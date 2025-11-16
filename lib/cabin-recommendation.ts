/**
 * AI 기반 객실 추천 시스템
 *
 * 사용자 프로필과 예약 조건을 분석하여 최적의 객실을 추천
 */

export interface UserProfile {
  numCabins: number;
  adults?: number;
  children?: number;
  budget?: number;
  preferences?: {
    needsView?: boolean;
    needsBalcony?: boolean;
    needsSpace?: boolean;
    isLuxury?: boolean;
    familyFriendly?: boolean;
  };
}

export interface CabinRecommendation {
  score: number; // 0-100
  reasons: string[];
  badges: ('best-value' | 'most-popular' | 'recommended' | 'family-friendly' | 'romantic')[];
}

/**
 * 객실 추천 점수 계산
 */
export function calculateRecommendationScore(
  cabin: any,
  profile: UserProfile,
  basePrice: number
): CabinRecommendation {
  let score = 50; // 기본 점수
  const reasons: string[] = [];
  const badges: CabinRecommendation['badges'] = [];

  const price = basePrice * cabin.priceMultiplier;

  // 1. 예산 적합성 (0-25점)
  if (profile.budget) {
    const budgetRatio = price / profile.budget;
    if (budgetRatio <= 0.8) {
      score += 25;
      reasons.push('예산 대비 가성비가 뛰어납니다');
      badges.push('best-value');
    } else if (budgetRatio <= 1.0) {
      score += 15;
      reasons.push('예산 범위 내 최적 선택');
    } else if (budgetRatio <= 1.2) {
      score += 5;
    } else {
      score -= 10;
    }
  }

  // 2. 인원수 적합성 (0-20점)
  const totalPeople = (profile.adults || 2) + (profile.children || 0);

  if (cabin.code === 'suite' && totalPeople <= 2) {
    score += 15;
    reasons.push('2인 투숙에 최적화된 스위트룸');
    badges.push('romantic');
  } else if (cabin.code === 'balcony' && totalPeople === 2) {
    score += 20;
    reasons.push('커플 여행에 인기 있는 발코니 객실');
    badges.push('most-popular');
  } else if (cabin.code === 'oceanview' && totalPeople >= 3) {
    score += 15;
    reasons.push('가족 단위 여행객에게 추천');
    badges.push('family-friendly');
  }

  // 3. 선호도 매칭 (0-25점)
  if (profile.preferences) {
    const { needsView, needsBalcony, isLuxury, familyFriendly } = profile.preferences;

    if (needsBalcony && cabin.code === 'balcony') {
      score += 20;
      reasons.push('원하시는 발코니가 포함되어 있습니다');
    } else if (needsBalcony && cabin.code === 'suite') {
      score += 25;
      reasons.push('프리미엄 발코니가 포함된 스위트');
    }

    if (needsView && (cabin.code === 'oceanview' || cabin.code === 'balcony' || cabin.code === 'suite')) {
      score += 15;
      reasons.push('멋진 바다 전망을 즐기실 수 있습니다');
    }

    if (isLuxury && cabin.code === 'suite') {
      score += 25;
      reasons.push('럭셔리한 경험을 원하시는 분께 완벽합니다');
      badges.push('recommended');
    }

    if (familyFriendly && cabin.code === 'oceanview') {
      score += 15;
      reasons.push('가족 여행에 적합한 넓은 공간');
      badges.push('family-friendly');
    }
  }

  // 4. 그룹 할인 혜택 (0-10점)
  if (profile.numCabins >= 6) {
    score += 10;
    reasons.push(`${profile.numCabins}개 객실 예약 시 10% 그룹 할인 적용`);
  } else if (profile.numCabins >= 3) {
    score += 5;
    reasons.push(`${profile.numCabins}개 객실 예약 시 5% 그룹 할인 적용`);
  }

  // 5. 카테고리별 기본 인기도
  const popularityBonus: Record<string, number> = {
    balcony: 10,
    oceanview: 5,
    suite: 8,
    inside: 0,
  };
  score += popularityBonus[cabin.code] || 0;

  // 6. 가격 대비 가치 분석
  if (cabin.code === 'oceanview') {
    reasons.push('내부 객실 대비 약간의 추가 비용으로 창문 전망 제공');
  } else if (cabin.code === 'balcony') {
    reasons.push('개인 발코니에서 바다를 감상할 수 있습니다');
    badges.push('most-popular');
  } else if (cabin.code === 'inside') {
    reasons.push('가장 경제적인 선택, 선내 시설 이용에 집중');
    if (!profile.preferences?.needsView) {
      badges.push('best-value');
    }
  }

  // 점수 범위 제한 (0-100)
  score = Math.max(0, Math.min(100, score));

  return {
    score: Math.round(score),
    reasons: reasons.slice(0, 3), // 최대 3개 이유만 표시
    badges: Array.from(new Set(badges)), // 중복 제거
  };
}

/**
 * 객실 목록을 추천 순으로 정렬
 */
export function sortCabinsByRecommendation(
  cabins: any[],
  profile: UserProfile,
  basePrice: number
): Array<{ cabin: any; recommendation: CabinRecommendation }> {
  const cabinsWithScores = cabins.map((cabin) => ({
    cabin,
    recommendation: calculateRecommendationScore(cabin, profile, basePrice),
  }));

  return cabinsWithScores.sort((a, b) => b.recommendation.score - a.recommendation.score);
}

/**
 * 추천 배지 스타일 정보
 */
export const BADGE_STYLES = {
  'best-value': {
    label: '최고 가성비',
    color: 'green',
    icon: '💰',
  },
  'most-popular': {
    label: '인기 1위',
    color: 'blue',
    icon: '⭐',
  },
  'recommended': {
    label: 'AI 추천',
    color: 'purple',
    icon: '🤖',
  },
  'family-friendly': {
    label: '가족 추천',
    color: 'orange',
    icon: '👨‍👩‍👧‍👦',
  },
  'romantic': {
    label: '로맨틱',
    color: 'pink',
    icon: '💕',
  },
};
