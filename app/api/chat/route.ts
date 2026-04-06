import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createServiceClient } from "@/lib/supabase/server";
import { getEnv } from "@/lib/security/env";
import type { ApiError } from "@/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  resultId: string;
  message: string;
  history: ChatMessage[];
}

interface ResultRow {
  id: string;
  content_type: string;
  title: string;
  summary: string;
  structured_output: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const { resultId, message, history } = body;

    if (!resultId || !message) {
      return NextResponse.json<ApiError>(
        { error: "Missing resultId or message." },
        { status: 400 }
      );
    }

    const env = getEnv();
    const supabase = createServiceClient();

    // Fetch the result for context
    const { data: result, error: dbError } = await supabase
      .from("analysis_results")
      .select("id, content_type, title, summary, structured_output")
      .eq("id", resultId)
      .single<ResultRow>();

    if (dbError || !result) {
      return NextResponse.json<ApiError>(
        { error: "Result not found." },
        { status: 404 }
      );
    }

    // Build system prompt with result context
    const systemPrompt = `You are a helpful assistant. The user is viewing the following analysis result. Answer their questions about it. Be concise and helpful. Respond in the same language the user writes in.

Result:
Title: ${result.title}
Type: ${result.content_type}
Summary: ${result.summary}
Full output: ${JSON.stringify(result.structured_output)}`;

    // Build conversation messages for OpenAI
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history
    if (Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    // Add the current user message
    messages.push({ role: "user", content: message });

    // Send to OpenAI
    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: env.OPENAI_MODEL_EXTRACT,
      messages,
      temperature: 0.4,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content;
    if (!reply) {
      return NextResponse.json<ApiError>(
        { error: "Empty response from AI." },
        { status: 500 }
      );
    }

    // Store both the user message and assistant reply in chat_messages
    const messagesToInsert = [
      {
        result_id: resultId,
        role: "user" as const,
        content: message,
      },
      {
        result_id: resultId,
        role: "assistant" as const,
        content: reply,
      },
    ];

    const { error: insertError } = await supabase
      .from("chat_messages")
      .insert(messagesToInsert);

    if (insertError) {
      console.error("Failed to store chat messages:", insertError);
      // Don't fail the request - the user still gets their reply
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json<ApiError>(
      { error: "Failed to process chat message." },
      { status: 500 }
    );
  }
}
