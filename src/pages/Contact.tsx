import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Mail, MessageSquare, ArrowLeft, ShieldCheck, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Contact() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isUrdu = i18n.language === 'ur';

  return (
    <div className="p-4 space-y-6 pb-12 animate-fadeIn">
      {/* Header back button & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-2xl active:scale-95 transition-all shadow-sm"
          title="Go Back"
        >
          <ArrowLeft className={`w-5 h-5 ${isUrdu ? 'rotate-180' : ''}`} />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {isUrdu ? 'ہم سے رابطہ کریں' : 'Contact Us'}
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {isUrdu ? 'براہ راست سپورٹ اور رہنمائی' : 'Direct Support & Inquiries'}
          </p>
        </div>
      </div>

      {/* Admin Message Card */}
      <div className="bg-red-650 rounded-[32px] p-6 text-white space-y-3 shadow-lg bg-gradient-to-br from-red-650 to-red-600 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <p className="text-sm font-black leading-snug">
            {isUrdu 
              ? 'کسی بھی مدد، سوالات، یا ایڈمنسٹریٹو مسائل کے لیے براہ راست رابطہ کریں۔' 
              : 'For any assistance, administrative needs, or inquiries, please contact the administrator directly.'}
          </p>
          <p className="text-[9px] text-red-150 uppercase tracking-wider font-extrabold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-green-300" />
            {isUrdu ? 'ایڈمن سپورٹ ٹیم • مدد کے لیے دستیاب ہے' : 'Official Admin Support • Available to Assist'}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mt-8 -mr-8" />
      </div>

      {/* Contact Channels Grid */}
      <div className="grid gap-4">
        {/* Email card contact channel */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 rounded-2xl flex items-center justify-center shadow-sm">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">
                  {isUrdu ? 'ای میل ایڈریس' : 'Email Support'}
                </span>
                <span className="text-xs font-black text-rose-600 dark:text-rose-400 selection:bg-rose-100">
                  rdadbaloch@gmail.com
                </span>
              </div>
            </div>
          </div>

          <a
            href="mailto:rdadbaloch@gmail.com"
            className="w-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-black py-3.5 rounded-xl transition-all active:scale-95 text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2"
          >
            {isUrdu ? 'ای میل بھیجیں' : 'Send Email'}
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5px]" />
          </a>
        </motion.div>

        {/* WhatsApp card contact channel */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-450 rounded-2xl flex items-center justify-center shadow-sm">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider block">
                  {isUrdu ? 'واٹس ایپ رابطہ' : 'WhatsApp Chat'}
                </span>
                <span className="text-xs font-black text-green-600 dark:text-green-400 selection:bg-green-150">
                  03342201288
                </span>
              </div>
            </div>
          </div>

          <a
            href="https://wa.me/923342201288"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 font-black py-3.5 rounded-xl transition-all active:scale-95 text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2"
          >
            {isUrdu ? 'چیٹ شروع کریں' : 'Chat on WhatsApp'}
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5px]" />
          </a>
        </motion.div>
      </div>

      {/* Security notice / Bottom Footer */}
      <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-200/50 dark:bg-slate-850 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400" />
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          {isUrdu 
            ? 'آپ کی معلومات ہمارے پاس مکمل طور پر محفوظ ہیں۔ ایڈمن سے رابطہ کرنے میں کسی بھی پریشانی کی صورت میں دوبارہ کوشش کریں۔' 
            : 'Your data privacy is strictly protected. Please click above links to get in touch with our administrative office.'}
        </p>
      </div>
    </div>
  );
}
