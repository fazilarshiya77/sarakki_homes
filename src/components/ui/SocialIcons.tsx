import type { SVGProps } from "react";

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsappIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} {...base} {...props}>
      <path d="M6.4 17.6 4.8 21l3.5-1.6a8.4 8.4 0 1 0-1.9-1.8Z" />
      <path d="M9 10.2c0 3 2.6 5.6 5.6 5.6.5 0 .9-.5.9-1v-.8a.6.6 0 0 0-.5-.6l-1.7-.4a.6.6 0 0 0-.6.2l-.4.5a.5.5 0 0 1-.6.1 4.7 4.7 0 0 1-2.3-2.3.5.5 0 0 1 .1-.6l.5-.4a.6.6 0 0 0 .2-.6l-.4-1.7a.6.6 0 0 0-.6-.5H10c-.5 0-1 .4-1 .9Z" />
    </svg>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="8" y1="10.5" x2="8" y2="16.5" />
      <circle cx="8" cy="6.8" r="0.3" fill="currentColor" stroke="none" />
      <path d="M12 16.5v-3.6c0-1.3 1-2 2-2s1.8.7 1.8 2v3.6" />
      <line x1="12" y1="10.5" x2="12" y2="16.5" />
    </svg>
  );
}
