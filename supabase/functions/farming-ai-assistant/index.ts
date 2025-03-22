
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cohereApiKey = Deno.env.get('COHERE_API_KEY');
    
    if (!cohereApiKey) {
      throw new Error('COHERE_API_KEY is not set');
    }

    const { message } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the incoming request
    console.log(`Processing message: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);

    // Call Cohere API
    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cohereApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        model: "command",
        preamble: `You are an AI farming assistant. You have expertise in agriculture, crop management, 
                  plant diseases, weather impacts on farming, and sustainable farming practices. 
                  Provide helpful, detailed, and accurate advice to farmers. When discussing plant diseases, 
                  include information on identification, prevention, and treatment. For crop management, 
                  consider factors like soil health, watering needs, and seasonal variations.
                  
                  Format your responses with clear paragraphs, bullet points where appropriate, and make sure 
                  important information stands out. Avoid long run-on sentences and keep paragraphs concise.`,
        chat_history: []
      }),
    });

    // Parse the Cohere API response
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Cohere API error:", data);
      throw new Error(data.message || "Error from Cohere API");
    }

    // Process and format the response text
    let formattedText = data.text;
    
    // Ensure proper spacing for better readability
    formattedText = formattedText
      .replace(/(\d+\.\s)/g, '\n$1') // Add line breaks before numbered lists
      .replace(/(\•\s)/g, '\n• ') // Add line breaks before bullet points
      .replace(/([.!?])\s+/g, '$1\n\n') // Add paragraph breaks after sentences
      .replace(/\n{3,}/g, '\n\n'); // Normalize multiple line breaks
      
    // Return the formatted response
    return new Response(
      JSON.stringify({ response: formattedText.trim() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in farming-ai-assistant function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
