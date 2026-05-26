import { useState } from 'react';
import { FileSpreadsheet, FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../services/api';

function Export() {
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExcelExport = async () => {
    setLoadingExcel(true);
    try {
      const response = await api.get('/api/export/excel', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download',
        `priorit-backlog-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showNotification('Excel file downloaded successfully.', 'success');
    } catch (err) {
      showNotification('Failed to export Excel. Please try again.', 'error');
    } finally {
      setLoadingExcel(false);
    }
  };

  const handlePdfExport = async () => {
    setLoadingPdf(true);
    try {
      const response = await api.get('/api/export/pdf', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download',
        `priorit-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showNotification('PDF report downloaded successfully.', 'success');
    } catch (err) {
      showNotification('Failed to export PDF. Please try again.', 'error');
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <PageWrapper
      title="Export Reports"
      subtitle="Generate PDF or Excel reports of your task backlog and scoring data"
    >
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem',
          zIndex: 1000, maxWidth: '360px',
          padding: '1rem 1.25rem',
          backgroundColor: notification.type === 'success'
            ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${notification.type === 'success'
            ? '#BBF7D0' : '#FECACA'}`,
          borderRadius: '0.75rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        }}>
          {notification.type === 'success'
            ? <CheckCircle size={18} color="#16A34A" style={{ flexShrink: 0 }} />
            : <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
          }
          <p style={{
            fontSize: '0.85rem', fontWeight: '500',
            color: notification.type === 'success' ? '#16A34A' : '#DC2626',
          }}>
            {notification.message}
          </p>
        </div>
      )}

      {/* Info banner */}
      <div style={{
        backgroundColor: '#1A1A2E',
        borderRadius: '0.75rem',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          backgroundColor: 'rgba(204, 32, 39, 0.2)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontSize: '1rem' }}>📊</span>
        </div>
        <div>
          <p style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
            Export includes all scored tasks
          </p>
          <p style={{ color: '#6B7280', fontSize: '0.78rem', lineHeight: '1.6' }}>
            Reports are generated in real time from the current database state.
            They include task details, Kano categories, MoSCoW labels,
            and full RICE scoring data. Tasks are sorted by final score descending.
          </p>
        </div>
      </div>

      {/* Export cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>

        {/* Excel card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          border: '1px solid #F0F0F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          {/* Card header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #F9FAFB',
            display: 'flex', alignItems: 'flex-start', gap: '1rem',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '0.625rem',
              backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <FileSpreadsheet size={22} color="#16A34A" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>
                Excel Export
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                Raw data — .xlsx format
              </p>
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding: '1.25rem 1.5rem' }}>
            <p style={{ fontSize: '0.825rem', color: '#6B7280', lineHeight: '1.7', marginBottom: '1.25rem' }}>
              Full backlog with all task data and scoring variables.
              Suitable for further analysis in Excel or Power BI.
            </p>

            {/* What's included */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{
                fontSize: '0.72rem', fontWeight: '600', color: '#374151',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                marginBottom: '0.5rem',
              }}>
                Included columns
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {[
                  'ID', 'Title', 'Type', 'Status',
                  'Kano', 'MoSCoW', 'Reach', 'Impact',
                  'Confidence', 'Effort', 'RICE Score',
                  'Final Score', 'Submitted By', 'Date',
                ].map((col) => (
                  <span key={col} style={{
                    padding: '0.15rem 0.5rem',
                    backgroundColor: '#F3F4F6',
                    color: '#6B7280',
                    fontSize: '0.7rem',
                    borderRadius: '4px',
                    border: '1px solid #E5E7EB',
                  }}>
                    {col}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handleExcelExport}
              disabled={loadingExcel}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '0.5rem',
                padding: '0.75rem',
                backgroundColor: loadingExcel ? '#9CA3AF' : '#16A34A',
                color: 'white', border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem', fontWeight: '600',
                cursor: loadingExcel ? 'not-allowed' : 'pointer',
              }}
            >
              <Download size={16} />
              {loadingExcel ? 'Generating...' : 'Export Excel (.xlsx)'}
            </button>
          </div>
        </div>

        {/* PDF card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          border: '1px solid #F0F0F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          {/* Card header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #F9FAFB',
            display: 'flex', alignItems: 'flex-start', gap: '1rem',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '0.625rem',
              backgroundColor: '#FEF2F2', border: '1px solid #FECACA',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <FileText size={22} color="#DC2626" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>
                PDF Report
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                Presentation ready — .pdf format
              </p>
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding: '1.25rem 1.5rem' }}>
            <p style={{ fontSize: '0.825rem', color: '#6B7280', lineHeight: '1.7', marginBottom: '1.25rem' }}>
              Full backlog ranked by RICE score with Kano and MoSCoW labels.
              Suitable for management presentations and project reports.
            </p>

            {/* What's included */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{
                fontSize: '0.72rem', fontWeight: '600', color: '#374151',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                marginBottom: '0.5rem',
              }}>
                Report contents
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {[
                  'Ranked task list sorted by final score',
                  'Kano category and MoSCoW label per task',
                  'Full RICE scoring breakdown',
                  'Generation timestamp and bank branding',
                ].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '50%',
                      backgroundColor: '#FEF2F2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ color: '#DC2626', fontSize: '9px' }}>✓</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handlePdfExport}
              disabled={loadingPdf}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '0.5rem',
                padding: '0.75rem',
                backgroundColor: loadingPdf ? '#9CA3AF' : '#CC2027',
                color: 'white', border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem', fontWeight: '600',
                cursor: loadingPdf ? 'not-allowed' : 'pointer',
              }}
            >
              <Download size={16} />
              {loadingPdf ? 'Generating...' : 'Export PDF Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Note */}
      <div style={{
        padding: '1rem 1.25rem',
        backgroundColor: '#F8F9FB',
        borderRadius: '0.75rem',
        border: '1px solid #F0F0F0',
      }}>
        <p style={{ fontSize: '0.78rem', color: '#9CA3AF', textAlign: 'center' }}>
          Exports are generated in real time — no files are stored on the server.
          Each download reflects the current state of the database.
        </p>
      </div>
    </PageWrapper>
  );
}

export default Export;