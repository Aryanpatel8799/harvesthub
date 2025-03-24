import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Send, Bot, User, Loader2, Apple, Leaf } from 'lucide-react';
import { generateAIResponse } from '@/lib/cohere';
import { useAuth } from '@/context/AuthContext';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

// Initial message for farmers
const FARMER_INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: `Hello! I'm your farming and agricultural healthcare AI assistant. I can help you with:

1. Crop Management:
   - Disease identification and treatment
   - Pest control solutions
   - Fertilizer recommendations
   - Irrigation advice

2. Livestock Health:
   - Animal disease treatments
   - Medication recommendations
   - Preventive healthcare
   - Emergency care

3. Farm Operations:
   - Weather impact on farming
   - Market trends and pricing
   - Sustainable practices
   - Equipment maintenance

4. Agricultural Medicine:
   - Specific medication recommendations
   - Treatment protocols
   - Dosage instructions
   - Safety guidelines

Feel free to ask me anything about farming, crops, livestock health, or agricultural medicine. I'll provide detailed, practical advice with specific recommendations and treatments.`,
  timestamp: new Date()
};

// Initial message for consumers
const CONSUMER_INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: `Hello! I'm your health and nutrition assistant. I can help you with:

1. Healthy Eating:
   - Nutritional benefits of fruits and vegetables
   - Balanced diet recommendations
   - Meal planning ideas
   - Seasonal produce guidance

2. Dietary Needs:
   - Vegetarian/vegan options
   - Food allergies and alternatives
   - Low-sugar or low-carb diets
   - High-protein food sources

3. Lifestyle Benefits:
   - Foods for better sleep
   - Energy-boosting nutrition
   - Heart-healthy choices
   - Brain-boosting foods

4. Health Management:
   - Anti-inflammatory foods
   - Immune system support
   - Hydration tips
   - Natural remedies

Feel free to ask about any fruits, vegetables, or foods that can help with your specific health goals. I'll provide personalized nutrition advice to help you live a healthier lifestyle.`,
  timestamp: new Date()
};

// Example quick questions for consumers
const CONSUMER_QUICK_QUESTIONS = [
  "What fruits are best for boosting immunity?",
  "How can I incorporate more vegetables in my diet?",
  "What foods help with better sleep?",
  "Which seasonal vegetables should I eat now?",
  "What are good anti-inflammatory foods?"
];

// Example quick questions for farmers
const FARMER_QUICK_QUESTIONS = [
  "How to identify tomato leaf disease?",
  "What's the best fertilizer for wheat?",
  "How to manage pests organically?",
  "When is the best time to harvest rice?",
  "How to improve soil quality naturally?"
];

const AIChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    user?.type === 'farmer' ? FARMER_INITIAL_MESSAGE : CONSUMER_INITIAL_MESSAGE
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSendMessage = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') {
      e.preventDefault();
    }
    
    let userMessage: string;
    
    if (typeof e === 'string') {
      userMessage = e;
    } else {
      userMessage = input.trim();
      if (!userMessage || isLoading) return;
      setInput('');
    }
    
    // Add user message to chat
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    
    try {
      // Get AI response from Cohere
      const aiResponse = await generateAIResponse(messages.concat(newUserMessage), user?.type);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get quick questions based on user type
  const quickQuestions = user?.type === 'farmer' 
    ? FARMER_QUICK_QUESTIONS 
    : CONSUMER_QUICK_QUESTIONS;

  return (
    <div className="container w-full mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6">
      <div className="flex flex-col h-[calc(100vh-5rem)] sm:h-[calc(100vh-4rem)] bg-white rounded-lg shadow-lg border border-gray-100">
        {/* Chat Header */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 border-b bg-gradient-to-r from-harvest-50 to-white">
          <div className={`p-1.5 sm:p-2 rounded-full ${
            user?.type === 'farmer' ? 'bg-harvest-100' : 'bg-orange-100'
          }`}>
            {user?.type === 'farmer' ? (
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-harvest-600" />
            ) : (
              <Apple className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-orange-600" />
            )}
          </div>
          <div>
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
              {user?.type === 'farmer' ? 'Farming AI Assistant' : 'Health & Nutrition Assistant'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {user?.type === 'farmer' 
                ? 'Ask me anything about farming' 
                : 'Get personalized nutrition and health advice'}
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4 bg-gray-50/50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-1.5 sm:gap-2 md:gap-3 max-w-[95%] sm:max-w-[90%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  message.role === 'user' ? 'bg-harvest-600' : 'bg-white'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-white" />
                  ) : (
                    user?.type === 'farmer' ? 
                      <Bot className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-harvest-600" /> : 
                      <Apple className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-orange-600" />
                  )}
                </div>
                <div className="flex flex-col">
                  <div className={`rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-harvest-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-100'
                  }`}>
                    <p className="whitespace-pre-wrap text-xs sm:text-sm md:text-[15px] leading-relaxed">{message.content}</p>
                  </div>
                  <span className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${
                    message.role === 'user' ? 'text-right text-gray-400' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-1.5 sm:gap-2 md:gap-3 max-w-[95%] sm:max-w-[90%]">
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center bg-white shadow-sm">
                  {user?.type === 'farmer' ? 
                    <Bot className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-harvest-600" /> : 
                    <Apple className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-orange-600" />
                  }
                </div>
                <div className="bg-white rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 shadow-sm border border-gray-100">
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 animate-spin text-harvest-600" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        <div className="p-2 sm:p-3 border-t bg-white overflow-x-auto">
          <div className="flex flex-nowrap gap-1.5 sm:gap-2 pb-1 sm:pb-0">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(question)}
                disabled={isLoading}
                className="shrink-0 px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs md:text-sm bg-gray-50 border border-gray-200 rounded-full text-gray-700 hover:bg-gray-100 flex items-center gap-1 sm:gap-2 transition-all duration-200 disabled:opacity-50 hover:shadow-sm whitespace-nowrap"
              >
                {user?.type === 'farmer' ? (
                  <Leaf className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 text-harvest-600" />
                ) : (
                  <Apple className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 text-orange-600" />
                )}
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-2 sm:p-3 border-t bg-white">
          <div className="flex gap-1.5 sm:gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={user?.type === 'farmer' 
                ? "Ask about farming, crops, or agriculture..." 
                : "Ask about healthy eating, nutrition, or diet..."}
              className="flex-1 px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 rounded-lg border border-gray-200 focus:border-harvest-600 focus:ring-2 focus:ring-harvest-100 focus:ring-opacity-50 placeholder-gray-400 text-gray-800 transition-all duration-200 text-xs sm:text-sm md:text-[15px] placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-[15px]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="shrink-0 bg-harvest-600 text-white px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 rounded-lg hover:bg-harvest-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
            >
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
