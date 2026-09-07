import { NextResponse } from "next/server";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type Body = {
  messages?: ChatMessage[];
};

const SYSTEM_PROMPT = `You are Amazon Q, AWS's generative AI assistant in the AWS Management Console.
You help users with AWS services, especially Amazon Route 53 (hosted zones, DNS records, health checks, routing policies).
Be concise, accurate, and practical. Use short paragraphs and bullet lists when helpful.
If the user asks about this Route 53 console clone, explain common workflows: create/edit/delete hosted zones and DNS records (A, AAAA, CNAME, MX, TXT, NS, SRV, CAA, PTR).
Do not invent live AWS account data. If something requires live AWS APIs you cannot call, say so and give the console steps instead.`;

export async function POST(request: Request) {
  const apiKey =
    process.env.GROQ_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GROQ_KEY_1?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GROQ_API_KEY is not set. Add it to route53/.env.local and restart the Next.js server.",
      },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...incoming
      .filter((m) => m && (m.role === "user" || m.role === "assistant"))
      .map((m) => ({ role: m.role, content: String(m.content ?? "").slice(0, 10000) }))
      .filter((m) => m.content.trim().length > 0)
      .slice(-20),
  ];

  if (messages.length < 2) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const model = process.env.GROQ_MODEL ?? "openai/gpt-oss-20b";

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 2048,
      }),
    });

    const data = (await res.json()) as {
      error?: { message?: string };
      choices?: Array<{ message?: { content?: string } }>;
    };

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.message ?? "Groq request failed." },
        { status: res.status },
      );
    }

    const content = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!content) {
      return NextResponse.json(
        { error: "Empty response from Amazon Q." },
        { status: 502 },
      );
    }

    return NextResponse.json({ content });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to reach Groq API.",
      },
      { status: 502 },
    );
  }
}
