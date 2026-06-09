import { useEffect, useState } from 'react';
import { X, ExternalLink, Megaphone } from 'lucide-react';
import { getAppSetting } from '../lib/db';

interface PromoData {
  title: string;
  image: string;
  link: string;
  enabled: boolean;
}

export default function PromoBanner({ userId }: { userId: string | undefined }) {
  const [promo, setPromo] = useState<PromoData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getAppSetting('promo_banner').then((data) => {
      if (data) {
        const p = typeof data === 'string' ? JSON.parse(data) : data;
        setPromo(p.enabled ? p : null);
      }
    }).catch(() => {});
  }, [userId]);

  if (!promo || dismissed) return null;

  const content = (
    <div className="relative bg-gradient-to-r from-amber-500/10 via-primary/5 to-amber-500/10 border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Megaphone className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="text-xs font-medium text-on-surface truncate">{promo.title || 'Promotion'}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {promo.link && (
            <a href={promo.link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/15 text-amber-400 text-[10px] font-semibold hover:bg-amber-500/25 transition-all">
              View <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <button onClick={() => setDismissed(true)} className="p-1 rounded hover:bg-surface-container text-on-surface-variant/60 hover:text-on-surface transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return content;
}
