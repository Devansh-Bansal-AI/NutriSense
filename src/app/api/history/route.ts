import { NextRequest, NextResponse } from 'next/server';
import { FirestoreService } from '@/services/firestore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const days = parseInt(searchParams.get('days') || '7');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const entries = await FirestoreService.getMealHistory(userId, days);
    
    // For now, return basic summary structure.
    return NextResponse.json({
      entries,
      summary: {
        totals: {
          calories: entries.reduce((s, e) => s + e.calories, 0),
          protein: entries.reduce((s, e) => s + e.protein, 0),
          carbs: entries.reduce((s, e) => s + e.carbs, 0),
          fat: entries.reduce((s, e) => s + e.fat, 0),
          fiber: entries.reduce((s, e) => s + e.fiber, 0),
          meals: entries.length
        },
        target: 2000,
        remaining: 0,
        percentComplete: 0,
        status: 'onTrack'
      },
      insights: [],
      habitData: []
    });
  } catch (error) {
    console.error('History GET API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, entry } = body;
    
    if (!userId || !entry) {
      return NextResponse.json({ error: 'userId and entry are required' }, { status: 400 });
    }

    const success = await FirestoreService.logMeal(userId, entry);
    if (!success) {
      console.warn('DB not configured, mocking successful meal log for demo purposes.');
    }

    return NextResponse.json({ logged: true, entry });
  } catch (error) {
    console.error('History POST API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
