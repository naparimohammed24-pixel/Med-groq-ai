import Groq from "groq-sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {
    const { messages } = req.body;

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    const stream = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages,
      temperature: 1,
      stream: true
    });

    res.setHeader("Content-Type", "text/plain");

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      res.write(text); // send chunks as they arrive
    }

    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}
