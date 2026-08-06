'use server';

import { getMockItems } from "@/server/mockData"

import {
  getMockGoal,
  getMockCategories,
  getMockTodayProgress,
  getMockProgressAnalytics,
  getMockStatistics,
  getMockSkillTree,
  getMockInsights,
} from '@/server/mockData';

import { serverAuth } from "@/lib/auth/gateway/serverAuth";

export async function fetchActiveGoal() {
  const user = await serverAuth.requireUser();
  return getMockGoal();
}

export async function fetchGoalCategories(goalId: string) {
  const user = await serverAuth.requireUser();
  return getMockCategories(goalId);
}

export async function fetchTodayProgress(goalId?: string) {
  const user = await serverAuth.requireUser();
  return getMockTodayProgress();
}

export async function fetchProgressAnalytics(goalId?: string) {
  const user = await serverAuth.requireUser();
  return getMockProgressAnalytics();
}

export async function fetchStatistics() {
  // ADR-002 Phase 2: resolve identity server-side instead of trusting the client.
  // The user variable will be consumed by real database queries in a future PR.
  const user = await serverAuth.requireUser();
  return getMockStatistics();
}

export async function fetchSkillTree() {
  const user = await serverAuth.requireUser();
  return getMockSkillTree();
}

export async function fetchLearningInsights() {
  const user = await serverAuth.requireUser();
  return getMockInsights();
}

export async function fetchUserItems() {
  const user = await serverAuth.requireUser();
  return getMockItems(user.id);
}