import React from 'react';

/**
 * Subtle falling sakura petals & young spring leaves backdrop.
 * Uses inline SVG only, pointer-events-none, and respects prefers-reduced-motion.
 */
export const SakuraPetalsBackdrop: React.FC = () => {
  const petals = [
    { left: '6%', size: 16, duration: '18s', delay: '0s', type: 'petal' },
    { left: '16%', size: 13, duration: '21s', delay: '-5s', type: 'leaf' },
    { left: '28%', size: 15, duration: '16s', delay: '-9s', type: 'petal' },
    { left: '42%', size: 12, duration: '22s', delay: '-3s', type: 'petal' },
    { left: '58%', size: 14, duration: '19s', delay: '-11s', type: 'leaf' },
    { left: '72%', size: 17, duration: '17s', delay: '-6s', type: 'petal' },
    { left: '84%', size: 13, duration: '20s', delay: '-13s', type: 'petal' },
    { left: '93%', size: 14, duration: '23s', delay: '-2s', type: 'leaf' },
  ];

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* Top-right soft sakura & butter radial glow */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-45 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(251,207,232,0.7) 0%, rgba(254,243,199,0.45) 55%, rgba(255,255,255,0) 75%)',
        }}
      />
      {/* Bottom-left soft young leaf & cream glow */}
      <div
        className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full opacity-45 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(187,247,208,0.65) 0%, rgba(254,249,195,0.4) 55%, rgba(255,255,255,0) 75%)',
        }}
      />

      {petals.map((p, idx) => (
        <div
          key={idx}
          className="absolute -top-8 animate-sakura-fall"
          style={
            {
              left: p.left,
              '--fall-duration': p.duration,
              '--fall-delay': p.delay,
            } as React.CSSProperties
          }
        >
          {p.type === 'petal' ? (
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C15.5 5 18 9.2 17.5 13.8C17 17.8 14.5 20.5 12 21.5C9.5 20.5 7 17.8 6.5 13.8C6 9.2 8.5 5 12 2Z"
                fill="#FBCFE8"
                stroke="#F472B6"
                strokeOpacity="0.45"
                strokeWidth="1"
              />
              <path
                d="M12 4.5C12.3 9 12.2 14 12 18.5"
                stroke="#F9A8D4"
                strokeWidth="0.9"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 19C5 10 11 4.5 20 4C19.5 13 14 19 4 19Z"
                fill="#BBF7D0"
                stroke="#4ADE80"
                strokeOpacity="0.55"
                strokeWidth="1"
              />
              <path
                d="M5.5 17.5C9.5 13.5 14 9.5 18 6"
                stroke="#22C55E"
                strokeOpacity="0.5"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Floris circular inline SVG emblem (sakura flower + young leaf + bottle).
 */
export const FlorisSpringEmblem: React.FC<{ className?: string }> = ({
  className = 'w-10 h-10',
}) => (
  <svg
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="florisBgGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFE4EC" />
        <stop offset="55%" stopColor="#FFF7D6" />
        <stop offset="100%" stopColor="#DCFCE7" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="url(#florisBgGrad)" stroke="#F472B6" strokeWidth="2" strokeOpacity="0.45" />
    {/* Young Spring Leaf */}
    <path
      d="M15 41C16 32 22 27 30 27C29 36 23 41 15 41Z"
      fill="#86EFAC"
      stroke="#16A34A"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    {/* Five-petal Sakura Blossom */}
    <g transform="translate(34 31)">
      {[0, 72, 144, 216, 288].map((deg) => (
        <path
          key={deg}
          transform={`rotate(${deg})`}
          d="M0 -3 C4 -11, 9 -14, 0 -17 C-9 -14, -4 -11, 0 -3Z"
          fill="#F9A8D4"
          stroke="#DB2777"
          strokeWidth="1"
          strokeOpacity="0.55"
        />
      ))}
      <circle cx="0" cy="0" r="4" fill="#FDE047" stroke="#D97706" strokeWidth="1" />
    </g>
  </svg>
);

/**
 * Decorative inline SVG cherry blossom branch & spring leaves for hero/banner.
 */
export const SakuraBranchIllustration: React.FC<{ className?: string }> = ({
  className = 'w-44 h-28',
}) => (
  <svg
    viewBox="0 0 220 120"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Branch */}
    <path
      d="M10 92 C58 84, 114 60, 198 22"
      stroke="#A1624F"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M84 71 C104 52, 126 36, 148 16"
      stroke="#A1624F"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Young Leaves */}
    <path
      d="M44 82 C36 68, 46 54, 62 56 C62 72, 52 80, 44 82Z"
      fill="#86EFAC"
      stroke="#22C55E"
      strokeWidth="1.2"
    />
    <path
      d="M168 38 C178 24, 196 24, 206 34 C194 46, 178 46, 168 38Z"
      fill="#BBF7D0"
      stroke="#16A34A"
      strokeWidth="1.2"
    />
    {/* Big Sakura Flower */}
    <g transform="translate(132 54)">
      {[0, 72, 144, 216, 288].map((deg) => (
        <path
          key={deg}
          transform={`rotate(${deg})`}
          d="M0 -4 C7 -14, 14 -20, 0 -24 C-14 -20, -7 -14, 0 -4Z"
          fill="#FBCFE8"
          stroke="#EC4899"
          strokeWidth="1.2"
          strokeOpacity="0.55"
        />
      ))}
      <circle cx="0" cy="0" r="5.5" fill="#FEF08A" stroke="#F59E0B" strokeWidth="1.2" />
    </g>
    {/* Medium Sakura Flower */}
    <g transform="translate(76 66) scale(0.75)">
      {[0, 72, 144, 216, 288].map((deg) => (
        <path
          key={deg}
          transform={`rotate(${deg})`}
          d="M0 -4 C7 -14, 14 -20, 0 -24 C-14 -20, -7 -14, 0 -4Z"
          fill="#FFE4EC"
          stroke="#F472B6"
          strokeWidth="1.2"
        />
      ))}
      <circle cx="0" cy="0" r="5" fill="#FDE047" />
    </g>
    {/* Small Blossom */}
    <g transform="translate(178 26) scale(0.55)">
      {[0, 72, 144, 216, 288].map((deg) => (
        <path
          key={deg}
          transform={`rotate(${deg})`}
          d="M0 -4 C7 -14, 14 -20, 0 -24 C-14 -20, -7 -14, 0 -4Z"
          fill="#F9A8D4"
          stroke="#DB2777"
          strokeWidth="1.3"
        />
      ))}
      <circle cx="0" cy="0" r="5" fill="#FEF08A" />
    </g>
    {/* Drifting Petals */}
    <path d="M24 38 C30 33, 35 37, 30 43 C24 46, 21 41, 24 38Z" fill="#FBCFE8" />
    <path d="M188 76 C194 71, 200 76, 194 82 C188 85, 184 80, 188 76Z" fill="#F9A8D4" />
  </svg>
);

export interface ScentFamilyBadgeInfo {
  emoji: string;
  shortLabel: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  swatchHex: string;
}

/**
 * Maps an ingredient's scentFamily/name to a compact icon + 1–2 word pastel badge
 * so we never dump walls of text in cards or dropdowns.
 */
export function getScentFamilyVisual(scentFamily: string = '', name: string = ''): ScentFamilyBadgeInfo {
  const key = `${scentFamily} ${name}`.toLowerCase();

  if (key.includes('cam') || key.includes('chanh') || key.includes('citrus') || key.includes('bergamot') || key.includes('quýt')) {
    return {
      emoji: '🍋',
      shortLabel: 'Cam chanh',
      bgClass: 'bg-[#FEF9C3]',
      textClass: 'text-[#854D0E]',
      borderClass: 'border-[#FDE047]',
      swatchHex: '#FDE047',
    };
  }
  if (key.includes('đào') || key.includes('lê') || key.includes('trái cây') || key.includes('fruity')) {
    return {
      emoji: '🍑',
      shortLabel: 'Trái cây',
      bgClass: 'bg-[#FFEDD5]',
      textClass: 'text-[#9A3412]',
      borderClass: 'border-[#FDBA74]',
      swatchHex: '#FDBA74',
    };
  }
  if (key.includes('hoa anh đào') || key.includes('hồng') || key.includes('nhài') || key.includes('hoa') || key.includes('floral')) {
    return {
      emoji: '🌸',
      shortLabel: 'Hoa cỏ',
      bgClass: 'bg-[#FCE7F3]',
      textClass: 'text-[#9D174D]',
      borderClass: 'border-[#F9A8D4]',
      swatchHex: '#F9A8D4',
    };
  }
  if (key.includes('bạc hà') || key.includes('thảo mộc') || key.includes('tươi mát') || key.includes('oải hương') || key.includes('cỏ')) {
    return {
      emoji: '🌿',
      shortLabel: 'Lá tươi',
      bgClass: 'bg-[#DCFCE7]',
      textClass: 'text-[#166534]',
      borderClass: 'border-[#86EFAC]',
      swatchHex: '#86EFAC',
    };
  }
  if (key.includes('gỗ') || key.includes('wood') || key.includes('hoắc') || key.includes('tuyết tùng') || key.includes('đàn hương')) {
    return {
      emoji: '🪵',
      shortLabel: 'Gỗ ấm',
      bgClass: 'bg-[#FEF3C7]',
      textClass: 'text-[#78350F]',
      borderClass: 'border-[#FCD34D]',
      swatchHex: '#F59E0B',
    };
  }
  if (key.includes('vani') || key.includes('vanilla') || key.includes('gourmand') || key.includes('hổ phách')) {
    return {
      emoji: '🍦',
      shortLabel: 'Ngọt dịu',
      bgClass: 'bg-[#FEF3C7]',
      textClass: 'text-[#92400E]',
      borderClass: 'border-[#FDE68A]',
      swatchHex: '#FDE68A',
    };
  }
  if (key.includes('xạ hương') || key.includes('musk') || key.includes('phấn')) {
    return {
      emoji: '🤍',
      shortLabel: 'Xạ hương',
      bgClass: 'bg-[#F3F4F6]',
      textClass: 'text-[#374151]',
      borderClass: 'border-[#E5E7EB]',
      swatchHex: '#E5E7EB',
    };
  }
  if (key.includes('quế') || key.includes('tiêu') || key.includes('bạch đậu khấu') || key.includes('gia vị') || key.includes('spicy')) {
    return {
      emoji: '✨',
      shortLabel: 'Gia vị',
      bgClass: 'bg-[#FFE4E6]',
      textClass: 'text-[#9F1239]',
      borderClass: 'border-[#FDA4AF]',
      swatchHex: '#FDA4AF',
    };
  }

  return {
    emoji: '🌸',
    shortLabel: 'Hương xuân',
    bgClass: 'bg-[#FCE7F3]',
    textClass: 'text-[#9D174D]',
    borderClass: 'border-[#F9A8D4]',
    swatchHex: '#F9A8D4',
  };
}

export const ScentFamilyVisualBadge: React.FC<{
  scentFamily?: string;
  name?: string;
  className?: string;
}> = ({ scentFamily = '', name = '', className = '' }) => {
  const info = getScentFamilyVisual(scentFamily, name);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${info.bgClass} ${info.textClass} ${info.borderClass} ${className}`}
    >
      <span aria-hidden="true">{info.emoji}</span>
      <span>{info.shortLabel}</span>
    </span>
  );
};
