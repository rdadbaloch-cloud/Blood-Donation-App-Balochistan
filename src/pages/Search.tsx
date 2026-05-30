import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Search as SearchIcon, Droplet, MapPin, Phone, MessageSquare, Copy, Check } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BLOOD_GROUPS } from '../constants';
import { cn } from '../lib/utils';
import { useDistricts } from '../hooks/useDistricts';

export default function Search() {
  const { t } = useTranslation();
  const { districts } = useDistricts();
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    bloodGroup: '',
    district: ''
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filters.bloodGroup || !filters.district) return;

    setLoading(true);
    setSearched(true);
    try {
      const q = query(
        collection(db, 'donors'),
        where('bloodGroup', '==', filters.bloodGroup),
        where('district', '==', filters.district),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDonors(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <SearchIcon className="w-5 h-5 text-red-600" />
          {t('btn_search')}
        </h2>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {t('blood_group')}
              </label>
              <select
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
                value={filters.bloodGroup}
                onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
              >
                <option value="" className="dark:bg-slate-900">- Select -</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g} className="dark:bg-slate-900">{g}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {t('district')}
              </label>
              <select
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
                value={filters.district}
                onChange={(e) => setFilters({ ...filters, district: e.target.value })}
              >
                <option value="" className="dark:bg-slate-900">- Select -</option>
                {districts.map(d => <option key={d} value={d} className="dark:bg-slate-900">{d}</option>)}
              </select>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <SearchIcon className="w-5 h-5" />
                {t('btn_search')}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {searched && donors.length === 0 && !loading && (
          <div className="py-12 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Droplet className="w-10 h-10" />
            </div>
            <p className="text-slate-500 font-medium">{t('no_results')}</p>
          </div>
        )}

        {donors.map((donor) => (
          <motion.div
            key={donor.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 overflow-hidden rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800"
          >
            <div className="p-5 flex items-start gap-4">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner">
                {donor.bloodGroup}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate">{donor.fullName}</h3>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mt-1">
                  <MapPin className="w-3 h-3" />
                  {donor.district}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${donor.phoneNumber}`}
                  className="p-3 bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 rounded-xl shadow-sm hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors border border-transparent dark:border-slate-700"
                  title="Call"
                >
                  <Phone className="w-5 h-5" />
                </a>
                <a
                  href={`https://wa.me/${donor.whatsappNumber || donor.phoneNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors border border-transparent dark:border-slate-700"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-5 h-5" />
                </a>
              </div>
              
              <button
                onClick={() => copyToClipboard(donor.phoneNumber, donor.id)}
                className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-transparent dark:border-slate-700"
              >
                {copiedId === donor.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {donor.phoneNumber}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
