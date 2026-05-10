import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export function UpgradeLink({
  href,
  className,
  style,
  children,
}: {
  href: string;
  isPaid?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={className} style={style}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={style}>
      {children}
    </Link>
  );
}
