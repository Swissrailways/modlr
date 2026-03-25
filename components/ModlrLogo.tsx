interface LogoProps {
  size?: number
  className?: string
}

/**
 * Modlr logo mark — isometric cube with three visible faces.
 * Top face: bright, Left face: mid, Right face: dark.
 */
export function ModlrMark({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top face */}
      <path
        d="M16 3L29 10.5V11L16 18.5L3 11V10.5L16 3Z"
        fill="white"
        opacity="0.95"
      />
      {/* Left face */}
      <path
        d="M3 11L16 18.5V29L3 21.5V11Z"
        fill="white"
        opacity="0.5"
      />
      {/* Right face */}
      <path
        d="M29 11L16 18.5V29L29 21.5V11Z"
        fill="white"
        opacity="0.25"
      />
    </svg>
  )
}

/** Full wordmark: cube mark + "Modlr" logotype */
export function ModlrWordmark({ height = 28 }: { height?: number }) {
  return (
    <span className="flex items-center gap-2.5 select-none">
      <span
        className="flex-shrink-0 flex items-center justify-center rounded-[10px] bg-indigo-600 shadow-lg shadow-indigo-600/30"
        style={{ width: height, height }}
      >
        <ModlrMark size={Math.round(height * 0.65)} />
      </span>
      <span className="font-bold tracking-tight text-white" style={{ fontSize: height * 0.64 }}>
        Modlr
      </span>
    </span>
  )
}
