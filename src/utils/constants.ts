export const API_KEY = 'ab89d5b4dfcc4bf5b124d3dc39ad6c18';
export const API_BASE_URL = 'https://openapi.gg.go.kr/RegionMnyFacltStus';

export const SIGUN_LIST = [
  '가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시',
  '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시',
  '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군',
  '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시',
  '포천시', '하남시', '화성시',
];

export const INDUSTRY_CATEGORIES: Record<string, string> = {
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

export const PAGE_SIZE = 1000;

export const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24시간
