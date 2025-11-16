/**
 * SNS Posting Service
 * Handles posting content to various social media platforms
 * Supports: Facebook, Instagram, Twitter/X, Kakao, Naver
 */

import { prisma } from '@/lib/prisma';
import { encryption } from '@/lib/encryption';

export interface SnsPostData {
  contentType: 'cruise' | 'packageDiscount' | 'destination' | 'manual';
  contentId?: string;
  snsAccountId: string;
  content: string;
  mediaUrls?: string[];
  hashtags?: string;
  scheduledAt?: Date;
  createdBy: string;
}

export interface PostResult {
  success: boolean;
  platformPostId?: string;
  errorMessage?: string;
}

/**
 * Template parsing helper
 * Replaces placeholders like {name}, {description} with actual values
 */
export function parseTemplate(template: string, data: Record<string, any>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(value || ''));
  }
  return result;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Get content data for template parsing
 */
export async function getContentData(contentType: string, contentId: string): Promise<Record<string, any> | null> {
  try {
    switch (contentType) {
      case 'packageDiscount': {
        const discount = await prisma.packageDiscount.findUnique({
          where: { id: contentId },
        });
        if (!discount) return null;

        return {
          name: discount.name,
          nameEn: discount.nameEn || '',
          description: discount.description || '',
          discount: discount.discountType === 'percentage'
            ? `${(discount.discountValue * 100).toFixed(0)}%`
            : `$${discount.discountValue}`,
          validFrom: formatDate(discount.validFrom),
          validUntil: formatDate(discount.validUntil),
          displayText: discount.displayText || '',
        };
      }

      case 'destination': {
        const dest = await prisma.destination.findUnique({
          where: { id: contentId },
        });
        if (!dest) return null;

        return {
          name: dest.name,
          nameEn: dest.nameEn || '',
          description: dest.description || '',
          region: dest.region || '',
          imageUrl: dest.imageUrl || '',
        };
      }

      case 'cruise': {
        const cruise = await prisma.cruise.findUnique({
          where: { id: contentId },
        });
        if (!cruise) return null;

        return {
          name: cruise.name,
          shipName: cruise.shipName,
          description: cruise.description || '',
          departurePort: cruise.departurePort,
          durationDays: cruise.durationDays.toString(),
          startingPrice: cruise.startingPrice.toFixed(0),
          departureDate: cruise.departureDate ? formatDate(cruise.departureDate) : '',
          promotionTag: cruise.promotionTag || '',
        };
      }

      default:
        return null;
    }
  } catch (error) {
    console.error(`[SNS Service] Error getting content data:`, error);
    return null;
  }
}

/**
 * Post to Facebook
 */
async function postToFacebook(account: any, content: string, mediaUrls?: string[]): Promise<PostResult> {
  // TODO: Implement actual Facebook Graph API call
  // For now, return mock success
  console.log('[SNS Service] Mock posting to Facebook:', {
    accountId: account.accountId,
    content: content.substring(0, 100),
    mediaCount: mediaUrls?.length || 0,
  });

  return {
    success: true,
    platformPostId: 'fb_' + Math.random().toString(36).substring(7),
  };
}

/**
 * Post to Instagram
 */
async function postToInstagram(account: any, content: string, mediaUrls?: string[]): Promise<PostResult> {
  // TODO: Implement actual Instagram Graph API call
  // Instagram requires at least one image/video
  console.log('[SNS Service] Mock posting to Instagram:', {
    accountId: account.accountId,
    content: content.substring(0, 100),
    mediaCount: mediaUrls?.length || 0,
  });

  if (!mediaUrls || mediaUrls.length === 0) {
    return {
      success: false,
      errorMessage: 'Instagram requires at least one media file',
    };
  }

  return {
    success: true,
    platformPostId: 'ig_' + Math.random().toString(36).substring(7),
  };
}

/**
 * Post to Twitter/X
 */
async function postToTwitter(account: any, content: string, mediaUrls?: string[]): Promise<PostResult> {
  // TODO: Implement actual Twitter API v2 call
  console.log('[SNS Service] Mock posting to Twitter:', {
    accountId: account.accountId,
    content: content.substring(0, 100),
    mediaCount: mediaUrls?.length || 0,
  });

  // Twitter has 280 character limit (or 4000 for Twitter Blue)
  if (content.length > 280) {
    return {
      success: false,
      errorMessage: 'Content exceeds Twitter character limit (280)',
    };
  }

  return {
    success: true,
    platformPostId: 'tw_' + Math.random().toString(36).substring(7),
  };
}

/**
 * Post to Kakao
 */
async function postToKakao(account: any, content: string, mediaUrls?: string[]): Promise<PostResult> {
  // TODO: Implement actual Kakao API call
  console.log('[SNS Service] Mock posting to Kakao:', {
    accountId: account.accountId,
    content: content.substring(0, 100),
    mediaCount: mediaUrls?.length || 0,
  });

  return {
    success: true,
    platformPostId: 'kakao_' + Math.random().toString(36).substring(7),
  };
}

