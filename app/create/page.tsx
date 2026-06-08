import { redirect } from "next/navigation";
import { GoalCreationFlowClientWrapper } from "../../components/GoalCreationFlowClientWrapper";
import { getCurrentUser } from "@/server/actions/app/auth";

export default async function CreateGoalPage() {
  const user = await getCurrentUser();
  const userId = user?.id;
  if (!userId) {
    // No authenticated user; redirect to app dashboard
    redirect('/app');
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
      <GoalCreationFlowClientWrapper userId={userId!} />
    </div>
  );
}
