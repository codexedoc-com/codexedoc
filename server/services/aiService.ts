import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import mammoth from "mammoth";

// Helper to safely parse PDF buffer
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdf = require("pdf-parse");
    const data = await pdf(buffer);
    return data.text || "";
  } catch (e) {
    console.warn("Failed to extract PDF text:", e);
    return "";
  }
}

export interface GeneratedCard {
  prompt: string;
  answer: string;
  type: "vocab" | "concept" | "fact" | "procedure";
  difficulty: number;
}

export interface GeneratedCategory {
  name: string;
  items: GeneratedCard[];
}

export interface IngestionResult {
  documentTitle: string;
  fileType: string;
  summary: string;
  extractedText: string;
  categories: GeneratedCategory[];
  providerUsed: "gemini" | "openai" | "local-fallback";
}

const SYSTEM_GENERATION_PROMPT = `
You are an expert learning scientist and instructional designer for CODEXEDOC, a Spaced Repetition and Active Recall platform.
Analyze the provided document, video, audio, or slide deck thoroughly.
Extract deep understanding and structure it into actionable learning materials:

1. High-level Summary: 3-5 concise sentences capturing the core thesis and key insights.
2. Comprehensive Knowledge Notes / Transcript: Structured notes capturing the core concepts, principles, formulas, definitions, and rules so the learner can review the source anytime.
3. Categories & Flashcards:
   - Group the knowledge into 1 to 4 logical topics/categories.
   - For each category, generate 3 to 10 high-quality active recall flashcards (questions on front, clear solutions on back).
   - Card types: "concept" | "vocab" | "fact" | "procedure".
   - Difficulty: 1 (easy/intro) to 5 (advanced).

Return strictly valid JSON conforming to this structure:
{
  "documentTitle": "Clean title describing the source material",
  "summary": "Executive summary of the content...",
  "extractedText": "Structured, detailed notes and key takeaways...",
  "categories": [
    {
      "name": "Category / Topic Name",
      "items": [
        {
          "prompt": "Clear, specific question targeting active recall?",
          "answer": "Direct, accurate, high-yield explanation or answer.",
          "type": "concept",
          "difficulty": 2
        }
      ]
    }
  ]
}
`;

/**
 * Process any uploaded file (PDF, Video, Audio, DOCX, Text) and generate learning tools.
 */
