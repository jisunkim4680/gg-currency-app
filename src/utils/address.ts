import { Store } from '../types/store';

export interface AddressParts {
  gu: string;   // 구/군 (예: 영통구, 권선구)
  dong: string; // 동/읍/면 (예: 신동, 매탄동)
}

// 주소에서 구/동 정보 추출
export function parseAddress(store: Store): AddressParts {
  const addr = store.roadAddress || store.lotAddress || '';
  const parts = addr.split(' ');

  let gu = '';
  let dong = '';

  for (const part of parts) {
    if (part.endsWith('구') || part.endsWith('군')) {
      if (part !== store.sigunName) {
        gu = part;
      }
    }
    if (part.endsWith('동') || part.endsWith('읍') || part.endsWith('면')) {
      // 첫 번째로 나오는 동/읍/면만 사용 (번지 앞)
      if (!dong && !part.includes('번')) {
        dong = part;
      }
    }
  }

  return { gu, dong };
}

// 가맹점 목록에서 구 목록 추출
export function getGuList(stores: Store[]): string[] {
  const guSet = new Set<string>();
  for (const store of stores) {
    const { gu } = parseAddress(store);
    if (gu) guSet.add(gu);
  }
  return Array.from(guSet).sort();
}

// 가맹점 목록에서 동 목록 추출 (선택된 구 기준)
export function getDongList(stores: Store[], selectedGu: string | null): string[] {
  const dongSet = new Set<string>();
  for (const store of stores) {
    const { gu, dong } = parseAddress(store);
    if (selectedGu && gu !== selectedGu) continue;
    if (dong) dongSet.add(dong);
  }
  return Array.from(dongSet).sort();
}

// 구/동 필터 적용
export function filterByAddress(
  stores: Store[],
  selectedGu: string | null,
  selectedDong: string | null
): Store[] {
  if (!selectedGu && !selectedDong) return stores;

  return stores.filter((store) => {
    const { gu, dong } = parseAddress(store);
    if (selectedGu && gu !== selectedGu) return false;
    if (selectedDong && dong !== selectedDong) return false;
    return true;
  });
}
