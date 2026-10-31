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

export function getPrayersForDate(date: Date) {
  const isFriday = date.getDay() === 5;
  if (!isFriday) return PRAYERS;
  return [
    { id: 'fajr', name: 'Fajr', icon: 'Moon' },
    { id: 'sunrise', name: 'Sunrise', icon: 'Sunrise' },
    { id: 'jumuah', name: "Jumu'ah", icon: 'Users' },
    { id: 'asr', name: 'Asr', icon: 'SunDim' },
    { id: 'maghrib', name: 'Maghrib', icon: 'Sunset' },
    { id: 'ishā', name: 'Ishā', icon: 'MoonStar' },
  ];
}

export type PrayerId = typeof PRAYERS[number]['id'] | 'jumuah';

export function parseTime(timeStr: string | undefined, date: Date): Date {
  if (!timeStr) return new Date(date);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

export function getNextPrayer(todayData: PrayerData, currentTime: Date, tomorrowData?: PrayerData) {
  if (!todayData) return null;

  const isFriday = currentTime.getDay() === 5;
  const middayId = isFriday ? 'jumuah' : 'zuhr';
  const middayName = isFriday ? "Jumu'ah" : "Zuhr";
  const middayJamaah = isFriday ? '13:15' : todayData["zuhr_jama'h"];
  const middayBegins = isFriday ? '12:30' : todayData.zuhr_begins;

  const prayerTimes = [
    { id: 'fajr', time: parseTime(todayData["fajr_jama'h"], currentTime), name: 'Fajr', beginsTime: parseTime(todayData.fajr_begins, currentTime) },
    { id: 'sunrise', time: parseTime(todayData.sunrise, currentTime), name: 'Sunrise', beginsTime: parseTime(todayData.sunrise, currentTime) },
    { id: middayId, time: parseTime(middayJamaah, currentTime), name: middayName, beginsTime: parseTime(middayBegins, currentTime) },
    { id: 'asr', time: parseTime(todayData["asr_jama'h"], currentTime), name: 'Asr', beginsTime: parseTime(todayData.asr_begins, currentTime) },
    { id: 'maghrib', time: parseTime(todayData["maghrib_jama'h"], currentTime), name: 'Maghrib', beginsTime: parseTime(todayData.maghrib_begins, currentTime) },
    { id: 'ishā', time: parseTime(todayData["ishā_jama'h"], currentTime), name: 'Ishā', beginsTime: parseTime(todayData.ishā_begins, currentTime) },
  ];

  for (const prayer of prayerTimes) {
    if (currentTime < prayer.time) {
      return prayer;
    }
  }
  
  // If all prayers for today have passed, next is Fajr tomorrow
  const tomorrowDate = new Date(currentTime);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);

  const tomorrowFajrTime = tomorrowData 
    ? parseTime(tomorrowData["fajr_jama'h"], tomorrowDate)
    : parseTime(todayData["fajr_jama'h"], tomorrowDate);
  const tomorrowFajrBegins = tomorrowData
    ? parseTime(tomorrowData.fajr_begins, tomorrowDate)
    : parseTime(todayData.fajr_begins, tomorrowDate);

  return { id: 'fajr', time: tomorrowFajrTime, name: 'Fajr (Tomorrow)', beginsTime: tomorrowFajrBegins };
}

export function getCurrentPrayerWindow(todayData: PrayerData, currentTime: Date, tomorrowData?: PrayerData) {
  if (!todayData) return null;

  const isFriday = currentTime.getDay() === 5;
  const middayId = isFriday ? 'jumuah' : 'zuhr';
  const middayName = isFriday ? "Jumu'ah" : "Zuhr";
  const middayJamaah = isFriday ? '13:15' : todayData["zuhr_jama'h"];
  const middayBegins = isFriday ? '12:30' : todayData.zuhr_begins;

  const prayers = [
    { id: 'fajr', time: parseTime(todayData["fajr_jama'h"], currentTime), begins: parseTime(todayData.fajr_begins, currentTime), name: 'Fajr' },
    { id: 'sunrise', time: parseTime(todayData.sunrise, currentTime), begins: parseTime(todayData.sunrise, currentTime), name: 'Sunrise' },
    { id: middayId, time: parseTime(middayJamaah, currentTime), begins: parseTime(middayBegins, currentTime), name: middayName },
    { id: 'asr', time: parseTime(todayData["asr_jama'h"], currentTime), begins: parseTime(todayData.asr_begins, currentTime), name: 'Asr' },
    { id: 'maghrib', time: parseTime(todayData["maghrib_jama'h"], currentTime), begins: parseTime(todayData.maghrib_begins, currentTime), name: 'Maghrib' },
    { id: 'ishā', time: parseTime(todayData["ishā_jama'h"], currentTime), begins: parseTime(todayData.ishā_begins, currentTime), name: 'Ishā' },
  ];

  const nextPrayer = getNextPrayer(todayData, currentTime, tomorrowData);
  if (!nextPrayer) return null;

  // Find index of next prayer
  const nextIdx = prayers.findIndex(p => p.id === nextPrayer.id);
  
  let prevPrayerTime: Date;
  if (nextIdx <= 0) {
    // Before Fajr or Fajr tomorrow: prev is Isha yesterday / Isha today
    prevPrayerTime = parseTime(todayData["ishā_jama'h"], currentTime);
    if (currentTime < prayers[0].time) {
      // Very early morning before today's Fajr: subtract 1 day from prevPrayerTime
      prevPrayerTime.setDate(prevPrayerTime.getDate() - 1);
    }
  } else {
    prevPrayerTime = prayers[nextIdx - 1].time;
  }

  const totalWindowMs = Math.max(1, nextPrayer.time.getTime() - prevPrayerTime.getTime());
  const elapsedMs = Math.max(0, currentTime.getTime() - prevPrayerTime.getTime());
  const progressPercent = Math.min(100, Math.max(0, (elapsedMs / totalWindowMs) * 100));

  const diffMinutes = (nextPrayer.time.getTime() - currentTime.getTime()) / 60000;
  const isImminent = diffMinutes <= 15 && diffMinutes >= 0;

  return {
    nextPrayer,
    prevPrayerTime,
    progressPercent: Math.round(progressPercent),
    isImminent,
    diffMinutes: Math.round(diffMinutes)
  };
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
  jumuahTime.setHours(13, 15, 0, 0); // 13:15 for Jumu'ah Jama'ah
  
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
