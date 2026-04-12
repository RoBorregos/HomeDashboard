"use client";

import { useSession } from "next-auth/react";
import LoginText from "../../_components/login-text";

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
      <h1 className="font-anton text-[3vw] mb-8 uppercase tracking-widest text-roboblue">Your Profile</h1>

      <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-10 text-white backdrop-blur-md">
        <div className="flex items-center gap-6 mb-8 border-b border-gray-700 pb-8">
          {session.user.image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={session.user.image} alt="" className="h-16 w-16 rounded-full border-2 border-roboblue" />
          )}
          <div>
            <h2 className="text-2xl font-bold">{session.user.name}</h2>
            <p className="text-gray-400">{session.user.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Access Level</p>
            <div className="inline-block px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase">
              {session.user.role ?? "JUDGE"}
            </div>
          </section>

          <section className="pt-4">
             <p className="text-sm text-gray-400">
               Logged in via NextAuth. Your session data is used to record judge attempts for competition tasks.
             </p>
          </section>
        </div>
      </div>
    </div>
  );
}
