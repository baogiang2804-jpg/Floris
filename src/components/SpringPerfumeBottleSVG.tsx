import React, { useState } from 'react';
import { Sparkles, Droplets, Box, Square } from 'lucide-react';
import { CalculatedIngredient } from '../utils/perfumeCalculations';
import { getScentFamilyVisual } from './SpringDecorations';
import { FlorisBottle3D } from './bottle3d/FlorisBottle3D';

interface SpringPerfumeBottleSVGProps {
  ingredients: CalculatedIngredient[];
  totalVolume: number;
  concentrationPercent: number;
  pureFragranceMl: number;
  carrierAlcoholMl: number;
  perfumeName?: string;
  compact?: boolean;
  defaultDimension?: '2d' | '3d';
}

const LAYER_PASTEL_PALETTE: Record<string, string> = {
  top_jasmine: '#FEF08A',       // Butter Jasmine Yellow
  top_jasmine_fresh: '#FDE047', // Fresh Butter Yellow
  top_pear: '#BBF7D0',          // Young Pear Leaf Green
  top_bergamot: '#D9F99D',      // Citrus Lime Leaf
  heart_peach: '#FDBA74',       // Soft Peach
  heart_peach_ripe: '#FB923C',  // Warm Peach
  heart_cherry_blossom: '#F9A8D4', // Sakura Pink
  heart_jasmine: '#FCE7F3',     // White-Pink Jasmine
  base_musk: '#E2E8F0',         // Clean White Musk Mist
  base_vanilla: '#FDE68A',      // Creamy Vanilla Butter
};

function getSpringLayerColor(ing: CalculatedIngredient): string {
  if (LAYER_PASTEL_PALETTE[ing.id]) return LAYER_PASTEL_PALETTE[ing.id];
  if (ing.tier === 'top') return '#FEF08A';
  if (ing.tier === 'heart') return '#F9A8D4';
  if (ing.tier === 'base') return '#BBF7D0';
  return ing.color || '#FBCFE8';
}

/**
 * Interactive visual Spring perfume bottle (2D SVG & 3D WebGL toggle) & stacked proportion bar.
 * Fills bottom-to-top with pastel layers matching ingredient ratios (or Oil vs Solvent view).
 */
