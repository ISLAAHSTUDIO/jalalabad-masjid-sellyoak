/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  PrayerData, 
  getNextPrayer, 
  getCurrentPrayerWindow, 
  formatTimeRemaining, 
  format12Hour
} from '../utils/prayerTimes';
import { Language, translations } from '../translations';
import { 
  Clock, 
  BellRing
} from 'lucide-react';

import { AnimatedBackground } from './AnimatedBackground';

interface ExtendedHeroSectionProps {
  todayData: PrayerData;
  tomorrowData?: PrayerData;
  currentTime: Date;
  language: Language;
  t: typeof translations['en'];
  bgAnimationEnabled?: boolean;
}

export const HeroSection: React.FC<ExtendedHeroSectionProps> = ({
  todayData,
  tomorrowData,
  currentTime,
  language,
  t,
  bgAnimationEnabled = true
}) => {
  const nextPrayer = useMemo(() => {
    return getNextPrayer(todayData, currentTime, tomorrowData);
  }, [todayData, currentTime, tomorrowData]);

  const prayerWindow = useMemo(() => {
    return getCurrentPrayerWindow(todayData, currentTime, tomorrowData);
  }, [todayData, currentTime, tomorrowData]);

  const timeRemaining = useMemo(() => {
    if (!nextPrayer) return { days: 0, hours: 0, totalHours: 0, minutes: 0, seconds: 0 };
    return formatTimeRemaining(nextPrayer.time, currentTime);
  }, [nextPrayer, currentTime]);

  // Atmospheric Mood Color Config based on Next Prayer
  const atmosphericConfig = useMemo(() => {
    const prayerId = nextPrayer?.id || 'zuhr';
    switch (prayerId) {
      case 'fajr':
        return {
          chip: 'bg-indigo-500/25 text-indigo-200 border-indigo-400/40',
          auraColor: '#6366f1',
          borderClass: 'border-2 border-indigo-500/70',
          ringClass: 'ring-4 ring-indigo-500/20',
          glowClass: 'shadow-2xl shadow-indigo-950/40',
          name: 'Fajr'
        };
      case 'sunrise':
        return {
          chip: 'bg-rose-500/25 text-rose-200 border-rose-400/40',
          auraColor: '#f43f5e',
          borderClass: 'border-2 border-rose-500/70',
          ringClass: 'ring-4 ring-rose-500/20',
          glowClass: 'shadow-2xl shadow-rose-950/40',
          name: 'Sunrise'
        };
      case 'zuhr':
        return {
          chip: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40',
          auraColor: '#10b981',
          borderClass: 'border-2 border-emerald-500/70',
          ringClass: 'ring-4 ring-emerald-500/20',
          glowClass: 'shadow-2xl shadow-emerald-950/40',
          name: 'Zuhr'
        };
      case 'asr':
        return {
          chip: 'bg-amber-500/25 text-amber-200 border-amber-400/40',
          auraColor: '#d97706',
          borderClass: 'border-2 border-amber-500/70',
          ringClass: 'ring-4 ring-amber-500/20',
          glowClass: 'shadow-2xl shadow-amber-950/40',
          name: 'Asr'
        };
      case 'maghrib':
        return {
          chip: 'bg-orange-500/25 text-orange-200 border-orange-400/40',
          auraColor: '#f97316',
          borderClass: 'border-2 border-orange-500/70',
          ringClass: 'ring-4 ring-orange-500/20',
          glowClass: 'shadow-2xl shadow-orange-950/40',
          name: 'Maghrib'
        };
      case 'ishā':
      default:
        return {
          chip: 'bg-sky-500/25 text-sky-200 border-sky-400/40',
          auraColor: '#38bdf8',
          borderClass: 'border-2 border-sky-500/70',
          ringClass: 'ring-4 ring-sky-500/20',
          glowClass: 'shadow-2xl shadow-sky-950/40',
          name: 'Ishā'
        };
    }
  }, [nextPrayer]);

  const isImminent = prayerWindow?.isImminent;

  return (
    <div className={`relative rounded-[32px] overflow-hidden transition-all duration-700 ${atmosphericConfig.glowClass} rgb-border-box upcoming-rgb-box bg-[#060a14] shadow-2xl`}>
      
      {/* Animated Celestial Quran & God-Rays Background (Contained directly inside the Upcoming Box) */}
      <AnimatedBackground theme="dark" enabled={bgAnimationEnabled} isHeroContained={true} />

      {/* Main Content Container - High Contrast with translucent glass blocks */}
      <div className="relative z-10 p-6 md:p-10 flex flex-col gap-8 text-white">
        
        {/* Hero Body: Upcoming Prayer Information & Live Countdown */}
        {nextPrayer && (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 animate-in fade-in zoom-in-95 duration-500">
            
            {/* Left Column: Prayer Identification & Status */}
            <div className={`space-y-4 text-center ${language === 'ar' ? 'lg:text-right' : 'lg:text-left'} flex-1`}>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border shadow-sm backdrop-blur-md ${atmosphericConfig.chip}`}>
                  <span className="w-2 h-2 rounded-full bg-current animate-ping"></span>
                  {t.upcomingPrayer}
                </span>

                {isImminent && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-500/30 text-rose-200 border border-rose-400/50 rounded-full text-xs font-black uppercase tracking-wider animate-radar backdrop-blur-md">
                    <BellRing size={13} />
                    {t.adhanImminent}
                  </span>
                )}
              </div>

              {/* Big Prayer Name with Arabic Calligraphy Accent */}
              <div className={`flex items-baseline justify-center lg:justify-start gap-4 flex-wrap ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <h3 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-md">
                  {t[nextPrayer.id as keyof typeof t] || nextPrayer.name}
                </h3>
                <span className="text-3xl sm:text-4xl font-uthmani text-emerald-400 font-bold drop-shadow-sm">
                  {translations.ar[nextPrayer.id as keyof typeof translations.ar] || ''}
                </span>
              </div>

              {/* Exact Jama'ah & Begins Timings with high clarity */}
              <div className={`flex flex-wrap items-center justify-center lg:justify-start gap-3 text-slate-200 text-sm md:text-base`}>
                <div className="bg-black/60 border-2 border-white/20 px-4 py-2 rounded-2xl shadow-md backdrop-blur-md flex items-center gap-2">
                  <span className="text-slate-300 font-semibold">{language === 'ar' ? 'الجماعة:' : 'Jama\'ah:'}</span>
                  <span className="font-black text-white text-base md:text-lg">
                    {nextPrayer.id === 'sunrise' 
                      ? format12Hour(todayData.sunrise, language === 'ar' ? 'ar-SA' : 'en-US')
                      : format12Hour(todayData[`${nextPrayer.id}_jama'h` as keyof PrayerData] as string, language === 'ar' ? 'ar-SA' : 'en-US')
                    }
                  </span>
                </div>

                {nextPrayer.id !== 'sunrise' && (
                  <div className="bg-black/60 border-2 border-white/20 px-4 py-2 rounded-2xl shadow-md backdrop-blur-md flex items-center gap-2">
                    <span className="text-slate-300 font-semibold">{language === 'ar' ? 'البداية:' : 'Begins:'}</span>
                    <span className="font-bold text-white/95">
                      {format12Hour(todayData[`${nextPrayer.id}_begins` as keyof PrayerData] as string, language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Live Countdown Glass Cards */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-1.5 drop-shadow-sm">
                <Clock size={13} className="text-emerald-400" />
                {t.countdownToSalah}
              </span>

              <div className="flex gap-2.5 sm:gap-4 relative" dir="ltr">
                {/* Hours Block */}
                <div className="flex flex-col items-center gap-2 group">
                  <div className="bg-black/70 border-2 border-white/25 text-white w-18 h-22 sm:w-22 sm:h-26 md:w-24 md:h-28 rounded-[22px] flex flex-col items-center justify-center text-3xl sm:text-4xl md:text-5xl font-black shadow-xl backdrop-blur-xl relative overflow-hidden group-hover:border-emerald-400 transition-colors">
                    <span className="relative z-10 tabular-nums">{String(timeRemaining.totalHours).padStart(2, '0')}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-300 tracking-wider">{t.hours}</span>
                </div>

                {/* Colon Divider */}
                <div className="text-2xl sm:text-3xl font-black text-slate-400 self-center -mt-6 animate-pulse">:</div>

                {/* Minutes Block */}
                <div className="flex flex-col items-center gap-2 group">
                  <div className="bg-black/70 border-2 border-white/25 text-white w-18 h-22 sm:w-22 sm:h-26 md:w-24 md:h-28 rounded-[22px] flex flex-col items-center justify-center text-3xl sm:text-4xl md:text-5xl font-black shadow-xl backdrop-blur-xl relative overflow-hidden group-hover:border-emerald-400 transition-colors">
                    <span className="relative z-10 tabular-nums">{String(timeRemaining.minutes).padStart(2, '0')}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-300 tracking-wider">{t.minutes}</span>
                </div>

                {/* Colon Divider */}
                <div className="text-2xl sm:text-3xl font-black text-slate-400 self-center -mt-6 animate-pulse">:</div>

                {/* Seconds Block (with live subtle border pulse) */}
                <div className="flex flex-col items-center gap-2 group">
                  <div className="bg-emerald-950/60 border-2 border-emerald-400 text-emerald-300 w-18 h-22 sm:w-22 sm:h-26 md:w-24 md:h-28 rounded-[22px] flex flex-col items-center justify-center text-3xl sm:text-4xl md:text-5xl font-black shadow-[0_0_25px_rgba(16,185,129,0.35)] backdrop-blur-xl relative overflow-hidden">
                    <span className="relative z-10 tabular-nums">{String(timeRemaining.seconds).padStart(2, '0')}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs uppercase font-bold text-emerald-400 tracking-wider">{t.seconds}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Bottom Section: Quranic Verse on Performing Salah on Time */}
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl px-4 py-2.5 sm:py-3 border border-white/15 flex flex-col items-center text-center gap-1 max-w-2xl mx-auto w-full relative overflow-hidden shadow-md">
          <div className="text-emerald-300 font-uthmani text-lg sm:text-xl font-bold tracking-wide text-center leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" dir="rtl">
            {t.dailyAyahArabic}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-300 font-medium italic max-w-xl leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            "{t.dailyAyahText}" <span className="not-italic font-bold text-emerald-400 whitespace-nowrap">{language === 'ar' ? '(٤:١٠٣)' : '(4:103)'}</span>
          </p>
        </div>

      </div>
    </div>
  );
};
