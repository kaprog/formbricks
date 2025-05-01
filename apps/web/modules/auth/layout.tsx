import { getIsFreshInstance } from "@/lib/instance/service";
import { authOptions } from "@/modules/auth/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";

export const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const [session, isFreshInstance] = await Promise.all([getServerSession(authOptions), getIsFreshInstance()]);

  if (session) {
    redirect(`/`);
  }

  if (isFreshInstance) {
    redirect("/setup/intro");
  }
  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-slate-50">
        <div className="isolate bg-white">
          <div className="bg-gradient-radial flex min-h-screen from-slate-200 to-slate-50">{children}</div>
        </div>
      </div>
    </>
  );
};
