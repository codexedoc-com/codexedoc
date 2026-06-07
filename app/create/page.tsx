"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { GoalCreationFlow } from "../../components/GoalCreationFlow";

export default function CreateGoalPage() {
  const router = useRouter();
  const params = useSearchParams();
  const userId = params?.get("userId") ?? undefined;

  return (
    <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
      <GoalCreationFlow userId={userId} onClose={() => router.back()} onGoalCreated={() => router.push('/app')} />
    </div>
  );
}
