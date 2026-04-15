const CATEGORY_MAP: Record<string, string> = {
  '일반음식점': '음식점',
  '휴게음식점': '카페',
  '제과점': '카페',
  '치과': '병원',
  '한의원': '병원',
  '의원': '병원',
  '약국': '약국',
  '편의점': '편의점',
  '슈퍼마켓': '마트',
  '대형마트': '마트',
  '미용실': '미용실',
  '이용원': '미용실',
  '학원': '학원',
  '컴퓨터': '기타',
};

export function getCategoryFromIndustry(industryName: string): string {
  const mainType = industryName.split('/')[0];
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (mainType.includes(keyword)) {
      return category;
    }
  }
  return '기타';
}

/**
 * Returns the category string for a given industry name.
 * Use this with the IndustryIcon component.
 */
export function getIndustryCategory(industryName: string): string {
  return getCategoryFromIndustry(industryName);
}

/**
 * @deprecated Use IndustryIcon component with getIndustryCategory() instead.
 * Emoji icons render differently across platforms (Android WebView, iOS, web).
 * Kept for backwards compatibility.
 */
export function getIndustryEmoji(industryName: string): string {
  const category = getCategoryFromIndustry(industryName);
  const emojiMap: Record<string, string> = {
    '음식점': '🍽️',
    '카페': '☕',
    '편의점': '🏪',
    '약국': '💊',
    '미용실': '💈',
    '병원': '🏥',
    '마트': '🛒',
    '학원': '📚',
    '기타': '🏷️',
  };
  return emojiMap[category] || '🏷️';
}
