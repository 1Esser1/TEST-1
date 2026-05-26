import { useState, useEffect, useRef } from 'react';
import { User, Bell, Shield, Brain, CheckCircle, Eye, EyeOff, Camera, X, Lock, GitBranch, GitFork, Loader2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import useAuthStore from '../store/authStore';
import settingsService from '../services/settingsService';
import adminService from '../services/adminService';
import gitService from '../services/gitService';

/* ─── constants ─── */

const SECTIONS = [
  { id: 'profile',      label: 'My Profile',          icon: User      },
  { id: 'permissions',  label: 'Roles & Permissions',  icon: Shield    },
  { id: 'ai',           label: 'AI Scoring Config',    icon: Brain     },
  { id: 'notifications',label: 'Notifications',        icon: Bell      },
  { id: 'git',          label: 'Connected Accounts',   icon: GitBranch },
];

const ALL_ROLES = ['DEVELOPER', 'ERP_TEAM', 'PRODUCT_TEAM', 'IT_MANAGER', 'ADMIN'];

const ROLE_LABELS = {
  DEVELOPER:    'IT Developer',
  ERP_TEAM:     'ERP Team',
  PRODUCT_TEAM: 'Product / Mobile Team',
  IT_MANAGER:   'IT Manager',
  ADMIN:        'Administrator',
};

const ROLE_COLORS = {
  DEVELOPER:    { bg: '#EFF6FF', color: '#2563EB' },
  ERP_TEAM:     { bg: '#F0FDF4', color: '#16A34A' },
  PRODUCT_TEAM: { bg: '#FFF7ED', color: '#D97706' },
  IT_MANAGER:   { bg: '#F5F3FF', color: '#7C3AED' },
  ADMIN:        { bg: '#FEF2F2', color: '#DC2626' },
};

const ROLE_PERMISSIONS = [
  { feature: 'Submit tasks',            developer: true,  erpTeam: true,  productTeam: true,  manager: true,  admin: true  },
  { feature: 'View AI scores',          developer: true,  erpTeam: true,  productTeam: true,  manager: true,  admin: true  },
  { feature: 'View full backlog',       developer: false, erpTeam: false, productTeam: false, manager: true,  admin: true  },
  { feature: 'Override AI scores',      developer: true,  erpTeam: true,  productTeam: true,  manager: true,  admin: true  },
  { feature: 'Export reports',          developer: true,  erpTeam: true,  productTeam: true,  manager: true,  admin: true  },
  { feature: 'View audit trail',        developer: false, erpTeam: false, productTeam: false, manager: true,  admin: true  },
  { feature: 'Approve registrations',   developer: false, erpTeam: false, productTeam: false, manager: false, admin: true  },
  { feature: 'Configure AI provider',   developer: false, erpTeam: false, productTeam: false, manager: false, admin: true  },
  { feature: 'Manage user roles',       developer: false, erpTeam: false, productTeam: false, manager: false, admin: true  },
  { feature: 'Delete tasks',            developer: false, erpTeam: false, productTeam: false, manager: false, admin: true  },
  { feature: 'MoSCoW ratio dashboard',  developer: false, erpTeam: false, productTeam: false, manager: true,  admin: true  },
];

const AI_PROVIDERS_INFO = [
  {
    value: 'groq', label: 'Groq', color: '#F97316',
    model: 'llama-3.3-70b-versatile',
    description: 'Fast inference. Best for real-time scoring.',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  },
  {
    value: 'gemini', label: 'Gemini', color: '#4285F4',
    model: 'gemini-2.0-flash',
    description: 'Google DeepMind. Strong reasoning and context.',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
  },
  {
    value: 'mistral', label: 'Mistral', color: '#FF7000',
    model: 'mistral-small-latest',
    description: 'Efficient European model. Good multilingual support.',
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
  },
  {
    value: 'ollama', label: 'Ollama', color: '#1A1A2E',
    model: 'llama3.2',
    description: 'Local inference. No external API calls.',
    endpoint: 'http://localhost:11434/api/chat',
  },
];

const KANO_MULTIPLIERS = [
  { label: 'Basic Need',   value: '×1.3', note: 'Users complain if missing' },
  { label: 'Performance',  value: '×1.0', note: 'Users appreciate it' },
  { label: 'Delighter',    value: '×0.8', note: 'Users surprised if present' },
  { label: 'Indifferent',  value: '×1.0', note: 'No satisfaction impact' },
  { label: 'Reverse',      value: '×1.0', note: 'Some users dislike it' },
];

const MOSCOW_MULTIPLIERS = [
  { label: 'Must',   value: '×1.5', color: '#DC2626' },
  { label: 'Should', value: '×1.2', color: '#D97706' },
  { label: 'Could',  value: '×1.0', color: '#2563EB' },
  { label: "Won't",  value: '×0.5', color: '#9CA3AF' },
];

/* ─── shared styles ─── */

const inputStyle = {
  width: '100%', padding: '0.65rem 1rem',
  border: '1.5px solid #E5E7EB', borderRadius: '0.5rem',
  fontSize: '0.875rem', outline: 'none',
  boxSizing: 'border-box', backgroundColor: '#FAFAFA',
  color: '#111827', fontFamily: 'Inter, sans-serif',
};

const labelStyle = {
  display: 'block', fontSize: '0.75rem', fontWeight: '600',
  color: '#374151', marginBottom: '0.4rem',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

/* ─── Toggle ─── */
function Toggle({ checked, onChange }) {
  return (
    <div onClick={onChange} style={{
      width: '44px', height: '24px', borderRadius: '9999px',
      backgroundColor: checked ? '#CC2027' : '#E5E7EB',
      cursor: 'pointer', position: 'relative',
      transition: 'background-color 0.2s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: '3px',
        left: checked ? '23px' : '3px',
        width: '18px', height: '18px',
        borderRadius: '50%', backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
      }} />
    </div>
  );
}

/* ─── Password Confirm Modal ─── */
function ConfirmPasswordModal({ message, onConfirm, onClose }) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!password) { setError('Please enter your current password.'); return; }
    setLoading(true);
    setError('');
    try {
      await onConfirm(password);
    } catch (e) {
      setError(e?.response?.data?.message || 'Incorrect password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '1rem',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
      }}>
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #F0F0F0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '0.4rem',
              backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Lock size={15} color="#DC2626" />
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827' }}>
              Confirm with password
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem' }}>
          <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '1rem', lineHeight: '1.5' }}>
            {message}
          </p>
          <label style={labelStyle}>Current password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConfirm()}
              placeholder="••••••••"
              style={{ ...inputStyle, paddingRight: '2.5rem' }}
              onFocus={e => e.target.style.borderColor = '#CC2027'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              autoFocus
            />
            <button type="button" onClick={() => setShow(!show)} style={{
              position: 'absolute', right: '0.75rem', top: '50%',
              transform: 'translateY(-50%)', background: 'none',
              border: 'none', cursor: 'pointer', color: '#9CA3AF',
            }}>
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {error && (
            <p style={{ fontSize: '0.78rem', color: '#DC2626', marginTop: '0.5rem' }}>{error}</p>
          )}
        </div>

        <div style={{
          padding: '1rem 1.5rem', borderTop: '1px solid #F0F0F0',
          display: 'flex', justifyContent: 'flex-end', gap: '0.5rem',
        }}>
          <button onClick={onClose} style={{
            padding: '0.5rem 1.1rem', backgroundColor: 'white',
            border: '1.5px solid #E5E7EB', borderRadius: '0.5rem',
            fontSize: '0.82rem', fontWeight: '600', color: '#6B7280', cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={loading} style={{
            padding: '0.5rem 1.25rem',
            backgroundColor: loading ? '#9CA3AF' : '#CC2027',
            color: 'white', border: 'none', borderRadius: '0.5rem',
            fontSize: '0.82rem', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Verifying…' : 'Confirm & Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Settings Page ─── */
function Settings() {
  const { user, updateUser } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'IT_MANAGER' || isAdmin;

  const [activeSection, setActiveSection] = useState('profile');
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const photoInputRef = useRef(null);

  /* git connected accounts */
  const [gitStatus, setGitStatus] = useState(null);
  const [gitLoading, setGitLoading] = useState(false);
  const [gitDisconnecting, setGitDisconnecting] = useState('');

  /* profile */
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [newPhoto, setNewPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [profileError, setProfileError] = useState('');

  /* notifications */
  const [notifications, setNotifications] = useState({
    taskScored: true,
    taskOverridden: true,
    taskApproved: true,
    weeklyDigest: false,
    moscowAlert: true,
    method: 'both',
  });
  const [notifError, setNotifError] = useState('');

  /* admin: user list for permissions */
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [roleEdits, setRoleEdits] = useState({});

  useEffect(() => {
    if (activeSection === 'permissions' && isAdmin && allUsers.length === 0) {
      setUsersLoading(true);
      adminService.getAllUsers()
        .then(data => setAllUsers(data))
        .catch(() => {})
        .finally(() => setUsersLoading(false));
    }
  }, [activeSection]);

  // Handle OAuth callback redirects — GitHub/GitLab send browser back here with ?github=connected etc.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const githubResult = params.get('github');
    const gitlabResult = params.get('gitlab');
    if (githubResult === 'connected') {
      showToast('GitHub account connected successfully!');
      setActiveSection('git');
      window.history.replaceState({}, '', '/settings');
    } else if (githubResult === 'error') {
      showToast(decodeURIComponent(params.get('message') || 'GitHub connection failed.'), 'error');
      window.history.replaceState({}, '', '/settings');
    }
    if (gitlabResult === 'connected') {
      showToast('GitLab account connected successfully!');
      setActiveSection('git');
      window.history.replaceState({}, '', '/settings');
    } else if (gitlabResult === 'error') {
      showToast(decodeURIComponent(params.get('message') || 'GitLab connection failed.'), 'error');
      window.history.replaceState({}, '', '/settings');
    }
  }, []);

  // Load git status whenever the git section is opened
  useEffect(() => {
    if (activeSection === 'git') {
      setGitLoading(true);
      gitService.getStatus()
        .then(data => setGitStatus(data))
        .catch(() => {})
        .finally(() => setGitLoading(false));
    }
  }, [activeSection]);

  const handleGitConnect = async (provider) => {
    try {
      const { authUrl } = await gitService.getAuthUrl(provider);
      window.location.href = authUrl;
    } catch {
      showToast(`Failed to start ${provider} connection.`, 'error');
    }
  };

  const handleGitDisconnect = async (provider) => {
    setGitDisconnecting(provider);
    try {
      await gitService.disconnect(provider);
      setGitStatus(prev => ({
        ...prev,
        [`${provider}Connected`]: false,
        [`${provider}Username`]: null,
      }));
      showToast(`${provider === 'github' ? 'GitHub' : 'GitLab'} account disconnected.`);
    } catch {
      showToast('Disconnect failed.', 'error');
    } finally {
      setGitDisconnecting('');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  /* ── save profile (after password confirm) ── */
  const requestProfileSave = () => {
    setProfileError('');
    if (newPassword && newPassword !== confirmPassword) {
      setProfileError('New passwords do not match.');
      return;
    }
    setConfirmModal({
      message: 'Enter your current password to save your profile changes.',
      onConfirm: async (currentPassword) => {
        const payload = {
          name: profileName,
          email: profileEmail,
          currentPassword,
          ...(newPassword ? { newPassword } : {}),
        };
        const updated = await settingsService.updateProfile(payload, newPhoto);
        updateUser({
          name: updated.name ?? profileName,
          email: updated.email ?? profileEmail,
          photoPath: updated.photoPath ?? user?.photoPath,
        });
        setConfirmModal(null);
        setNewPassword('');
        setConfirmPassword('');
        setNewPhoto(null);
        setPhotoPreview(null);
        showToast('Profile updated successfully.');
      },
    });
  };

  /* ── save notifications (after password confirm) ── */
  const requestNotifSave = () => {
    setNotifError('');
    setConfirmModal({
      message: 'Enter your current password to save your notification preferences.',
      onConfirm: async (currentPassword) => {
        await settingsService.saveNotifications({ ...notifications, currentPassword });
        setConfirmModal(null);
        showToast('Notification preferences saved.');
      },
    });
  };

  /* ── admin: save role change (after password confirm) ── */
  const requestRoleSave = (userId, userName, newRole) => {
    setConfirmModal({
      message: `Enter your password to change ${userName}'s role to ${ROLE_LABELS[newRole]}.`,
      onConfirm: async (currentPassword) => {
        await adminService.updateUser(userId, { role: newRole, currentPassword });
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setRoleEdits(prev => { const next = { ...prev }; delete next[userId]; return next; });
        setConfirmModal(null);
        showToast(`${userName}'s role updated to ${ROLE_LABELS[newRole]}.`);
      },
    });
  };

  const storedPhotoUrl = user?.photoPath
    ? (user.photoPath.startsWith('http') ? user.photoPath : `http://localhost:8080/${user.photoPath}`)
    : null;
  const currentPhotoSrc = photoPreview || storedPhotoUrl;

  const userAccessMap = {
    DEVELOPER: perm => perm.developer,
    ERP_TEAM: perm => perm.erpTeam,
    PRODUCT_TEAM: perm => perm.productTeam,
    IT_MANAGER: perm => perm.manager,
    ADMIN: perm => perm.admin,
  };
  const myAccess = userAccessMap[user?.role] || (() => false);

  return (
    <PageWrapper title="Settings" subtitle="Manage your account and application preferences">

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem',
          zIndex: 2000, maxWidth: '340px',
          padding: '0.875rem 1.25rem',
          backgroundColor: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
          borderRadius: '0.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <CheckCircle size={16} color={toast.type === 'success' ? '#16A34A' : '#DC2626'} />
          <p style={{ fontSize: '0.85rem', fontWeight: '500', color: toast.type === 'success' ? '#16A34A' : '#DC2626' }}>
            {toast.message}
          </p>
        </div>
      )}

      {/* Password confirm modal */}
      {confirmModal && (
        <ConfirmPasswordModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem' }}>

        {/* Left nav */}
        <div style={{
          backgroundColor: 'white', borderRadius: '0.75rem',
          border: '1px solid #F0F0F0', padding: '0.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: 'fit-content',
        }}>
          {SECTIONS.map(section => {
            const Icon = section.icon;
            const active = activeSection === section.id;
            return (
              <button key={section.id} onClick={() => setActiveSection(section.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.875rem', borderRadius: '0.5rem', border: 'none',
                backgroundColor: active ? '#FEF2F2' : 'transparent',
                borderLeft: `3px solid ${active ? '#CC2027' : 'transparent'}`,
                color: active ? '#CC2027' : '#6B7280',
                fontSize: '0.85rem', fontWeight: active ? '600' : '400',
                cursor: 'pointer', textAlign: 'left', marginBottom: '0.1rem',
              }}>
                <Icon size={16} />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Right content */}
        <div style={{
          backgroundColor: 'white', borderRadius: '0.75rem',
          border: '1px solid #F0F0F0', padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>

          {/* ─── MY PROFILE ─── */}
          {activeSection === 'profile' && (
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>
                My Profile
              </p>
              <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginBottom: '1.5rem' }}>
                Update your personal information, photo and password
              </p>

              {/* Avatar + upload */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1.25rem',
                marginBottom: '1.75rem', padding: '1.25rem',
                backgroundColor: '#F8F9FB', borderRadius: '0.75rem', border: '1px solid #F0F0F0',
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    backgroundColor: '#1A1A2E', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '3px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  }}>
                    {currentPhotoSrc ? (
                      <img src={currentPhotoSrc} alt="avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#CC2027', fontSize: '1.75rem', fontWeight: '700' }}>
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: '24px', height: '24px', borderRadius: '50%',
                      backgroundColor: '#CC2027', border: '2px solid white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Camera size={12} color="white" />
                  </button>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <p style={{ fontSize: '1rem', fontWeight: '700', color: '#111827' }}>{user?.name}</p>
                    {user?.emailVerified && (
                      <span style={{
                        fontSize: '0.68rem', fontWeight: '600',
                        backgroundColor: '#EFF6FF', color: '#2563EB',
                        padding: '0.1rem 0.4rem', borderRadius: '9999px',
                        border: '1px solid #BFDBFE',
                      }}>✓ Verified</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.35rem' }}>{user?.email}</p>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: '600',
                    backgroundColor: '#FEF2F2', color: '#CC2027',
                    padding: '0.15rem 0.6rem', borderRadius: '9999px',
                    border: '1px solid #FECACA',
                  }}>
                    {user?.role?.replace(/_/g, ' ')}
                  </span>
                  {newPhoto && (
                    <p style={{ fontSize: '0.72rem', color: '#16A34A', marginTop: '0.35rem' }}>
                      ✓ New photo selected — save to apply
                    </p>
                  )}
                </div>
              </div>

              {/* Name + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Full name</label>
                  <input
                    type="text" value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#CC2027'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email address</label>
                  <input
                    type="email" value={profileEmail}
                    onChange={e => setProfileEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#CC2027'}
                    onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>
              </div>

              {/* Change password */}
              <div style={{
                padding: '1.25rem', backgroundColor: '#F8F9FB',
                borderRadius: '0.75rem', border: '1px solid #F0F0F0', marginBottom: '1.25rem',
              }}>
                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
                  Change password <span style={{ fontSize: '0.72rem', fontWeight: '400', color: '#9CA3AF' }}>(leave blank to keep current)</span>
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={labelStyle}>New password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{ ...inputStyle, paddingRight: '2.5rem' }}
                        onFocus={e => e.target.style.borderColor = '#CC2027'}
                        onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                      />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)} style={{
                        position: 'absolute', right: '0.75rem', top: '50%',
                        transform: 'translateY(-50%)', background: 'none',
                        border: 'none', cursor: 'pointer', color: '#9CA3AF',
                      }}>
                        {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Confirm new password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{
                          ...inputStyle, paddingRight: '2.5rem',
                          borderColor: confirmPassword && confirmPassword !== newPassword ? '#DC2626' : '#E5E7EB',
                        }}
                        onFocus={e => e.target.style.borderColor = '#CC2027'}
                        onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                      />
                      <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} style={{
                        position: 'absolute', right: '0.75rem', top: '50%',
                        transform: 'translateY(-50%)', background: 'none',
                        border: 'none', cursor: 'pointer', color: '#9CA3AF',
                      }}>
                        {showConfirmPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p style={{ fontSize: '0.7rem', color: '#DC2626', marginTop: '0.25rem' }}>
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {profileError && (
                <p style={{ fontSize: '0.8rem', color: '#DC2626', marginBottom: '0.75rem' }}>{profileError}</p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={requestProfileSave} style={{
                  padding: '0.65rem 1.5rem', backgroundColor: '#CC2027',
                  color: 'white', border: 'none', borderRadius: '0.5rem',
                  fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}>
                  <Lock size={14} />
                  Save changes
                </button>
              </div>
            </div>
          )}

          {/* ─── ROLES & PERMISSIONS ─── */}
          {activeSection === 'permissions' && (
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>
                Roles & Permissions
              </p>
              <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginBottom: '1.25rem' }}>
                {isAdmin ? 'View permission matrix and manage user roles' : 'Your access level based on your assigned role'}
              </p>

              {/* Permission matrix */}
              <div style={{ border: '1px solid #F0F0F0', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: isAdmin ? '2rem' : '0' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1.6fr repeat(5, 1fr)',
                  padding: '0.75rem 1rem', backgroundColor: '#F8F9FB',
                  borderBottom: '1px solid #F0F0F0',
                }}>
                  {['Feature', 'Developer', 'ERP', 'Product', 'Manager', 'Admin'].map(h => (
                    <span key={h} style={{
                      fontSize: '0.68rem', fontWeight: '600', color: '#9CA3AF',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>{h}</span>
                  ))}
                </div>
                {ROLE_PERMISSIONS.map((perm, i) => {
                  const cols = [perm.developer, perm.erpTeam, perm.productTeam, perm.manager, perm.admin];
                  const hasAccess = myAccess(perm);
                  return (
                    <div key={perm.feature} style={{
                      display: 'grid', gridTemplateColumns: '1.6fr repeat(5, 1fr)',
                      padding: '0.75rem 1rem',
                      borderBottom: i < ROLE_PERMISSIONS.length - 1 ? '1px solid #F9FAFB' : 'none',
                      alignItems: 'center',
                      backgroundColor: hasAccess ? 'white' : '#FAFAFA',
                    }}>
                      <span style={{ fontSize: '0.8rem', color: '#374151', fontWeight: hasAccess ? '500' : '400' }}>
                        {perm.feature}
                      </span>
                      {cols.map((val, ci) => (
                        <span key={ci} style={{ fontSize: '0.8rem' }}>
                          {val
                            ? <span style={{ color: '#16A34A', fontWeight: '700' }}>✓</span>
                            : <span style={{ color: '#D1D5DB' }}>—</span>
                          }
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Admin: manage user roles */}
              {isAdmin && (
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>
                    Manage User Roles
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginBottom: '1rem' }}>
                    Change the role of any user. A password confirmation is required.
                  </p>

                  {usersLoading && (
                    <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Loading users…</p>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {allUsers.map(u => {
                      const currentRole = roleEdits[u.id] ?? u.role;
                      const changed = roleEdits[u.id] && roleEdits[u.id] !== u.role;
                      const rs = ROLE_COLORS[currentRole] || ROLE_COLORS.DEVELOPER;
                      return (
                        <div key={u.id} style={{
                          display: 'flex', alignItems: 'center', gap: '1rem',
                          padding: '0.875rem 1rem',
                          border: `1px solid ${changed ? '#BFDBFE' : '#F0F0F0'}`,
                          borderRadius: '0.625rem',
                          backgroundColor: changed ? '#F0F7FF' : 'white',
                        }}>
                          {/* Avatar */}
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            backgroundColor: '#1A1A2E', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden',
                          }}>
                            {u.photoPath ? (
                              <img src={`http://localhost:8080/${u.photoPath}`} alt={u.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ color: '#CC2027', fontSize: '0.875rem', fontWeight: '700' }}>
                                {u.name?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#111827' }}>{u.name}</p>
                            <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{u.email}</p>
                          </div>

                          {/* Role selector */}
                          <select
                            value={currentRole}
                            onChange={e => setRoleEdits(prev => ({ ...prev, [u.id]: e.target.value }))}
                            style={{
                              padding: '0.4rem 0.75rem', borderRadius: '0.4rem',
                              border: `1.5px solid ${changed ? '#2563EB' : '#E5E7EB'}`,
                              fontSize: '0.78rem', fontWeight: '600',
                              backgroundColor: rs.bg, color: rs.color,
                              cursor: 'pointer', outline: 'none',
                            }}
                          >
                            {ALL_ROLES.map(r => (
                              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                          </select>

                          {changed && (
                            <button
                              onClick={() => requestRoleSave(u.id, u.name, roleEdits[u.id])}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.4rem 0.875rem',
                                backgroundColor: '#CC2027', color: 'white',
                                border: 'none', borderRadius: '0.4rem',
                                fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer',
                              }}
                            >
                              <Lock size={12} />
                              Save
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── AI SCORING CONFIG ─── */}
          {activeSection === 'ai' && (
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>
                AI Scoring Configuration
              </p>
              <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginBottom: '1.5rem' }}>
                Overview of the multi-provider AI scoring engine. Switch providers from the Admin panel.
              </p>

              {/* Provider cards */}
              <p style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Available providers
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.75rem' }}>
                {AI_PROVIDERS_INFO.map(p => (
                  <div key={p.value} style={{
                    padding: '1rem', borderRadius: '0.625rem',
                    border: `1.5px solid ${p.color}30`,
                    backgroundColor: `${p.color}08`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: '700',
                        color: p.color, backgroundColor: `${p.color}18`,
                        padding: '0.15rem 0.5rem', borderRadius: '9999px',
                      }}>
                        {p.label}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#6B7280', fontFamily: 'monospace' }}>
                        {p.model}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280', lineHeight: '1.4', marginBottom: '0.5rem' }}>
                      {p.description}
                    </p>
                    <p style={{ fontSize: '0.68rem', color: '#9CA3AF', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {p.endpoint}
                    </p>
                  </div>
                ))}
              </div>

              {/* Formula */}
              <div style={{
                padding: '1rem 1.25rem', backgroundColor: '#1A1A2E',
                borderRadius: '0.75rem', marginBottom: '1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              }}>
                {[
                  { v: '(R × I × C)', label: 'RICE numerator' },
                  { v: '÷ E', label: 'effort divisor' },
                  { v: '× Kano', label: 'category multiplier' },
                  { v: '× MoSCoW', label: 'priority multiplier' },
                ].map((part, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: '700', color: '#CC2027' }}>{part.v}</p>
                    <p style={{ fontSize: '0.6rem', color: '#4B5563', marginTop: '0.15rem' }}>{part.label}</p>
                  </div>
                ))}
              </div>

              {/* Multipliers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <p style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Kano multipliers
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {KANO_MULTIPLIERS.map(m => (
                      <div key={m.label} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.5rem 0.875rem', backgroundColor: '#F8F9FB',
                        borderRadius: '0.4rem', border: '1px solid #F0F0F0',
                      }}>
                        <div>
                          <span style={{ fontSize: '0.78rem', color: '#374151', fontWeight: '500' }}>{m.label}</span>
                          <span style={{ fontSize: '0.68rem', color: '#9CA3AF', marginLeft: '0.4rem' }}>{m.note}</span>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#CC2027' }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    MoSCoW multipliers
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {MOSCOW_MULTIPLIERS.map(m => (
                      <div key={m.label} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.5rem 0.875rem', backgroundColor: '#F8F9FB',
                        borderRadius: '0.4rem', border: '1px solid #F0F0F0',
                      }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: '600', color: m.color }}>{m.label}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#CC2027' }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {!isAdmin && (
                <div style={{
                  marginTop: '1.25rem', padding: '0.875rem 1rem',
                  backgroundColor: '#FFF7ED', border: '1px solid #FDE68A',
                  borderRadius: '0.5rem', display: 'flex', gap: '0.75rem',
                }}>
                  <span style={{ fontSize: '0.875rem' }}>⚠️</span>
                  <p style={{ fontSize: '0.8rem', color: '#92400E' }}>
                    To switch the active AI provider, go to the <strong>Admin Panel → AI Scoring Provider</strong>.
                    Only administrators can change this setting.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── NOTIFICATIONS ─── */}
          {activeSection === 'notifications' && (
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>
                Notification Preferences
              </p>
              <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginBottom: '0.75rem' }}>
                Choose which events trigger notifications
              </p>

              {/* Backend note */}
              <div style={{
                padding: '0.875rem 1rem', marginBottom: '1.25rem',
                backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE',
                borderRadius: '0.5rem', display: 'flex', gap: '0.75rem',
              }}>
                <span style={{ fontSize: '0.875rem' }}>ℹ️</span>
                <p style={{ fontSize: '0.78rem', color: '#1D4ED8', lineHeight: '1.5' }}>
                  Preferences are saved to the backend. Actual email/in-app delivery requires the
                  notification service to be configured in <strong>application.properties</strong> (SMTP for email,
                  WebSocket for in-app).
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  { key: 'taskScored',    label: 'Task AI scored',       desc: 'Notify me when my submitted task is scored by the AI' },
                  { key: 'taskOverridden',label: 'Score overridden',     desc: 'Notify me when a score on my task is manually overridden' },
                  { key: 'taskApproved',  label: 'Task approved',        desc: 'Notify me when my task is approved and added to the backlog' },
                  { key: 'weeklyDigest',  label: 'Weekly backlog digest',desc: 'Receive a weekly summary of top-priority tasks every Monday', managerOnly: false },
                  { key: 'moscowAlert',   label: 'MoSCoW ratio alert',   desc: 'Alert when the Must ratio deviates from the 60% target', managerOnly: true },
                ].map((item, i, arr) => {
                  if (item.managerOnly && !isManager) return null;
                  return (
                    <div key={item.key} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: '1rem', padding: '1rem 0',
                      borderBottom: i < arr.length - 1 ? '1px solid #F9FAFB' : 'none',
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151' }}>
                            {item.label}
                          </p>
                          {item.managerOnly && (
                            <span style={{
                              fontSize: '0.65rem', fontWeight: '600',
                              backgroundColor: '#F5F3FF', color: '#7C3AED',
                              padding: '0.1rem 0.4rem', borderRadius: '9999px',
                              border: '1px solid #DDD6FE',
                            }}>Manager+</span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.15rem' }}>
                          {item.desc}
                        </p>
                      </div>
                      <Toggle
                        checked={notifications[item.key]}
                        onChange={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Notification method */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #F0F0F0' }}>
                <label style={labelStyle}>Notification delivery method</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[
                    { value: 'app',   label: 'In-app only' },
                    { value: 'email', label: 'Email only' },
                    { value: 'both',  label: 'Both' },
                  ].map(opt => (
                    <button key={opt.value}
                      onClick={() => setNotifications(prev => ({ ...prev, method: opt.value }))}
                      style={{
                        padding: '0.5rem 1rem', borderRadius: '0.5rem',
                        border: `1.5px solid ${notifications.method === opt.value ? '#CC2027' : '#E5E7EB'}`,
                        backgroundColor: notifications.method === opt.value ? '#FEF2F2' : 'white',
                        color: notifications.method === opt.value ? '#CC2027' : '#6B7280',
                        fontSize: '0.825rem', fontWeight: '500', cursor: 'pointer',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {notifError && (
                <p style={{ fontSize: '0.8rem', color: '#DC2626', marginTop: '0.75rem' }}>{notifError}</p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button onClick={requestNotifSave} style={{
                  padding: '0.65rem 1.5rem', backgroundColor: '#CC2027',
                  color: 'white', border: 'none', borderRadius: '0.5rem',
                  fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                }}>
                  <Lock size={14} />
                  Save preferences
                </button>
              </div>
            </div>
          )}

          {/* ─── CONNECTED ACCOUNTS ─── */}
          {activeSection === 'git' && (
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>
                Connected Accounts
              </p>
              <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginBottom: '1.5rem' }}>
                Link your GitHub or GitLab account to commit code directly from PriorIT tasks.
                Your access token is stored securely on the server — never exposed to the browser.
              </p>

              {gitLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '2rem', color: '#9CA3AF' }}>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.85rem' }}>Loading account status…</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  {/* GitHub card */}
                  {[
                    { provider: 'github', label: 'GitHub', Icon: GitFork, accentColor: '#1A1A2E', bgColor: '#F8F9FB' },
                    { provider: 'gitlab', label: 'GitLab', Icon: GitBranch, accentColor: '#FC6D26', bgColor: '#FFF7F3' },
                  ].map(({ provider, label, Icon, accentColor, bgColor }) => {
                    const connected = gitStatus?.[`${provider}Connected`];
                    const username = gitStatus?.[`${provider}Username`];
                    const isDisconnecting = gitDisconnecting === provider;
                    return (
                      <div key={provider} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: '1rem', padding: '1.25rem 1.5rem',
                        border: `1.5px solid ${connected ? (provider === 'github' ? '#D1D5DB' : '#FDD5C0') : '#F0F0F0'}`,
                        borderRadius: '0.75rem',
                        backgroundColor: connected ? bgColor : 'white',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{
                            width: '42px', height: '42px', borderRadius: '0.6rem',
                            backgroundColor: accentColor,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <Icon size={20} color="white" />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                              <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827' }}>{label}</p>
                              {connected && (
                                <span style={{
                                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                                  fontSize: '0.68rem', fontWeight: '600',
                                  backgroundColor: '#F0FDF4', color: '#16A34A',
                                  padding: '0.15rem 0.5rem', borderRadius: '9999px',
                                  border: '1px solid #BBF7D0',
                                }}>
                                  <CheckCircle2 size={10} />
                                  Connected
                                </span>
                              )}
                            </div>
                            {connected ? (
                              <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                                Signed in as <strong style={{ color: '#111827' }}>@{username}</strong>
                              </p>
                            ) : (
                              <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                                Not connected — click to authorise via OAuth
                              </p>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                          {connected ? (
                            <>
                              <a
                                href={`https://${provider}.com/${username}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                                  padding: '0.45rem 0.875rem', borderRadius: '0.45rem',
                                  border: '1px solid #E5E7EB', backgroundColor: 'white',
                                  color: '#374151', fontSize: '0.78rem', fontWeight: '500',
                                  textDecoration: 'none',
                                }}
                              >
                                <ExternalLink size={12} />
                                View profile
                              </a>
                              <button
                                onClick={() => handleGitDisconnect(provider)}
                                disabled={isDisconnecting}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                                  padding: '0.45rem 0.875rem', borderRadius: '0.45rem',
                                  border: '1px solid #FECACA', backgroundColor: '#FEF2F2',
                                  color: '#DC2626', fontSize: '0.78rem', fontWeight: '600',
                                  cursor: isDisconnecting ? 'not-allowed' : 'pointer',
                                  opacity: isDisconnecting ? 0.6 : 1,
                                }}
                              >
                                {isDisconnecting
                                  ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Disconnecting…</>
                                  : <><X size={12} /> Disconnect</>
                                }
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleGitConnect(provider)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.5rem 1.25rem', borderRadius: '0.45rem',
                                border: 'none', backgroundColor: accentColor,
                                color: 'white', fontSize: '0.82rem', fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              <Icon size={14} />
                              Connect {label}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Info box */}
                  <div style={{
                    padding: '0.875rem 1rem', marginTop: '0.5rem',
                    backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE',
                    borderRadius: '0.5rem', display: 'flex', gap: '0.75rem',
                  }}>
                    <AlertCircle size={15} color="#2563EB" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div style={{ fontSize: '0.78rem', color: '#1D4ED8', lineHeight: '1.55' }}>
                      <strong>How it works:</strong> PriorIT uses OAuth to request read/write access to your
                      repositories. Your token is stored encrypted on our server and is only used when you
                      push code from a subtask. You can disconnect at any time.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </PageWrapper>
  );
}

export default Settings;
