type MockGoal = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dailyMinutes: number;
  deadline?: string;
  createdAt: string;
};

type MockCategory = {
  id: string;
  goalId: string;
  name: string;
  createdAt: string;
};

type MockItem = {
  id: string;
  userId: string;
  areaId: string;
  type: string;
  prompt: string;
  answer: string;
  difficulty: number;
  masteryLevel: string;
  createdAt: string;
};

type MockReview = {
  id: string;
  userId: string;
  itemId: string;
  scheduledAt: string;
};

type MockState = {
  user: {
    id: string;
    username: string;
    email: string;
  };
  goals: MockGoal[];
  categories: MockCategory[];
  items: MockItem[];
  reviews: MockReview[];
  dailyProgress: Array<{
    id: string;
    userId: string;
    date: string;
    newItemsAdded: number;
  }>;
  sessions: Array<{
    id: string;
    userId: string;
    startedAt: string;
    durationMinutes: number;
  }>;
};

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

function createInitialState(): MockState {
  const goalId = "goal-mandarin";
  const categoryId = "cat-vocabulary";

  return {
    user: {
      id: "mock-user",
      username: "Mock Learner",
      email: "demo@codexedoc.com",
    },
    goals: [
      {
        id: goalId,
        userId: "mock-user",
        title: "Learn Mandarin",
        description: "Build everyday speaking and listening confidence in Mandarin.",
        dailyMinutes: 30,
        deadline: "2026-12-31",
        createdAt: "2026-06-15T09:00:00.000Z",
      },
    ],
    categories: [
      {
        id: categoryId,
        goalId,
        name: "Vocabulary",
        createdAt: "2026-06-15T09:05:00.000Z",
      },
      {
        id: "cat-phrases",
        goalId,
        name: "Everyday Phrases",
        createdAt: "2026-06-16T10:00:00.000Z",
      },
    ],
    items: [
      {
        id: "item-hello",
        userId: "mock-user",
        areaId: categoryId,
        type: "vocab",
        prompt: "How do you say hello in Mandarin?",
        answer: "Nǐ hǎo",
        difficulty: 1,
        masteryLevel: "mastered",
        createdAt: "2026-06-15T09:10:00.000Z",
      },
      {
        id: "item-thanks",
        userId: "mock-user",
        areaId: categoryId,
        type: "phrase",
        prompt: "How do you say thank you?",
        answer: "Xièxie",
        difficulty: 2,
        masteryLevel: "learning",
        createdAt: "2026-06-16T09:10:00.000Z",
      },
      {
        id: "item-date",
        userId: "mock-user",
        areaId: "cat-phrases",
        type: "fact",
        prompt: "What is the Mandarin word for date?",
        answer: "Rìqī",
        difficulty: 2,
        masteryLevel: "new",
        createdAt: "2026-06-17T09:10:00.000Z",
      },
    ],
    reviews: [
      {
        id: "review-1",
        userId: "mock-user",
        itemId: "item-hello",
        scheduledAt: new Date().toISOString(),
      },
      {
        id: "review-2",
        userId: "mock-user",
        itemId: "item-thanks",
        scheduledAt: new Date().toISOString(),
      },
    ],
    dailyProgress: [
      {
        id: "progress-1",
        userId: "mock-user",
        date: new Date().toISOString(),
        newItemsAdded: 1,
      },
    ],
    sessions: [
      {
        id: "session-1",
        userId: "mock-user",
        startedAt: "2026-07-15T19:00:00.000Z",
        durationMinutes: 34,
      },
      {
        id: "session-2",
        userId: "mock-user",
        startedAt: "2026-07-16T19:30:00.000Z",
        durationMinutes: 28,
      },
    ],
  };
}

let mockState = createInitialState();

export function resetMockData() {
  mockState = createInitialState();
}

export function getMockUser() {
  return { ...mockState.user };
}

export function getMockGoal() {
  return mockState.goals[0] ? { ...mockState.goals[0] } : null;
}

export function getMockGoals() {
  return mockState.goals.map((goal) => ({ ...goal }));
}

export function getMockCategories(goalId?: string) {
  const categories = mockState.categories.filter((category) => !goalId || category.goalId === goalId);
  return categories.map((category) => ({
    ...category,
    itemCount: mockState.items.filter((item) => item.areaId === category.id).length,
  }));
}

