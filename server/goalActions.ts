"use server";

import { db } from "@/server/db/db";
import { goals, learningAreas } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// Get user's goals
export async function getUserGoals(userId: string) {
  try {
    const userGoals = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId));

    return {
      success: true,
      data: userGoals,
    };
  } catch (error) {
    console.error("Error fetching goals:", error);
    return {
      success: false,
      error: "Failed to fetch goals",
    };
  }
}

// Create a new goal
export async function createGoal(
  userId: string,
  data: {
    title: string;
    description?: string;
    deadline?: Date;
    dailyMinutes: number;
  }
) {
  try {
    const newGoal = await db.insert(goals).values({
      userId,
      title: data.title,
      description: data.description,
      deadline: data.deadline,
      dailyMinutes: data.dailyMinutes,
    });

    return {
      success: true,
      message: "Goal created successfully",
    };
  } catch (error) {
    console.error("Error creating goal:", error);
    return {
      success: false,
      error: "Failed to create goal",
    };
  }
}

// Get learning areas for a goal
export async function getLearningAreas(goalId: string) {
  try {
    const areas = await db
      .select()
      .from(learningAreas)
      .where(eq(learningAreas.goalId, goalId));

    return {
      success: true,
      data: areas,
    };
  } catch (error) {
    console.error("Error fetching learning areas:", error);
    return {
      success: false,
      error: "Failed to fetch learning areas",
    };
  }
}

// Create a new learning area (category)
export async function createLearningArea(goalId: string, name: string) {
  try {
    const newArea = await db.insert(learningAreas).values({
      goalId,
      name,
    });

    return {
      success: true,
      message: "Learning area created successfully",
    };
  } catch (error) {
    console.error("Error creating learning area:", error);
    return {
      success: false,
      error: "Failed to create learning area",
    };
  }
}
