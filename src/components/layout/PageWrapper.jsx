import Sidebar from './Sidebar';
import { useLanguage } from '../../i18n/LanguageContext';

function PageWrapper({ children, title, subtitle }) {
  const { isRTL } = useLanguage();

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      backgroundColor: '#F8F9FB',
      direction: isRTL ? 'rtl' : 'ltr',
    }}>
      <Sidebar />
      <div style={{
        marginLeft: isRTL ? 0 : '240px',
        marginRight: isRTL ? '240px' : 0,
        flex: 1, display: 'flex', flexDirection: 'column',
      }}>
        {title && (
          <div style={{
            padding: '1.25rem 2rem',
            backgroundColor: 'white',
            borderBottom: '1px solid #F0F0F0',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: isRTL ? 'right' : 'left',
          }}>
            <div>
              <h1 style={{
                fontSize: '1.1rem', fontWeight: '700',
                color: '#111827',
                marginBottom: subtitle ? '0.15rem' : 0,
              }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}
        <div style={{ padding: '1.5rem 2rem', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default PageWrapper;