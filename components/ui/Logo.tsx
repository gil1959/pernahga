export default function PernahgaLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 443 511"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Lightbulb base */}
      <path
        d="M160 400 Q160 460 221.5 460 Q283 460 283 400"
        stroke="#8DA399"
        strokeWidth="24"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="175" y="450" width="93" height="18" rx="9" fill="#8DA399" />
      <rect x="190" y="475" width="63" height="16" rx="8" fill="#2D2D2D" />

      {/* Network nodes - center */}
      <circle cx="221" cy="220" r="22" fill="#2D2D2D" />

      {/* Outer ring nodes */}
      <circle cx="221" cy="120" r="16" fill="#2D2D2D" />
      <circle cx="320" cy="165" r="16" fill="#2D2D2D" />
      <circle cx="330" cy="275" r="16" fill="#2D2D2D" />
      <circle cx="260" cy="350" r="16" fill="#2D2D2D" />
      <circle cx="182" cy="350" r="16" fill="#2D2D2D" />
      <circle cx="112" cy="275" r="16" fill="#2D2D2D" />
      <circle cx="122" cy="165" r="16" fill="#2D2D2D" />

      {/* Mid ring nodes */}
      <circle cx="271" cy="140" r="13" fill="#2D2D2D" />
      <circle cx="325" cy="222" r="13" fill="#2D2D2D" />
      <circle cx="296" cy="316" r="13" fill="#2D2D2D" />
      <circle cx="146" cy="316" r="13" fill="#2D2D2D" />
      <circle cx="117" cy="222" r="13" fill="#2D2D2D" />
      <circle cx="171" cy="140" r="13" fill="#2D2D2D" />

      {/* Lines from center to outer */}
      <line x1="221" y1="220" x2="221" y2="120" stroke="#8DA399" strokeWidth="10" strokeLinecap="round" />
      <line x1="221" y1="220" x2="320" y2="165" stroke="#8DA399" strokeWidth="10" strokeLinecap="round" />
      <line x1="221" y1="220" x2="330" y2="275" stroke="#8DA399" strokeWidth="10" strokeLinecap="round" />
      <line x1="221" y1="220" x2="260" y2="350" stroke="#8DA399" strokeWidth="10" strokeLinecap="round" />
      <line x1="221" y1="220" x2="182" y2="350" stroke="#8DA399" strokeWidth="10" strokeLinecap="round" />
      <line x1="221" y1="220" x2="112" y2="275" stroke="#8DA399" strokeWidth="10" strokeLinecap="round" />
      <line x1="221" y1="220" x2="122" y2="165" stroke="#8DA399" strokeWidth="10" strokeLinecap="round" />

      {/* Outer ring connections */}
      <line x1="221" y1="120" x2="320" y2="165" stroke="#8DA399" strokeWidth="8" strokeLinecap="round" />
      <line x1="320" y1="165" x2="330" y2="275" stroke="#8DA399" strokeWidth="8" strokeLinecap="round" />
      <line x1="330" y1="275" x2="260" y2="350" stroke="#8DA399" strokeWidth="8" strokeLinecap="round" />
      <line x1="260" y1="350" x2="182" y2="350" stroke="#8DA399" strokeWidth="8" strokeLinecap="round" />
      <line x1="182" y1="350" x2="112" y2="275" stroke="#8DA399" strokeWidth="8" strokeLinecap="round" />
      <line x1="112" y1="275" x2="122" y2="165" stroke="#8DA399" strokeWidth="8" strokeLinecap="round" />
      <line x1="122" y1="165" x2="221" y2="120" stroke="#8DA399" strokeWidth="8" strokeLinecap="round" />

      {/* Lightbulb arc body */}
      <path
        d="M140 265 Q130 170 221 110 Q312 170 302 265"
        stroke="#8DA399"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
