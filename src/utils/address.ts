import { Store } from '../types/store';

export interface AddressParts {
  gu: string;
  dong: string;
}

// 주소에서 구/동 정보 추출 (시군명 바로 뒤의 구만 인식)
export function parseAddress(store: Store): AddressParts {
  const addr = store.roadAddress || store.lotAddress || '';
  const parts = addr.split(' ');

  let gu = '';
  let dong = '';

  // 시군명의 위치를 찾고, 그 바로 다음이 구/군인지 확인
  const sigunIdx = parts.findIndex((p) => p === store.sigunName);

  if (sigunIdx >= 0 && sigunIdx + 1 < parts.length) {
    const nextPart = parts[sigunIdx + 1];
    // 시군명 바로 뒤에 오는 것만 구로 인식
    if (nextPart.endsWith('구') || nextPart.endsWith('군')) {
      gu = nextPart;
    }
  }

  // 동/읍/면 추출: 구 뒤에 오는 것, 또는 시군명 뒤에 오는 것
  const startIdx = gu ? sigunIdx + 2 : sigunIdx + 1;
  for (let i = startIdx; i < parts.length; i++) {
    const part = parts[i];
    if (part.endsWith('동') || part.endsWith('읍') || part.endsWith('면')) {
      if (!part.includes('번')) {
        dong = part;
        break;
      }
    }
    // 도로명이 나오면 중단 (동 정보는 그 전에 나옴)
    if (part.endsWith('로') || part.endsWith('길')) break;
  }

  return { gu, dong };
}

export function getGuList(stores: Store[]): string[] {
  const guSet = new Set<string>();
  for (const store of stores) {
    const { gu } = parseAddress(store);
    if (gu) guSet.add(gu);
  }
  return Array.from(guSet).sort();
}

export function getDongList(stores: Store[], selectedGu: string | null): string[] {
  const dongSet = new Set<string>();
  for (const store of stores) {
    const { gu, dong } = parseAddress(store);
    if (selectedGu && gu !== selectedGu) continue;
    if (dong) dongSet.add(dong);
  }
  return Array.from(dongSet).sort();
}

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
