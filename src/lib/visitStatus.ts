// Shared "next visit" status helper used by the client table and the side panel
// so the badge and card can never disagree.

export type VisitTone = 'gray' | 'blue' | 'amber' | 'red' | 'neutral';

export interface VisitStatus {
  tone: VisitTone;
  label: string;
  className: string;
  isSet: boolean;
}

function fmt(d: Date): string {
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).replace(',', ' ·');
}

export function getVisitStatus(
  nextVisitAt: string | null | undefined,
  hasVisitReport: boolean = false,
): VisitStatus {
  if (!nextVisitAt) {
    return {
      tone: 'gray',
      label: 'No visit',
      className: 'bg-muted text-muted-foreground border border-transparent',
      isSet: false,
    };
  }

  const now = new Date();
  const visit = new Date(nextVisitAt);
  const isToday =
    visit.getFullYear() === now.getFullYear() &&
    visit.getMonth() === now.getMonth() &&
    visit.getDate() === now.getDate();

  if (isToday) {
    return {
      tone: 'amber',
      label: `Today · ${visit.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
      className: 'bg-amber-100 text-amber-800 border border-amber-200',
      isSet: true,
    };
  }

  if (visit.getTime() > now.getTime()) {
    return {
      tone: 'blue',
      label: fmt(visit),
      className: 'bg-blue-100 text-blue-800 border border-blue-200',
      isSet: true,
    };
  }

  // In the past
  if (!hasVisitReport) {
    return {
      tone: 'red',
      label: `${fmt(visit)} · overdue`,
      className: 'bg-red-100 text-red-800 border border-red-200',
      isSet: true,
    };
  }

  return {
    tone: 'neutral',
    label: fmt(visit),
    className: 'bg-muted text-muted-foreground border border-transparent',
    isSet: true,
  };
}