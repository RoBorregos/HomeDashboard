"use client";

import { getServerAuthSession } from "rbrgs/server/auth";
import LoginText from "../../_components/login-text";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";

export default function AccountPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="mt-[4rem] p-10 text-white font-mono">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="mt-[4rem] rounded-md bg-gradient-to-r from-blue-rbrgs to-black p-10 text-white">
        <LoginText />
        <p>You need to log in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="mt-[4rem] h-max bg-black p-10 font-mono text-white">
      <h1 className="font-anton text-[3vw] mb-8">Account</h1>

      <div className="rounded-md bg-gradient-to-r from-blue-rbrgs to-black p-10 text-white">
        <p className="mb-4">
          You are logged in as <span className="text-roboblue font-bold">{session.user.email}</span> - {session.user.name}
        </p>
        
        {session.user.role === Role.JUDGE && (
          <div className="mt-4 p-4 border border-white/10 rounded-lg">
            <p className="text-sm text-gray-400">ROLE: JUDGE</p>
            <p className="mt-2">
              You can submit scores for @Home tasks.
            </p>
          </div>
        )}

        {session.user.role === Role.ADMIN && (
          <div className="mt-4 p-4 border border-emerald-500/20 rounded-lg bg-emerald-500/5">
            <p className="text-sm text-emerald-400 font-bold tracking-widest">ADMINISTRATOR</p>
            <p className="mt-2 text-gray-300">
              You have full access to competition management and overview tools.
            </p>
          </div>
        )}

        {session.user.role === Role.UNASSIGNED && (
          <div className="mt-4 p-4 border border-yellow-500/20 rounded-lg bg-yellow-500/5">
            <p className="text-sm text-yellow-400 font-bold">LIMITED ACCESS</p>
            <p className="mt-2 text-gray-400">
              Your account is not assigned to a specific role. Please contact an admin if you believe this is an error.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
