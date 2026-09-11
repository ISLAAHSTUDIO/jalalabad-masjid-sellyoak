/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useCurrentTime } from './hooks/useCurrentTime';
import timetableData from './data/timetable.json';
import { Language, translations } from './translations';
import { 
  PRAYERS, 
  PrayerData, 
  getNextPrayer, 
  formatTimeRemaining, 
  formatDateString,
  parseTime,
  getNextJumuahTime,
  format12Hour
} from './utils/prayerTimes';
import { HeroSection } from './components/HeroSection';
import { 
  Moon, 
  Sunrise, 
  Sun, 
  SunDim, 
  Sunset, 
  MoonStar,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Settings,
  Home,
  Users,
  BookOpen,
  Volume2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Heart,
  CalendarDays,
  Bell,
  X,
  ExternalLink,
  Mail,
  Globe,
  Phone
} from 'lucide-react';

const iconMap = {
  Moon,
  Sunrise,
  Sun,
  SunDim,
  Sunset,
  MoonStar
};

const prayerCardConfig: Record<string, {
  cardClass: string;
  nextCardClass: string;
  iconColor: string;
  nextIconColor: string;
  dividerBorder: string;
  nextDividerBorder: string;
  accentText: string;
}> = {
  fajr: {
    cardClass: 'prayer-card-fajr',
    nextCardClass: 'prayer-card-fajr is-next',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    nextIconColor: 'text-indigo-700 dark:text-indigo-300',
    dividerBorder: 'border-indigo-200/90 dark:border-white/10',
    nextDividerBorder: 'border-indigo-400 dark:border-indigo-400/80',
    accentText: 'text-indigo-800 dark:text-indigo-300',
  },
  sunrise: {
    cardClass: 'prayer-card-sunrise',
    nextCardClass: 'prayer-card-sunrise is-next',
    iconColor: 'text-rose-600 dark:text-rose-400',
    nextIconColor: 'text-rose-700 dark:text-rose-300',
    dividerBorder: 'border-rose-200/90 dark:border-white/10',
    nextDividerBorder: 'border-rose-400 dark:border-rose-400/80',
    accentText: 'text-rose-800 dark:text-rose-300',
  },
  zuhr: {
    cardClass: 'prayer-card-zuhr',
    nextCardClass: 'prayer-card-zuhr is-next',
    iconColor: 'text-emerald-700 dark:text-emerald-400',
    nextIconColor: 'text-emerald-700 dark:text-emerald-300',
    dividerBorder: 'border-emerald-200/90 dark:border-white/10',
    nextDividerBorder: 'border-emerald-400 dark:border-emerald-400/80',
    accentText: 'text-emerald-800 dark:text-emerald-300',
  },
  asr: {
    cardClass: 'prayer-card-asr',
    nextCardClass: 'prayer-card-asr is-next',
    iconColor: 'text-amber-700 dark:text-amber-400',
    nextIconColor: 'text-amber-700 dark:text-amber-300',
    dividerBorder: 'border-amber-200/90 dark:border-white/10',
    nextDividerBorder: 'border-amber-400 dark:border-amber-400/80',
    accentText: 'text-amber-800 dark:text-amber-300',
  },
  maghrib: {
    cardClass: 'prayer-card-maghrib',
    nextCardClass: 'prayer-card-maghrib is-next',
    iconColor: 'text-orange-700 dark:text-orange-400',
    nextIconColor: 'text-orange-700 dark:text-orange-300',
    dividerBorder: 'border-orange-200/90 dark:border-white/10',
    nextDividerBorder: 'border-orange-400 dark:border-orange-400/80',
    accentText: 'text-orange-800 dark:text-orange-300',
  },
  ishā: {
    cardClass: 'prayer-card-isha',
    nextCardClass: 'prayer-card-isha is-next',
    iconColor: 'text-sky-700 dark:text-sky-400',
    nextIconColor: 'text-sky-700 dark:text-sky-300',
    dividerBorder: 'border-sky-200/90 dark:border-white/10',
    nextDividerBorder: 'border-sky-400 dark:border-sky-400/80',
    accentText: 'text-sky-800 dark:text-sky-300',
  },
  isha: {
    cardClass: 'prayer-card-isha',
    nextCardClass: 'prayer-card-isha is-next',
    iconColor: 'text-sky-700 dark:text-sky-400',
    nextIconColor: 'text-sky-700 dark:text-sky-300',
    dividerBorder: 'border-sky-200/90 dark:border-white/10',
    nextDividerBorder: 'border-sky-400 dark:border-sky-400/80',
    accentText: 'text-sky-800 dark:text-sky-300',
  },
};


