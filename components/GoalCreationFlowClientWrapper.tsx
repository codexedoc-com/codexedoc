"use client";

import { useRouter } from "next/navigation";
import { GoalCreationFlow } from "./GoalCreationFlow";

export function GoalCreationFlowClientWrapper() {
  const router = useRouter();

  return (
    <GoalCreationFlow
      onClose={() => router.push('/app')}
      onGoalCreated={() => router.push('/app')}
    />
  );
}
