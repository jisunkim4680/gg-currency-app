import React from 'react';
import { getCategoryFromIndustry } from '../utils/industry';

interface IndustryIconProps {
  category: string;
  size?: number;
}

const svgPaths: Record<string, React.ReactNode> = {
  // Fork and knife
  '음식점': (
    <>
      <path d="M3 3v10h2v8h2V3H5" />
      <path d="M3 3v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" />
      <path d="M18 3a4 4 0 0 0-4 4v3a2 2 0 0 0 2 2h1v9h2V3" />
    </>
  ),
  // Coffee cup
  '카페': (
    <>
      <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </>
  ),
  // Store front
  '편의점': (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-6h6v6" />
      <path d="M3 7h18" />
    </>
  ),
  // Pill / medicine
  '약국': (
    <>
      <rect x="4.5" y="2" width="6" height="10" rx="3" transform="rotate(0 7.5 7)" />
      <path d="M16.5 13.5a5 5 0 0 1 0 7.07 5 5 0 0 1-7.07 0 5 5 0 0 1 0-7.07 5 5 0 0 1 7.07 0" />
      <line x1="10.5" y1="16" x2="15.5" y2="18" />
      <line x1="4.5" y1="7" x2="10.5" y2="7" />
    </>
  ),
  // Scissors
  '미용실': (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </>
  ),
  // Medical cross
  '병원': (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </>
  ),
  // Shopping cart
  '마트': (
    <>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </>
  ),
  // Book
  '학원': (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </>
  ),
  // Tag / label
  '기타': (
    <>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </>
  ),
};

const IndustryIcon: React.FC<IndustryIconProps> = ({ category, size = 24 }) => {
  const paths = svgPaths[category] || svgPaths['기타'];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      {paths}
    </svg>
  );
};

/**
 * Helper: takes a full industry name (e.g. "일반음식점/일반음식점")
 * and returns the matching category string (e.g. "음식점").
 */
export function getIndustrySvgIcon(industryName: string): string {
  return getCategoryFromIndustry(industryName);
}

export default IndustryIcon;
