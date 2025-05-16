import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Build up the path for each segment
  const crumbs = segments.map((segment, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/');
    // Capitalize and replace dashes/underscores
    const label = segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
    return { href, label };
  });

  if (crumbs.length === 0) return null;

  return (
    <nav className="text-sm text-orange-700 my-2 animate-fade-in" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href="/dashboard"
            className="hover:underline font-semibold text-orange-600 transition-colors duration-200 hover:text-orange-800"
          >
            Dashboard
          </Link>
        </li>
        {crumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.href}>
            <span className="mx-1 text-orange-400">/</span>
            <li>
              {idx === crumbs.length - 1 ? (
                <AnimatedShinyText shimmerWidth={80} className="font-bold text-orange-800">
                  {crumb.label}
                </AnimatedShinyText>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:underline text-orange-600 transition-colors duration-200 hover:text-orange-800"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
} 