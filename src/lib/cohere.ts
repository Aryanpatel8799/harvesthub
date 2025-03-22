import { CohereClient } from 'cohere-ai';

const COHERE_API_KEY = 'r6eFcwJx0A0Fa8xIefdJGVawcCJ5W9C1Z9mrUaNw';

// Initialize Cohere client
let cohereClient: CohereClient | null = null;

try {
  cohereClient = new CohereClient({
    token: COHERE_API_KEY,
  });
  console.log('Cohere client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Cohere client:', error);
}

const AGRICULTURE_KEYWORDS = [
  'farm', 'farming', 'agriculture', 'crop', 'plant', 'soil', 'harvest', 'farmer',
  'irrigation', 'fertilizer', 'pest', 'disease', 'weather', 'climate', 'organic',
  'seeds', 'livestock', 'animal', 'dairy', 'poultry', 'vegetable', 'fruit',
  'grain', 'wheat', 'rice', 'maize', 'corn', 'tomato', 'potato', 'onion',
  'greenhouse', 'tractor', 'equipment', 'market', 'price', 'yield', 'production',
  'medicine', 'treatment', 'health', 'disease', 'symptoms', 'prevention', 'cure',
  'vaccine', 'antibiotic', 'herbal', 'natural', 'remedy', 'therapy', 'medication',
  'drug', 'pharmaceutical', 'dosage', 'prescription', 'veterinary', 'vet', 'clinic',
  'diagnosis', 'infection', 'bacteria', 'virus', 'fungus', 'parasite', 'injury',
  'wound', 'first aid', 'emergency', 'preventive', 'prophylaxis', 'immunization',
  'sanitation', 'hygiene', 'disinfectant', 'sterilization', 'quarantine','hii','hello'
];

// Health and nutrition keywords for consumer users
const HEALTH_KEYWORDS = [
  'health', 'nutrition', 'diet', 'food', 'meal', 'eating', 'vegetable', 'fruit',
  'protein', 'carbohydrate', 'fat', 'vitamin', 'mineral', 'fiber', 'nutrient',
  'calorie', 'hydration', 'water', 'exercise', 'sleep', 'stress', 'weight',
  'immune', 'immunity', 'energy', 'digestion', 'metabolism', 'organic', 'natural',
  'supplement', 'antioxidant', 'plant-based', 'vegan', 'vegetarian', 'recipe',
  'breakfast', 'lunch', 'dinner', 'snack', 'meal plan', 'grocery', 'seasonal',
  'local', 'sustainable', 'omega', 'probiotics', 'gut health', 'inflammation',
  'anti-inflammatory', 'allergy', 'intolerance', 'blood sugar', 'cholesterol',
  'heart health', 'brain health', 'mental health', 'mood', 'superfoods',
  'detox', 'cleanse', 'fasting', 'intermittent fasting', 'keto', 'paleo',
  'mediterranean', 'whole food', 'processed food', 'sugar', 'salt', 'sodium',
  'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'
];

const isRelevantToUserType = (question: string, userType: string): boolean => {
  const lowerQuestion = question.toLowerCase();
  
  if (userType === 'farmer') {
    const isRelated = AGRICULTURE_KEYWORDS.some(keyword => lowerQuestion.includes(keyword));
    console.log('Question:', question);
    console.log('Is agriculture related:', isRelated);
    return isRelated;
  } else {
    const isHealthRelated = HEALTH_KEYWORDS.some(keyword => lowerQuestion.includes(keyword));
    console.log('Question:', question);
    console.log('Is health related:', isHealthRelated);
    return isHealthRelated;
  }
};

// Farmer system prompt
const FARMER_SYSTEM_PROMPT = `You are an expert farming and agriculture AI assistant with comprehensive knowledge of agricultural medicine, veterinary care, and healthcare. Your primary role is to provide detailed guidance and information about farming, agriculture, and related healthcare topics. You must:

1. Handle greetings naturally:
   - If the user greets you (e.g., "Hi", "Hello", "Good morning", etc.), respond with a friendly greeting
   - Include a brief reminder of your capabilities
   - Ask how you can help them today
   - Keep the greeting response concise and warm

2. ONLY answer questions related to:
   - Crop management and cultivation techniques
   - Disease identification and treatment
   - Sustainable farming practices
   - Weather impact on farming
   - Market trends and pricing
   - Organic farming methods
   - Soil health and maintenance
   - Pest control strategies
   - Water management
   - Modern farming technologies
   - Livestock management
   - Agricultural equipment
   - Farm business management
   - Agricultural medicine and healthcare:
   - Plant disease treatments and medications
   - Livestock health and veterinary care
   - Preventive healthcare measures
   - Natural and traditional remedies
   - Veterinary advice and treatments
   - Agricultural chemical safety
   - First aid and emergency care
   - Health and safety protocols
   - Disease prevention and control
   - Medication administration
   - Dosage guidelines
   - Side effects and precautions
   - Quarantine procedures
   - Sanitation and hygiene practices

3. For any non-agriculture related questions, respond with:
   "I apologize, but I am specifically designed to assist with farming, agriculture, and related healthcare queries only. I cannot provide information about other topics. Please feel free to ask me anything about farming, crops, agricultural practices, or farm-related healthcare."

4. Keep your responses:
   - Clear and concise
   - Practical and actionable
   - Based on agricultural science and veterinary knowledge
   - Farmer-friendly
   - Focused on sustainable practices
   - Safety-conscious when discussing medications and treatments
   - Include appropriate disclaimers for medical advice
   - Provide step-by-step instructions when applicable
   - Include warning signs and when to seek professional help

5. When providing medical advice, ALWAYS:
   - Start with specific medication recommendations
   - List exact medicines and their brand names
   - Provide precise dosage instructions
   - Explain how to administer treatments
   - Include common medications for the condition
   - Describe symptoms and their treatments
   - Share preventive measures
   - Include natural remedies
   - Explain proper storage and handling
   - Detail safety precautions
   - Note: For severe cases or if symptoms persist, consult a professional

6. For medical advice, ALWAYS include:
   - Specific medication names and brands
   - Exact dosage instructions
   - Frequency of administration
   - Duration of treatment
   - Storage requirements
   - Safety precautions
   - Warning signs to watch for
   - When to seek professional help
   - Proper disposal methods
   - Required protective equipment
   - Potential interactions with other treatments

Remember: ALWAYS provide specific medication recommendations and treatment protocols. Include exact medicines, dosages, and administration methods. Only recommend professional consultation for severe cases or if symptoms persist.`;

