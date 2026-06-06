import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, LogIn, Trash2, Filter, UserX, UserCheck, Search, Users, Plus, X, MapPin, AlertCircle, CheckCircle, Clock, Mail, MessageSquare } from 'lucide-react';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BLOOD_GROUPS } from '../constants';
import { cn } from '../lib/utils';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('[Admin] Firestore Error:', errInfo);
  throw new Error(JSON.stringify(errInfo));
};

export default function Admin() {
  const { t } = useTranslation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [emergencyRequests, setEmergencyRequests] = useState<any[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterBlood, setFilterBlood] = useState('');
  
  // Login State
  const [loginData, setLoginData] = useState({ userId: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // District Management State
  const [newDistrict, setNewDistrict] = useState('');
  const [isAddingDistrict, setIsAddingDistrict] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (session === 'authorized' || isAuthorized) {
      if (!isAuthorized) setIsAuthorized(true);
      
      // Real-time districts sync
      const qDistricts = query(collection(db, 'districts'), orderBy('name', 'asc'));
      const unsubDistricts = onSnapshot(qDistricts, (snapshot) => {
        const list = snapshot.docs.map(doc => doc.data().name);
        setDistricts(list);
      });

      // Real-time donors sync - simpler query to avoid index issues with order
      const qDonors = collection(db, 'donors');
      const unsubDonors = onSnapshot(qDonors, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort in memory instead
        const sorted = docs.sort((a: any, b: any) => {
          const dateA = a.registeredAt?.toDate?.() || new Date(0);
          const dateB = b.registeredAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        setDonors(sorted);
        setLoading(false);
      }, (err) => {
        console.error("Donors listener error:", err);
        setLoading(false);
      });
      
      return () => {
        unsubDistricts();
        unsubDonors();
      };
    } else {
      setLoading(false);
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (!isAuthorized) return;

    const qEmergency = query(collection(db, 'emergency_requests'), orderBy('createdAt', 'desc'));
    const unsubEmergency = onSnapshot(qEmergency, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmergencyRequests(docs);
    }, (err) => {
      console.error("Emergency requests listener error:", err);
    });

    return () => unsubEmergency();
  }, [isAuthorized]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.userId === 'Admin' && loginData.password === 'mutab1980') {
      setIsAuthorized(true);
      localStorage.setItem('admin_session', 'authorized');
    } else {
      setLoginError('Invalid Credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    localStorage.removeItem('admin_session');
  };

  const addDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newDistrict.trim();
    if (!name) return;
    
    // Duplicate check
    if (districts.some(d => d.toLowerCase() === name.toLowerCase())) {
      alert('This district already exists!');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'districts'), { 
        name,
        createdAt: serverTimestamp()
      });
      setNewDistrict('');
      setIsAddingDistrict(false);
    } catch (err) {
      console.error(err);
      alert('Failed to add district. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const seedDistricts = async () => {
    const defaultDistricts = [
      'Awaran', 'Barkhan', 'Chagai', 'Chamman', 'Dera Bugti', 'Duki', 'Gwadar', 'Harnai', 'Jafarabad', 'Jhal Magsi', 'Kachhi', 'Kalat', 'Kech', 'Kharan', 'Khuzdar', 'Killa Abdullah', 'Kohlu', 'Lasbela', 'Loralai', 'Mastung', 'Musakhel', 'Naseerabad', 'Nushki', 'Panjgur', 'Pishin', 'Qilla Saifullah', 'Quetta', 'Sherani', 'Sibi', 'Surab', 'Sohbatpur', 'Washuk', 'Zhob', 'Ziarat'
    ];
    try {
      setLoading(true);
      for (const d of defaultDistricts) {
        await addDoc(collection(db, 'districts'), { name: d, createdAt: serverTimestamp() });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'delete' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'delete'
  });

  const closeDialog = () => setConfirmDialog(prev => ({ ...prev, isOpen: false }));

  const deleteDistrict = async (name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove District',
      message: `Are you sure you want to remove "${name}"? This will only remove it from the list of districts available during registration.`,
      type: 'delete',
      onConfirm: async () => {
        try {
          const q = query(collection(db, 'districts'), where('name', '==', name));
          const snap = await getDocs(q);
          const promises = snap.docs.map(d => deleteDoc(doc(db, 'districts', d.id)));
          await Promise.all(promises);
          closeDialog();
        } catch (err) {
          console.error(err);
          alert('Failed to delete district.');
        }
      }
    });
  };

  const deleteDonor = async (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Donor Record',
      message: `Are you sure you want to permanently delete donor "${name}"? This action cannot be undone and the record will be removed from the database.`,
      type: 'delete',
      onConfirm: async () => {
        console.log(`[Admin] Attempting to delete donor document: donors/${id}`);
        try {
          setDeletingId(id);
          closeDialog();
          const donorRef = doc(db, 'donors', id);
          await deleteDoc(donorRef);
          console.log(`[Admin] Successfully deleted document: donors/${id}`);
          alert(`Donor "${name}" has been removed.`);
        } catch (err: any) {
          console.error('[Admin] Delete error details:', err);
          try {
            handleFirestoreError(err, OperationType.DELETE, `donors/${id}`);
          } catch (jsonErr: any) {
            alert('Failed to delete donor. Check logs.');
          }
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const toggleDonorStatus = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'donors', id), { isActive: !current });
    } catch (err) {
      console.error(err);
    }
  };

  const updateRequestStatus = async (id: string, status: 'pending' | 'fulfilled') => {
    try {
      await updateDoc(doc(db, 'emergency_requests', id), { status });
    } catch (err) {
      console.error(err);
      alert('Failed to update request status');
    }
  };

  const deleteRequest = async (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Emergency Request',
      message: `Are you sure you want to delete the emergency blood request for "${name}"?`,
      type: 'delete',
      onConfirm: async () => {
        try {
          closeDialog();
          await deleteDoc(doc(db, 'emergency_requests', id));
          alert('Request deleted successfully');
        } catch (err) {
          console.error(err);
          alert('Failed to delete request');
        }
      }
    });
  };

  const filteredDonors = donors.filter(d => {
    return (filterDistrict ? d.district === filterDistrict : true) &&
           (filterBlood ? d.bloodGroup === filterBlood : true);
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAuthorized) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[80vh] bg-slate-50 dark:bg-slate-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-[24px] flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Admin Login</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Secure Access Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">User ID</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-red-500 dark:text-white transition-all"
                value={loginData.userId}
                onChange={e => setLoginData({...loginData, userId: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Password</label>
              <input
                type="password"
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-red-500 dark:text-white transition-all"
                value={loginData.password}
                onChange={e => setLoginData({...loginData, password: e.target.value})}
              />
            </div>
            {loginError && <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-red-600 text-white font-black py-5 rounded-[24px] shadow-xl shadow-red-200 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Enter Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            Admin Panel
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Management Suite</p>
        </div>
        <button
          onClick={handleLogout}
          className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:text-red-600 transition-colors"
        >
          <LogIn className="w-5 h-5 rotate-180" />
        </button>
      </header>

      {/* Admin Information Section */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-600" />
            Admin Information & Support
          </h3>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">
            Primary Contact Channels for App Support
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Email Channel */}
          <a
            href="mailto:rdadbaloch@gmail.com"
            className="flex flex-col p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-left space-y-2 group"
          >
            <div className="w-8 h-8 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 block leading-tight">
                Support Email
              </span>
              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 block truncate group-hover:text-rose-600 dark:group-hover:text-rose-400">
                rdadbaloch@gmail.com
              </span>
            </div>
          </a>

          {/* WhatsApp Channel */}
          <a
            href="https://wa.me/923342201288"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-left space-y-2 group"
          >
            <div className="w-8 h-8 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-450 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 block leading-tight">
                WhatsApp Admin
              </span>
              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 block group-hover:text-green-600 dark:group-hover:text-green-400">
                03342201288
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* District Management */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            Districts
          </h3>
          <button
            onClick={() => setIsAddingDistrict(!isAddingDistrict)}
            className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl"
          >
            {isAddingDistrict ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        <AnimatePresence>
          {isAddingDistrict && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={addDistrict}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="New District Name"
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
                value={newDistrict}
                onChange={e => setNewDistrict(e.target.value)}
              />
              <button
                type="submit"
                className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-2">
          {districts.map(d => (
            <span key={d} className="group relative bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              {d}
              <button 
                onClick={() => deleteDistrict(d)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {districts.length === 0 && (
            <div className="w-full space-y-4">
              <p className="text-xs text-slate-400 italic">No districts added yet.</p>
              <button
                onClick={seedDistricts}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-600 transition-all border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-3 h-3" /> Seed Default Districts
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Emergency Requests Management */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            Emergency Requests ({emergencyRequests.length})
          </span>
        </div>

        <div className="grid gap-3">
          {emergencyRequests.map((req) => (
            <motion.div
              key={req.id}
              layout
              className={cn(
                "p-5 rounded-[28px] border shadow-sm transition-all flex items-center justify-between gap-4",
                req.status === 'fulfilled' 
                  ? "bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-75"
                  : "bg-white dark:bg-slate-900 border-red-100 dark:border-red-900/30"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm uppercase",
                    req.status === 'fulfilled' 
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-500"
                      : "bg-red-500 text-white"
                  )}>
                    {req.bloodGroup}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm">
                    {req.patientName}
                  </h4>
                  {req.status === 'fulfilled' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    {req.hospital} • {req.district}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    Contact: {req.contactNumber}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateRequestStatus(req.id, req.status === 'fulfilled' ? 'pending' : 'fulfilled')}
                  className={cn(
                    "p-3 rounded-2xl transition-all shadow-sm active:scale-95",
                    req.status === 'fulfilled'
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      : "bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100"
                  )}
                  title={req.status === 'fulfilled' ? "Mark as Pending" : "Mark as Fulfilled"}
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteRequest(req.id, req.patientName)}
                  className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all shadow-sm active:scale-95"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}

          {emergencyRequests.length === 0 && (
            <div className="py-10 text-center bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 opacity-50">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No emergency requests active</p>
            </div>
          )}
        </div>
      </section>

      {/* Donor Filters */}
      <section className="bg-white dark:bg-slate-900 p-4 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest ml-1">District</label>
          <select
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-3 text-xs dark:text-white outline-none"
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
          >
            <option value="" className="dark:bg-slate-900 text-slate-400 uppercase tracking-widest">All</option>
            {districts.map(d => <option key={d} value={d} className="dark:bg-slate-900">{d}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest ml-1">Blood</label>
          <select
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-3 text-xs dark:text-white outline-none"
            value={filterBlood}
            onChange={(e) => setFilterBlood(e.target.value)}
          >
            <option value="" className="dark:bg-slate-900 text-slate-400 uppercase tracking-widest">All</option>
            {BLOOD_GROUPS.map(g => <option key={g} value={g} className="dark:bg-slate-900">{g}</option>)}
          </select>
        </div>
      </section>

      {/* Donor Management */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            Database Records ({filteredDonors.length})
          </span>
        </div>

        {filteredDonors.map((donor) => (
          <motion.div
            key={donor.id}
            layout
            className="bg-white dark:bg-slate-900 p-5 rounded-[28px] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-lg shadow-sm">
                  {donor.bloodGroup}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm">{donor.fullName}</h4>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                {donor.district} • {donor.phoneNumber}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleDonorStatus(donor.id, donor.isActive)}
                className={cn(
                  "p-3 rounded-2xl transition-all shadow-sm active:scale-90",
                  donor.isActive ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                )}
              >
                {donor.isActive ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
              </button>
              <button
                disabled={deletingId === donor.id}
                onClick={() => deleteDonor(donor.id, donor.fullName)}
                className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all shadow-sm active:scale-90 disabled:opacity-50"
              >
                {deletingId === donor.id ? (
                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>
        ))}
        
        {filteredDonors.length === 0 && (
          <div className="py-20 text-center opacity-40 grayscale flex flex-col items-center gap-4">
            <Users className="w-16 h-16 text-slate-300" />
            <p className="text-xs font-bold uppercase tracking-widest">No matched records found</p>
          </div>
        )}
      </div>

      {/* Custom Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDialog}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-8 space-y-6 text-center">
                <div className={cn(
                  "w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto",
                  confirmDialog.type === 'delete' ? "bg-red-50 dark:bg-red-900/20 text-red-600" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                )}>
                  <AlertCircle className="w-10 h-10" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {confirmDialog.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                    {confirmDialog.message}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={closeDialog}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black py-4 rounded-[20px] transition-all active:scale-95 text-[10px] uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDialog.onConfirm}
                    className={cn(
                      "flex-1 text-white font-black py-4 rounded-[20px] shadow-xl transition-all active:scale-95 text-[10px] uppercase tracking-widest",
                      confirmDialog.type === 'delete' ? "bg-red-600 shadow-red-200 dark:shadow-none" : "bg-amber-600 shadow-amber-200 dark:shadow-none"
                    )}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
