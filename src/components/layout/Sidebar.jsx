import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, ListOrdered,
  Brain, FileBarChart, Settings, LogOut, ShieldCheck, Scale,
  BriefcaseBusiness,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useLanguage } from '../../i18n/LanguageContext';

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, labelKey: 'nav_dashboard' },
  { path: '/tasks', icon: ClipboardList, labelKey: 'nav_tasks' },
  { path: '/backlog', icon: ListOrdered, labelKey: 'nav_backlog' },
  { path: '/scoring', icon: Brain, labelKey: 'nav_scoring' },
  { path: '/compare', icon: Scale, labelKey: 'nav_compare' },
  { path: '/workplace', icon: BriefcaseBusiness, labelKey: 'nav_workplace' },
  { path: '/reports', icon: FileBarChart, labelKey: 'nav_reports' },
  { path: '/settings', icon: Settings, labelKey: 'nav_settings' },
];

const ADMIN_ITEMS = [
  { path: '/admin', icon: ShieldCheck, labelKey: 'nav_admin' },
];

function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { language, setLanguage, t, isRTL } = useLanguage();

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{
      width: '240px', minHeight: '100vh',
      backgroundColor: '#1A1A2E',
      display: 'flex', flexDirection: 'column',
      position: 'fixed',
      left: isRTL ? 'auto' : 0,
      right: isRTL ? 0 : 'auto',
      top: 0, bottom: 0, zIndex: 100,
    }}>

      {/* Logo */}
      <div style={{
        padding: '1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          backgroundColor: 'white', borderRadius: '0.5rem',
          padding: '0.5rem 0.75rem', marginBottom: '0.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img
            src="/logo.gif"
            alt="Attijari Bank"
            style={{ height: '32px', objectFit: 'contain', width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '20px', height: '20px', backgroundColor: '#CC2027',
            borderRadius: '4px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ color: 'white', fontSize: '10px', fontWeight: '700' }}>P</span>
          </div>
          <span style={{ color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
            Prior<span style={{ color: '#CC2027' }}>IT</span>
          </span>
          <span style={{
            fontSize: '0.62rem', color: '#4B5563', marginLeft: 'auto',
            backgroundColor: 'rgba(255,255,255,0.05)',
            padding: '0.1rem 0.4rem', borderRadius: '4px',
          }}>
            v1.0
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            color: '#4B5563', fontSize: '0.68rem', fontWeight: '600',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '0 0.5rem', marginBottom: '0.5rem',
          }}>
            {t('nav_main')}
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.6rem 0.75rem', borderRadius: '0.5rem',
                marginBottom: '0.15rem', textDecoration: 'none',
                backgroundColor: active ? 'rgba(204, 32, 39, 0.15)' : 'transparent',
                borderLeft: !isRTL && active ? '3px solid #CC2027' : !isRTL ? '3px solid transparent' : 'none',
                borderRight: isRTL && active ? '3px solid #CC2027' : isRTL ? '3px solid transparent' : 'none',
                transition: 'all 0.15s',
              }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon size={17} color={active ? '#F87171' : '#6B7280'} />
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: active ? '600' : '400',
                  color: active ? '#F9FAFB' : '#9CA3AF',
                }}>
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>

        {user?.role === 'ADMIN' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{
              color: '#4B5563', fontSize: '0.68rem', fontWeight: '600',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '0 0.5rem', marginBottom: '0.5rem',
            }}>
              {t('nav_administration')}
            </p>
            {ADMIN_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link key={item.path} to={item.path} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.6rem 0.75rem', borderRadius: '0.5rem',
                  marginBottom: '0.15rem', textDecoration: 'none',
                  backgroundColor: active ? 'rgba(204, 32, 39, 0.15)' : 'transparent',
                  borderLeft: !isRTL && active ? '3px solid #CC2027' : !isRTL ? '3px solid transparent' : 'none',
                  borderRight: isRTL && active ? '3px solid #CC2027' : isRTL ? '3px solid transparent' : 'none',
                }}>
                  <Icon size={17} color={active ? '#F87171' : '#6B7280'} />
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: active ? '600' : '400',
                    color: active ? '#F9FAFB' : '#9CA3AF',
                  }}>
                    {t(item.labelKey)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Bottom section */}
      <div style={{
        padding: '0.75rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>

        {/* Language switcher */}
        <div style={{
          display: 'flex', gap: '0.35rem',
          padding: '0.5rem', marginBottom: '0.5rem',
        }}>
          {[
            { code: 'en', label: 'EN', flag: '🇬🇧' },
            { code: 'fr', label: 'FR', flag: '🇫🇷' },
            { code: 'ar', label: 'ع', flag: '🇹🇳' },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              title={lang.flag}
              style={{
                flex: 1, padding: '0.35rem',
                borderRadius: '0.35rem', border: 'none',
                backgroundColor: language === lang.code
                  ? '#CC2027' : 'rgba(255,255,255,0.05)',
                color: language === lang.code ? 'white' : '#6B7280',
                fontSize: '0.72rem', fontWeight: '700',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {lang.flag} {lang.label}
            </button>
          ))}
        </div>

        {/* User info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.6rem 0.5rem', marginBottom: '0.25rem',
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            backgroundColor: '#CC2027',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
          }}>
            {user?.photoPath ? (
              <img
                src={`http://localhost:8080/${user.photoPath}`}
                alt={user.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: '700' }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <p style={{
                color: '#F9FAFB', fontSize: '0.8rem', fontWeight: '600',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user?.name}
              </p>
              {user?.emailVerified && (
                <span style={{ color: '#3B82F6', fontSize: '0.7rem' }}>✓</span>
              )}
            </div>
            <p style={{
              color: '#6B7280', fontSize: '0.7rem',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.role?.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button onClick={logout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.6rem 0.75rem', borderRadius: '0.5rem',
          border: 'none', backgroundColor: 'transparent',
          cursor: 'pointer', color: '#6B7280', fontSize: '0.875rem',
          transition: 'all 0.15s',
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
            e.currentTarget.style.color = '#F87171';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#6B7280';
          }}
        >
          <LogOut size={16} />
          <span>{t('nav_signout')}</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;