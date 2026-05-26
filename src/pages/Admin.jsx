import { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Clock, RefreshCw, Shield, AlertCircle,
  Bot, Users, Eye, Edit3, Trash2, X, Save, ChevronDown,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import adminService from '../services/adminService';

const AI_PROVIDERS = [
  { value: 'groq',    label: 'Groq',    description: 'llama-3.3-70b-versatile' },
  { value: 'gemini',  label: 'Gemini',  description: 'gemini-2.0-flash' },
  { value: 'mistral', label: 'Mistral', description: 'mistral-small-latest' },
  { value: 'ollama',  label: 'Ollama',  description: 'llama3.2 (local)' },
];

const ROLE_LABELS = {
  DEVELOPER: 'IT Developer',
  ERP_TEAM: 'ERP Team',
  PRODUCT_TEAM: 'Product / Mobile Team',
  IT_MANAGER: 'IT Manager',
  ADMIN: 'Administrator',
};

const ROLE_COLORS = {
  DEVELOPER: { bg: '#EFF6FF', color: '#2563EB' },
  ERP_TEAM: { bg: '#F0FDF4', color: '#16A34A' },
  PRODUCT_TEAM: { bg: '#FFF7ED', color: '#D97706' },
  IT_MANAGER: { bg: '#F5F3FF', color: '#7C3AED' },
  ADMIN: { bg: '#FEF2F2', color: '#DC2626' },
};

const STATUS_COLORS = {
  // backend may return any of these variants
  ACTIVE:           { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', label: 'Active' },
  APPROVED:         { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', label: 'Active' },
  ENABLED:          { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', label: 'Active' },
  PENDING_APPROVAL: { bg: '#FFF7ED', color: '#D97706', border: '#FDE68A', label: 'Pending' },
  PENDING:          { bg: '#FFF7ED', color: '#D97706', border: '#FDE68A', label: 'Pending' },
  REJECTED:         { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: 'Rejected' },
  INACTIVE:         { bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB', label: 'Inactive' },
};

function resolveStatus(user) {
  const raw = user.status || user.accountStatus;
  if (raw) return raw;
  if (user.approved === true || user.enabled === true) return 'ACTIVE';
  if (user.approved === false) return 'REJECTED';
  return null;
}

const ALL_ROLES = ['DEVELOPER', 'ERP_TEAM', 'PRODUCT_TEAM', 'IT_MANAGER', 'ADMIN'];

function Avatar({ user, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: '#1A1A2E', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {user.photoPath ? (
        <img
          src={`http://localhost:8080/${user.photoPath}`}
          alt={user.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span style={{ color: '#CC2027', fontSize: size * 0.38, fontWeight: '700' }}>
          {user.name?.charAt(0)?.toUpperCase()}
        </span>
      )}
    </div>
  );
}

function RoleBadge({ role }) {
  const s = ROLE_COLORS[role] || ROLE_COLORS.DEVELOPER;
  return (
    <span style={{
      padding: '0.15rem 0.6rem', borderRadius: '9999px',
      fontSize: '0.7rem', fontWeight: '600',
      backgroundColor: s.bg, color: s.color,
    }}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}

function StatusBadge({ user }) {
  const status = resolveStatus(user);
  const s = STATUS_COLORS[status];
  if (!s) return null;
  return (
    <span style={{
      padding: '0.15rem 0.6rem', borderRadius: '9999px',
      fontSize: '0.7rem', fontWeight: '600',
      backgroundColor: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {s.label}
    </span>
  );
}

/* ─── View Details Modal ─── */
function UserDetailModal({ user, onClose }) {
  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '1rem',
        width: '100%', maxWidth: '480px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#1A1A2E', padding: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '1rem',
        }}>
          <Avatar user={user} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <p style={{ fontSize: '1rem', fontWeight: '700', color: 'white' }}>{user.name}</p>
              {user.emailVerified && (
                <span style={{
                  fontSize: '0.65rem', fontWeight: '600', color: '#3B82F6',
                  backgroundColor: '#1E3A5F', padding: '0.1rem 0.4rem', borderRadius: '4px',
                }}>
                  ✓ Verified
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>{user.email}</p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', flexShrink: 0,
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {[
            { label: 'Role',            value: <RoleBadge role={user.role} /> },
            { label: 'Account Status',  value: <StatusBadge user={user} /> },
            { label: 'Email',           value: user.email },
            { label: 'Email Verified',  value: user.emailVerified ? '✓ Yes' : '✗ No' },
            { label: 'Registered',      value: formatDate(user.createdAt) },
            { label: 'Password Strength', value: user.passwordStrength || '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingBottom: '0.75rem', borderBottom: '1px solid #F9FAFB',
            }}>
              <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: '500' }}>{label}</span>
              <span style={{ fontSize: '0.82rem', color: '#111827', fontWeight: '600' }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #F0F0F0', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '0.5rem 1.25rem', backgroundColor: '#F3F4F6',
            border: 'none', borderRadius: '0.5rem',
            fontSize: '0.82rem', fontWeight: '600', color: '#374151', cursor: 'pointer',
          }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit User Modal ─── */
function EditUserModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user.name || '');
  const [role, setRole] = useState(user.role || 'DEVELOPER');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Name cannot be empty.'); return; }
    setIsSaving(true);
    setError('');
    try {
      await onSave(user.id, { name: name.trim(), role });
    } catch {
      setError('Failed to save changes.');
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '1rem',
        width: '100%', maxWidth: '440px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #F0F0F0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Avatar user={user} size={36} />
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827' }}>Edit User</p>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

          {/* Name */}
          <div>
            <label style={{
              display: 'block', fontSize: '0.75rem', fontWeight: '600',
              color: '#374151', marginBottom: '0.4rem',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Full Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%', padding: '0.65rem 0.875rem',
                border: '1.5px solid #E5E7EB', borderRadius: '0.5rem',
                fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
                backgroundColor: '#FAFAFA', color: '#111827',
              }}
              onFocus={e => e.target.style.borderColor = '#CC2027'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {/* Role */}
          <div>
            <label style={{
              display: 'block', fontSize: '0.75rem', fontWeight: '600',
              color: '#374151', marginBottom: '0.5rem',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Role
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {ALL_ROLES.map(r => {
                const s = ROLE_COLORS[r];
                const selected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.6rem 0.875rem', borderRadius: '0.5rem', cursor: 'pointer',
                      border: `1.5px solid ${selected ? s.color : '#E5E7EB'}`,
                      backgroundColor: selected ? s.bg : 'white',
                      transition: 'all 0.12s',
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: selected ? '700' : '500', color: selected ? s.color : '#374151' }}>
                      {ROLE_LABELS[r]}
                    </span>
                    {selected && (
                      <CheckCircle size={15} color={s.color} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p style={{ fontSize: '0.8rem', color: '#DC2626' }}>{error}</p>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem', borderTop: '1px solid #F0F0F0',
          display: 'flex', justifyContent: 'flex-end', gap: '0.5rem',
        }}>
          <button onClick={onClose} style={{
            padding: '0.5rem 1.25rem', backgroundColor: 'white',
            border: '1.5px solid #E5E7EB', borderRadius: '0.5rem',
            fontSize: '0.82rem', fontWeight: '600', color: '#6B7280', cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1.25rem',
              backgroundColor: isSaving ? '#9CA3AF' : '#CC2027',
              color: 'white', border: 'none', borderRadius: '0.5rem',
              fontSize: '0.82rem', fontWeight: '600',
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            <Save size={14} />
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Admin Page ─── */
function Admin() {
  const [activeTab, setActiveTab] = useState('pending');

  // Pending users
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // All users
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);

  // Notification
  const [notification, setNotification] = useState(null);

  // AI provider
  const [aiProvider, setAiProvider] = useState('');
  const [aiProviderSaving, setAiProviderSaving] = useState(false);
  const [aiProviderError, setAiProviderError] = useState('');

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  /* ── Loaders ── */
  const loadPendingUsers = async () => {
    setPendingLoading(true);
    setPendingError('');
    try {
      const data = await adminService.getPendingUsers();
      setPendingUsers(data);
    } catch {
      setPendingError('Failed to load pending users.');
    } finally {
      setPendingLoading(false);
    }
  };

  const loadAllUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const data = await adminService.getAllUsers();
      setAllUsers(data);
    } catch {
      setUsersError('Failed to load users.');
    } finally {
      setUsersLoading(false);
    }
  };

  const loadAiProvider = async () => {
    try {
      const data = await adminService.getAiProvider();
      setAiProvider(data.provider || '');
    } catch {
      setAiProviderError('Could not load AI provider setting.');
    }
  };

  useEffect(() => {
    loadPendingUsers();
    loadAiProvider();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && allUsers.length === 0) loadAllUsers();
  }, [activeTab]);

  /* ── Pending actions ── */
  const handleApprove = async (userId, userName) => {
    setProcessingId(userId);
    try {
      await adminService.approveUser(userId);
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      showNotification(`${userName} has been approved.`, 'success');
    } catch {
      showNotification('Failed to approve user.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId, userName) => {
    if (!window.confirm(`Reject ${userName}'s registration request?`)) return;
    setProcessingId(userId);
    try {
      await adminService.rejectUser(userId);
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      showNotification(`${userName}'s request has been rejected.`, 'error');
    } catch {
      showNotification('Failed to reject user.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  /* ── All users actions ── */
  const handleSaveUser = async (userId, data) => {
    await adminService.updateUser(userId, data);
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    setEditUser(null);
    showNotification('User updated successfully.', 'success');
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Permanently delete ${user.name}? This cannot be undone.`)) return;
    try {
      await adminService.deleteUser(user.id);
      setAllUsers(prev => prev.filter(u => u.id !== user.id));
      showNotification(`${user.name} has been deleted.`, 'error');
    } catch {
      showNotification('Failed to delete user.', 'error');
    }
  };

  /* ── AI provider ── */
  const handleSaveAiProvider = async () => {
    if (!aiProvider) return;
    setAiProviderSaving(true);
    setAiProviderError('');
    try {
      await adminService.setAiProvider(aiProvider);
      showNotification(`AI provider switched to ${aiProvider}.`, 'success');
    } catch {
      setAiProviderError('Failed to update AI provider.');
    } finally {
      setAiProviderSaving(false);
    }
  };

  /* ── Filtered users ── */
  const filteredUsers = allUsers.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      ROLE_LABELS[u.role]?.toLowerCase().includes(q)
    );
  });

  const totalActive = allUsers.filter(u => u.status === 'ACTIVE').length;

  /* ─────────────────────────────── RENDER ─────────────────────────────── */
  return (
    <PageWrapper title="Admin Panel" subtitle="Manage users, roles and system settings">

      {/* Toast notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem',
          zIndex: 2000, maxWidth: '360px',
          padding: '1rem 1.25rem',
          backgroundColor: notification.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${notification.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
          borderRadius: '0.75rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        }}>
          {notification.type === 'success'
            ? <CheckCircle size={18} color="#16A34A" style={{ flexShrink: 0 }} />
            : <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
          }
          <p style={{ fontSize: '0.85rem', fontWeight: '500', color: notification.type === 'success' ? '#16A34A' : '#DC2626' }}>
            {notification.message}
          </p>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Pending Approval', value: pendingUsers.length, icon: <Clock size={20} color="#D97706" />, bg: '#FFF7ED', border: '#FDE68A' },
          { label: 'Total Users',      value: allUsers.length || '—', icon: <Users size={20} color="#2563EB" />, bg: '#EFF6FF', border: '#BFDBFE' },
          { label: 'Active Accounts',  value: totalActive || '—', icon: <CheckCircle size={20} color="#16A34A" />, bg: '#F0FDF4', border: '#BBF7D0' },
          {
            label: 'Action Required',
            value: pendingUsers.length > 0 ? 'Yes' : 'No',
            icon: <AlertCircle size={20} color={pendingUsers.length > 0 ? '#DC2626' : '#16A34A'} />,
            bg: pendingUsers.length > 0 ? '#FEF2F2' : '#F0FDF4',
            border: pendingUsers.length > 0 ? '#FECACA' : '#BBF7D0',
          },
        ].map(stat => (
          <div key={stat.label} style={{
            backgroundColor: 'white', borderRadius: '0.75rem',
            padding: '1.25rem', border: '1px solid #F0F0F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '0.5rem',
              backgroundColor: stat.bg, border: `1px solid ${stat.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{stat.value}</p>
              <p style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Provider selector */}
      <div style={{
        backgroundColor: 'white', borderRadius: '0.75rem',
        border: '1px solid #F0F0F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '0.4rem',
            backgroundColor: '#F0F4FF', border: '1px solid #C7D2FE',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Bot size={16} color="#4F6EF7" />
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827' }}>AI Scoring Provider</p>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Active provider used to score submitted tasks</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
          {AI_PROVIDERS.map(p => (
            <button key={p.value} onClick={() => setAiProvider(p.value)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              padding: '0.65rem 1rem', borderRadius: '0.5rem', cursor: 'pointer',
              border: `2px solid ${aiProvider === p.value ? '#4F6EF7' : '#E5E7EB'}`,
              backgroundColor: aiProvider === p.value ? '#F0F4FF' : 'white',
              minWidth: '110px', transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: aiProvider === p.value ? '#4F6EF7' : '#374151' }}>
                {p.label}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#9CA3AF', marginTop: '0.1rem' }}>{p.description}</span>
            </button>
          ))}
        </div>
        {aiProviderError && <p style={{ fontSize: '0.8rem', color: '#DC2626', marginBottom: '0.75rem' }}>{aiProviderError}</p>}
        <button onClick={handleSaveAiProvider} disabled={aiProviderSaving || !aiProvider} style={{
          padding: '0.5rem 1.25rem',
          backgroundColor: aiProviderSaving || !aiProvider ? '#9CA3AF' : '#4F6EF7',
          color: 'white', border: 'none', borderRadius: '0.5rem',
          fontSize: '0.82rem', fontWeight: '600',
          cursor: aiProviderSaving || !aiProvider ? 'not-allowed' : 'pointer',
        }}>
          {aiProviderSaving ? 'Saving…' : 'Save Provider'}
        </button>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: '0.25rem',
        backgroundColor: '#F9FAFB', borderRadius: '0.625rem',
        padding: '0.25rem', marginBottom: '1.25rem',
        width: 'fit-content',
      }}>
        {[
          { key: 'pending', label: 'Pending Requests', count: pendingUsers.length },
          { key: 'users',   label: 'All Users',        count: allUsers.length || null },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 1.1rem', borderRadius: '0.4rem', border: 'none',
            backgroundColor: activeTab === tab.key ? 'white' : 'transparent',
            color: activeTab === tab.key ? '#111827' : '#6B7280',
            fontWeight: activeTab === tab.key ? '700' : '500',
            fontSize: '0.82rem', cursor: 'pointer',
            boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s',
          }}>
            {tab.label}
            {tab.count != null && tab.count > 0 && (
              <span style={{
                fontSize: '0.68rem', fontWeight: '700',
                backgroundColor: activeTab === tab.key ? '#FEF2F2' : '#E5E7EB',
                color: activeTab === tab.key ? '#CC2027' : '#6B7280',
                padding: '0.1rem 0.45rem', borderRadius: '9999px',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── TAB: PENDING ─── */}
      {activeTab === 'pending' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#111827' }}>
              Pending Registration Requests
            </h3>
            <button onClick={loadPendingUsers} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 0.85rem', backgroundColor: 'white',
              border: '1.5px solid #E5E7EB', borderRadius: '0.5rem',
              fontSize: '0.78rem', color: '#6B7280', cursor: 'pointer',
            }}>
              <RefreshCw size={13} />
              Refresh
            </button>
          </div>

          {pendingError && (
            <div style={{ padding: '1rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '0.75rem', marginBottom: '1rem' }}>
              <p style={{ color: '#DC2626', fontSize: '0.875rem' }}>{pendingError}</p>
            </div>
          )}

          {pendingLoading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>
              <p>Loading pending users...</p>
            </div>
          )}

          {!pendingLoading && pendingUsers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #F0F0F0' }}>
              <CheckCircle size={32} color="#16A34A" style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>All caught up</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No pending registration requests at this time.</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingUsers.map(user => {
              const isProcessing = processingId === user.id;
              return (
                <div key={user.id} style={{
                  backgroundColor: 'white', borderRadius: '0.75rem',
                  border: '1px solid #F0F0F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex', alignItems: 'center', gap: '1.25rem',
                }}>
                  <Avatar user={user} size={48} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#111827' }}>{user.name}</p>
                      {user.emailVerified && <span style={{ color: '#3B82F6', fontSize: '0.75rem' }} title="Email verified">✓</span>}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.3rem' }}>{user.email}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <RoleBadge role={user.role} />
                      <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Registered {formatDate(user.createdAt)}</span>
                    </div>
                  </div>

                  <div style={{ padding: '0.25rem 0.75rem', backgroundColor: '#FFF7ED', border: '1px solid #FDE68A', borderRadius: '9999px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#D97706' }}>⏳ Pending</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button onClick={() => setViewUser(user)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.5rem 0.85rem', backgroundColor: 'white',
                      border: '1.5px solid #E5E7EB', borderRadius: '0.5rem',
                      fontSize: '0.8rem', color: '#6B7280', cursor: 'pointer',
                    }}>
                      <Eye size={14} />
                    </button>
                    <button onClick={() => handleApprove(user.id, user.name)} disabled={isProcessing} style={{
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: isProcessing ? '#9CA3AF' : '#16A34A',
                      color: 'white', border: 'none', borderRadius: '0.5rem',
                      fontSize: '0.8rem', fontWeight: '600', cursor: isProcessing ? 'not-allowed' : 'pointer',
                    }}>
                      <CheckCircle size={14} />
                      {isProcessing ? 'Processing...' : 'Approve'}
                    </button>
                    <button onClick={() => handleReject(user.id, user.name)} disabled={isProcessing} style={{
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.5rem 1rem', backgroundColor: 'white',
                      color: '#DC2626', border: '1.5px solid #FECACA',
                      borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: '600',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                    }}>
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ─── TAB: ALL USERS ─── */}
      {activeTab === 'users' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search by name, email or role…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1, minWidth: '220px', maxWidth: '360px',
                padding: '0.5rem 0.875rem', border: '1.5px solid #E5E7EB',
                borderRadius: '0.5rem', fontSize: '0.82rem',
                outline: 'none', backgroundColor: 'white',
              }}
              onFocus={e => e.target.style.borderColor = '#CC2027'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
            <button onClick={loadAllUsers} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 0.85rem', backgroundColor: 'white',
              border: '1.5px solid #E5E7EB', borderRadius: '0.5rem',
              fontSize: '0.78rem', color: '#6B7280', cursor: 'pointer',
            }}>
              <RefreshCw size={13} />
              Refresh
            </button>
          </div>

          {usersError && (
            <div style={{ padding: '1rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '0.75rem', marginBottom: '1rem' }}>
              <p style={{ color: '#DC2626', fontSize: '0.875rem' }}>{usersError}</p>
            </div>
          )}

          {usersLoading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>
              <p>Loading users...</p>
            </div>
          )}

          {!usersLoading && filteredUsers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #F0F0F0' }}>
              <Users size={32} color="#E5E7EB" style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>No users found</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Try a different search term.</p>
            </div>
          )}

          <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #F0F0F0', overflow: 'hidden' }}>
            {filteredUsers.map((user, i) => (
              <div key={user.id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.25rem',
                borderBottom: i < filteredUsers.length - 1 ? '1px solid #F9FAFB' : 'none',
              }}>
                <Avatar user={user} size={40} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>{user.name}</p>
                    {user.emailVerified && <span style={{ color: '#3B82F6', fontSize: '0.7rem' }} title="Email verified">✓</span>}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#6B7280' }}>{user.email}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <RoleBadge role={user.role} />
                  <StatusBadge user={user} />
                  <span style={{ fontSize: '0.72rem', color: '#9CA3AF', minWidth: '80px', textAlign: 'right' }}>
                    {formatDate(user.createdAt)}
                  </span>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button
                    onClick={() => setViewUser(user)}
                    title="View details"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '32px', height: '32px', borderRadius: '0.4rem',
                      border: '1.5px solid #E5E7EB', backgroundColor: 'white',
                      color: '#6B7280', cursor: 'pointer',
                    }}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => setEditUser(user)}
                    title="Edit user"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '32px', height: '32px', borderRadius: '0.4rem',
                      border: '1.5px solid #BFDBFE', backgroundColor: '#EFF6FF',
                      color: '#2563EB', cursor: 'pointer',
                    }}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    title="Delete user"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '32px', height: '32px', borderRadius: '0.4rem',
                      border: '1.5px solid #FECACA', backgroundColor: '#FEF2F2',
                      color: '#DC2626', cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      {viewUser && <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} />}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={handleSaveUser}
        />
      )}
    </PageWrapper>
  );
}

export default Admin;
