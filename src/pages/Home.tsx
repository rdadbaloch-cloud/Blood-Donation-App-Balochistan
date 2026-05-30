import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Users, AlertCircle, ArrowRight, Phone, Search as SearchIcon, Clock, Bell, Plus, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, getCountFromServer, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BLOOD_GROUPS } from '../constants';
import { useDistricts } from '../hooks/useDistricts';

export default function Home() {
  const { t } = useTranslation();
  const [donorCount, setDonorCount] = useState<number | null>(null);
  const [emergencyRequests, setEmergencyRequests] = useState<any[]>([]);
  const { districts, loading: districtsLoading } = useDistricts();

  // Ticking state for real-time countdown timer
  const [now, setNow] = useState(Date.now());

  // Form states
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({
    patientName: '',
    bloodGroup: '',
    district: '',
    hospital: '',
    contactNumber: ''
  });

  useEffect(() => {
    const getDonorCount = async () => {
      try {
        const coll = collection(db, 'donors');
        const q = query(coll, where('isActive', '==', true));
        const snapshot = await getCountFromServer(q);
        setDonorCount(snapshot.data().count);
      } catch (error) {
        console.error('Error fetching count:', error);
      }
    };

    getDonorCount();

    const emergencyQuery = query(
      collection(db, 'emergency_requests'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(emergencyQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmergencyRequests(docs);
    });

    // Tick every second to synchronize timers and trigger visual auto-expiry
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  // Filter out any emergency requests older than 3 hours
  const activeEmergencies = emergencyRequests.filter((req) => {
    // Standardize Firestore Timestamp or JSON date string to millisecond time
    const createdTime = req.createdAt?.seconds 
      ? req.createdAt.seconds * 1000 
      : (req.createdAt ? new Date(req.createdAt).getTime() : now);
    const threeHoursInMs = 3 * 60 * 60 * 1000;
    return now - createdTime < threeHoursInMs;
  });

  // Calculate live countdown timer string
  const getCountdownString = (req: any) => {
    const createdTime = req.createdAt?.seconds 
      ? req.createdAt.seconds * 1000 
      : (req.createdAt ? new Date(req.createdAt).getTime() : now);
    const expiryTime = createdTime + 3 * 60 * 60 * 1000;
    const diff = expiryTime - now;
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const handleEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName || !form.bloodGroup || !form.district || !form.hospital || !form.contactNumber) {
      setSubmitError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await addDoc(collection(db, 'emergency_requests'), {
        patientName: form.patientName,
        bloodGroup: form.bloodGroup,
        district: form.district,
        hospital: form.hospital,
        contactNumber: form.contactNumber,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSubmitSuccess(true);
      setForm({
        patientName: '',
        bloodGroup: '',
        district: '',
        hospital: '',
        contactNumber: ''
      });
    } catch (err: any) {
      console.error('Error submitting emergency request:', err);
      setSubmitError('Unable to submit emergency request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pt-6 animate-fadeIn">
      {/* High-visibility Emergency Alert Banner with Blinking Red Indicator */}
      <AnimatePresence>
        {activeEmergencies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 dark:bg-red-950/20 border-2 border-red-500/30 rounded-[32px] p-6 space-y-4 shadow-red-100/40 dark:shadow-none shadow-xl relative overflow-hidden"
          >
            {/* Blinking red alert light indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-600 dark:text-red-400 animate-pulse">
                LIVE URGENT DEMAND
              </span>
            </div>

            {/* Attention Grabbing Warning Message */}
            <div className="space-y-1">
              <p className="text-base font-black text-slate-900 dark:text-white leading-snug">
                “Someone urgently needs blood. Your donation can save a life today.”
              </p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">
                Requests automatically self-destruct after 3 hours
              </p>
            </div>

            {/* List of active real-time queries */}
            <div className="space-y-3 pt-1">
              {activeEmergencies.map((req) => (
                <div 
                  key={req.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-600 text-white font-black text-xs px-2.5 py-0.5 rounded-lg shrink-0 tracking-wide select-none shadow-sm">
                        {req.bloodGroup}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {req.patientName || 'Emergency Patient'}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                      📍 {req.district} • {req.hospital}
                    </p>

                    {/* Automatic countdown timer */}
                    <div className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-black px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider">
                      <Clock className="w-3 h-3 text-red-600 animate-spin [animation-duration:8s]" />
                      Expires in: {getCountdownString(req)}
                    </div>
                  </div>

                  <a 
                    href={`tel:${req.contactNumber}`}
                    className="p-3 bg-red-600 hover:bg-red-700 text-white dark:bg-red-950/40 dark:hover:bg-red-900/30 dark:text-red-400 rounded-xl transition-all shadow-md hover:shadow-red-200 shadow-red-100 dark:shadow-none shrink-0 active:scale-95"
                    title={`Call and Donate Now`}
                  >
                    <Phone className="w-4 h-4 fill-current text-white dark:text-red-400" />
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing list backup / Standby status */}
      {activeEmergencies.length === 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tighter">
              <span className="w-1 h-4 bg-red-600 rounded-full"></span>
              Emergency Requests
            </h3>
          </div>
          <div className="bg-slate-100/50 dark:bg-slate-900/50 rounded-3xl p-6 text-center border-2 border-dashed border-slate-250 dark:border-slate-800 flex flex-col items-center justify-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
              No Current Emergency Demands
            </p>
          </div>
        </section>
      )}

      {/* Dedicated Submit Emergency Request Section */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0"></span>
              Request Urgent Blood
            </h3>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">
              Broadcast immediately under 3-hour expiry limit
            </p>
          </div>
        </div>

        {submitSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-55 border border-green-200 dark:bg-green-950/20 dark:border-green-900/30 rounded-2xl p-5 text-center space-y-3"
          >
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-green-700 dark:text-green-400">
                Posted Successfully
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                Emergency blood request is now live in real-time. It will automatically self-expire in exactly 3 hours.
              </p>
            </div>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-350 transition-all active:scale-95"
            >
              Post Another
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleEmergencySubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Patient Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-450 ml-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asmatullah"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs outline-none focus:ring-2 focus:ring-red-500 dark:text-white transition-all shadow-sm"
                  value={form.patientName}
                  onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-450 ml-1">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 03337812345"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs outline-none focus:ring-2 focus:ring-red-500 dark:text-white transition-all shadow-sm"
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Blood Group */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-450 ml-1">
                  Blood Group *
                </label>
                <select
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs outline-none focus:ring-2 focus:ring-red-500 dark:text-white transition-all shadow-sm"
                  value={form.bloodGroup}
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                >
                  <option value="">Group</option>
                  {BLOOD_GROUPS.map(gb => (
                    <option key={gb} value={gb}>{gb}</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-450 ml-1">
                  District *
                </label>
                <select
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs outline-none focus:ring-2 focus:ring-red-500 dark:text-white transition-all shadow-sm"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                >
                  <option value="">Location</option>
                  {districtsLoading ? (
                    <option disabled>Loading...</option>
                  ) : (
                    districts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Hospital/Clinical Info */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-450 ml-1">
                Hospital/Clinical Information *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Quetta Civil Hospital Intensive Care Unit"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs outline-none focus:ring-2 focus:ring-red-500 dark:text-white transition-all shadow-sm"
                value={form.hospital}
                onChange={(e) => setForm({ ...form, hospital: e.target.value })}
              />
            </div>

            {submitError && (
              <p className="text-[10px] text-red-600 font-extrabold bg-red-50 dark:bg-red-955/20 border border-red-100 dark:border-red-900/30 p-2.5 rounded-xl">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-xl hover:shadow-red-200 shadow-red-150 dark:shadow-none transition-all active:scale-95 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3px]" />
                  Broadcast Live Request
                </>
              )}
            </button>
          </form>
        )}
      </section>

      {/* Stats Section - Design Grid */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <p className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-500 tracking-widest mb-1">
            Donors
          </p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-red-600">
              {donorCount !== null ? donorCount.toLocaleString() : '...'}
            </span>
            <span className="text-[10px] text-green-500 font-bold mb-1 ml-auto">Verified</span>
          </div>
        </div>
        
        <Link 
          to="/search"
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col group active:scale-95 transition-transform"
        >
          <p className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-500 tracking-widest mb-1 group-hover:text-red-500 transition-colors">
            Quick Find
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-slate-900 dark:text-white">Search</span>
            <SearchIcon className="w-5 h-5 text-red-600" />
          </div>
        </Link>
      </section>

      {/* Hero Quote - Vibrant Red Style */}
      <div className="bg-red-600 rounded-[32px] p-8 text-center space-y-3 shadow-xl shadow-red-200 dark:shadow-none relative overflow-hidden min-h-[160px] flex flex-col justify-center">
        <p className="text-white font-black text-lg leading-tight relative z-10">
          Become a Hero,<br />Donate Blood Today
        </p>
        <Link 
          to="/register" 
          className="text-[10px] font-black text-white uppercase tracking-[0.2em] relative z-10 hover:text-red-100 transition-colors bg-white/20 py-2 px-4 rounded-full backdrop-blur-sm self-center"
        >
          {t('btn_register')} →
        </Link>
        <Heart className="absolute -left-4 -bottom-4 w-24 h-24 text-white/10 -rotate-12" />
      </div>

      <div className="text-center space-y-4 pt-4">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
          {t('total_donors')} in Balochistan
        </p>
        
        <Link 
          to="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-colors"
        >
          <AlertCircle className="w-3 h-3" />
          Admin Portal
        </Link>
      </div>
    </div>
  );
}
