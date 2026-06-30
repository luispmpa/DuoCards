export function isoDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function isDue(due: string, now = new Date()) {
  return new Date(due).getTime() <= now.getTime();
}

export function formatShortDate(value: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  })
    .format(new Date(value))
    .replace(".", "");
}

export function formatLongDate(value: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(value));
}

export function relativeDue(value: string | Date) {
  const milliseconds = new Date(value).getTime() - Date.now();
  const minutes = Math.round(milliseconds / 60000);
  if (minutes <= 1) return "agora";
  if (minutes < 60) return `em ${minutes} min`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `em ${hours} h`;

  const days = Math.round(hours / 24);
  return `em ${days} ${days === 1 ? "dia" : "dias"}`;
}
