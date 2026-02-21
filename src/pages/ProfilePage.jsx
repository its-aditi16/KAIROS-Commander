import React, { useState, useEffect, useRef } from 'react';
import { auth, storage } from '../firebase';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import {
  User,
  Building2,
  Briefcase,
  Mail,
  Camera,
  CheckCircle2,
  Shield,
  Calendar,
} from 'lucide-react';

const db = getFirestore();

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="glass-panel p-4 flex items-center gap-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-kairos-muted">{label}</p>
      <p className="text-sm font-semibold text-white">{value || '—'}</p>
    </div>
  </div>
);

// ─── Info Row ────────────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4 py-4 border-b border-white/5 last:border-0">
    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={16} className="text-kairos-muted" />
    </div>
    <div>
      <p className="text-xs text-kairos-muted mb-0.5">{label}</p>
      <p className="text-sm text-white font-medium">{value || '—'}</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ProfilePage = () => {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  // Listen to auth state + load Firestore profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setPhotoURL(user?.photoURL || null);
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) setProfile(snap.data());
        } catch (e) {
          console.error('Failed to load profile:', e);
        }
      }
    });
    return () => unsub();
  }, []);

  // ── Handle avatar upload ──────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // Update Firebase Auth profile photo
      await updateProfile(currentUser, { photoURL: url });

      // Persist to Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), { photoURL: url });

      setPhotoURL(url);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  // ── Derived display values ────────────────────────────────────────────────
  const displayName =
    profile?.name ||
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'User';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-kairos-bg text-white px-4 py-10 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[45%] bg-kairos-blue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10 space-y-6">

        {/* ── Hero Card ── */}
        <div className="glass-panel p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0 group">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-kairos-blue to-purple-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-kairos-surface overflow-hidden flex items-center justify-center">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">{initials}</span>
                )}
              </div>
            </div>

            {/* Camera upload overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              title="Change photo"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera size={20} className="text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            {/* Saved indicator */}
            {saved && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 size={14} className="text-white" />
              </div>
            )}
          </div>

          {/* Name & Meta */}
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              {displayName}
            </h1>
            <p className="text-kairos-muted mt-1 text-sm">
              {profile?.position || 'Position not set'}
            </p>
            <p className="text-kairos-muted text-sm">
              {profile?.organisation || 'Organisation not set'}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-kairos-blue/10 border border-kairos-blue/30 text-kairos-blue text-xs font-medium px-3 py-1 rounded-full">
              <Shield size={12} />
              Incident Commander
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard
            label="Organisation"
            value={profile?.organisation}
            icon={Building2}
            color="bg-kairos-blue/20"
          />
          <StatCard
            label="Position"
            value={profile?.position}
            icon={Briefcase}
            color="bg-purple-500/20"
          />
          <StatCard
            label="Member Since"
            value={joinedDate}
            icon={Calendar}
            color="bg-green-500/20"
          />
        </div>

        {/* ── Detail Panel ── */}
        <div className="glass-panel p-6">
          <h2 className="text-sm font-semibold text-kairos-muted uppercase tracking-widest mb-2">
            Account Details
          </h2>
          <InfoRow icon={User}       label="Full Name"     value={displayName} />
          <InfoRow icon={Mail}       label="Email"         value={profile?.email || currentUser?.email} />
          <InfoRow icon={Building2}  label="Organisation"  value={profile?.organisation} />
          <InfoRow icon={Briefcase}  label="Position"      value={profile?.position} />
        </div>

        {/* ── Upload hint ── */}
        <p className="text-center text-xs text-kairos-muted/60">
          Hover over your avatar to upload a profile photo.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
