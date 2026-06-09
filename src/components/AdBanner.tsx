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
      if (ref.current && window.aclib) {
        const s = document.createElement('script');
        s.type = 'text/javascript';
        s.text = 'aclib.runBanner({zoneId:"' + zoneId + '"});';
        ref.current.appendChild(s);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [zoneId]);

  return <div ref={ref} className={className} />;
}
