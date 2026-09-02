"use server";

import { db } from "@/server/db/db";
import {
  sourceMaterials,
  learningAreas,
  items,
  reviews,
  dailyProgress,
  goals,
} from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/getCurrentUser";
import {
  processDocumentWithAI,
  regenerateCardsFromText,
  IngestionResult,
  GeneratedCategory,
} from "@/server/services/aiService";

/**
 * Upload & parse any document/media file (PDF, Video, Audio, DOCX, Text)
 */
export async function parseUploadedDocumentAction(formData: FormData): Promise<{
  success: boolean;
  data?: IngestionResult;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: "No file provided" };
    }

    const goalTitle = formData.get("goalTitle")?.toString() || undefined;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await processDocumentWithAI(
      buffer,
      file.type || "application/octet-stream",
      file.name,
      goalTitle
    );

    return { success: true, data: result };
  } catch (error) {
    console.error("parseUploadedDocumentAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process document",
    };
  }
}

export interface SaveBlueprintPayload {
  goalId: string;
  documentTitle: string;
  fileType: string;
  summary: string;
  extractedText: string;
  categories: GeneratedCategory[];
}

/**
 * Save extracted knowledge context to sourceMaterials AND insert approved categories & flashcards into database
 */
export async function saveGeneratedBlueprintAction(payload: SaveBlueprintPayload) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // 1. Save knowledge context into source_materials table so user can access it anytime
    const [savedSource] = await db
      .insert(sourceMaterials)
      .values({
        userId: user.id,
        goalId: payload.goalId || null,
        title: payload.documentTitle,
        fileType: payload.fileType,
        summary: payload.summary,
        extractedText: payload.extractedText,
      })
      .returning();

    let totalItemsCreated = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Insert categories and items
    for (const cat of payload.categories) {
      if (!cat.name || cat.items.length === 0) continue;

      const [createdArea] = await db
        .insert(learningAreas)
        .values({
          goalId: payload.goalId,
          name: cat.name,
        })
        .returning();

      if (createdArea) {
        for (const item of cat.items) {
          const [createdItem] = await db
            .insert(items)
            .values({
              userId: user.id,
              areaId: createdArea.id,
              type: item.type || "concept",
              prompt: item.prompt,
              answer: item.answer,
              difficulty: item.difficulty || 2,
              masteryLevel: "new",
            })
            .returning();

          if (createdItem) {
            totalItemsCreated += 1;
            // Schedule initial review for today
            await db.insert(reviews).values({
              itemId: createdItem.id,
              userId: user.id,
              scheduledAt: today,
              easeFactor: 250,
              intervalDays: 1,
              repetition: 0,
            });
          }
        }
      }
    }

    // 3. Update daily progress stats
    const existingProgress = await db.query.dailyProgress.findFirst({
      where: and(eq(dailyProgress.userId, user.id), eq(dailyProgress.date, today)),
    });

    if (existingProgress) {
      await db
        .update(dailyProgress)
        .set({
          newItemsAdded: (existingProgress.newItemsAdded || 0) + totalItemsCreated,
        })
        .where(eq(dailyProgress.id, existingProgress.id));
    } else {
      await db.insert(dailyProgress).values({
        userId: user.id,
        date: today,
        reviewsCompleted: 0,
        newItemsAdded: totalItemsCreated,
        minutesStudied: 0,
      });
    }

    return {
      success: true,
      sourceId: savedSource?.id,
      itemsCount: totalItemsCreated,
    };
  } catch (error) {
    console.error("saveGeneratedBlueprintAction error:", error);
    return { success: false, error: "Failed to save blueprint" };
  }
}

/**
 * Fetch all saved source materials / documents for the user
 */
export async function getSourceMaterialsAction(goalId?: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return [];

    const conditions = [eq(sourceMaterials.userId, user.id)];
    if (goalId) {
      conditions.push(eq(sourceMaterials.goalId, goalId));
    }

    const docs = await db.query.sourceMaterials.findMany({
      where: and(...conditions),
      orderBy: [desc(sourceMaterials.createdAt)],
    });

    return docs;
  } catch (error) {
    console.error("getSourceMaterialsAction error:", error);
    return [];
  }
}

/**
 * Regenerate new flashcards from previously stored document text
 */
export async function regenerateCardsFromSavedSourceAction(sourceId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { success: false, error: "Not authenticated" };

    const doc = await db.query.sourceMaterials.findFirst({
      where: and(eq(sourceMaterials.id, sourceId), eq(sourceMaterials.userId, user.id)),
    });

    if (!doc) return { success: false, error: "Document not found" };

    const categories = await regenerateCardsFromText(doc.extractedText, 1);

    return {
      success: true,
      documentTitle: doc.title,
      summary: doc.summary,
      extractedText: doc.extractedText,
      fileType: doc.fileType,
      categories,
    };
  } catch (error) {
    console.error("regenerateCardsFromSavedSourceAction error:", error);
    return { success: false, error: "Failed to regenerate cards" };
  }
}

/**
 * Delete a saved source material record
 */
export async function deleteSourceMaterialAction(sourceId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { success: false, error: "Not authenticated" };

    await db
      .delete(sourceMaterials)
      .where(and(eq(sourceMaterials.id, sourceId), eq(sourceMaterials.userId, user.id)));

    return { success: true };
  } catch (error) {
    console.error("deleteSourceMaterialAction error:", error);
    return { success: false, error: "Failed to delete source material" };
  }
}