export const SpringPerfumeBottleSVG: React.FC<SpringPerfumeBottleSVGProps> = ({
  ingredients,
  totalVolume,
  concentrationPercent,
  pureFragranceMl,
  carrierAlcoholMl,
  perfumeName = 'Floris',
  compact = false,
  defaultDimension = '2d',
}) => {
  const [dimensionMode, setDimensionMode] = useState<'2d' | '3d'>(defaultDimension);
  const [viewMode, setViewMode] = useState<'blend' | 'bottle'>('blend');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeIngredients = ingredients.filter((i) => i.percentage > 0);
  const totalPct = activeIngredients.reduce((sum, i) => sum + i.percentage, 0) || 100;

  // Stack Base notes at the bottom, Heart in middle, Top at top (mirrors volatility!)
  const orderedForBottle = [
    ...activeIngredients.filter((i) => i.tier === 'base'),
    ...activeIngredients.filter((i) => i.tier === 'heart'),
    ...activeIngredients.filter((i) => i.tier === 'top'),
  ];

  // Bottle liquid interior coordinate space: y from 68 (top of liquid) to 188 (bottom) => height = 120
  const liquidTop = 68;
  const liquidHeight = 120;

  const layers =
    viewMode === 'blend'
      ? (() => {
          let cursorY = liquidTop + liquidHeight;
          return orderedForBottle.map((ing) => {
            const h = (ing.percentage / totalPct) * liquidHeight;
            cursorY -= h;
            const badge = getScentFamilyVisual(ing.scentFamily, ing.name);
            const cleanName = ing.name
              .split('(')[0]
              .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
              .trim();
            return {
              key: ing.slotKey,
              label: cleanName || ing.name.split('(')[0].trim(),
              emoji: badge.emoji,
              pct: ing.percentage,
              subText: `${ing.volumeMl} mL · ${ing.drops} giọt`,
              color: getSpringLayerColor(ing),
              y: cursorY,
              height: Math.max(h, 2),
              tierLabel: ing.tierLabel,
            };
          });
        })()
      : [
          {
            key: 'pure_oil',
            label: `Cốt hương (${concentrationPercent}%)`,
            emoji: '🌸',
            pct: concentrationPercent,
            subText: `${pureFragranceMl} mL tinh dầu`,
            color: '#F9A8D4',
            y: liquidTop + liquidHeight - (concentrationPercent / 100) * liquidHeight,
            height: Math.max((concentrationPercent / 100) * liquidHeight, 6),
            tierLabel: 'Tinh dầu',
          },
          {
            key: 'solvent',
            label: `Dung môi (${100 - concentrationPercent}%)`,
            emoji: '💧',
            pct: 100 - concentrationPercent,
            subText: `${carrierAlcoholMl} mL Ethanol + Nước cất`,
            color: '#DCFCE7',
            y: liquidTop,
            height: ((100 - concentrationPercent) / 100) * liquidHeight,
            tierLabel: 'Dung môi',
          },
        ];

  const activeHovered = layers.find((l) => l.key === hoveredId) || null;

  return (
    <div className="spring-card p-4 sm:p-5 flex flex-col gap-4">
      {/* Compact Header & Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[#FCE7F3] border border-[#F9A8D4] flex items-center justify-center text-sm">
            🧴
          </span>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#DB2777] block">
              Chai nước hoa
            </span>
            <h3 className="text-sm font-bold text-[#2B342D] leading-tight">
              {totalVolume} mL · {concentrationPercent}% cốt
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* 2D <-> 3D Dimension Switcher */}
          <div
            role="group"
            aria-label="Chế độ hiển thị 2D hoặc 3D"
            className="inline-flex rounded-full bg-[#FCE7F3]/80 p-1 border border-[#F9A8D4]/70"
          >
            <button
              type="button"
              onClick={() => setDimensionMode('2d')}
              aria-pressed={dimensionMode === '2d'}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                dimensionMode === '2d'
                  ? 'bg-white text-[#BE185D] shadow-xs'
                  : 'text-[#6B4A58] hover:text-[#2B342D]'
              }`}
            >
              <Square className="w-3 h-3" />
              <span>2D</span>
            </button>
            <button
              type="button"
              onClick={() => setDimensionMode('3d')}
              aria-pressed={dimensionMode === '3d'}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                dimensionMode === '3d'
                  ? 'bg-gradient-to-r from-[#EC4899] to-[#F472B6] text-white shadow-xs'
                  : 'text-[#6B4A58] hover:text-[#2B342D]'
              }`}
            >
              <Box className="w-3 h-3" />
              <span>3D</span>
            </button>
          </div>

          {/* Composition View Mode Switcher */}
          <div className="inline-flex rounded-full bg-[#FFF5E8] p-1 border border-[#F6DCE5]">
            <button
              type="button"
              onClick={() => setViewMode('blend')}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                viewMode === 'blend'
                  ? 'bg-white text-[#BE185D] shadow-xs'
                  : 'text-[#5C6B5F] hover:text-[#2B342D]'
              }`}
            >
              Tỷ lệ hương
            </button>
            <button
              type="button"
              onClick={() => setViewMode('bottle')}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                viewMode === 'bottle'
                  ? 'bg-white text-[#15803D] shadow-xs'
                  : 'text-[#5C6B5F] hover:text-[#2B342D]'
              }`}
            >
              Cốt & Dung môi
            </button>
          </div>
        </div>
      </div>

      {/* Bottle Visual + Layer Legend */}
      <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-12'} gap-4 items-center`}>
        {/* 2D SVG or 3D WebGL Perfume Bottle */}
        <div
          className={`${
            compact ? '' : dimensionMode === '3d' ? 'sm:col-span-6' : 'sm:col-span-5'
          } flex flex-col items-center justify-center relative w-full`}
        >
          {dimensionMode === '3d' ? (
            <div className="w-full space-y-2">
              <FlorisBottle3D
                layers={layers}
                totalVolume={totalVolume}
                concentrationPercent={concentrationPercent}
                perfumeName={perfumeName}
                hoveredId={hoveredId}
                onHoverLayer={setHoveredId}
                onSelectLayer={setHoveredId}
                compact={compact}
              />
            </div>
          ) : (
            <svg
              viewBox="0 0 160 215"
              className={compact ? 'w-36 h-48' : 'w-40 h-52 sm:w-44 sm:h-56'}
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label={`Minh họa 2D chai nước hoa ${perfumeName} ${totalVolume} mL`}
            >
              <defs>
                <clipPath id="bottleInteriorClip">
                  <rect x="30" y="64" width="100" height="126" rx="26" />
                </clipPath>
                <linearGradient id="glassShine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
                  <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.15" />
                  <stop offset="85%" stopColor="#FFFFFF" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.45" />
                </linearGradient>
                <linearGradient id="capGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>

              {/* Wooden / Butter-Gold Rounded Cap */}
              <rect x="62" y="14" width="36" height="24" rx="10" fill="url(#capGrad)" stroke="#D97706" strokeWidth="1.5" strokeOpacity="0.45" />
              {/* Collar */}
              <rect x="66" y="38" width="28" height="12" rx="4" fill="#FBCFE8" stroke="#EC4899" strokeWidth="1.2" strokeOpacity="0.5" />
              {/* Bottle Neck */}
              <path d="M58 50 H102 L106 60 H54 Z" fill="#FFFDF8" stroke="#EBC3D1" strokeWidth="1.5" />

              {/* Outer Glass Body */}
              <rect
                x="25"
                y="58"
                width="110"
                height="138"
                rx="30"
                fill="#FFFFFF"
                stroke="#EBC3D1"
                strokeWidth="2.5"
              />

              {/* Liquid Layers clipped to inner glass */}
              <g clipPath="url(#bottleInteriorClip)">
                <rect x="30" y="64" width="100" height="126" fill="#FFFBF5" />
                {layers.map((layer) => (
                  <rect
                    key={layer.key}
                    x="28"
                    y={layer.y}
                    width="104"
                    height={layer.height + 0.5}
                    fill={layer.color}
                    opacity={hoveredId && hoveredId !== layer.key ? 0.55 : 0.92}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredId(layer.key)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setHoveredId(hoveredId === layer.key ? null : layer.key)}
                  />
                ))}
                {/* Soft liquid glass highlight */}
                <rect x="30" y="64" width="100" height="126" fill="url(#glassShine)" pointerEvents="none" />
              </g>

              {/* Glass Highlight Streak */}
              <path
                d="M39 76 V170"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeLinecap="round"
                strokeOpacity="0.7"
                pointerEvents="none"
              />

              {/* Minimal Center Label */}
              <rect
                x="46"
                y="104"
                width="68"
                height="38"
                rx="12"
                fill="#FFFFFF"
                fillOpacity="0.9"
                stroke="#F9A8D4"
                strokeWidth="1.4"
                pointerEvents="none"
              />
              <text
                x="80"
                y="121"
                textAnchor="middle"
                fill="#BE185D"
                fontSize="11"
                fontWeight="700"
                fontFamily="Quicksand, sans-serif"
              >
                🌸 Floris
              </text>
              <text
                x="80"
                y="135"
                textAnchor="middle"
                fill="#4A4D48"
                fontSize="8.5"
                fontWeight="600"
                fontFamily="JetBrains Mono, monospace"
              >
                {totalVolume} mL · {concentrationPercent}%
              </text>
            </svg>
          )}

          {/* Mini Interactive Tooltip Readout */}
          <div className="min-h-[26px] text-center mt-1.5">
            {activeHovered ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F5] border border-[#FBCFE8] text-xs font-bold text-[#9D174D]">
                <span>{activeHovered.emoji}</span>
                <span>{activeHovered.label}: {activeHovered.pct}%</span>
              </span>
            ) : (
              <span className="text-[11px] text-[#5C6B5F] flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-[#EC4899]" />
                <span>
                  {dimensionMode === '3d'
                    ? 'Xoay chai 3D & chạm tầng hương'
                    : 'Chạm tầng màu hoặc bật 3D'}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Visual Proportion Bars & Chips */}
        <div className={`${compact ? '' : dimensionMode === '3d' ? 'sm:col-span-6' : 'sm:col-span-7'} space-y-3`}>
          {/* Stacked Horizontal Ratio Bar (Thanh tỷ lệ) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#2B342D]">
              <span>Thanh tỷ lệ thành phần</span>
              <span className="font-mono text-[#15803D]">
                {viewMode === 'blend' ? `${Math.round(totalPct)}% cốt` : `${totalVolume} mL`}
              </span>
            </div>
            <div className="w-full h-5 rounded-full overflow-hidden flex border border-[#F3D5E0] bg-[#FFFDF8] shadow-inner">
              {layers.map((layer) => (
                <button
                  key={layer.key}
                  type="button"
                  style={{ width: `${layer.pct}%`, backgroundColor: layer.color }}
                  onMouseEnter={() => setHoveredId(layer.key)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setHoveredId(hoveredId === layer.key ? null : layer.key)}
                  title={`${layer.label}: ${layer.pct}% (${layer.subText})`}
                  className="h-full transition-all duration-300 border-r border-white/60 last:border-r-0 flex items-center justify-center text-[10px] font-bold text-[#2B342D]/90 overflow-hidden"
                >
                  {layer.pct >= 12 ? `${layer.pct}%` : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Color Legend Cards (Icon + Short Name + % + mL) */}
          <div className="grid grid-cols-1 gap-2">
            {layers.map((layer) => {
              const isSelected = hoveredId === layer.key;
              return (
                <button
                  key={layer.key}
                  type="button"
                  onMouseEnter={() => setHoveredId(layer.key)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setHoveredId(isSelected ? null : layer.key)}
                  className={`flex items-center justify-between gap-2 p-2.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#FFF1F5] border-[#F472B6] shadow-xs scale-[1.01]'
                      : 'bg-[#FFFDF8] border-[#F3DCE4] hover:border-[#F9A8D4]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-4 h-4 rounded-full shrink-0 border border-black/10"
                      style={{ backgroundColor: layer.color }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#2B342D] truncate">
                        {layer.emoji} {layer.label}
                      </div>
                      <div className="text-[11px] font-mono text-[#5C6B5F] truncate">
                        {layer.subText}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-[#BE185D] shrink-0 bg-[#FCE7F3] px-2 py-0.5 rounded-full">
                    {layer.pct}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Solvent Quick Pill */}
          <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-[#ECFDF3] border border-[#BBF7D0] text-xs">
            <span className="flex items-center gap-1.5 font-bold text-[#166534]">
              <Droplets className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Cốt {pureFragranceMl} mL · Dung môi {carrierAlcoholMl} mL</span>
            </span>
            <span className="font-mono font-bold text-[#15803D]">
              ~{Math.round(totalVolume * 20)} giọt
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
