import { DailyReview } from "@/types";

export function getTodayDate(timezone: string): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const parts = new Intl.DateTimeFormat("en-CA", options).format(now);
  return parts; // Returns YYYY-MM-DD
}

export function calculateStreak(history: DailyReview[], today: string): number {
  if (history.length === 0) return 1;

  const todayDate = new Date(today + "T00:00:00");
  const lastDate = new Date(history[0].date + "T00:00:00");
  const diffDays = Math.floor(
    (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 1) {
    // Día consecutivo — streak = entries anteriores + 1
    // (el caller ya validó que no hay gaps)
    return history.length + 1;
  }

  if (diffDays === 0) {
    // Mismo día (no debería pasar por la regla 1)
    return history.length;
  }

  // Gap de 2+ días — streak roto
  return 1;
}

export function formatDateES(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getDayNumber(createdDate: string, currentDate: string): number {
  const created = new Date(createdDate);
  const current = new Date(currentDate);
  const diff = Math.floor(
    (current.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff + 1;
}
