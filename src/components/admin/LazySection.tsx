import { useState, useCallback, ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LazySectionProps {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: () => ReactNode;
}

export function LazySection({ title, icon, defaultOpen = false, children }: LazySectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(defaultOpen);

  const toggle = useCallback(() => {
    if (!mounted) setMounted(true);
    setOpen(prev => !prev);
  }, [mounted]);

  return (
    <div>
      <Button
        variant="ghost"
        onClick={toggle}
        className="w-full justify-between px-0 h-8 text-sm font-semibold text-foreground hover:bg-transparent"
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
      {mounted && (
        <div style={{ display: open ? 'block' : 'none' }}>
          {children()}
        </div>
      )}
    </div>
  );
}
