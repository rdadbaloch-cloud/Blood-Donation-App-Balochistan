import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { User, Phone, MessageSquare, Droplet, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { addDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BLOOD_GROUPS } from '../constants';
import { useDistricts } from '../hooks/useDistricts';

export default function Register() {
  const { t } = useTranslation();
  const { districts, loading: districtsLoading } = useDistricts();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    whatsappNumber: '',
    bloodGroup: '',
    district: '',
    age: '',
    lastDonationDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check for duplicate phone number
      const q = query(
        collection(db, 'donors'), 
        where('phoneNumber', '==', formData.phoneNumber)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error('This phone number is already registered.');
      }

      await addDoc(collection(db, 'donors'), {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
        registeredAt: serverTimestamp(),
        isActive: true,
        isVerified: false
      });

      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('success_reg')}</h2>
        <p className="text-slate-500 mb-8">
          Thank you for joining our community. Your data is saved securely.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="w-full max-w-xs py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 active:scale-95 transition-all"
        >
          Back to Registration
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('register')}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-black opacity-50 tracking-widest">Enrollment Form</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2 ml-1">
            <User className="w-3.5 h-3.5" /> {t('full_name')} *
          </label>
          <input
            required
            type="text"
            placeholder="Muhammad Ali"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-red-500 outline-none dark:text-white transition-all shadow-sm"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2 ml-1">
              <Phone className="w-3.5 h-3.5" /> {t('phone')} *
            </label>
            <input
              required
              type="tel"
              placeholder="03001234567"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-red-500 outline-none dark:text-white transition-all shadow-sm"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>
          {/* WhatsApp */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2 ml-1">
              <MessageSquare className="w-3.5 h-3.5" /> {t('whatsapp')}
            </label>
            <input
              type="tel"
              placeholder="03001234567"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-red-500 outline-none dark:text-white transition-all shadow-sm"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Blood Group */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2 ml-1">
              <Droplet className="w-3.5 h-3.5" /> {t('blood_group')} *
            </label>
            <select
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-red-500 outline-none dark:text-white transition-all shadow-sm appearance-none"
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
            >
              <option value="" className="dark:bg-slate-900">Select Group</option>
              {BLOOD_GROUPS.map(group => (
                <option key={group} value={group} className="dark:bg-slate-900">{group}</option>
              ))}
            </select>
          </div>
          {/* District */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2 ml-1">
              <MapPin className="w-3.5 h-3.5" /> {t('district')} *
            </label>
            <select
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-red-500 outline-none dark:text-white transition-all shadow-sm appearance-none"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            >
              <option value="" className="dark:bg-slate-900">Select District</option>
              {districts.map(district => (
                <option key={district} value={district} className="dark:bg-slate-900">{district}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Age */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {t('age')}
            </label>
            <input
              type="number"
              placeholder="25"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none dark:text-white"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />
          </div>
          {/* Last Donation */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {t('last_donation')}
            </label>
            <input
              type="date"
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none dark:text-white"
              value={formData.lastDonationDate}
              onChange={(e) => setFormData({ ...formData, lastDonationDate: e.target.value })}
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          type="submit"
          className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
               <User className="w-5 h-5" />
               {t('btn_register')}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
