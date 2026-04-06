interface PawPrintBgProps {
  size?: number;
  className?: string;
  opacity?: number;
}

// Decorative paw print SVG — used as background art
export function PawPrintBg({ size = 120, className = '', opacity = 0.15 }: PawPrintBgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Main pad */}
      <ellipse cx="50" cy="68" rx="22" ry="18" />
      {/* Top-left toe */}
      <ellipse cx="24" cy="44" rx="9" ry="11" transform="rotate(-15 24 44)" />
      {/* Top-left-center toe */}
      <ellipse cx="40" cy="35" rx="9" ry="11" transform="rotate(-5 40 35)" />
      {/* Top-right-center toe */}
      <ellipse cx="60" cy="35" rx="9" ry="11" transform="rotate(5 60 35)" />
      {/* Top-right toe */}
      <ellipse cx="76" cy="44" rx="9" ry="11" transform="rotate(15 76 44)" />
    </svg>
  );
}
