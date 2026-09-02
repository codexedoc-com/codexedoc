import { redirect } from "next/navigation";
import { GoalCreationFlowClientWrapper } from "../../components/GoalCreationFlowClientWrapper";
import { getCurrentUser } from "@/lib/getCurrentUser";
import Link from "next/link";
import { Brain } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CreateGoalPage() {
  const user = await getCurrentUser();
  const userId = user?.id;
  if (!userId) {
    redirect('/auth');
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <Link href="/app" className="inline-flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Brain className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">CODEXEDOC</span>
        </Link>
      </div>

      <GoalCreationFlowClientWrapper userId={userId} />
    </div>
  );
}
