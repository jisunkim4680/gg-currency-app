import { Store } from '../types/store';

const API_URL = 'https://openapi.gg.go.kr/RegionMnyFacltStus';
const API_KEY = 'ab89d5b4dfcc4bf5b124d3dc39ad6c18';

export async function fetchStores(
  sigunName: string,
  page: number = 1,
  pageSize: number = 1000
): Promise<{ stores: Store[]; totalCount: number }> {
  const params = new URLSearchParams({
    KEY: API_KEY,
    Type: 'json',
    pIndex: String(page),
    pSize: String(pageSize),
    SIGUN_NM: sigunName,
  });

  const response = await fetch(`${API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  const result = data.RegionMnyFacltStus;
  if (!result || !Array.isArray(result) || result.length < 2) {
    throw new Error('Unexpected API response format');
  }

  const headInfo = result[0]?.head;
  if (!headInfo) {
    throw new Error('Missing head info in API response');
  }

  // head is an array of objects; totalCount is in the first element
  const totalCount: number = headInfo[0]?.list_total_count ?? 0;

  // Check for API result code errors
  const resultInfo = headInfo[1]?.RESULT;
  if (resultInfo && resultInfo.CODE !== 'INFO-000') {
    throw new Error(`API error: ${resultInfo.CODE} - ${resultInfo.MESSAGE}`);
  }

  const rows = result[1]?.row ?? [];

  const stores: Store[] = rows
    .map((row: Record<string, unknown>): Store => ({
      sigunName: (row.SIGUN_NM as string) ?? '',
      storeName: (row.CMPNM_NM as string) ?? '',
      industryName: (row.INDUTYPE_NM as string) ?? '',
      industryCode: (row.INDUTYPE_CD as string) ?? '',
      roadAddress: (row.REFINE_ROADNM_ADDR as string) ?? '',
      lotAddress: (row.REFINE_LOTNO_ADDR as string) ?? '',
      zipCode: (row.REFINE_ZIPNO as string) ?? '',
      lat: Number(row.REFINE_WGS84_LAT) || 0,
      lng: Number(row.REFINE_WGS84_LOGT) || 0,
      bizRegNo: (row.BIZREGNO as string) ?? '',
      franchiseNo: (row.FRCS_NO as string) ?? '',
      status: (row.LEAD_TAX_MAN_STATE as string) ?? '',
      statusCode: (row.LEAD_TAX_MAN_STATE_CD as string) ?? '',
    }))
    .filter((store: Store) => {
      // Filter out stores with statusCode "02" (휴업 = temporarily closed)
      if (store.statusCode === '02') return false;
      // Filter out stores without valid lat/lng coordinates
      if (!store.lat || !store.lng) return false;
      return true;
    });

  return { stores, totalCount };
}

export async function fetchAllStores(sigunName: string): Promise<Store[]> {
  const pageSize = 1000;

  // Fetch the first page to get totalCount
  const firstPage = await fetchStores(sigunName, 1, pageSize);
  const allStores: Store[] = [...firstPage.stores];
  const totalCount = firstPage.totalCount;

  // Calculate how many additional pages we need
  const totalPages = Math.ceil(totalCount / pageSize);

  // Fetch remaining pages
  for (let page = 2; page <= totalPages; page++) {
    const result = await fetchStores(sigunName, page, pageSize);
    allStores.push(...result.stores);
  }

  return allStores;
}
