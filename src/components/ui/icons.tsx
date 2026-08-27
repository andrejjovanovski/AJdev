type IconName = "pin" | "layers" | "code" | "spark";

const paths: Record<IconName, React.ReactNode> = {
  pin: (
    <>
      <path d="M12 22s7-7.58 7-12.5A7 7 0 0 0 5 9.5C5 14.42 12 22 12 22Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  layers: (
    <>
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </>
  ),
  code: (
    <>
      <polyline points="9 6 3 12 9 18" />
      <polyline points="15 6 21 12 15 18" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3v4M12 17v4M5 12H1M23 12h-4M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8M18.4 18.4l-2.8-2.8M8.4 8.4 5.6 5.6" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}
