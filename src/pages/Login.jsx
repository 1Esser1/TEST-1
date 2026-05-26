import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/authStore';

function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    clearError();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {}
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

      {/* Left panel */}
      <div style={{
        width: '58%',
        backgroundColor: '#1A1A2E',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
      }}>
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          backgroundColor: 'rgba(204, 32, 39, 0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '200px', height: '200px', borderRadius: '50%',
          backgroundColor: 'rgba(204, 32, 39, 0.05)',
        }} />

        <div style={{ maxWidth: '28rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.5rem', padding: '0.4rem 0.75rem', marginBottom: '2rem',
          }}>
            <div style={{
              width: '20px', height: '20px', backgroundColor: '#CC2027',
              borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'white', fontSize: '11px', fontWeight: '700' }}>A</span>
            </div>
            <span style={{ color: '#9CA3AF', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
              ATTIJARI BANK TUNISIA
            </span>
          </div>

          <h1 style={{
            fontSize: '3.5rem', fontWeight: '700', color: 'white',
            marginBottom: '0.5rem', letterSpacing: '-0.02em',
          }}>
            Prior<span style={{ color: '#CC2027' }}>IT</span>
          </h1>

          <div style={{
            width: '48px', height: '3px', backgroundColor: '#CC2027',
            margin: '0 auto 1.75rem', borderRadius: '2px',
          }} />

          <h2 style={{
            fontSize: '1.5rem', fontWeight: '600', color: 'white',
            marginBottom: '1rem', lineHeight: '1.4',
          }}>
            Prioritize smarter.<br />Deliver faster.
          </h2>

          <p style={{ color: '#6B7280', marginBottom: '3rem', lineHeight: '1.7', fontSize: '0.95rem' }}>
            AI-powered IT task prioritization using Kano model, MoSCoW method, and RICE scoring — built for Attijari Bank.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.6rem' }}>
            {['Kano Model', 'MoSCoW', 'RICE Scoring', 'AI Powered'].map((pill) => (
              <span key={pill} style={{
                padding: '0.4rem 1rem',
                backgroundColor: 'rgba(204, 32, 39, 0.12)',
                color: '#F87171',
                fontSize: '0.8rem',
                borderRadius: '9999px',
                border: '1px solid rgba(204, 32, 39, 0.25)',
                fontWeight: '500',
              }}>
                {pill}
              </span>
            ))}
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '2.5rem',
            marginTop: '3rem', paddingTop: '2rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}>
            {[
              { value: '3', label: 'Methods Combined' },
              { value: 'AI', label: 'Powered Scoring' },
              { value: '6', label: 'Task Types' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#CC2027' }}>{stat.value}</div>
                <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '0.2rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: '42%',
        backgroundColor: '#F8F9FB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: '26rem' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
            border: '1px solid #F0F0F0',
          }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#111827', marginBottom: '0.3rem' }}>
                Welcome back
              </h2>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Sign in to your PriorIT account</p>
            </div>

            {error && (
              <div style={{
                marginBottom: '1.25rem', padding: '0.75rem 0.875rem',
                backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '0.5rem',
              }}>
                <span style={{ color: '#DC2626', fontSize: '0.85rem' }}>⚠ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Email */}
              <div>
                <label style={{
                  display: 'block', fontSize: '0.78rem', fontWeight: '600',
                  color: '#374151', marginBottom: '0.5rem',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  Email address
                </label>
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="you@attijari.com" required
                  style={{
                    width: '100%', padding: '0.75rem 1rem',
                    border: '1.5px solid #E5E7EB', borderRadius: '0.5rem',
                    fontSize: '0.875rem', outline: 'none',
                    boxSizing: 'border-box', backgroundColor: '#FAFAFA', color: '#111827',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#CC2027'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{
                  display: 'block', fontSize: '0.78rem', fontWeight: '600',
                  color: '#374151', marginBottom: '0.5rem',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" value={formData.password}
                    onChange={handleChange} placeholder="••••••••" required
                    style={{
                      width: '100%', padding: '0.75rem 2.75rem 0.75rem 1rem',
                      border: '1.5px solid #E5E7EB', borderRadius: '0.5rem',
                      fontSize: '0.875rem', outline: 'none',
                      boxSizing: 'border-box', backgroundColor: '#FAFAFA', color: '#111827',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#CC2027'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                  <button
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '0.875rem', top: '50%',
                      transform: 'translateY(-50%)', background: 'none', border: 'none',
                      cursor: 'pointer', color: '#9CA3AF',
                      display: 'flex', alignItems: 'center', padding: '0',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={isLoading}
                style={{
                  width: '100%', padding: '0.8rem',
                  backgroundColor: isLoading ? '#9CA3AF' : '#CC2027',
                  color: 'white', fontWeight: '600', borderRadius: '0.5rem',
                  border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem', letterSpacing: '0.02em', marginTop: '0.25rem',
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div style={{
              marginTop: '1.5rem', paddingTop: '1.5rem',
              borderTop: '1px solid #F3F4F6', textAlign: 'center',
            }}>
              <p style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
                No account?{' '}
                <Link to="/register" style={{ color: '#CC2027', fontWeight: '600', textDecoration: 'none' }}>
                  Request access
                </Link>
              </p>
            </div>
          </div>

          <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: '#9CA3AF' }}>
            Access level is determined by your IT profile.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;