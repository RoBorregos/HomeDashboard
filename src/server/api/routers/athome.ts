import { z } from "zod";
import type { Prisma } from "@prisma/client";
import {
  createTRPCRouter,
  judgeProcedure,
  adminProcedure,
} from "rbrgs/server/api/trpc";

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
      return ctx.db.taskScore.upsert({
        where: {
          taskId_judgeId: {
            taskId: input.taskId,
            judgeId: ctx.session.user.id,
          },
        },
        create: {
          taskId: input.taskId,
          judgeId: ctx.session.user.id,
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
    return ctx.db.taskScore.findMany({
      where: { judgeId: ctx.session.user.id },
    });
  }),

  scoreGetBestPerTask: judgeProcedure.query(async ({ ctx }) => {
    // Get all scores, then compute best per task in JS
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
      include: {
        judge: { select: { id: true, name: true, email: true } },
      },
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
      return ctx.db.inspectionResult.upsert({
        where: { judgeId: ctx.session.user.id },
        create: {
          judgeId: ctx.session.user.id,
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
    return ctx.db.inspectionResult.findUnique({
      where: { judgeId: ctx.session.user.id },
    });
  }),

  inspectionGetAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.inspectionResult.findMany({
      include: {
        judge: { select: { id: true, name: true, email: true } },
      },
    });
  }),

  // ── Reset ───────────────────────────────────────────────────
  resetAll: judgeProcedure.mutation(async ({ ctx }) => {
    await ctx.db.taskScore.deleteMany({
      where: { judgeId: ctx.session.user.id },
    });
    await ctx.db.inspectionResult.deleteMany({
      where: { judgeId: ctx.session.user.id },
    });
    return { success: true };
  }),
});
