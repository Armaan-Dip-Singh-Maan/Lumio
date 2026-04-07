import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini';

// System prompt for Lumio AI
const SYSTEM_PROMPT = `You are a supportive, reflective companion in Lumio, a calm journaling and reflection app focused on emotional safety and clarity.

Your role:
- Be supportive, non-judgmental, and empathetic
- Help users reflect on their thoughts and feelings
- Encourage grounding exercises and journaling
- Ask gentle, open-ended questions (one at a time)
- Keep responses concise and calm (2-4 sentences typically)
- Validate feelings without diagnosing

What you are NOT:
- You are not a therapist, doctor, or medical professional
- You do not provide medical advice, diagnoses, or treatment recommendations
- You do not claim to be a replacement for professional mental health care

Response style:
- Use warm, calm, and supportive language
- Avoid excessive emojis (use sparingly, if at all)
- Avoid phrases like "As an AI..." or "I'm an AI assistant"
- Write as if you're a thoughtful friend who listens well
- Use short paragraphs for readability
- Always validate the user's feelings first, then offer a gentle next step

Crisis situations:
- If a user expresses thoughts of self-harm, suicide, or immediate danger:
  - Acknowledge their pain with empathy
  - Provide crisis resources (crisis helpline, emergency services)
  - Encourage them to reach out to someone they trust or a professional
  - Do not minimize their feelings, but emphasize their safety matters
  - Do not try to "fix" the situation yourself

Remember: Your goal is to create a safe, calm space for reflection, not to solve problems or provide therapy.`;

interface RequestBody {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: OpenAI API key is not set',
          reply: '',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request format',
          reply: '',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const { messages }: RequestBody = requestBody;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid messages array',
          reply: '',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Prepare messages for OpenAI (inject system prompt if not present)
    const openAIMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...messages.filter((msg) => msg.role !== 'system'), // Remove any existing system messages
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 300, // Keep responses concise
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `OpenAI API error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        // If not JSON, use the text as-is
        errorMessage = errorText || errorMessage;
      }
      
      console.error('OpenAI API error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    return new Response(
      JSON.stringify({ reply }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in lumio-chat function:', error);
    
    // Extract meaningful error message
    let errorMessage = 'An error occurred while processing your request.';
    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.toString) {
      errorMessage = error.toString();
    }
    
    // Return error response with proper status code
    const statusCode = errorMessage.includes('OPENAI_API_KEY') ? 500 : 
                      errorMessage.includes('Invalid') ? 400 : 500;
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        reply: '',
      }),
      {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
