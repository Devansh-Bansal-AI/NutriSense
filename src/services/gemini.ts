import { GoogleGenerativeAI } from '@google/generative-ai';
import { FoodItem, ScoreBreakdown } from '@/types/food';
import { UserProfile } from '@/types/profile';
import { ChatMessage } from '@/types/chat';
import { ANALYZE_FOOD_PROMPT, RECOMMENDATION_EXPLANATION_PROMPT, CHAT_SYSTEM_PROMPT } from '@/lib/prompts';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const MODEL_NAME = 'gemini-2.5-flash'; // using flash for fast responses

export class GeminiService {
  /**
   * Analyze food item using Gemini 1.5 Flash.
   * Returns a structured JSON assessment.
   */
  static async analyzeFood(foodName: string) {
    if (!genAI) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = ANALYZE_FOOD_PROMPT.replace('{foodName}', foodName);

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2, // Low temperature for deterministic analysis
        }
      });
      
      const responseText = result.response.text();
      return JSON.parse(responseText);
    } catch (error) {
      console.error('Gemini analyzeFood error:', error);
      throw error;
    }
  }

  /**
   * Generate contextual explanation for a food recommendation.
   */
  static async explainRecommendation(
    food: FoodItem,
    scores: ScoreBreakdown,
    context: { goalLabel: string; mealLabel: string; activityLevel: string; compositeScore: number }
  ): Promise<string[]> {
    if (!genAI) return ['Highly rated based on your profile.']; // Fallback

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = RECOMMENDATION_EXPLANATION_PROMPT
      .replace('{goalLabel}', context.goalLabel)
      .replace('{mealLabel}', context.mealLabel)
      .replace('{activityLevel}', context.activityLevel)
      .replace('{foodName}', food.name)
      .replace('{compositeScore}', context.compositeScore.toString())
      .replace('{calories}', food.calories.toString())
      .replace('{protein}', food.protein.toString())
      .replace('{carbs}', food.carbs.toString())
      .replace('{fat}', food.fat.toString());

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });
      
      const responseText = result.response.text();
      const explanations = JSON.parse(responseText);
      return Array.isArray(explanations) ? explanations.slice(0, 3) : ['Highly rated based on your profile.'];
    } catch (error) {
      console.error('Gemini explainRecommendation error:', error);
      return ['Highly rated based on your profile.']; // Fallback on failure
    }
  }

  /**
   * Get streaming chat response for NutriSense AI Chat.
   */
  static async chatWithAssistant(messages: ChatMessage[], profile?: UserProfile) {
    if (!genAI) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    // Build context string
    let userProfileContext = '';
    if (profile) {
      userProfileContext = `
The user is ${profile.age} years old, weighs ${profile.weight}kg.
Their main goal is ${profile.goal}.
Activity Level: ${profile.activityLevel}.
Daily Calorie Target: ${profile.dailyCalories} kcal.
Dietary Restrictions: ${profile.dietaryRestrictions?.join(', ') || 'None'}.
Allergens: ${profile.allergens?.join(', ') || 'None'}.
Budget: ${profile.budget}.
`;
    }

    const systemInstruction = CHAT_SYSTEM_PROMPT.replace('{userProfileContext}', userProfileContext);

    // Format history for Gemini SDK
    let history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Gemini requires history to start with a user message. Remove initial greeting if present.
    if (history.length > 0 && history[0].role === 'model') {
      history.shift();
    }

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({
      history,
      systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: 0.7,
      }
    });

    const result = await chat.sendMessageStream([{ text: lastMessage }]);
    return result.stream;
  }
}
