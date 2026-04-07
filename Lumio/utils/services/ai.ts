import { supabase } from '@/utils/supabase-client';
import { ChatMessage } from './chat-storage';

export interface AIResponse {
  reply: string;
  error?: string;
}

function humanizeAIError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('429') || lower.includes('rate limit') || lower.includes('quota')) {
    return 'The AI service is temporarily busy. Please wait a moment and try again.';
  }
  if (lower.includes('openai_api_key') || lower.includes('not set')) {
    return 'Chat is not fully set up on the server yet. Please try again later.';
  }
  return raw;
}

/**
 * Call the Supabase Edge Function to get an AI response
 * @param messages Array of chat messages (conversation history)
 * @returns AI response or error
 */
export async function getAIResponse(
  messages: ChatMessage[]
): Promise<AIResponse> {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return {
      reply: '',
      error: 'Chat is not configured. Please add Supabase credentials to your .env file.',
    };
  }

  try {
    // Convert ChatMessage[] to OpenAI format
    const openAIMessages = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('lumio-chat', {
      body: {
        messages: openAIMessages,
      },
    });

    if (error) {
      const errorName = (error as any)?.name;
      if (errorName !== 'FunctionsFetchError') {
        console.error('Supabase function error:', error);
      }

      let errorMessage = 'Failed to get AI response';

      if (error && typeof error === 'object' && 'context' in error) {
        try {
          const errorBody = await (error as any).context.json();
          errorMessage =
            errorBody?.error ||
            errorBody?.message ||
            error?.message ||
            errorMessage;
        } catch {
          try {
            const errorText = await (error as any).context.text();
            errorMessage = errorText || error?.message || errorMessage;
          } catch {
            errorMessage = error?.message || errorMessage;
          }
        }
      } else if (errorName === 'FunctionsFetchError') {
        errorMessage =
          'Network error: unable to reach the Edge Function. Check your internet connection, VPN, or Supabase URL.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      return { reply: '', error: humanizeAIError(errorMessage) };
    }

    if (data?.error) {
      console.error('Edge Function returned error:', data.error);
      return { reply: '', error: humanizeAIError(String(data.error)) };
    }

    if (!data || !data.reply) {
      return {
        reply: '',
        error: 'No reply received from AI service. Please try again.',
      };
    }

    return { reply: data.reply };
  } catch (error: any) {
    console.error('Error calling AI service:', error);
    
    // Return a calm error message
    return {
      reply: '',
      error: error?.message || 'Something went wrong. Let\'s try again.',
    };
  }
}

/**
 * Retry wrapper for AI calls (max 1 retry)
 */
export async function getAIResponseWithRetry(
  messages: ChatMessage[]
): Promise<AIResponse> {
  try {
    return await getAIResponse(messages);
  } catch (error) {
    // One retry
    console.log('Retrying AI call...');
    return await getAIResponse(messages);
  }
}
