import { useEffect, useState } from 'react';

export function formatReservationCountdown(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function useReservationCountdown(reservedUntil?: string | null) {
  const [secondsLeft, setSecondsLeft] = useState(() => computeSecondsLeft(reservedUntil));

  useEffect(() => {
    setSecondsLeft(computeSecondsLeft(reservedUntil));
    if (!reservedUntil) return;

    const timer = window.setInterval(() => {
      setSecondsLeft(computeSecondsLeft(reservedUntil));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [reservedUntil]);

  return {
    secondsLeft,
    display: formatReservationCountdown(secondsLeft),
    isExpired: secondsLeft <= 0,
  };
}

function computeSecondsLeft(reservedUntil?: string | null): number {
  if (!reservedUntil) return 0;
  const end = new Date(reservedUntil).getTime();
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / 1000));
}