export default function App() {
  const currentTime = useCurrentTime();
  const [view, setView] = useState<'today' | 'calendar' | 'table' | 'services' | 'donation' | 'quran'>('today');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleNavigation = (newView: 'today' | 'calendar' | 'table' | 'services' | 'donation' | 'quran') => {
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [adhanEnabled, setAdhanEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('adhanEnabled');
    return saved === 'true';
  });

  const [lastPlayedTime, setLastPlayedTime] = useState<string | null>(null);
  const [lastReminderTime, setLastReminderTime] = useState<string | null>(null);
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('remindersEnabled');
    return saved === 'true';
  });
  const [reminderInterval, setReminderInterval] = useState<number>(() => {
    const saved = localStorage.getItem('reminderInterval');
    return saved ? parseInt(saved) : 10;
  });
  const [bgAnimationEnabled, setBgAnimationEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('bgAnimationEnabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'info' | 'success' }[]>([]);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const t = translations[language];

  React.useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }, [language]);

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  React.useEffect(() => {
    localStorage.setItem('adhanEnabled', String(adhanEnabled));
  }, [adhanEnabled]);

  React.useEffect(() => {
    localStorage.setItem('remindersEnabled', String(remindersEnabled));
  }, [remindersEnabled]);

  React.useEffect(() => {
    localStorage.setItem('reminderInterval', String(reminderInterval));
  }, [reminderInterval]);

  React.useEffect(() => {
    localStorage.setItem('bgAnimationEnabled', String(bgAnimationEnabled));
  }, [bgAnimationEnabled]);

  const addNotification = (message: string, type: 'info' | 'success' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 8000);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  // Find today's data
  const todayString = formatDateString(currentTime);
  const todayData = useMemo(() => {
    return timetableData.find(d => d.date === todayString) || timetableData[0]; // Fallback to first available date
  }, [todayString]);

  // Tomorrow's data
  const tomorrowData = useMemo(() => {
    const tomorrow = new Date(currentTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDateString(tomorrow);
    return timetableData.find(d => d.date === tomorrowStr);
  }, [currentTime]);

  // Find selected date's data
  const selectedDateString = formatDateString(selectedDate);
  const selectedDayData = useMemo(() => {
    return timetableData.find(d => d.date === selectedDateString) || todayData;
  }, [selectedDateString, todayData]);

  const nextPrayer = useMemo(() => getNextPrayer(todayData, currentTime, tomorrowData), [todayData, currentTime, tomorrowData]);

  // Adhan Logic
  React.useEffect(() => {
    if (!adhanEnabled || !todayData) return;

    const jamaahTimes = [
      { name: 'Fajr', time: todayData["fajr_jama'h"] },
      { name: 'Zuhr', time: todayData["zuhr_jama'h"] },
      { name: 'Asr', time: todayData["asr_jama'h"] },
      { name: 'Maghrib', time: todayData["maghrib_jama'h"] },
      { name: 'Isha', time: todayData["ishā_jama'h"] },
    ];

    const currentMinuteStr = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

    for (const prayer of jamaahTimes) {
      if (!prayer.time) continue;
      
      const [h, m] = prayer.time.split(':').map(Number);
      const jamaahDate = new Date(currentTime);
      jamaahDate.setHours(h, m, 0, 0);
      
      const adhanTime = new Date(jamaahDate.getTime() - 15 * 60000);
      const adhanMinuteStr = `${adhanTime.getHours().toString().padStart(2, '0')}:${adhanTime.getMinutes().toString().padStart(2, '0')}`;

      if (currentMinuteStr === adhanMinuteStr && lastPlayedTime !== adhanMinuteStr) {
        const audio = new Audio('https://www.islamcan.com/audio/adhan/makkah.mp3');
        audio.play().catch(e => console.error("Audio play failed:", e));
        setLastPlayedTime(adhanMinuteStr);
        break;
      }
    }
  }, [currentTime, adhanEnabled, todayData, lastPlayedTime]);

  // Reminder Logic
  React.useEffect(() => {
    if (!remindersEnabled || !todayData) return;

    const prayerTimes = [
      { name: 'Fajr', time: todayData.fajr_begins },
      { name: 'Zuhr', time: todayData.zuhr_begins },
      { name: 'Asr', time: todayData.asr_begins },
      { name: 'Maghrib', time: todayData.maghrib_begins },
      { name: 'Isha', time: todayData.ishā_begins },
    ];

    const currentMinuteStr = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

    for (const prayer of prayerTimes) {
      if (!prayer.time) continue;
      
      const [h, m] = prayer.time.split(':').map(Number);
      const prayerDate = new Date(currentTime);
      prayerDate.setHours(h, m, 0, 0);
      
      const reminderTime = new Date(prayerDate.getTime() - reminderInterval * 60000);
      const reminderMinuteStr = `${reminderTime.getHours().toString().padStart(2, '0')}:${reminderTime.getMinutes().toString().padStart(2, '0')}`;

      if (currentMinuteStr === reminderMinuteStr && lastReminderTime !== `${prayer.name}-${reminderMinuteStr}`) {
        addNotification(`${prayer.name} starts in ${reminderInterval} minutes.`, 'info');
        
        // Try push notification if permitted
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Prayer Reminder", {
            body: `${prayer.name} starts in ${reminderInterval} minutes.`,
            icon: "/logo.png"
          });
        }

        setLastReminderTime(`${prayer.name}-${reminderMinuteStr}`);
        break;
      }
    }
  }, [currentTime, remindersEnabled, todayData, reminderInterval, lastReminderTime]);

  const nextJumuahTime = useMemo(() => getNextJumuahTime(currentTime), [currentTime]);
  const jumuahTimeRemaining = useMemo(() => formatTimeRemaining(nextJumuahTime, currentTime), [nextJumuahTime, currentTime]);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedHijriDate = currentTime.toLocaleDateString('en-US-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
    handleNavigation('today');
  };

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} min-h-screen relative text-slate-800 dark:text-slate-100 pb-24 font-sans selection:bg-primary/30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 dark:from-emerald-950 via-slate-50 dark:via-background-dark to-slate-50 dark:to-background-dark`}>
      
      {/* Notifications Overlay - Positioned cleanly in top-right corner with high z-index */}
      <div className="fixed top-4 right-4 z-[300] flex flex-col gap-3 pointer-events-none max-w-xs w-full">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`pointer-events-auto animate-in slide-in-from-right-full duration-300 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
              n.type === 'success' 
                ? 'bg-emerald-600 text-white border-emerald-500/30' 
                : 'bg-slate-900 text-white dark:bg-emerald-950 border-white/10'
            }`}
          >
            <div className={`p-2 rounded-full ${n.type === 'success' ? 'bg-white/20' : 'bg-primary/30'}`}>
              <Bell size={18} />
            </div>
            <p className="font-bold text-sm leading-snug">{n.message}</p>
            <button 
              onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}
              className="ml-auto p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Settings Modal - Rendered at root level with backdrop click to dismiss */}
      {showSettings && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSettings(false);
          }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 relative z-[210]">
            <div className={`flex items-center justify-between mb-6 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t.settings}</h3>
              <button onClick={() => setShowSettings(false)} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className={`space-y-5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {/* Language and Theme - Compact Row */}
              <div className={`flex gap-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <div className="flex-[3] bg-slate-100 dark:bg-slate-800/60 p-3 rounded-2xl">
                  <p className={`text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.language}</p>
                  <div className={`flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <button 
                      onClick={() => setLanguage('en')}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${language === 'en' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      EN
                    </button>
                    <button 
                      onClick={() => setLanguage('ar')}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${language === 'ar' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      AR
                    </button>
                  </div>
                </div>

                <div className="flex-[2] bg-slate-100 dark:bg-slate-800/60 p-3 rounded-2xl flex flex-col justify-between">
                  <p className={`text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.theme}</p>
                  <button 
                    onClick={toggleTheme}
                    className="flex items-center justify-center gap-2 w-full py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-600 dark:text-slate-300 hover:text-primary transition-colors text-sm font-medium"
                  >
                    {theme === 'dark' ? <><Sun size={14} className="text-amber-400" /> Light</> : <><Moon size={14} /> Dark</>}
                  </button>
                </div>
              </div>

              {/* Notifications Section */}
              <div className="bg-slate-100 dark:bg-slate-800/60 p-4 rounded-2xl space-y-4">
                {/* Adhan Toggle */}
                <div className={`flex items-center justify-between ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{t.adhanAudio}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{adhanEnabled ? t.enabled : t.disabled}</p>
                  </div>
                  <button 
                    onClick={() => setAdhanEnabled(!adhanEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${adhanEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${adhanEnabled ? (language === 'ar' ? 'right-7' : 'left-7') : (language === 'ar' ? 'right-1' : 'left-1')}`}></div>
                  </button>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-700/50 w-full"></div>

                {/* Reminders Toggle */}
                <div className={`flex items-center justify-between ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{t.prayerReminders}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{t.inAppAlerts}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (!remindersEnabled && "Notification" in window && Notification.permission !== "granted") {
                        Notification.requestPermission();
                      }
                      setRemindersEnabled(!remindersEnabled);
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${remindersEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${remindersEnabled ? (language === 'ar' ? 'right-7' : 'left-7') : (language === 'ar' ? 'right-1' : 'left-1')}`}></div>
                  </button>
                </div>

                {/* Reminder Interval (conditionally shown) */}
                {remindersEnabled && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-2">
                    <p className={`text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.reminderInterval}</p>
                    <div className={`flex gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      {[5, 10, 15].map(min => (
                        <button 
                          key={min}
                          onClick={() => setReminderInterval(min)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            reminderInterval === min 
                              ? 'bg-primary text-white border-primary shadow-md' 
                              : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700/50 hover:border-primary/30'
                          }`}
                        >
                          {min}{t.minutesShort}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="h-px bg-slate-200 dark:bg-slate-700/50 w-full"></div>

                {/* Animated Background Toggle */}
                <div className={`flex items-center justify-between ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <div className={`${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{t.animatedBackground}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{bgAnimationEnabled ? t.enabled : t.disabled}</p>
                  </div>
                  <button 
                    onClick={() => setBgAnimationEnabled(!bgAnimationEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${bgAnimationEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${bgAnimationEnabled ? (language === 'ar' ? 'right-7' : 'left-7') : (language === 'ar' ? 'right-1' : 'left-1')}`}></div>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => {
                    addNotification("Test notification successful!", "success");
                    if ("Notification" in window && Notification.permission === "granted") {
                      new Notification("Test Notification", {
                        body: "This is a test prayer reminder notification.",
                        icon: "/logo.png"
                      });
                    } else if ("Notification" in window && Notification.permission !== "denied") {
                      Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                          new Notification("Test Notification", {
                            body: "This is a test prayer reminder notification.",
                            icon: "/logo.png"
                          });
                        }
                      });
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-primary/10 text-primary dark:text-emerald-400 text-xs font-bold hover:bg-primary/20 transition-all text-center"
                >
                  Send Test Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 md:p-6 bg-slate-50/80 dark:bg-background-dark/60 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-xl shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)] overflow-hidden h-12 w-12 flex items-center justify-center">
            <img src="/logo.png" alt="Jalalabad Mosque Logo" className="object-contain w-full h-full" />
          </div>
          <div className={language === 'ar' ? 'text-right' : 'text-left'}>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">{t.appName}</h1>
            <p className="text-xs text-primary/80 font-medium flex items-center gap-1">
              <MapPin size={12} /> {t.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <nav className="hidden md:flex items-center gap-1 mr-4">
            <button 
              onClick={() => handleNavigation('today')}
              className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${view === 'today' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              {t.today}
            </button>
            <button 
              onClick={() => handleNavigation('services')}
              className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${view === 'services' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              {t.services}
            </button>
            <a 
              href="https://islaahacademy.com/Quran-Study"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 hover:text-primary"
            >
              <BookOpen size={16} />
              {t.quranStudy}
              <ExternalLink size={13} className="opacity-60" />
            </a>
            <button 
              onClick={() => handleNavigation('donation')}
              className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${view === 'donation' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-primary hover:bg-primary/10 flex items-center gap-2'}`}
            >
              <Heart size={16} className={view === 'donation' ? 'fill-white' : 'fill-primary/20'} />
              {t.donation}
            </button>
          </nav>
          <div className="flex items-center gap-2 relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full transition-all ${showSettings ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10'}`}
              title="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-4 py-8 space-y-10 relative z-10">
        
        {/* Date & Time Section */}
        {['today', 'calendar', 'table'].includes(view) && (
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{t.todaysPrayerTimes}</h2>
            <div className="flex flex-col items-center gap-3">
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 text-primary/90 font-medium text-sm md:text-base">
                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-4 py-1.5 rounded-full border border-black/5 dark:border-white/5">
                  <CalendarIcon size={16} />
                  <span>{language === 'ar' ? currentTime.toLocaleDateString('ar-SA', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) : formattedDate}</span>
                </div>
              </div>
              <button 
                onClick={() => handleNavigation('calendar')}
                className="flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 text-primary font-medium text-sm md:text-base shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)] hover:bg-primary/20 transition-all active:scale-95"
              >
                <Moon size={16} />
                <span>{language === 'ar' ? currentTime.toLocaleDateString('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }) : formattedHijriDate}</span>
              </button>
            </div>
          </div>
        )}

        {/* Next Prayer Dynamic Hero Section */}
        {['today', 'calendar', 'table'].includes(view) && (
          <HeroSection 
            todayData={todayData}
            tomorrowData={tomorrowData}
            currentTime={currentTime}
            language={language}
            t={t}
            bgAnimationEnabled={bgAnimationEnabled}
          />
        )}

        {/* View Toggle */}
        {['today', 'calendar', 'table'].includes(view) && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-6">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.prayerTimetable}</h2>
              <div className="bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/10 dark:border-white/10 inline-flex shadow-lg">
                <button 
                  onClick={goToToday}
                  className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${view === 'today' ? 'bg-primary text-white dark:text-background-dark shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <CalendarDays size={16} />
                  {t.today}
                </button>
                <button 
                  onClick={() => handleNavigation('calendar')}
                  className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${view === 'calendar' || view === 'table' ? 'bg-primary text-white dark:text-background-dark shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <CalendarIcon size={16} />
                  {t.dailyMonthly}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Card View */}
        {view === 'calendar' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className={`flex items-center justify-center gap-8 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <button 
                onClick={handlePrevDay}
                className="w-12 h-12 flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-all hover:scale-110 active:scale-95"
              >
                {language === 'ar' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
              </button>
              <div className="text-center">
                <h4 className="text-3xl font-black text-primary tracking-tight">
                  {language === 'ar' ? selectedDate.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' }) : selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
                </h4>
                <div className={`flex items-center justify-center gap-2 mt-1 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{language === 'ar' ? selectedDate.toLocaleDateString('ar-SA', { weekday: 'long' }) : selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}</span>
                  {selectedDateString === todayString && (
                    <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">{t.today}</span>
                  )}
                </div>
              </div>
              <button 
                onClick={handleNextDay}
                className="w-12 h-12 flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-all hover:scale-110 active:scale-95"
              >
                {language === 'ar' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
              </button>
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl max-w-2xl mx-auto">
              <div className={`bg-black/5 dark:bg-slate-800/80 px-6 py-4 flex justify-between items-center border-b border-black/10 dark:border-slate-700/60 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">{t.prayer}</span>
                <div className={`flex gap-12 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">{t.begins}</span>
                  <span className={`text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 w-16 ${language === 'ar' ? 'text-left' : 'text-right'}`}>{t.jamah}</span>
                </div>
              </div>
              <div className="divide-y divide-black/5 dark:divide-white/10">
                {PRAYERS.map((prayer) => {
                  const Icon = iconMap[prayer.icon as keyof typeof iconMap];
                  const beginsKey = prayer.id === 'sunrise' ? 'sunrise' : `${prayer.id}_begins` as keyof PrayerData;
                  const jamahKey = `${prayer.id}_jama'h` as keyof PrayerData;
                  const jamahTime = selectedDayData[jamahKey] as string;
                  
                  return (
                    <div key={prayer.id} className={`px-6 py-5 flex justify-between items-center hover:bg-black/5 dark:hover:bg-white/[0.04] transition-colors group ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-4 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_rgba(var(--color-rgb),0.5)] ${
                          prayer.id === 'fajr' ? 'bg-indigo-400' :
                          prayer.id === 'sunrise' ? 'bg-amber-400' :
                          prayer.id === 'zuhr' ? 'bg-orange-400' :
                          prayer.id === 'asr' ? 'bg-rose-400' :
                          prayer.id === 'maghrib' ? 'bg-pink-400' :
                          'bg-blue-400'
                        }`} />
                        <div className={`flex flex-col ${language === 'ar' ? 'items-end' : 'items-start'}`}>
                          <span className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-slate-900 dark:group-hover:text-primary transition-colors">
                            {t[prayer.id as keyof typeof t] || prayer.name}
                          </span>
                          <span className="text-sm font-bold text-slate-600 dark:text-emerald-400 font-amiri">
                            {language === 'en' ? translations.ar[prayer.id as keyof typeof translations.ar] : translations.en[prayer.id as keyof typeof translations.en]}
                          </span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-12 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        <span className="text-lg font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                          {format12Hour(selectedDayData[beginsKey] as string, language === 'ar' ? 'ar-SA' : 'en-US').replace(' AM', '').replace(' PM', '').replace(' ص', '').replace(' م', '')}
                        </span>
                        <span className={`text-2xl font-black text-slate-900 dark:text-white tabular-nums w-16 ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                          {jamahTime ? format12Hour(jamahTime, language === 'ar' ? 'ar-SA' : 'en-US').replace(' AM', '').replace(' PM', '').replace(' ص', '').replace(' م', '') : '—'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10">
                <button 
                  onClick={() => handleNavigation('table')}
                  className="w-full py-3 text-sm font-bold text-primary hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-widest"
                >
                  {t.viewFullMonthTable}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prayer Cards Grid (Today View) */}
        {view === 'today' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {PRAYERS.map((prayer) => {
              const Icon = iconMap[prayer.icon as keyof typeof iconMap];
              const isNext = nextPrayer?.id === prayer.id;
              const beginsKey = prayer.id === 'sunrise' ? 'sunrise' : `${prayer.id}_begins` as keyof PrayerData;
              const jamahKey = `${prayer.id}_jama'h` as keyof PrayerData;
              
              // Simple check if passed (not perfectly accurate without full date logic, but good for UI demo)
              const prayerTime = parseTime(todayData[beginsKey] as string, currentTime);
              const isPassed = currentTime > prayerTime && !isNext;
              const variant = prayerCardConfig[prayer.id] || prayerCardConfig.zuhr;

              return (
                <div 
                  key={prayer.id} 
                  className={`p-6 rounded-[28px] transition-all duration-300 relative overflow-hidden group ${
                    isNext 
                      ? `${variant.nextCardClass} rgb-border-box scale-[1.02] z-10` 
                      : `glass-panel ${variant.cardClass} hover:shadow-md hover:scale-[1.01]`
                  }`}
                >
                  {/* Next prayer button removed as upcoming prayer is already prominently showcased in the hero section */}
                  
                  <div className={`flex justify-between items-center mb-6 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <Icon className={`${isNext ? variant.nextIconColor : `${variant.iconColor} group-hover:scale-110`} transition-all duration-300`} size={24} />
                      <div className={`flex flex-col ${language === 'ar' ? 'items-end' : 'items-start'}`}>
                        <span className={`font-bold text-xl ${isNext ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                          {t[prayer.id as keyof typeof t] || prayer.name}
                        </span>
                        <span className="text-sm font-bold text-slate-600 dark:text-emerald-400 font-uthmani">
                          {language === 'en' ? translations.ar[prayer.id as keyof typeof translations.ar] : translations.en[prayer.id as keyof typeof translations.en]}
                        </span>
                      </div>
                    </div>
                    {isPassed && !isNext && (
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest bg-slate-100 dark:bg-slate-800/90 px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 shadow-xs">{t.passed}</span>
                    )}
                  </div>

                  <div className={`flex justify-between items-end ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                    {prayer.id !== 'sunrise' ? (
                      <>
                        <div className={`space-y-1.5 ${language === 'ar' ? 'text-right' : ''}`}>
                          <p className={`text-[10px] uppercase font-bold tracking-widest ${isNext ? variant.accentText : 'text-slate-600 dark:text-slate-300'}`}>{t.jamah}</p>
                          <p className={`text-3xl font-black ${isNext ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
                            {format12Hour(todayData[jamahKey] as string, language === 'ar' ? 'ar-SA' : 'en-US')}
                          </p>
                        </div>
                        <div className={`space-y-1.5 ${language === 'ar' ? `text-left border-r pr-6 ${isNext ? variant.nextDividerBorder : variant.dividerBorder}` : `text-right border-l pl-6 ${isNext ? variant.nextDividerBorder : variant.dividerBorder}`}`}>
                          <p className={`text-[10px] uppercase font-bold tracking-widest ${isNext ? variant.accentText : 'text-slate-600 dark:text-slate-300'}`}>{t.begins}</p>
                          <p className={`text-lg font-bold ${isNext ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                            {format12Hour(todayData[beginsKey] as string, language === 'ar' ? 'ar-SA' : 'en-US')}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className={`space-y-1.5 ${language === 'ar' ? 'text-right' : ''}`}>
                        <p className={`text-[10px] uppercase font-bold tracking-widest ${isNext ? variant.accentText : 'text-slate-600 dark:text-slate-300'}`}>{t.begins}</p>
                        <p className={`text-3xl font-black ${isNext ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
                          {format12Hour(todayData[beginsKey] as string, language === 'ar' ? 'ar-SA' : 'en-US')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* About Us Section in Home */}
        {view === 'today' && (
          <div className="glass-panel p-6 md:p-8 rounded-[28px] animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8 relative overflow-hidden">
            <div className={`absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none`}></div>
            <div className={`flex flex-col gap-6 relative z-10 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-3 mb-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <Heart size={24} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.aboutUs}</h2>
              </div>
              <div className="space-y-4 text-slate-700 dark:text-slate-200 leading-relaxed max-w-4xl font-medium">
                <p>{t.aboutUsText1}</p>
                <div className="pl-4 border-l-4 border-primary/50 py-2 my-4 bg-primary/10 dark:bg-slate-800/80 rounded-r-xl p-4 border dark:border-slate-700/60">
                  <p className="italic text-slate-900 dark:text-white font-medium">{t.aboutUsText2}</p>
                </div>
                <p>{t.aboutUsText3}</p>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Table View */}
        {view === 'table' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`flex flex-col md:flex-row justify-between items-center gap-4 px-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t.monthlyTimetable}</h3>
              
              <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <button 
                  onClick={() => {
                    const prev = new Date(selectedDate);
                    prev.setDate(1);
                    prev.setMonth(prev.getMonth() - 1);
                    setSelectedDate(prev);
                  }}
                  className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {language === 'ar' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
                <select 
                  className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedDate.getMonth()}
                  onChange={(e) => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(1);
                    newDate.setMonth(parseInt(e.target.value));
                    setSelectedDate(newDate);
                  }}
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, idx) => (
                    <option key={month} value={idx} className="bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white">
                      {language === 'ar' ? new Date(2024, idx, 1).toLocaleDateString('ar-SA', { month: 'long' }) : month}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={() => {
                    const next = new Date(selectedDate);
                    next.setDate(1);
                    next.setMonth(next.getMonth() + 1);
                    setSelectedDate(next);
                  }}
                  className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {language === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
              </div>
            </div>

            <div className="glass-panel rounded-[28px] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <thead>
                    <tr className="bg-black/5 dark:bg-black/40 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-widest border-b border-black/10 dark:border-white/10">
                      <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.date}</th>
                      <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.fajr}</th>
                      <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.sunrise}</th>
                      <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.zuhr}</th>
                      <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.asr}</th>
                      <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.maghrib}</th>
                      <th className={`px-6 py-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.ishā}</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {timetableData
                      .filter(day => {
                        const date = new Date(day.date);
                        return date.getMonth() === selectedDate.getMonth();
                      })
                      .map((day) => {
                        const isToday = day.date === todayString;
                        return (
                          <tr 
                            key={day.date} 
                            onClick={() => {
                              setSelectedDate(new Date(day.date));
                              handleNavigation('calendar');
                            }}
                            className={`transition-colors cursor-pointer group ${
                              isToday 
                                ? 'bg-primary/10 border-l-4 border-l-primary' 
                                : 'hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                          >
                            <td className={`px-6 py-4 font-medium ${isToday ? 'text-primary font-bold' : 'text-slate-700 dark:text-slate-200'} group-hover:text-primary transition-colors`}>
                              <div className={`flex flex-col ${language === 'ar' ? 'items-end' : 'items-start'}`}>
                                <span className="underline decoration-primary/20 underline-offset-4 group-hover:decoration-primary">
                                  {language === 'ar' ? new Date(day.date).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' }) : new Date(day.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </span>
                                <span className="text-[10px] opacity-50 uppercase">
                                  {language === 'ar' ? new Date(day.date).toLocaleDateString('ar-SA', { weekday: 'short' }) : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`flex flex-col ${language === 'ar' ? 'items-end' : 'items-start'}`}>
                                <span className={`font-semibold ${isToday ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}>{format12Hour(day["fajr_jama'h"], language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                                <span className="text-xs text-primary/70">{format12Hour(day.fajr_begins, language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                              </div>
                            </td>
                            <td className={`px-6 py-4 font-semibold ${isToday ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}>{format12Hour(day.sunrise, language === 'ar' ? 'ar-SA' : 'en-US')}</td>
                            <td className="px-6 py-4">
                              <div className={`flex flex-col ${language === 'ar' ? 'items-end' : 'items-start'}`}>
                                <span className={`font-semibold ${isToday ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}>{format12Hour(day["zuhr_jama'h"], language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                                <span className="text-xs text-primary/70">{format12Hour(day.zuhr_begins, language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`flex flex-col ${language === 'ar' ? 'items-end' : 'items-start'}`}>
                                <span className={`font-semibold ${isToday ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}>{format12Hour(day["asr_jama'h"], language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                                <span className="text-xs text-primary/70">{format12Hour(day.asr_begins, language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`flex flex-col ${language === 'ar' ? 'items-end' : 'items-start'}`}>
                                <span className={`font-semibold ${isToday ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}>{format12Hour(day["maghrib_jama'h"], language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                                <span className="text-xs text-primary/70">{format12Hour(day.maghrib_begins, language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`flex flex-col ${language === 'ar' ? 'items-end' : 'items-start'}`}>
                                <span className={`font-semibold ${isToday ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-100'}`}>{format12Hour(day["ishā_jama'h"], language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                                <span className="text-xs text-primary/70">{format12Hour(day.ishā_begins, language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                              </div>
                            </td>
                            <td className={`px-6 py-4 ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                              <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                {language === 'ar' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {view === 'services' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{t.ourServices}</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                {language === 'ar' 
                  ? 'يهدف مسجد جلال آباد والمركز الإسلامي في برمنغهام إلى تعزيز روح الأخوة والأخوات مع مزيج من الصلاة والتعليم والأنشطة الثقافية ونمط الحياة.'
                  : 'Jalalabad Masjid & Islamic Centre at Birmingham aims to promote ethos of brotherhood and sisterhood with a mix of prayer, education, cultural and lifestyle activities.'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: t.dailyPrayers, desc: t.dailyPrayersDesc, icon: Clock },
                { title: t.fridayJumuah, desc: t.fridayJumuahDesc, icon: Users },
                { title: t.quranClasses, desc: t.quranClassesDesc, icon: BookOpen },
                { title: t.marriageServices, desc: t.marriageServicesDesc, icon: Heart },
                { title: t.communityEvents, desc: t.communityEventsDesc, icon: CalendarDays }
              ].map((service, idx) => (
                <div key={idx} className="glass-panel p-6 rounded-[28px] hover:bg-primary/5 transition-all border border-black/5 dark:border-white/5 group">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary w-fit mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                    <service.icon size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{service.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'quran' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full text-primary mb-2">
                <BookOpen size={40} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{t.theHolyQuran}</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                {t.readListenQuran}
              </p>
              <a 
                href="https://islaahacademy.com/Quran-Study" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
              >
                {t.openQuranStudy} <ExternalLink size={18} />
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5 hover:bg-primary/5 transition-all group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-primary/10 p-4 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <BookOpen size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t.readOnline}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{t.browseSurahs}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { name: language === 'ar' ? 'سورة الفاتحة' : 'Surah Al-Fatihah', id: 1 },
                    { name: language === 'ar' ? 'سورة البقرة' : 'Surah Al-Baqarah', id: 2 },
                    { name: language === 'ar' ? 'سورة يس' : 'Surah Ya-Sin', id: 36 },
                    { name: language === 'ar' ? 'سورة الملك' : 'Surah Al-Mulk', id: 67 }
                  ].map((surah, i) => (
                    <a 
                      key={i} 
                      href={`https://quran.com/${surah.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-primary/10 transition-colors group/item"
                    >
                      <span className="font-medium text-slate-900 dark:text-white">{surah.name}</span>
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1 group-hover/item:text-primary transition-colors">
                        {language === 'ar' ? 'اقرأ' : 'Read'} <ExternalLink size={12} />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
              
              <div className="glass-panel p-8 rounded-3xl border border-black/5 dark:border-white/5 hover:bg-primary/5 transition-all group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-primary/10 p-4 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Volume2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t.listenOnline}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{t.listenRecitations}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { name: language === 'ar' ? 'مشاري راشد العفاسي' : 'Mishary Rashid Alafasy', url: 'https://quran.com/reciters/7' },
                    { name: language === 'ar' ? 'عبد الرحمن السديس' : 'Abdul Rahman Al-Sudais', url: 'https://quran.com/reciters/3' },
                    { name: language === 'ar' ? 'سعد الغامدي' : 'Saad Al-Ghamdi', url: 'https://quran.com/reciters' },
                    { name: language === 'ar' ? 'ماهر المعيقلي' : 'Maher Al-Muaiqly', url: 'https://quran.com/reciters' }
                  ].map((reciter, i) => (
                    <a 
                      key={i} 
                      href={reciter.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-primary/10 transition-colors group/item"
                    >
                      <span className="font-medium text-slate-900 dark:text-white">{reciter.name}</span>
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1 group-hover/item:text-primary transition-colors">
                        {language === 'ar' ? 'استمع' : 'Play'} <ExternalLink size={12} />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'donation' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full text-primary mb-2">
                <Heart size={40} className="fill-primary/20" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{t.supportMasjid}</h2>
              <p className="text-slate-500 dark:text-slate-400">
                {language === 'ar' 
                  ? 'تبرعاتكم تساعدنا في الحفاظ على المركز والاستمرار في تقديم الخدمات للمجتمع.'
                  : 'Your donations help us maintain the center and continue providing services to the community.'}
              </p>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl border border-primary/20 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['£10', '£20', '£50', '£100'].map(amount => (
                    <button key={amount} className="py-3 rounded-xl border border-primary/30 text-primary font-bold hover:bg-primary hover:text-white transition-all">
                      {amount}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 dark:text-white">{t.bankTransferDetails}</h4>
                  <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t.bankName}:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">Barclay Bank</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t.accountName}:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">Jalalabad Trust</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t.sortCode}:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">20-07-82</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t.accountNumber}:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">73478653</span>
                    </div>
                    <div className="flex justify-between border-t border-black/5 dark:border-white/5 pt-2 mt-2">
                      <span className="text-slate-500 dark:text-slate-400">Charity No:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">1105603</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Address:</span>
                      <span className="font-semibold text-slate-900 dark:text-white text-right">24-26 Dartmouth Rd, Selly Oak, Birmingham B29 6DR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Phone:</span>
                      <span className="font-semibold text-slate-900 dark:text-white text-right">0121 471 1556</span>
                    </div>
                  </div>
                </div>
                
                <button className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                  {t.donateViaCard}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Jumu'ah Section */}
        {view !== 'quran' && view !== 'services' && view !== 'donation' && (
          <div className="glass-panel bg-primary/5 rounded-[28px] p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-2xl text-primary shadow-inner">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Jumu'ah Times <span className="text-slate-500 dark:text-slate-400 font-medium text-lg">(Friday)</span></h3>
                  <p className="text-primary/80 text-sm mt-1">Next Jumu'ah in:</p>
                </div>
              </div>
              
              {/* Jumu'ah Countdown */}
              <div className="flex gap-2 md:gap-3">
                {jumuahTimeRemaining.days > 0 && (
                  <div className="flex flex-col items-center gap-1">
                    <div className="bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white w-12 h-14 md:w-14 md:h-16 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-bold backdrop-blur-md">
                      {String(jumuahTimeRemaining.days).padStart(2, '0')}
                    </div>
                    <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-widest">Days</span>
                  </div>
                )}
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white w-12 h-14 md:w-14 md:h-16 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-bold backdrop-blur-md">
                    {String(jumuahTimeRemaining.hours).padStart(2, '0')}
                  </div>
                  <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-widest">Hours</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white w-12 h-14 md:w-14 md:h-16 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-bold backdrop-blur-md">
                    {String(jumuahTimeRemaining.minutes).padStart(2, '0')}
                  </div>
                  <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-widest">Mins</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white w-12 h-14 md:w-14 md:h-16 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-bold backdrop-blur-md">
                    {String(jumuahTimeRemaining.seconds).padStart(2, '0')}
                  </div>
                  <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-widest">Secs</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <div className="flex items-center justify-between p-5 bg-black/5 dark:bg-black/20 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/5 hover:border-primary/30 transition-colors">
                <span className="font-medium text-slate-600 dark:text-slate-300">Bayan Start</span>
                <span className="text-2xl font-bold text-primary">12:45 PM</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-black/5 dark:bg-black/20 backdrop-blur-sm rounded-2xl border border-black/5 dark:border-white/5 hover:border-primary/30 transition-colors">
                <span className="font-medium text-slate-600 dark:text-slate-300">Khutbah Start</span>
                <span className="text-2xl font-bold text-primary">1:30 PM</span>
              </div>
            </div>
          </div>
        )}

        {/* Global Footer */}
        <footer className="mt-16 pt-8 pb-4 border-t border-black/5 dark:border-white/5 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div className={`flex flex-col justify-center ${language === 'ar' ? 'items-end' : 'items-start'}`}>
              <div className="bg-white p-2 rounded-2xl shadow-sm border border-black/5 inline-flex mb-4">
                <img src="/logo.png" alt="Jalalabad Mosque Logo" className="h-16 object-contain" />
              </div>
              <p className={`text-sm text-slate-600 dark:text-slate-200 max-w-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'يهدف مسجد جلال آباد والمركز الإسلامي في برمنغهام إلى تعزيز روح الأخوة والأخوات.' : 'Jalalabad Masjid & Islamic Centre at Birmingham aims to promote ethos of brotherhood and sisterhood.'}
              </p>
            </div>
            
            <div className={`space-y-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                <div className="bg-primary/10 p-2 rounded-xl text-primary">
                  <MapPin size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.contactUs}</h3>
              </div>
              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
                <p className={`flex items-start gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <strong className="text-slate-900 dark:text-white mt-0.5"><MapPin size={16} /></strong>
                  <span>24-26 Dartmouth Rd, Selly Oak, Birmingham B29 6DR</span>
                </p>
                <p className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <strong className="text-slate-900 dark:text-white"><Phone size={16} /></strong>
                  <a href="tel:01214711556" className="hover:text-primary transition-colors">0121 471 1556</a>
                </p>
                <p className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <strong className="text-slate-900 dark:text-white"><Mail size={16} /></strong>
                  <a href="mailto:info@jalalabadmosque.org" className="hover:text-primary transition-colors">info@jalalabadmosque.org</a>
                </p>
                <p className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <strong className="text-slate-900 dark:text-white"><Globe size={16} /></strong>
                  <a href="https://www.jalalabadmosque.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">www.jalalabadmosque.org</a>
                </p>
              </div>
            </div>

            <div className="w-full h-48 lg:h-full min-h-[200px] rounded-2xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5 relative">
              <iframe 
                src="https://maps.google.com/maps?q=Jalalabad+Mosque,+24-26+Dartmouth+Rd,+Selly+Oak,+Birmingham+B29+6DR&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0, position: 'absolute', top: 0, left: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Maps Location of Jalalabad Masjid"
              ></iframe>
            </div>
          </div>
          <div className={`text-xs text-slate-600 dark:text-slate-300 font-medium pt-6 border-t border-black/5 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-2 ${language === 'ar' ? 'flex-row-reverse md:flex-row-reverse' : ''}`}>
            <p>© {new Date().getFullYear()} {t.appName}. {t.allRightsReserved}</p>
            <p>Charity No: 1105603</p>
          </div>
        </footer>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-background-dark/95 backdrop-blur-xl border-t border-black/5 dark:border-white/5 px-2 py-3 flex justify-between items-center z-50 pb-safe">
        <button 
          onClick={() => handleNavigation('today')}
          className={`flex flex-col items-center gap-1.5 flex-1 transition-colors ${view === 'today' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary'}`}
        >
          <Home size={22} className={view === 'today' ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <a 
          href="https://islaahacademy.com/Quran-Study"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1.5 flex-1 transition-colors text-slate-500 dark:text-slate-400 hover:text-primary"
        >
          <BookOpen size={22} className="stroke-[2px]" />
          <span className="text-[9px] font-bold uppercase tracking-widest">{t.quranStudy}</span>
        </a>
        <button 
          onClick={() => handleNavigation('services')}
          className={`flex flex-col items-center gap-1.5 flex-1 transition-colors ${view === 'services' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary'}`}
        >
          <LayoutGrid size={22} className={view === 'services' ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Services</span>
        </button>
        <button 
          onClick={() => handleNavigation('donation')}
          className={`flex flex-col items-center gap-1.5 flex-1 transition-colors ${view === 'donation' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary'}`}
        >
          <Heart size={22} className={view === 'donation' ? 'stroke-[2.5px] fill-primary/20' : 'stroke-[2px]'} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Donation</span>
        </button>
      </nav>
    </div>
  );
}
