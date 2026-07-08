'use server';

import {
  getActiveGoal,
  getGoalCategories,
  getTodayProgress,
  getProgressAnalytics,
  getStatistics,
  getSkillTree,
  getLearningInsights,
} from '@/server/queries/appQueries';

export async function fetchActiveGoal(userId: string) {
  return getActiveGoal(userId);
}

export async function fetchGoalCategories(goalId: string) {
  return getGoalCategories(goalId);
}

export async function fetchTodayProgress(userId: string, goalId?: string) {
  return getTodayProgress(userId, goalId ?? "");
}

export async function fetchProgressAnalytics(userId: string, goalId?: string) {
  return getProgressAnalytics(userId, goalId ?? "");
}

export async function fetchStatistics(userId: string) {
  return getStatistics(userId);
}

export async function fetchSkillTree(userId: string) {
  return getSkillTree(userId);
}

export async function fetchLearningInsights(userId: string) {
  return getLearningInsights(userId);
}
