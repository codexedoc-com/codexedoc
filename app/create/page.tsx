import { GoalCreationFlowClientWrapper } from "../../components/GoalCreationFlowClientWrapper";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function CreateGoalPage() {
  const user = await getCurrentUser();
  const userId = user?.id ?? "mock-user";

  return (
    <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
      <GoalCreationFlowClientWrapper userId={userId} />
    </div>
  );
}
