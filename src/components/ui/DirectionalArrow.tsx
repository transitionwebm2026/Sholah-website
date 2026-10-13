import {ArrowRight} from 'lucide-react';
import {cn} from '@/lib/utils';

/** "Forward" arrow that points left in RTL and right in LTR. Loops forward when its button/card is hovered. */
export function DirectionalArrow({className}: {className?: string}) {
  return <ArrowRight aria-hidden className={cn('fx-arrow size-4 shrink-0 rtl:-scale-x-100', className)} />;
}