export function getMockTodayProgress() {
  const reviewsDue = Math.max(3, mockState.reviews.length + 2);
  const newItems = mockState.items.filter((item) => item.masteryLevel === "new").length;
  return {
    reviewsDue,
    newItems,
    practiceTasks: reviewsDue,
    streak: 17,
  };
}

export function getMockProgressAnalytics() {
  const masteredItems = mockState.items.filter((item) => item.masteryLevel === "mastered").length;
  const progressPercent = mockState.items.length > 0 ? Math.round((masteredItems / mockState.items.length) * 100) : 0;
  return {
    progressPercent,
    itemsMastered: masteredItems,
    retentionRate: 87,
    streak: 17,
  };
}

export function getMockStatistics() {
  const totalMinutes = mockState.sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  return {
    totalItemsAdded: mockState.items.length,
    itemsMastered: mockState.items.filter((item) => item.masteryLevel === "mastered").length,
    reviewsCompleted: mockState.reviews.length,
    minutesStudied: totalMinutes,
    averageSessionLength: mockState.sessions.length > 0 ? Math.round(totalMinutes / mockState.sessions.length) : 0,
    consecutiveDaysActive: 17,
  };
}

export function getMockSkillTree() {
  return {
    name: "Overall Learning",
    percentage: 72,
    children: [
      {
        name: "Speaking",
        percentage: 78,
        children: [
          { name: "Introductions", percentage: 100 },
          { name: "Questions", percentage: 75 },
          { name: "Opinions", percentage: 20 },
        ],
      },
      {
        name: "Listening",
        percentage: 66,
      },
      {
        name: "Reading",
        percentage: 58,
      },
      {
        name: "Writing",
        percentage: 74,
      },
    ],
  };
}

export function getMockInsights() {
  return {
    daysOfLearning: 24,
    hasEnoughData: true,
    bestStudyTime: "7:00 PM - 8:00 PM",
    bestSessionLength: 34,
    highestRetentionDay: "Tuesday",
    lowestRetentionDay: "Saturday",
    averageRecall: 84,
    mostEffectiveMethod: "Active Recall",
    leastEffectiveMethod: "Passive Reading",
  };
}

export function createMockGoal(userId: string, data: { title: string; dailyMinutes: number; deadline?: string }) {
  const goal: MockGoal = {
    id: createId("goal"),
    userId,
    title: data.title,
    description: "Added from the mock creation flow.",
    dailyMinutes: data.dailyMinutes,
    deadline: data.deadline,
    createdAt: new Date().toISOString(),
  };

  mockState.goals.unshift(goal);
  mockState.categories.unshift({
    id: createId("cat"),
    goalId: goal.id,
    name: "Starter Notes",
    createdAt: new Date().toISOString(),
  });

  return { success: true, goal };
}

export function createMockItem(userId: string, data: { areaId: string; type: string; prompt: string; answer: string; difficulty?: number }) {
  const item: MockItem = {
    id: createId("item"),
    userId,
    areaId: data.areaId,
    type: data.type,
    prompt: data.prompt,
    answer: data.answer,
    difficulty: data.difficulty ?? 1,
    masteryLevel: "new",
    createdAt: new Date().toISOString(),
  };

  mockState.items.unshift(item);
  mockState.reviews.unshift({
    id: createId("review"),
    userId,
    itemId: item.id,
    scheduledAt: new Date().toISOString(),
  });

  const todayProgress = mockState.dailyProgress[0];
  if (todayProgress) {
    todayProgress.newItemsAdded += 1;
  } else {
    mockState.dailyProgress.unshift({
      id: createId("progress"),
      userId,
      date: new Date().toISOString(),
      newItemsAdded: 1,
    });
  }

  return { success: true, item };
}

export function createMockCategory(goalId: string, name: string) {
  const category: MockCategory = {
    id: createId("cat"),
    goalId,
    name,
    createdAt: new Date().toISOString(),
  };

  mockState.categories.unshift(category);
  return { success: true, category };
}

export function authenticateMockUser(email: string, username?: string) {
  mockState.user = {
    id: "mock-user",
    username: username || "Mock Learner",
    email: email.trim().toLowerCase(),
  };

  return {
    success: true,
    user: { ...mockState.user },
  };
}
