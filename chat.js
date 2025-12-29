import Groq from "groq-sdk";

export const config = {
  runtime: "edge"
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { messages } = await req.json();

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  const stream = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages,
    temperature: 1,
    stream: true
  });

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        controller.enqueue(encoder.encode(text));
      }
      controller.close();
    }
  });

  return new Response(readableStream, {
    headers: { "Content-Type": "text/plain" }
  });
}