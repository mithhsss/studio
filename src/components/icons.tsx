import type { SVGProps } from "react";

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

export function OrangeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="24" height="24" rx="6" fill="#FFDDC9"/>
      <path d="M12 7V17M12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11M12 7C13.1046 7 14 7.89543 14 9C14 10.1046 13.1046 11 12 11M12 17V11M12 17H10M12 17H14" stroke="#FFA500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function BlueIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="24" height="24" rx="6" fill="#D6E4FF"/>
        <path d="M12 6L12 18M12 6L10 8M12 6L14 8M12 18L10 16M12 18L14 16" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function YellowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="24" height="24" rx="6" fill="#FFF5D6"/>
        <circle cx="12" cy="12" r="4" stroke="#FFC700" strokeWidth="1.5"/>
    </svg>
  );
}

export function GreenIcon(props: SVGProps<SVGSVGElement>) {
    return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="24" height="24" rx="6" fill="#D7F5DC"/>
        <path d="M10 10L14 14M10 14L14 10" stroke="#34A853" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    );
}
