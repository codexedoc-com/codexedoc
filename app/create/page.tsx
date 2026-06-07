"use client";

import { useRouter } from "next/navigation";
import { GoalCreationFlow } from "../../components/GoalCreationFlow";

export default function CreateGoalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
      <GoalCreationFlow onClose={() => router.back()} onGoalCreated={() => router.push('/app')} />
    </div>
  );
}
