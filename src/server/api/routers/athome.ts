import { z } from "zod";
import type { Prisma } from "@prisma/client";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "rbrgs/server/api/trpc";

export const athomeRouter = createTRPCRouter({
  // ── Sessions ────────────────────────────────────────────────────

  /** Create a new scoring session for the current user */
  createSession: protectedProcedure
    .input(
      z.object({
        label: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.scoringSession.create({
        data: {
          userId: ctx.session.user.id,
          label: input.label ?? null,
        },
      });
    }),

  /** Finish (close) a scoring session */
  finishSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.scoringSession.update({
        where: { id: input.sessionId, userId: ctx.session.user.id },
        data: { finishedAt: new Date() },
      });
    }),

  /** Get all sessions for the current user */
  getMySessions: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.scoringSession.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { startedAt: "desc" },
      include: {
        scores: {
          select: { taskId: true, totalScore: true },
        },
        inspections: {
          select: { passed: true },
        },
      },
    });
  }),

  /** Get details for a specific session */
  getSessionDetail: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.scoringSession.findUnique({
        where: { id: input.sessionId },
        include: {
          user: { select: { name: true, email: true, image: true } },
          scores: true,
          inspections: true,
        },
      });
    }),

  /** Get all sessions across all users (for the overview/admin page) */
  getAllSessions: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.scoringSession.findMany({
      orderBy: { startedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        scores: {
          select: { taskId: true, totalScore: true },
        },
        inspections: {
          select: { passed: true },
        },
      },
    });
  }),

  // ── Scores ──────────────────────────────────────────────────────

  /** Save or update a task score within a session */
  scoreSave: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        taskId: z.string(),
        scoreData: z.record(z.unknown()),
        totalScore: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.taskScore.upsert({
        where: {
          taskId_sessionId: {
            taskId: input.taskId,
            sessionId: input.sessionId,
          },
        },
        create: {
          taskId: input.taskId,
          userId: ctx.session.user.id,
          sessionId: input.sessionId,
          scoreData: input.scoreData as Prisma.InputJsonValue,
          totalScore: input.totalScore,
        },
        update: {
          scoreData: input.scoreData as Prisma.InputJsonValue,
          totalScore: input.totalScore,
        },
      });
    }),

  /** Get all scores for a specific session */
  scoreGetBySession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.taskScore.findMany({
        where: { sessionId: input.sessionId },
      });
    }),

  /** Get best score per task across ALL sessions (all users) */
  scoreGetBestPerTask: protectedProcedure.query(async ({ ctx }) => {
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

  /** Get all scores (admin-like overview) */
  scoreGetAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.taskScore.findMany({
      orderBy: { taskId: "asc" },
      include: {
        user: { select: { name: true, email: true } },
        session: { select: { label: true, startedAt: true } },
      },
    });
  }),

  // ── Inspection ──────────────────────────────────────────────────

  /** Save or update inspection for a session */
  inspectionSave: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        checklist: z.record(z.boolean()),
        passed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.inspectionResult.upsert({
        where: { sessionId: input.sessionId },
        create: {
          userId: ctx.session.user.id,
          sessionId: input.sessionId,
          checklist: input.checklist as Prisma.InputJsonValue,
          passed: input.passed,
        },
        update: {
          checklist: input.checklist as Prisma.InputJsonValue,
          passed: input.passed,
        },
      });
    }),

  /** Get inspection for a specific session */
  inspectionGetBySession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.inspectionResult.findUnique({
        where: { sessionId: input.sessionId },
      });
    }),

  /** Get all inspections (admin-like overview) */
  inspectionGetAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.inspectionResult.findMany({
      include: {
        user: { select: { name: true, email: true } },
        session: { select: { label: true, startedAt: true } },
      },
    });
  }),
});
