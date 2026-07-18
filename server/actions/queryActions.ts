'use server';

import {
  getMockGoal,
  getMockCategories,
  getMockTodayProgress,
  getMockProgressAnalytics,
  getMockStatistics,
  getMockSkillTree,
  getMockInsights,
} from '@/server/mockData';

export async function fetchActiveGoal(userId: string) {
  return getMockGoal();
}

export async function fetchGoalCategories(goalId: string) {
  return getMockCategories(goalId);
}

export async function fetchTodayProgress(userId: string, goalId?: string) {
  return getMockTodayProgress();
}

export async function fetchProgressAnalytics(userId: string, goalId?: string) {
  return getMockProgressAnalytics();
}

export async function fetchStatistics(userId: string) {
  return getMockStatistics();
}

export async function fetchSkillTree(userId: string) {
  return getMockSkillTree();
}

export async function fetchLearningInsights(userId: string) {
  return getMockInsights();
}
