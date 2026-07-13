type IconProps = { className?: string };

export function StarGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#e7ecff" />
          <stop offset="100%" stopColor="#c9b6ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#starGlow)" opacity="0.65" />
      <path
        d="M50 10 L58 40 L88 44 L62 60 L70 90 L50 72 L30 90 L38 60 L12 44 L42 40 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function GearIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M19.4 13.5c.04-.33.06-.66.06-1s-.02-.67-.06-1l1.86-1.45a.5.5 0 0 0 .12-.64l-1.76-3.05a.5.5 0 0 0-.6-.22l-2.2.88a7.5 7.5 0 0 0-1.73-1l-.33-2.34a.5.5 0 0 0-.5-.43h-3.5a.5.5 0 0 0-.5.43l-.33 2.34c-.63.24-1.2.58-1.73 1l-2.2-.88a.5.5 0 0 0-.6.22L2.62 9.4a.5.5 0 0 0 .12.64L4.6 11.5c-.04.33-.06.66-.06 1s.02.67.06 1l-1.86 1.45a.5.5 0 0 0-.12.64l1.76 3.05c.13.22.4.31.6.22l2.2-.88c.53.42 1.1.76 1.73 1l.33 2.34c.05.25.25.43.5.43h3.5c.25 0 .45-.18.5-.43l.33-2.34c.63-.24 1.2-.58 1.73-1l2.2.88c.2.09.47 0 .6-.22l1.76-3.05a.5.5 0 0 0-.12-.64L19.4 13.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BackArrow({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function PlayTriangle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}

export function SparkDot({ className, color = "#ffffff" }: IconProps & { color?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <defs>
        <radialGradient id={`spark-${color.replace("#", "")}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill={`url(#spark-${color.replace("#", "")})`} />
    </svg>
  );
}

export function VolumeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10v4h3.5L12 17.5v-11L7.5 10H4Z" fill="currentColor" />
      <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17.8 7.2a7 7 0 0 1 0 9.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
