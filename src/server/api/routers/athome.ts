import { z } from "zod";
import type { Prisma } from "@prisma/client";
import {
  createTRPCRouter,
  judgeProcedure,
  adminProcedure,
} from "rbrgs/server/api/trpc";

const ANON_JUDGE_ID = "anonymous";

export const athomeRouter = createTRPCRouter({
  // ── Scores ──────────────────────────────────────────────────
  scoreSave: judgeProcedure
    .input(
      z.object({
        taskId: z.string(),
        scoreData: z.record(z.unknown()),
        totalScore: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const judgeId = ctx.session?.user?.id ?? ANON_JUDGE_ID;
      return ctx.db.taskScore.upsert({
        where: {
          taskId_judgeId: {
            taskId: input.taskId,
            judgeId,
          },
        },
        create: {
          taskId: input.taskId,
          judgeId,
          scoreData: input.scoreData as Prisma.InputJsonValue,
          totalScore: input.totalScore,
        },
        update: {
          scoreData: input.scoreData as Prisma.InputJsonValue,
          totalScore: input.totalScore,
        },
      });
    }),

  scoreGetMine: judgeProcedure.query(async ({ ctx }) => {
    const judgeId = ctx.session?.user?.id ?? ANON_JUDGE_ID;
    return ctx.db.taskScore.findMany({
      where: { judgeId },
    });
  }),

  scoreGetBestPerTask: judgeProcedure.query(async ({ ctx }) => {
    const all = await ctx.db.taskScore.findMany({
      select: { taskId: true, totalScore: true },
    });
    const best = new Map<string, number>();
    for (const s of all) {
      const cur = best.get(s.taskId) ?? -Infinity;
      if (s.totalScore > cur) best.set(s.taskId, s.totalScore);
    }
    return Object.fromEntries(best);
  }),

  scoreGetAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.taskScore.findMany({
      orderBy: { taskId: "asc" },
    });
  }),

  // ── Inspection ──────────────────────────────────────────────
  inspectionSave: judgeProcedure
    .input(
      z.object({
        checklist: z.record(z.boolean()),
        passed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const judgeId = ctx.session?.user?.id ?? ANON_JUDGE_ID;
      return ctx.db.inspectionResult.upsert({
        where: { judgeId },
        create: {
          judgeId,
          checklist: input.checklist as Prisma.InputJsonValue,
          passed: input.passed,
        },
        update: {
          checklist: input.checklist as Prisma.InputJsonValue,
          passed: input.passed,
        },
      });
    }),

  inspectionGetMine: judgeProcedure.query(async ({ ctx }) => {
    const judgeId = ctx.session?.user?.id ?? ANON_JUDGE_ID;
    return ctx.db.inspectionResult.findUnique({
      where: { judgeId },
    });
  }),

  inspectionGetAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.inspectionResult.findMany();
  }),

  // ── Reset ───────────────────────────────────────────────────
  resetAll: judgeProcedure.mutation(async ({ ctx }) => {
    const judgeId = ctx.session?.user?.id ?? ANON_JUDGE_ID;
    await ctx.db.taskScore.deleteMany({
      where: { judgeId },
    });
    await ctx.db.inspectionResult.deleteMany({
      where: { judgeId },
    });
    return { success: true };
  }),
});
