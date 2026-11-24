import React from 'react';

/**
 * 霧臺六大神獸自製向量隊徽（取代系統 Emoji，維持一致的幾何線條與撞色視覺風格）
 * 支援：leopard（霧臺雲豹）、bear（大武黑熊）、boar（勇士山豬）、deer（溪谷水鹿）、eagle（雄鷹獵手）、owl（智慧貓頭鷹）
 */
export function WutaiAnimalIcon({ animal = 'leopard', className = 'w-6 h-6' }) {
  switch (animal) {
    case 'leopard':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <circle cx="18" cy="18" r="16" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
          <path d="M10 13L12.5 8.5L15.5 12H20.5L23.5 8.5L26 13C27.5 15 27.5 22 25 24.5C22.8 26.8 13.2 26.8 11 24.5C8.5 22 8.5 15 10 13Z" fill="#F59E0B" />
          <circle cx="14.5" cy="17.5" r="1.5" fill="#1E293B" />
          <circle cx="21.5" cy="17.5" r="1.5" fill="#1E293B" />
          <path d="M16.5 20.5H19.5L18 22.5Z" fill="#1E293B" />
          <circle cx="13" cy="14" r="1" fill="#92400E" />
          <circle cx="23" cy="14" r="1" fill="#92400E" />
          <circle cx="18" cy="14.5" r="1" fill="#92400E" />
        </svg>
      );
    case 'bear':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <circle cx="18" cy="18" r="16" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
          <circle cx="11.5" cy="11.5" r="3.5" fill="#334155" />
          <circle cx="24.5" cy="11.5" r="3.5" fill="#334155" />
          <circle cx="18" cy="19" r="8.5" fill="#1E293B" />
          <ellipse cx="18" cy="21" rx="4" ry="3" fill="#CBD5E1" />
          <circle cx="14.8" cy="17" r="1.3" fill="#F8FAFC" />
          <circle cx="21.2" cy="17" r="1.3" fill="#F8FAFC" />
          <path d="M16.8 19.8H19.2L18 21.3Z" fill="#0F172A" />
          <path d="M13 24.5L18 27L23 24.5" stroke="#F8FAFC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'boar':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <circle cx="18" cy="18" r="16" fill="#FFE4E6" stroke="#E11D48" strokeWidth="2" />
          <path d="M10 13L12 9L15 12H21L24 9L26 13L27 21C27 24.5 23 26.5 18 26.5C13 26.5 9 24.5 9 21L10 13Z" fill="#9F1239" />
          <ellipse cx="18" cy="21.5" rx="4.2" ry="2.8" fill="#FDA4AF" />
          <circle cx="16.5" cy="21.5" r="0.9" fill="#881337" />
          <circle cx="19.5" cy="21.5" r="0.9" fill="#881337" />
          <path d="M12.5 22.5C11 21 11 19 12.2 18" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M23.5 22.5C25 21 25 19 23.8 18" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="14.5" cy="16.5" r="1.3" fill="#FFF1F2" />
          <circle cx="21.5" cy="16.5" r="1.3" fill="#FFF1F2" />
        </svg>
      );
    case 'deer':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <circle cx="18" cy="18" r="16" fill="#D1FAE5" stroke="#059669" strokeWidth="2" />
          <path d="M13 13L10 7M11.5 10L8.5 9.5M23 13L26 7M24.5 10L27.5 9.5" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 14C12 12 24 12 24 14L23 22C22.5 25 20.5 26.5 18 26.5C15.5 26.5 13.5 25 13 22L12 14Z" fill="#D97706" />
          <circle cx="15" cy="18" r="1.3" fill="#1E293B" />
          <circle cx="21" cy="18" r="1.3" fill="#1E293B" />
          <circle cx="18" cy="22.5" r="1.5" fill="#1E293B" />
        </svg>
      );
    case 'eagle':
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <circle cx="18" cy="18" r="16" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
          <path d="M10 17C10 12 13.5 9 18 9C22.5 9 26 12 26 17C26 22.5 22.5 26.5 18 26.5C13.5 26.5 10 22.5 10 17Z" fill="#0369A1" />
          <path d="M12 15.5L16.5 17M24 15.5L19.5 17" stroke="#F8FAFC" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="14.5" cy="17.5" r="1.2" fill="#FEF08A" />
          <circle cx="21.5" cy="17.5" r="1.2" fill="#FEF08A" />
          <path d="M16 19.5H20L18 24.5Z" fill="#F59E0B" />
        </svg>
      );
    case 'owl':
    default:
      return (
        <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
          <circle cx="18" cy="18" r="16" fill="#F3E8FF" stroke="#9333EA" strokeWidth="2" />
          <path d="M11 11L14.5 13.5H21.5L25 11L25.5 21C25.5 24.8 22 27 18 27C14 27 10.5 24.8 10.5 21L11 11Z" fill="#7E22CE" />
          <circle cx="14.5" cy="18" r="3" fill="#FFFFFF" />
          <circle cx="21.5" cy="18" r="3" fill="#FFFFFF" />
          <circle cx="14.5" cy="18" r="1.3" fill="#1E293B" />
          <circle cx="21.5" cy="18" r="1.3" fill="#1E293B" />
          <path d="M16.8 20.5H19.2L18 23Z" fill="#FBBF24" />
        </svg>
      );
  }
}
