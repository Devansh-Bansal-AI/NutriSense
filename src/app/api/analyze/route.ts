import { NextRequest, NextResponse } from 'next/server';
import { NutritionEngine } from '@/services/nutrition-engine';
import { analyzeRequestSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = rateLimit(ip, 30, 60000);
    
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const result = analyzeRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const analysis = await NutritionEngine.analyzeFood(result.data.foodName);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analyze API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