export async function processDocumentWithAI(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
  goalContext?: string,
  targetTopic?: string
): Promise<IngestionResult> {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  // Normalize file type label
  let fileType = "text";
  if (mimeType.includes("pdf")) fileType = "pdf";
  else if (mimeType.startsWith("video/")) fileType = "video";
  else if (mimeType.startsWith("audio/")) fileType = "audio";
  else if (mimeType.includes("wordprocessingml") || fileName.endsWith(".docx")) fileType = "docx";

  // -------------------------------------------------------------
  // 1. Google Gemini Multimodal Processing (Recommended)
  // -------------------------------------------------------------
  if (geminiKey && geminiKey !== "your_gemini_api_key_here") {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const base64Data = fileBuffer.toString("base64");

      let promptContext = goalContext
        ? `The learner's current target goal is "${goalContext}". Tailor the categories and questions to support this goal.`
        : "";

      if (targetTopic) {
        promptContext += ` All generated flashcards must be categorized strictly under the topic "${targetTopic}". Return "${targetTopic}" as the category name.`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || "application/octet-stream",
                  data: base64Data,
                },
              },
              {
                text: `${SYSTEM_GENERATION_PROMPT}\n${promptContext}\nOriginal File Name: ${fileName}`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text?.trim() || "{}";
      const parsed = JSON.parse(responseText);

      return {
        documentTitle: parsed.documentTitle || fileName.replace(/\.[^/.]+$/, ""),
        fileType,
        summary: parsed.summary || "Summary generated from uploaded source.",
        extractedText: parsed.extractedText || "Extracted knowledge context.",
        categories: parsed.categories || [],
        providerUsed: "gemini",
      };
    } catch (geminiError) {
      console.warn("Gemini processing failed, attempting OpenAI fallback:", geminiError);
    }
  }

  // -------------------------------------------------------------
  // 2. OpenAI Processing Fallback
  // -------------------------------------------------------------
  if (openaiKey && openaiKey !== "your_openai_api_key_here") {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      let extractedRawText = "";

      if (fileType === "pdf") {
        extractedRawText = await extractTextFromPdf(fileBuffer);
      } else if (fileType === "docx") {
        const parsedDocx = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedRawText = parsedDocx.value;
      } else if (fileType === "audio" || fileType === "video") {
        // Transcribe audio using Whisper
        const file = new File([new Uint8Array(fileBuffer)], fileName, { type: mimeType });
        const transcription = await openai.audio.transcriptions.create({
          file,
          model: "whisper-1",
        });
        extractedRawText = transcription.text;
      } else {
        extractedRawText = fileBuffer.toString("utf-8");
      }

      const promptContext = goalContext
        ? `The learner's current target goal is "${goalContext}".`
        : "";

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_GENERATION_PROMPT },
          {
            role: "user",
            content: `Source File: ${fileName}\n${promptContext}\n\nContent:\n${extractedRawText.slice(0, 50000)}`,
          },
        ],
      });

      const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");

      return {
        documentTitle: parsed.documentTitle || fileName.replace(/\.[^/.]+$/, ""),
        fileType,
        summary: parsed.summary || "Summary generated from uploaded source.",
        extractedText: parsed.extractedText || extractedRawText.slice(0, 10000),
        categories: parsed.categories || [],
        providerUsed: "openai",
      };
    } catch (openaiError) {
      console.warn("OpenAI processing failed, attempting local fallback:", openaiError);
    }
  }

  // -------------------------------------------------------------
  // 3. Local Intelligent Fallback (Zero Setup / Offline Testing)
  // -------------------------------------------------------------
  let rawContent = "";
  try {
    if (fileType === "pdf") {
      rawContent = await extractTextFromPdf(fileBuffer);
    } else if (fileType === "docx") {
      const parsed = await mammoth.extractRawText({ buffer: fileBuffer });
      rawContent = parsed.value;
    } else {
      rawContent = fileBuffer.toString("utf-8");
    }
  } catch (e) {
    rawContent = `Sample content from ${fileName}`;
  }

  // Clean title
  const cleanTitle = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

  return {
    documentTitle: cleanTitle,
    fileType,
    summary: `Extracted summary for ${cleanTitle}. (Add GEMINI_API_KEY to your .env to unlock full multimodal AI reasoning).`,
    extractedText: rawContent.slice(0, 3000) || `Extracted text from ${fileName}.`,
    categories: [
      {
        name: targetTopic || `${cleanTitle} - Core Concepts`,
        items: [
          {
            prompt: `What is the primary topic covered in ${cleanTitle}?`,
            answer: `The document discusses key principles, definitions, and applications related to ${cleanTitle}.`,
            type: "concept",
            difficulty: 2,
          },
          {
            prompt: `What is a fundamental rule or guideline established in ${cleanTitle}?`,
            answer: `Consistent practice and active recall ensure long-term retention of these concepts.`,
            type: "procedure",
            difficulty: 3,
          },
        ],
      },
    ],
    providerUsed: "local-fallback",
  };
}

/**
 * Regenerate additional flashcards from an existing saved document's extracted text
 */
export async function regenerateCardsFromText(
  extractedText: string,
  existingCategoriesCount: number
): Promise<GeneratedCategory[]> {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  const prompt = `
Based on the following knowledge notes, generate 2-4 fresh active recall categories with 3-6 flashcards each that test deeper understanding or edge cases.
Return strictly valid JSON with this format:
{
  "categories": [
    {
      "name": "Topic Name",
      "items": [
        {
          "prompt": "Deep active recall question?",
          "answer": "Accurate detailed answer.",
          "type": "concept",
          "difficulty": 3
        }
      ]
    }
  ]
}

Knowledge Content:
${extractedText.slice(0, 30000)}
`;

  if (geminiKey && geminiKey !== "your_gemini_api_key_here") {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });
      const parsed = JSON.parse(response.text || "{}");
      return parsed.categories || [];
    } catch (e) {
      console.error("Gemini regenerate error:", e);
    }
  }

  if (openaiKey && openaiKey !== "your_openai_api_key_here") {
    try {
      const openai = new OpenAI({ apiKey: openaiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      });
      const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
      return parsed.categories || [];
    } catch (e) {
      console.error("OpenAI regenerate error:", e);
    }
  }

  // Fallback
  return [
    {
      name: `Deep Dive Part ${existingCategoriesCount + 1}`,
      items: [
        {
          prompt: "How can these concepts be applied to real-world problem solving?",
          answer: "By identifying the fundamental constraints and using structured active recall.",
          type: "concept",
          difficulty: 4,
        },
      ],
    },
  ];
}
