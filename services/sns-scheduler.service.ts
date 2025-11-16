/**
 * SNS Scheduler Service
 * Processes scheduled SNS posts and executes them when the time comes
 */

import { prisma } from '@/lib/prisma';

interface PostResult {
  success: boolean;
  platformPostId?: string;
  errorMessage?: string;
}

/**
 * Post to platform (imported logic from sns-posting.service.ts)
 */
async function postToPlatform(
  platform: string,
  account: any,
  content: string,
  mediaUrls?: string[]
): Promise<PostResult> {
  // Mock implementation - delegates to platform-specific functions
  console.log(`[Scheduler] Posting to ${platform}:`, {
    accountId: account.accountId,
    contentLength: content.length,
    mediaCount: mediaUrls?.length || 0,
  });

  // Platform-specific validation
  if (platform === 'instagram' && (!mediaUrls || mediaUrls.length === 0)) {
    return {
      success: false,
      errorMessage: 'Instagram requires at least one media file',
    };
  }

  if (platform === 'twitter' && content.length > 280) {
    return {
      success: false,
      errorMessage: 'Content exceeds Twitter character limit (280)',
    };
  }

  // Mock successful post
  return {
    success: true,
    platformPostId: `${platform}_${Math.random().toString(36).substring(7)}`,
  };
}

/**
 * Process a single scheduled post
 */
async function processScheduledPost(postId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get post with account info
    const post = await prisma.snsPost.findUnique({
      where: { id: postId },
      include: {
        snsAccount: true,
      },
    });

    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    if (post.status !== 'scheduled') {
      return { success: false, error: `Post status is ${post.status}, not scheduled` };
    }

    if (!post.scheduledAt || post.scheduledAt > new Date()) {
      return { success: false, error: 'Post is not due yet' };
    }

    // Update status to 'posting'
    await prisma.snsPost.update({
      where: { id: postId },
      data: { status: 'posting' },
    });

    // Parse media URLs
    const mediaUrls = post.mediaUrls ? JSON.parse(post.mediaUrls) : [];

    // Post to platform
    const result = await postToPlatform(
      post.platform,
      post.snsAccount,
      post.content,
      mediaUrls
    );

    // Update post with result
    await prisma.snsPost.update({
      where: { id: postId },
      data: {
        status: result.success ? 'posted' : 'failed',
        platformPostId: result.platformPostId,
        postedAt: result.success ? new Date() : null,
        errorMessage: result.errorMessage,
      },
    });

    console.log(`[Scheduler] Post ${postId} processed:`, result.success ? 'SUCCESS' : 'FAILED');

    return { success: true };
  } catch (error: any) {
    console.error(`[Scheduler] Error processing post ${postId}:`, error);

    // Update post as failed
    try {
      await prisma.snsPost.update({
        where: { id: postId },
        data: {
          status: 'failed',
          errorMessage: error.message || 'Unknown error',
        },
      });
    } catch (updateError) {
      console.error(`[Scheduler] Failed to update post status:`, updateError);
    }

    return { success: false, error: error.message };
  }
}

/**
 * Main scheduler function - processes all due scheduled posts
 */
export async function processScheduledPosts(): Promise<{
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
}> {
  console.log('[Scheduler] Starting scheduled posts processing...');

  const stats = {
    processed: 0,
    successful: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    // Find all scheduled posts that are due
    const duePosts = await prisma.snsPost.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: new Date(),
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    console.log(`[Scheduler] Found ${duePosts.length} posts to process`);

    // Process each post
    for (const post of duePosts) {
      stats.processed++;

      const result = await processScheduledPost(post.id);

      if (result.success) {
        stats.successful++;
      } else {
        stats.failed++;
        stats.errors.push(`${post.id}: ${result.error}`);
      }

      // Small delay between posts to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('[Scheduler] Completed. Stats:', stats);
  } catch (error: any) {
    console.error('[Scheduler] Fatal error:', error);
    stats.errors.push(`Fatal: ${error.message}`);
  }

  return stats;
}

/**
 * Cleanup old posts (optional maintenance task)
 * Removes posted/failed posts older than specified days
 */
export async function cleanupOldPosts(olderThanDays: number = 90): Promise<{
  deleted: number;
}> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.snsPost.deleteMany({
      where: {
        status: {
          in: ['posted', 'failed'],
        },
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`[Cleanup] Deleted ${result.count} old posts`);

    return { deleted: result.count };
  } catch (error: any) {
    console.error('[Cleanup] Error:', error);
    return { deleted: 0 };
  }
}
