import { useEffect, useRef } from 'react';

interface AdBannerProps {
  zoneId: string;
  className?: string;
}

export default function AdBanner({ zoneId, className = '' }: AdBannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    const timer = setTimeout(() => {
      if (window.aclib && ref.current) {
        try { aclib.runBanner({ zoneId }); } catch {}
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [zoneId]);

  return <div ref={ref} className={className} />;
}
