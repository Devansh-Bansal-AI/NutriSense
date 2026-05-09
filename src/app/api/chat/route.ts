import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/services/gemini';
import { chatRequestSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = rateLimit(ip, 10, 60000); // Stricter rate limit for chat
    
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const result = chatRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.format() }, { status: 400 });
    }

    const { messages, userProfile } = result.data;

    let streamSource;

    try {
      streamSource = await GeminiService.chatWithAssistant(messages as any, userProfile);
    } catch (e: any) {
      if (e.message === 'GEMINI_API_KEY is not configured') {
        const mockResponse = "I'm currently running in demo mode without a Gemini API key configured. Please add your GEMINI_API_KEY to .env.local to enable real AI conversational capabilities!";
        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            const words = mockResponse.split(' ');
            for (const word of words) {
              controller.enqueue(encoder.encode(word + ' '));
              await new Promise(r => setTimeout(r, 50));
            }
            controller.close();
          }
        });
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      }
      throw e;
    }

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of streamSource) {
            const chunkText = chunk.text();
            controller.enqueue(encoder.encode(chunkText));
          }
        } catch (error) {
          console.error("Stream error:", error);
        } finally {
          controller.close();
        }
      }
    });
    
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
