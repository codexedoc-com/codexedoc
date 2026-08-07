import { GoalCreationFlowClientWrapper } from "../../components/GoalCreationFlowClientWrapper";

export default async function CreateGoalPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
      <GoalCreationFlowClientWrapper />
    </div>
  );
}
