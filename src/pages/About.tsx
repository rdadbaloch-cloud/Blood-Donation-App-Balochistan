import { useTranslation } from 'react-i18next';
import { Heart, Info, Mail, Share2, Globe, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function About() {
  const { t } = useTranslation();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Balochistan Blood Donor App',
        text: 'Save lives in Balochistan. Register as a blood donor or find one near you!',
        url: window.location.origin
      });
    }
  };

  return (
    <div className="p-4 space-y-6 pb-12">
      <div className="bg-red-600 rounded-3xl p-8 text-white text-center shadow-lg relative overflow-hidden">
        <Heart className="w-16 h-16 mx-auto mb-4 fill-current text-red-200 animate-pulse" />
        <h2 className="text-2xl font-bold mb-2">{t('app_name')}</h2>
        <p className="text-red-100 text-sm">{t('slogan')}</p>
        <div className="absolute top-0 left-0 w-full h-full bg-white/5 skew-y-12 transform origin-top-left -z-0" />
      </div>

      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
          <Info className="w-5 h-5 text-red-600" />
          Mission & Vision
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          The Balochistan Blood Donor App is a community-driven initiative dedicated to bridging the gap between blood donors and those in need across all districts of Balochistan.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Our goal is to make blood donation accessible, efficient, and transparent, ensuring that no life is lost due to the unavailability of blood in our region.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={handleShare}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Share App</span>
        </button>
        <a 
          href="mailto:contact@balochistanblood.com"
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Contact Us</span>
        </a>
      </div>

      <section className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Safe & Secure</h4>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Powered by Firebase</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed italic">
          "The best among you are those who bring most benefit to others."
        </p>
      </section>

      <div className="text-center pt-4">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Version 1.0.0 • Made with ❤️ for Balochistan
        </p>
      </div>
    </div>
  );
}
