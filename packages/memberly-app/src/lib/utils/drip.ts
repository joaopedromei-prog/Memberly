/**
 * Drip content utilities.
 * Controls progressive content unlock based on days since purchase.
 */

export function isDripUnlocked(grantedAt: string, dripDays: number | null): boolean {
  if (dripDays === null || dripDays === 0) return true;
  const unlockDate = new Date(grantedAt).getTime() + dripDays * 86_400_000;
  return Date.now() >= unlockDate;
}

export function getEffectiveDripDays(
  moduleDripDays: number | null,
  lessonDripDays: number | null
): number {
  return Math.max(moduleDripDays ?? 0, lessonDripDays ?? 0);
}

export function getDripCountdown(
  grantedAt: string,
  dripDays: number
): { days: number; hours: number; minutes: number } {
  const unlockDate = new Date(grantedAt).getTime() + dripDays * 86_400_000;
  const diff = Math.max(0, unlockDate - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
  };
}