/**
 * Post to Naver
 */
async function postToNaver(account: any, content: string, mediaUrls?: string[]): Promise<PostResult> {
  // TODO: Implement actual Naver Blog API call
  console.log('[SNS Service] Mock posting to Naver:', {
    accountId: account.accountId,
    content: content.substring(0, 100),
    mediaCount: mediaUrls?.length || 0,
  });

  return {
    success: true,
    platformPostId: 'naver_' + Math.random().toString(36).substring(7),
  };
}

/**
 * Main posting function - posts to any platform
 */
export async function postToSns(postData: SnsPostData): Promise<{ postId: string; result: PostResult }> {
  try {
    // Get SNS account
    const account = await prisma.snsAccount.findUnique({
      where: { id: postData.snsAccountId },
    });

    if (!account) {
      throw new Error('SNS account not found');
    }

    if (!account.isActive) {
      throw new Error('SNS account is inactive');
    }

    // Create post record first
    const post = await prisma.snsPost.create({
      data: {
        contentType: postData.contentType,
        contentId: postData.contentId,
        snsAccountId: postData.snsAccountId,
        platform: account.platform,
        content: postData.content,
        mediaUrls: postData.mediaUrls ? JSON.stringify(postData.mediaUrls) : null,
        hashtags: postData.hashtags,
        status: postData.scheduledAt ? 'scheduled' : 'posting',
        scheduledAt: postData.scheduledAt,
        createdBy: postData.createdBy,
        cruiseId: postData.contentType === 'cruise' ? postData.contentId : null,
      },
    });

    // If scheduled for later, don't post now
    if (postData.scheduledAt && postData.scheduledAt > new Date()) {
      return {
        postId: post.id,
        result: { success: true },
      };
    }

    // Post to platform
    let result: PostResult;
    switch (account.platform) {
      case 'facebook':
        result = await postToFacebook(account, postData.content, postData.mediaUrls);
        break;
      case 'instagram':
        result = await postToInstagram(account, postData.content, postData.mediaUrls);
        break;
      case 'twitter':
        result = await postToTwitter(account, postData.content, postData.mediaUrls);
        break;
      case 'kakao':
        result = await postToKakao(account, postData.content, postData.mediaUrls);
        break;
      case 'naver':
        result = await postToNaver(account, postData.content, postData.mediaUrls);
        break;
      default:
        result = {
          success: false,
          errorMessage: `Unsupported platform: ${account.platform}`,
        };
    }

    // Update post with result
    await prisma.snsPost.update({
      where: { id: post.id },
      data: {
        status: result.success ? 'posted' : 'failed',
        platformPostId: result.platformPostId,
        postedAt: result.success ? new Date() : null,
        errorMessage: result.errorMessage,
      },
    });

    return { postId: post.id, result };
  } catch (error: any) {
    console.error('[SNS Service] Error posting to SNS:', error);
    throw error;
  }
}

/**
 * Auto-post based on content creation
 * Checks auto-post rules and creates posts automatically
 */
export async function autoPostContent(
  contentType: 'packageDiscount' | 'destination' | 'cruise',
  contentId: string,
  createdBy: string
): Promise<{ postIds: string[]; errors: string[] }> {
  try {
    // Find active auto-post rules for this content type
    const rules = await prisma.snsAutoPostRule.findMany({
      where: {
        contentType,
        isActive: true,
      },
      include: {
        snsAccount: true,
      },
    });

    if (rules.length === 0) {
      console.log(`[SNS Service] No auto-post rules found for ${contentType}`);
      return { postIds: [], errors: [] };
    }

    // Get content data for template parsing
    const contentData = await getContentData(contentType, contentId);
    if (!contentData) {
      return {
        postIds: [],
        errors: [`Failed to fetch content data for ${contentType} ${contentId}`],
      };
    }

    const postIds: string[] = [];
    const errors: string[] = [];

    // Create posts for each rule
    for (const rule of rules) {
      try {
        // Parse template
        const content = parseTemplate(rule.template, contentData);
        const hashtags = rule.hashtagTemplate
          ? parseTemplate(rule.hashtagTemplate, contentData)
          : undefined;

        // Determine scheduled time
        let scheduledAt: Date | undefined;
        if (!rule.postImmediately && rule.scheduleDelayMinutes) {
          scheduledAt = new Date(Date.now() + rule.scheduleDelayMinutes * 60 * 1000);
        }

        // Post to SNS
        const { postId } = await postToSns({
          contentType,
          contentId,
          snsAccountId: rule.snsAccountId,
          content,
          hashtags,
          scheduledAt,
          createdBy,
        });

        postIds.push(postId);
        console.log(`[SNS Service] Auto-posted to ${rule.snsAccount.platform}: ${postId}`);
      } catch (error: any) {
        errors.push(`Failed to post to ${rule.snsAccount.platform}: ${error.message}`);
      }
    }

    return { postIds, errors };
  } catch (error: any) {
    console.error('[SNS Service] Error in auto-post:', error);
    return { postIds: [], errors: [error.message] };
  }
}
