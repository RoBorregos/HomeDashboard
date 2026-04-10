import { createCallerFactory, createTRPCRouter } from "rbrgs/server/api/trpc";
import { athomeRouter } from "./routers/athome";
import { adminRouter } from "./routers/admin";
import { configRouter } from "./routers/config";
import { interviewerRouter } from "./routers/interviewer";
import { judgeRouter } from "./routers/judge";
import { rolesRouter } from "./routers/roles";
import { scoreboardRouter } from "./routers/scoreboard";
import { teamRouter } from "./routers/team";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  athome: athomeRouter,
  admin: adminRouter,
  config: configRouter,
  interviewer: interviewerRouter,
  judge: judgeRouter,
  roles: rolesRouter,
  scoreboard: scoreboardRouter,
  team: teamRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
