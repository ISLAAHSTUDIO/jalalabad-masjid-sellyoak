import React, { useState } from 'react';
import { Send, CheckCircle2, Mail, User, Phone, MessageSquare, Tag, AlertCircle } from 'lucide-react';
import { Language, translations } from '../translations';

interface ContactFormProps {
  language: Language;
  onNotify?: (message: string, type?: 'info' | 'success') => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ language, onNotify }) => {
  const t = translations[language];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const getSubjectLabel = (key: string) => {
    switch (key) {
      case 'madrasah': return t.madrasahInquiry;
      case 'nikah': return t.nikahInquiry;
      case 'donation': return t.donationInquiry;
      case 'other': return t.otherInquiry;
      case 'general':
      default:
        return t.generalInquiry;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      const msg = language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields';
      setErrorMessage(msg);
      if (onNotify) onNotify(msg, 'info');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: getSubjectLabel(formData.subject),
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message. Please try again.');
      }

      setIsSubmitted(true);
      if (onNotify) {
        onNotify(t.messageSent, 'success');
      }
    } catch (err: any) {
      const errorMsg = err.message || (language === 'ar' ? 'تعذر إرسال الرسالة، يرجى المحاولة لاحقاً' : 'Could not send message. Please try again or email us directly.');
      setErrorMessage(errorMsg);
      if (onNotify) {
        onNotify(errorMsg, 'info');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'general',
      message: ''
    });
    setIsSubmitted(false);
    setErrorMessage(null);
  };

  return (
    <div 
      id="contact-form"
      className="bg-white/90 dark:bg-[#0c1222]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-left relative overflow-hidden"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className={`flex items-center gap-3.5 mb-6 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
          <MessageSquare size={22} />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t.sendMessage}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ar' 
              ? 'تواصل مع إدارة المسجد وسنرد عليك في أقرب وقت'
              : 'Get in touch with the Mosque administration and committee'}
          </p>
        </div>
      </div>

      {isSubmitted ? (
        <div className="py-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-400">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 size={36} />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">{t.messageSent}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              {t.messageSentSub}
            </p>
          </div>
          
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-primary/40 text-primary hover:bg-primary/10 font-bold text-sm transition-colors"
            >
              {t.sendAnother}
            </button>
            <a
              href={`mailto:info@jalalabadmosque.org?subject=${encodeURIComponent(getSubjectLabel(formData.subject))}&body=${encodeURIComponent(`Name: ${formData.name}\nPhone: ${formData.phone}\n\n${formData.message}`)}`}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-emerald-700 font-bold text-sm transition-all shadow-md shadow-primary/25"
            >
              {language === 'ar' ? 'فتح في تطبيق البريد' : 'Open in Email App'}
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{errorMessage}</p>
                <p className="text-xs opacity-90">
                  {language === 'ar' ? 'يمكنك أيضاً مراسلتنا مباشرة على:' : 'You can also reach us directly at:'}{' '}
                  <a href="mailto:info@jalalabadmosque.org" className="underline font-bold">info@jalalabadmosque.org</a>
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User size={13} className="text-primary" />
                {t.fullName} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder={language === 'ar' ? 'محمد عبد الله' : 'e.g. Mohammed Ahmed'}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail size={13} className="text-primary" />
                {t.yourEmail} <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone size={13} className="text-primary" />
                {t.yourPhone}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="07123 456789"
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Tag size={13} className="text-primary" />
                {t.subject}
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="general">{t.generalInquiry}</option>
                <option value="madrasah">{t.madrasahInquiry}</option>
                <option value="nikah">{t.nikahInquiry}</option>
                <option value="donation">{t.donationInquiry}</option>
                <option value="other">{t.otherInquiry}</option>
              </select>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MessageSquare size={13} className="text-primary" />
              {t.message} <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder={language === 'ar' ? 'اكتب رسالتك أو استفسارك هنا...' : 'How can we help you? Write your message here...'}
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-y min-h-[100px]"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-primary hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/35 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{t.sending}</span>
              </>
            ) : (
              <>
                <Send size={16} className={language === 'ar' ? 'rotate-180' : ''} />
                <span>{t.send}</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
