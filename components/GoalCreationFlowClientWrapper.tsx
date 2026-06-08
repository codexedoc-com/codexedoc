"use client";

import { useRouter } from "next/navigation";
import { GoalCreationFlow } from "./GoalCreationFlow";

export function GoalCreationFlowClientWrapper({ userId }: { userId: string }) {
  const router = useRouter();

  return (
    <GoalCreationFlow
      userId={userId}
      onClose={() => router.push('/app')}
      onGoalCreated={() => router.push('/app')}
    />
  );
}
