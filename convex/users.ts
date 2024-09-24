import { ConvexError, v } from "convex/values";

import { internalMutation, query } from "./_generated/server";


/**
 * Fungsi `getUserById` digunakan untuk mengambil data pengguna berdasarkan `clerkId`.
 * - Argumen: `clerkId` (string).
 * - Handler: Fungsi asinkron yang mencari pengguna di tabel "users" dengan `clerkId` yang diberikan.
 * - Jika pengguna tidak ditemukan, lemparkan error "User not found".
 * - Mengembalikan data pengguna jika ditemukan.
 */
export const getUserById = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    return user;
  },
});

/**
 * Fungsi `getTopUserByPodcastCount` digunakan untuk mengambil data pengguna dan mengurutkannya berdasarkan jumlah podcast yang mereka miliki.
 * - Argumen: Tidak ada argumen yang diperlukan.
 * - Handler: Fungsi asinkron yang mengambil semua pengguna dari tabel "users".
 *   - Untuk setiap pengguna, mengambil semua podcast yang mereka buat dari tabel "podcasts".
 *   - Mengurutkan podcast berdasarkan jumlah tampilan (views) secara menurun.
 *   - Mengembalikan data pengguna yang mencakup jumlah total podcast dan daftar podcast yang diurutkan.
 * - Mengembalikan data pengguna yang diurutkan berdasarkan jumlah total podcast secara menurun.
 */
export const getTopUserByPodcastCount = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").collect();

    const userData = await Promise.all(
      user.map(async (u) => {
        const podcasts = await ctx.db
          .query("podcasts")
          .filter((q) => q.eq(q.field("authorId"), u.clerkId))
          .collect();

        const sortedPodcasts = podcasts.sort((a, b) => b.views - a.views);

        return {
          ...u,
          totalPodcasts: podcasts.length,
          podcast: sortedPodcasts.map((p) => ({
            podcastTitle: p.podcastTitle,
            pocastId: p._id,
          })),
        };
      })
    );

    return userData.sort((a, b) => b.totalPodcasts - a.totalPodcasts);
  },
});

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      imageUrl: args.imageUrl,
      name: args.name,
    });
  },
});

export const updateUser = internalMutation({
  args: {
    clerkId: v.string(),
    imageUrl: v.string(),
    email: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      imageUrl: args.imageUrl,
      email: args.email,
    });

    const podcast = await ctx.db
      .query("podcasts")
      .filter((q) => q.eq(q.field("authorId"), args.clerkId))
      .collect();

    await Promise.all(
      podcast.map(async (p) => {
        await ctx.db.patch(p._id, {
          authorImageUrl: args.imageUrl,
        });
      })
    );
  },
});

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.delete(user._id);
  },
});