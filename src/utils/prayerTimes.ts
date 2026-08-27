export type PrayerData = {
  date: string;
  fajr_begins: string;
  "fajr_jama'h": string;
  sunrise: string;
  zuhr_begins: string;
  "zuhr_jama'h": string;
  asr_begins: string;
  "asr_jama'h": string;
  maghrib_begins: string;
  "maghrib_jama'h": string;
  ishā_begins: string;
  "ishā_jama'h": string;
};

export const PRAYERS = [
  { id: 'fajr', name: 'Fajr', icon: 'Moon' },
  { id: 'sunrise', name: 'Sunrise', icon: 'Sunrise' },
  { id: 'zuhr', name: 'Zuhr', icon: 'Sun' },
  { id: 'asr', name: 'Asr', icon: 'SunDim' },
  { id: 'maghrib', name: 'Maghrib', icon: 'Sunset' },
  { id: 'ishā', name: 'Ishā', icon: 'MoonStar' },
] as const;

export type PrayerId = typeof PRAYERS[number]['id'];

export function parseTime(timeStr: string | undefined, date: Date): Date {
  if (!timeStr) return new Date(date);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

export function getNextPrayer(todayData: PrayerData, currentTime: Date) {
  if (!todayData) return null;

  const prayerTimes = [
    { id: 'fajr', time: parseTime(todayData["fajr_jama'h"], currentTime), name: 'Fajr' },
    { id: 'sunrise', time: parseTime(todayData.sunrise, currentTime), name: 'Sunrise' },
    { id: 'zuhr', time: parseTime(todayData["zuhr_jama'h"], currentTime), name: 'Zuhr' },
    { id: 'asr', time: parseTime(todayData["asr_jama'h"], currentTime), name: 'Asr' },
    { id: 'maghrib', time: parseTime(todayData["maghrib_jama'h"], currentTime), name: 'Maghrib' },
    { id: 'ishā', time: parseTime(todayData["ishā_jama'h"], currentTime), name: 'ishā' },
  ];

  for (const prayer of prayerTimes) {
    if (currentTime < prayer.time) {
      return prayer;
    }
  }
  
  // If all prayers for today have passed, next is Fajr tomorrow
  // For simplicity in this demo, we just return null or Fajr of today if we don't have tomorrow's data
  return { id: 'fajr', time: parseTime(todayData["fajr_jama'h"], new Date(currentTime.getTime() + 86400000)), name: 'Fajr (Tomorrow)' };
}

export function formatTimeRemaining(targetTime: Date, currentTime: Date) {
  const diff = targetTime.getTime() - currentTime.getTime();
  if (diff <= 0) return { days: 0, hours: 0, totalHours: 0, minutes: 0, seconds: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, totalHours, minutes, seconds };
}

export function getNextJumuahTime(currentTime: Date): Date {
  const currentDay = currentTime.getDay();
  let daysUntilFriday = (5 - currentDay + 7) % 7;
  
  const jumuahTime = new Date(currentTime);
  jumuahTime.setHours(13, 15, 0, 0); // 13:15 for First Khutbah
  
  if (daysUntilFriday === 0 && currentTime > jumuahTime) {
    // It's Friday but past Jumu'ah time, so next Jumu'ah is next week
    daysUntilFriday = 7;
  }
  
  const nextJumuah = new Date(currentTime);
  nextJumuah.setDate(currentTime.getDate() + daysUntilFriday);
  nextJumuah.setHours(13, 15, 0, 0);
  
  return nextJumuah;
}

export function formatDateString(date: Date) {
  return date.toISOString().split('T')[0];
}

export function format12Hour(timeStr: string | undefined, locale: string = 'en-US'): string {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? (locale === 'ar-SA' ? 'م' : 'PM') : (locale === 'ar-SA' ? 'ص' : 'AM');
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  if (locale === 'ar-SA') {
    // Convert numbers to Arabic numerals if needed, but standard Arabic locale often uses Western numerals too.
    // For simplicity, we'll just use the translated AM/PM.
    return `${hours}:${minutesStr} ${ampm}`;
  }
  
  return `${hours}:${minutesStr} ${ampm}`;
}
