const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export function formatRelativeDate(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  if (diff < MINUTE) return 'agora';
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
  if (diff < WEEK) {
    const days = Math.floor(diff / DAY);
    return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  }
  if (diff < 30 * DAY) {
    const weeks = Math.floor(diff / WEEK);
    return `há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  }

  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
