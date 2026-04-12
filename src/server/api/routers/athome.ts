import { z } from "zod";
import type { Prisma } from "@prisma/client";
import {
  createTRPCRouter,
  judgeProcedure,
  publicProcedure,
  protectedProcedure,
} from "rbrgs/server/api/trpc";

export const athomeRouter = createTRPCRouter({
  /** Save or update a task score */
  scoreSave: judgeProcedure
    .input(
      z.object({
        taskId: z.string(),
        label: z.string().optional(),
        scoreData: z.record(z.unknown()),
        totalScore: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.taskScore.create({
        data: {
          taskId: input.taskId,
          userId: ctx.session.user.id,
          label: input.label ?? null,
          scoreData: input.scoreData as Prisma.InputJsonValue,
          totalScore: input.totalScore,
        },
      });
    }),

  /** Get my scores (renamed to match original UI code) */
  scoreGetMine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.taskScore.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { savedAt: "desc" },
    });
  }),

  /** Get best per task (all users) */
  scoreGetBestPerTask: publicProcedure.query(async ({ ctx }) => {
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

  /** Get all scores (summary view) */
  scoreGetAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.taskScore.findMany({
      orderBy: { savedAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
  }),

  // ── Inspection ──────────────────────────────────────────────────

  /** Save inspection */
  inspectionSave: judgeProcedure
    .input(
      z.object({
        checklist: z.record(z.boolean()),
        passed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.inspectionResult.upsert({
        where: { userId: ctx.session.user.id },
        create: {
          userId: ctx.session.user.id,
          checklist: input.checklist as Prisma.InputJsonValue,
          passed: input.passed,
        },
        update: {
          checklist: input.checklist as Prisma.InputJsonValue,
          passed: input.passed,
        },
      });
    }),

  /** Get my inspection (renamed to match original UI code) */
  inspectionGetMine: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.inspectionResult.findUnique({
      where: { userId: ctx.session.user.id },
    });
  }),

  /** Get all inspections */
  inspectionGetAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.inspectionResult.findMany({
      include: {
        user: { select: { name: true, email: true, image: true } },
      },
    });
  }),

  /** Legacy compat query */
  getAllSessions: publicProcedure.query(async ({ ctx }) => {
    // This is a complex query to mock the 'sessions' structure from the old admin view
    const users = await ctx.db.user.findMany({
        where: { taskScores: { some: {} } },
        include: {
            taskScores: true,
            inspectionResult: true
        }
    });

    return users.map(u => ({
        id: u.id,
        user: u,
        label: "Judge Session",
        startedAt: u.taskScores[0]?.savedAt ?? new Date(),
        finishedAt: u.taskScores.length > 0 ? new Date() : null,
        scores: u.taskScores,
        inspections: u.inspectionResult
    }));
  })
});
