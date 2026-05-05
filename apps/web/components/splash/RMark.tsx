interface RMarkProps {
  size?: number;
  color?: string;
  className?: string;
}

export function RMark({ size = 124, color = "#fff", className }: RMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-label="Runwae"
    >
      <path
        d="M22 14 H56 a26 26 0 0 1 0 52 H38 V86 H22 Z M38 28 V52 H54 a12 12 0 0 0 0 -24 Z"
        fill={color}
      />
      <path d="M58 60 L82 86 H66 L46 64 Z" fill={color} />
    </svg>
  );
}
