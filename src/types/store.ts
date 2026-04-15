export interface Store {
  sigunName: string;
  storeName: string;
  industryName: string;
  industryCode: string;
  roadAddress: string;
  lotAddress: string;
  zipCode: string;
  lat: number;
  lng: number;
  bizRegNo: string;
  franchiseNo: string;
  status: string;
  statusCode: string;
}

export interface StoreApiResponse {
  RegionMnyFacltStus: [
    { head: [{ list_total_count: number }, { RESULT: { CODE: string; MESSAGE: string } }, { api_version: string }] },
    { row: StoreApiRow[] }
  ];
}

export interface StoreApiRow {
  SIGUN_NM: string;
  CMPNM_NM: string;
  INDUTYPE_NM: string;
  INDUTYPE_CD: string;
  REFINE_ROADNM_ADDR: string;
  REFINE_LOTNO_ADDR: string;
  REFINE_ZIPNO: string;
  REFINE_WGS84_LAT: string;
  REFINE_WGS84_LOGT: string;
  BIZREGNO: string;
  FRCS_NO: string;
  LEAD_TAX_MAN_STATE: string;
  LEAD_TAX_MAN_STATE_CD: string;
}

export type SortType = 'distance' | 'name';

export type DataSource = 'api' | 'cache' | 'static';
