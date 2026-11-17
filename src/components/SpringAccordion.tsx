import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SpringAccordionProps {
  title: string;
  badge?: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  tone?: 'sakura' | 'leaf' | 'butter' | 'cream';
  children: React.ReactNode;
  className?: string;
}

const TONE_MAP = {
  sakura: {
    wrap: 'bg-[#FFF5F8] border-[#FBCFE8]',
    hover: 'hover:bg-[#FFEBF2]',
    badge: 'bg-[#FCE7F3] text-[#BE185D] border-[#F9A8D4]',
  },
  leaf: {
    wrap: 'bg-[#F3FDF6] border-[#BBF7D0]',
    hover: 'hover:bg-[#E7FAEE]',
    badge: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]',
  },
  butter: {
    wrap: 'bg-[#FFFDF0] border-[#FDE68A]',
    hover: 'hover:bg-[#FEF8D8]',
    badge: 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]',
  },
  cream: {
    wrap: 'bg-white border-[#F3DCE4]',
    hover: 'hover:bg-[#FFF8FA]',
    badge: 'bg-[#FFF1F5] text-[#9D174D] border-[#FBCFE8]',
  },
};

/**
 * Click-to-expand pastel accordion so long scientific/lab details stay hidden until clicked.
 */
export const SpringAccordion: React.FC<SpringAccordionProps> = ({
  title,
  badge,
  icon,
  defaultOpen = false,
  tone = 'cream',
  children,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const style = TONE_MAP[tone];

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${style.wrap} ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors ${style.hover}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="text-xs sm:text-sm font-bold text-[#2B342D] truncate">{title}</span>
          {badge && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 whitespace-nowrap ${style.badge}`}
            >
              {badge}
            </span>
          )}
        </div>
        <span className="shrink-0 w-7 h-7 rounded-full bg-white/80 border border-black/5 flex items-center justify-center text-[#5C6B5F]">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-black/5 text-xs text-[#39403A] space-y-2.5 bg-white/75">
          {children}
        </div>
      )}
    </div>
  );
};