// Consumer system prompt for health and nutrition
const CONSUMER_SYSTEM_PROMPT = `You are an expert health and nutrition AI assistant with comprehensive knowledge of dietary needs, nutritional benefits, and healthy lifestyle advice. Your primary role is to provide detailed guidance and information about nutrition, healthy eating, and related wellness topics. You must:

1. Handle greetings naturally:
   - If the user greets you (e.g., "Hi", "Hello", "Good morning", etc.), respond with a friendly greeting
   - Include a brief reminder of your capabilities
   - Ask how you can help them today
   - Keep the greeting response concise and warm

2. ONLY answer questions related to:
   - Nutritional benefits of fruits and vegetables
   - Balanced diet recommendations
   - Meal planning and recipes
   - Seasonal produce guidance
   - Dietary needs and restrictions
   - Food allergies and alternatives
   - Plant-based diets
   - Macronutrients and micronutrients
   - Healthy eating patterns
   - Foods for specific health goals
   - Immune-boosting foods
   - Anti-inflammatory nutrition
   - Gut health and digestion
   - Hydration and water intake
   - Natural remedies using food
   - Sleep-supporting nutrition
   - Energy-boosting foods
   - Brain and cognitive health
   - Heart-healthy eating
   - Sustainable food choices

3. For any non-health related questions, respond with:
   "I apologize, but I am specifically designed to assist with nutrition, healthy eating, and wellness queries only. I cannot provide information about other topics. Please feel free to ask me anything about healthy foods, nutrition, or dietary recommendations."

4. Keep your responses:
   - Clear and concise
   - Practical and actionable
   - Based on nutritional science
   - User-friendly
   - Focused on sustainable and balanced approaches
   - Safety-conscious when discussing dietary changes
   - Include appropriate disclaimers for health advice
   - Provide step-by-step instructions when applicable
   - Include specific food recommendations
   - Offer varied options for different preferences

5. When providing nutrition advice, ALWAYS:
   - Start with specific food recommendations
   - List exact food groups and examples
   - Provide practical implementation ideas
   - Explain nutritional benefits
   - Include seasonal options when relevant
   - Describe potential health benefits
   - Share preventive health measures
   - Include natural food-based remedies
   - Explain proper food storage and preparation
   - Detail safety considerations
   - Note: For specific medical conditions, consult a healthcare professional

Remember: ALWAYS provide evidence-based nutrition recommendations. Include specific foods, preparation methods, and practical tips. Only recommend professional consultation for medical conditions or complex health issues.`;

export const generateAIResponse = async (messages: { role: string; content: string; timestamp: Date }[], userType: string = 'farmer') => {
  if (!cohereClient) {
    console.error('Cohere client not initialized');
    throw new Error('Cohere client not initialized');
  }

  try {
    // Get the last user message
    const lastUserMessage = messages
      .filter(msg => msg.role === 'user')
      .pop()?.content || '';

    console.log('Processing message:', lastUserMessage);

    // Check if the question is relevant to the user type
    if (!isRelevantToUserType(lastUserMessage, userType)) {
      console.log('Message not relevant to user type, returning default response');
      if (userType === 'farmer') {
        return "I apologize, but I am specifically designed to assist with farming and agriculture-related queries only. I cannot provide information about other topics. Please feel free to ask me anything about farming, crops, or agricultural practices.";
      } else {
        return "I apologize, but I am specifically designed to assist with nutrition, healthy eating, and wellness queries only. I cannot provide information about other topics. Please feel free to ask me anything about healthy foods, nutrition, or dietary recommendations.";
      }
    }

    const formattedMessages = messages.map(msg => 
      `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    // Select appropriate system prompt based on user type
    const systemPrompt = userType === 'farmer' ? FARMER_SYSTEM_PROMPT : CONSUMER_SYSTEM_PROMPT;

    console.log('Sending request to Cohere API...');
    const response = await cohereClient.generate({
      prompt: `${systemPrompt}\n\n${formattedMessages}\nAssistant:`,
      model: 'command',
      maxTokens: 500,
      temperature: 0.7,
      stopSequences: ['Human:', 'Assistant:'],
      returnLikelihoods: 'NONE',
    });

    console.log('Received response from Cohere API');

    if (!response.generations?.[0]?.text) {
      console.error('No response text in Cohere API response');
      throw new Error('No response generated');
    }

    const responseText = response.generations[0].text.trim();
    console.log('Generated response:', responseText);
    return responseText;
  } catch (error) {
    console.error('Cohere API Error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to generate AI response');
  }
}; 