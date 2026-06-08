import { redirect } from "next/navigation";
import { GoalCreationFlowClientWrapper } from "@/components/GoalCreationFlowClientWrapper";
import { getCurrentUser } from "@/server/queries/app";

export default async function CreateGoalPage() {
  const user = await getCurrentUser();
  const userId = user?.id;
  if (!userId) {
    redirect('/app');
  }

  return (
    <main className="relative min-h-screen bg-[#050816] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_40%)]" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-20">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-black leading-tight sm:text-6xl">
            Create Your First Goal
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/65">
            Start by creating a clear learning goal to power your dashboard.
          </p>
        </div>
      </div>

      <GoalCreationFlowClientWrapper userId={userId!} />
    </main>
  );
}
