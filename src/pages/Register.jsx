import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Upload } from 'lucide-react';
import authService from '../services/authService';

const getPasswordStrength = (password) => {
  if (!password) return { label: '', color: '', score: 0 };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(password)) score++;
  if (score <= 2) return { label: 'Weak', color: '#DC2626', score };
  if (score <= 3) return { label: 'Medium', color: '#D97706', score };
  return { label: 'Strong', color: '#16A34A', score };
};

const ROLES = [
  { value: 'DEVELOPER', label: 'IT Developer' },
  { value: 'ERP_TEAM', label: 'ERP Team' },
  { value: 'PRODUCT_TEAM', label: 'Product / Mobile Team' },
  { value: 'IT_MANAGER', label: 'IT Manager' },
];

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1.5px solid #E5E7EB',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: '#FAFAFA',
  color: '#111827',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '0.5rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: '',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be less than 5MB'); return; }
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (!formData.role) { setError('Please select your role'); return; }

    setIsLoading(true);
    try {
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }, photo);
      setSuccess('Registration successful! Please wait for admin approval. You will receive an email when your account is approved.');
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

      {/* Left panel */}
      <div style={{
        width: '38%',
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
          position: 'absolute', top: '-60px', right: '-60px',
          width: '220px', height: '220px', borderRadius: '50%',
          backgroundColor: 'rgba(204, 32, 39, 0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', left: '-40px',
          width: '160px', height: '160px', borderRadius: '50%',
          backgroundColor: 'rgba(204, 32, 39, 0.05)',
        }} />

        <div style={{ maxWidth: '22rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.5rem', padding: '0.4rem 0.75rem', marginBottom: '1.75rem',
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
            fontSize: '3rem', fontWeight: '700', color: 'white',
            marginBottom: '0.5rem', letterSpacing: '-0.02em',
          }}>
            Prior<span style={{ color: '#CC2027' }}>IT</span>
          </h1>

          <div style={{
            width: '40px', height: '3px', backgroundColor: '#CC2027',
            margin: '0 auto 1.5rem', borderRadius: '2px',
          }} />

          <h2 style={{ fontSize: '1.15rem', fontWeight: '600', color: 'white', marginBottom: '0.75rem' }}>
            Request access
          </h2>

          <p style={{ color: '#6B7280', lineHeight: '1.7', fontSize: '0.875rem', marginBottom: '2.5rem' }}>
            Fill in the form to request an account. Your request will be reviewed by an IT administrator before you can log in.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
            {[
              'AI-powered task scoring',
              'Kano + MoSCoW + RICE methodology',
              'Role-based access control',
              'Full audit trail',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  backgroundColor: 'rgba(204, 32, 39, 0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ color: '#F87171', fontSize: '10px' }}>✓</span>
                </div>
                <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Divider + note */}
          <div style={{
            marginTop: '2.5rem', paddingTop: '2rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}>
            <p style={{ color: '#6B7280', fontSize: '0.78rem', lineHeight: '1.6' }}>
              After submitting, you'll receive a confirmation email. An admin will review your request within 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: '62%',
        backgroundColor: '#F8F9FB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        overflowY: 'auto',
        minHeight: '100vh',
      }}>
        <div style={{ width: '100%', maxWidth: '34rem', padding: '0.5rem 0' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
            border: '1px solid #F0F0F0',
          }}>
            <div style={{ marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#111827', marginBottom: '0.3rem' }}>
                Create your account
              </h2>
              <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>All fields marked * are required</p>
            </div>

            {success && (
              <div style={{
                marginBottom: '1.25rem', padding: '0.875rem',
                backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '0.5rem',
              }}>
                <p style={{ color: '#16A34A', fontSize: '0.85rem' }}>{success}</p>
              </div>
            )}

            {error && (
              <div style={{
                marginBottom: '1.25rem', padding: '0.75rem 0.875rem',
                backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '0.5rem',
              }}>
                <span style={{ color: '#DC2626', fontSize: '0.85rem' }}>⚠ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Photo upload */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1.25rem',
                padding: '1rem', backgroundColor: '#FAFAFA',
                borderRadius: '0.75rem', border: '1.5px dashed #E5E7EB',
              }}>
                <div
                  onClick={() => document.getElementById('photo').click()}
                  style={{
                    width: '68px', height: '68px', borderRadius: '50%',
                    backgroundColor: '#F3F4F6', border: '2px solid #E5E7EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', flexShrink: 0, cursor: 'pointer',
                  }}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '1.5rem', color: '#9CA3AF' }}>👤</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                    Profile photo
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>
                    Optional · JPG, PNG · Max 5MB
                  </p>
                  <button
                    type="button"
                    onClick={() => document.getElementById('photo').click()}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.4rem 0.85rem',
                      backgroundColor: 'white',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: '0.4rem',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      color: '#374151',
                      fontWeight: '500',
                    }}
                  >
                    <Upload size={12} />
                    {photo ? 'Change photo' : 'Upload photo'}
                  </button>
                  <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                </div>
              </div>

              {/* Name + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Full name *</label>
                  <input
                    type="text" name="name" value={formData.name}
                    onChange={handleChange} placeholder="Your name" required
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#CC2027'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input
                    type="email" name="email" value={formData.email}
                    onChange={handleChange} placeholder="you@attijari.com" required
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#CC2027'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label style={labelStyle}>Role *</label>
                <select
                  name="role" value={formData.role} onChange={handleChange} required
                  style={{ ...inputStyle, color: formData.role ? '#111827' : '#9CA3AF' }}
                  onFocus={(e) => e.target.style.borderColor = '#CC2027'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                >
                  <option value="">Select your role</option>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" value={formData.password}
                    onChange={handleChange} placeholder="Minimum 8 characters" required
                    style={{ ...inputStyle, paddingRight: '2.75rem' }}
                    onFocus={(e) => e.target.style.borderColor = '#CC2027'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '0.875rem', top: '50%',
                      transform: 'translateY(-50%)', background: 'none', border: 'none',
                      cursor: 'pointer', color: '#9CA3AF',
                      display: 'flex', alignItems: 'center', padding: '0',
                    }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Strength indicator */}
                {formData.password && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '3px', marginBottom: '0.3rem' }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} style={{
                          flex: 1, height: '3px', borderRadius: '2px',
                          backgroundColor: i <= passwordStrength.score ? passwordStrength.color : '#E5E7EB',
                          transition: 'background-color 0.2s',
                        }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: passwordStrength.color, fontWeight: '600' }}>
                        {passwordStrength.label}
                      </span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {[
                          { test: /[A-Z]/.test(formData.password), label: 'A-Z' },
                          { test: /[0-9]/.test(formData.password), label: '0-9' },
                          { test: /[!@#$%^&*]/.test(formData.password), label: '#!' },
                        ].map((h) => (
                          <span key={h.label} style={{
                            fontSize: '0.68rem', padding: '0.1rem 0.35rem', borderRadius: '3px',
                            backgroundColor: h.test ? '#F0FDF4' : '#F9FAFB',
                            color: h.test ? '#16A34A' : '#9CA3AF',
                            border: `1px solid ${h.test ? '#BBF7D0' : '#E5E7EB'}`,
                          }}>
                            {h.test ? '✓' : '○'} {h.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label style={labelStyle}>Confirm password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword" value={formData.confirmPassword}
                    onChange={handleChange} placeholder="Repeat your password" required
                    style={{
                      ...inputStyle, paddingRight: '2.75rem',
                      borderColor: formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? '#FCA5A5' : '#E5E7EB',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#CC2027'}
                    onBlur={(e) => e.target.style.borderColor =
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? '#FCA5A5' : '#E5E7EB'
                    }
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute', right: '0.875rem', top: '50%',
                      transform: 'translateY(-50%)', background: 'none', border: 'none',
                      cursor: 'pointer', color: '#9CA3AF',
                      display: 'flex', alignItems: 'center', padding: '0',
                    }}>
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: '0.3rem' }}>
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={isLoading || !!success}
                style={{
                  width: '100%', padding: '0.8rem',
                  backgroundColor: isLoading || success ? '#9CA3AF' : '#CC2027',
                  color: 'white', fontWeight: '600', borderRadius: '0.5rem',
                  border: 'none', cursor: isLoading || success ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem', letterSpacing: '0.02em', marginTop: '0.25rem',
                }}
              >
                {isLoading ? 'Submitting...' : 'Request access'}
              </button>
            </form>

            <div style={{
              marginTop: '1.5rem', paddingTop: '1.5rem',
              borderTop: '1px solid #F3F4F6', textAlign: 'center',
            }}>
              <p style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#CC2027', fontWeight: '600', textDecoration: 'none' }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;