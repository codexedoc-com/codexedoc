import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { GoalCreationFlowClientWrapper } from "../../components/GoalCreationFlowClientWrapper";
import { getCurrentUser } from "@/lib/getCurrentUser";

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
          <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900 shadow-sm">
            <Image
              src="/codexedoc.png"
              alt="CODEXEDOC Logo"
              fill
              className="object-contain p-1.5"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">CODEXEDOC</span>
        </Link>
      </div>

      <GoalCreationFlowClientWrapper userId={userId} />
    </div>
  );
}
