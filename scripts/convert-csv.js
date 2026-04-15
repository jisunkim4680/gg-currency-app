/**
 * CSV → JSON 변환 스크립트
 *
 * 경기도 지역화폐 가맹점 CSV 파일을 읽어서
 * 시군명별로 JSON 파일을 생성합니다.
 *
 * 사용법: node scripts/convert-csv.js
 */

import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── 경로 설정 ──
const INPUT_CSV =
  "/Users/jisun-kim/Downloads/지역화폐가맹점_가맹점번호수정_260225.csv";
const OUTPUT_DIR = join(__dirname, "..", "public", "data");

// ── 1) EUC-KR → UTF-8 변환 후 읽기 ──
// 97MB 파일은 execSync 버퍼를 넘으므로 임시 파일로 변환 후 읽기
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";

const TMP_FILE = join(tmpdir(), "gg-currency-utf8.csv");
console.log("CSV 파일을 읽고 있습니다 (EUC-KR → UTF-8 변환 중)...");
execSync(`iconv -f euc-kr -t utf-8//IGNORE "${INPUT_CSV}" > "${TMP_FILE}"`);
const raw = readFileSync(TMP_FILE, "utf-8");

// ── 2) CSV 파싱 ──
// 따옴표로 감싸진 필드, 필드 내 쉼표를 올바르게 처리하는 간단한 파서
function parseCSVLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // 이중 따옴표 → 하나의 따옴표
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== "");
const headers = parseCSVLine(lines[0]);

console.log(`헤더: ${headers.join(", ")}`);
console.log(`전체 행 수 (헤더 제외): ${lines.length - 1}`);

// ── 3) 한글 헤더 → 영어 camelCase 매핑 ──
const FIELD_MAP = {
  시군명: "sigunName",
  상호명: "storeName",
  "업종명(종목명)": "industryName",
  업종코드: "industryCode",
  소재지도로명주소: "roadAddress",
  소재지지번주소: "lotAddress",
  우편번호: "zipCode",
  위도: "lat",
  경도: "lng",
  사업자등록번호: "bizRegNo",
  가맹점번호: "franchiseNo",
  휴폐업상태: "status",
  휴폐업상태코드: "statusCode",
};

// 헤더 인덱스 매핑
const headerIndex = {};
for (const [i, h] of headers.entries()) {
  const trimmed = h.replace(/"/g, "").trim();
  headerIndex[trimmed] = i;
}

// ── 4) 행 변환 & 필터링 & 그룹핑 ──
const groups = {}; // { 시군명: [ ... ] }
let skippedClosed = 0;
let skippedNoCoords = 0;
let totalKept = 0;

for (let i = 1; i < lines.length; i++) {
  const fields = parseCSVLine(lines[i]);
  if (fields.length < headers.length) continue;

  const get = (korName) => {
    const idx = headerIndex[korName];
    return idx !== undefined ? fields[idx].trim() : "";
  };

  // 필터: 휴폐업상태코드 "02" 제외 (휴업 상태)
  const statusCode = get("휴폐업상태코드");
  if (statusCode === "02") {
    skippedClosed++;
    continue;
  }

  // 필터: 위도/경도 비어있으면 제외
  const latStr = get("위도");
  const lngStr = get("경도");
  if (!latStr || !lngStr) {
    skippedNoCoords++;
    continue;
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  if (isNaN(lat) || isNaN(lng)) {
    skippedNoCoords++;
    continue;
  }

  // 객체 생성
  const record = {};
  for (const [kor, eng] of Object.entries(FIELD_MAP)) {
    const val = get(kor);
    if (eng === "lat") record[eng] = lat;
    else if (eng === "lng") record[eng] = lng;
    else record[eng] = val;
  }

  const city = record.sigunName;
  if (!city) continue;

  if (!groups[city]) groups[city] = [];
  groups[city].push(record);
  totalKept++;
}

// ── 5) 시군별 JSON 파일 쓰기 ──
mkdirSync(OUTPUT_DIR, { recursive: true });

const cityNames = Object.keys(groups).sort();
for (const city of cityNames) {
  const filePath = join(OUTPUT_DIR, `${city}.json`);
  writeFileSync(filePath, JSON.stringify(groups[city]), "utf-8");
  console.log(`  ${city}: ${groups[city].length}건 → ${city}.json`);
}

// ── 6) 결과 요약 ──
console.log("\n=== 변환 완료 ===");
console.log(`총 도시 수: ${cityNames.length}`);
console.log(`총 유효 레코드: ${totalKept}`);
console.log(`제외 - 휴업(02): ${skippedClosed}`);
console.log(`제외 - 좌표 없음: ${skippedNoCoords}`);
