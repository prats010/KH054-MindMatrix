import { NextResponse } from "next/server";
import { runPipeline } from "@/lib/agents/coordinator";

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body || !body.profile) {
      return NextResponse.json(
        { error: "Missing 'profile' field in request body." },
        { status: 400 }
      );
    }

    const language = body.language || "en";
    const validLanguages = ["en", "hi", "mr"];
    const lang = validLanguages.includes(language) ? language : "en";

    const result = await runPipeline(body.profile, lang);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        recommended_bundle: [],
        reasoning: "An unexpected error occurred. Please try again later.",
        missing_documents: [],
        confidence: 0,
        needs_review: true,
      },
      { status: 500 }
    );
  }
}
