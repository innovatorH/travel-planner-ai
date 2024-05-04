import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from './_generated/dataModel';

export const createExpense = mutation({
    args: {
        userId: v.string(),
        planId: v.string(),
        amount: v.number(),
        purpose: v.string(),
        category: v.union(v.literal('food'),
            v.literal('commute'),
            v.literal('shopping'),
            v.literal('gifts'),
            v.literal('accomodations'),
        ),
        date: v.string()
    },
    handler: async (ctx, { userId, amount, purpose, category, date, planId }) => {
        await ctx.db.insert("expenses", {
            planId,
            userId,
            amount,
            purpose,
            category,
            date
        });
    },
});

export const deleteExpense = mutation({
    args: {
        id: v.id("expenses")
    },
    handler: async (ctx, { id }) => {
        await ctx.db.delete(id);
    },
});

export const deleteMultipleExpenses = mutation({
    args: {
        ids: v.array(v.id("expenses"))
    },
    handler: async (ctx, { ids }) => {
        ids.forEach(async id => {
            await ctx.db.delete(id);
        })
    },
});

export const getExpenses = query({
    args: {
        planId: v.string()
    },
    handler: async (ctx, { planId }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const { subject } = identity;
        const expenses = await ctx.db
            .query("expenses")
            .filter((q) => q.and(q.eq(q.field("userId"), subject), q.eq(q.field("planId"), planId)))
            .order("desc")
            .take(100);

        return expenses;
    },
});