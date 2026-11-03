type IconName = "arrow" | "back" | "bag" | "check" | "lock" | "truck" | "gift" | "plus" | "minus";

const paths: Record<IconName, React.ReactNode> = {
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  back: <path d="M20 12H4m6-6-6 6 6 6" />,
  bag: <><path d="M5 7h14l1 14H4L5 7Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" /></>,
  truck: <><path d="M14 17H9m-4 0H2V5h12v12Zm0-9h4l4 5v4h-3" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></>,
  gift: <><path d="M3 8h18v4H3zm2 4v9h14v-9m-7-4v13" /><path d="M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z" /></>,
  plus: <path d="M5 12h14m-7-7v14" />,
  minus: <path d="M5 12h14" />,
};

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 ${className}`}>{paths[name]}</svg>;
}
