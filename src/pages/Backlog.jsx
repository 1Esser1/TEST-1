import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, AlertCircle, RefreshCw, Edit3, Activity, Trash2, BriefcaseBusiness, Scale, Loader2, CheckSquare, Square } from 'lucide-react';
import DoraModal from '../components/dashboard/DoraModal';
import PageWrapper from '../components/layout/PageWrapper';
import taskService from '../services/taskService';
import workplaceService from '../services/workplaceService';
import OverrideModal from '../components/scoring/OverrideModal';
import { useLanguage, useTranslatedTask } from '../i18n/LanguageContext';
import useAuthStore from '../store/authStore';

const KANO_COLORS = {
  BASIC: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: 'Basic' },
  PERFORMANCE: { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE', label: 'Performance' },
  DELIGHTER: { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', label: 'Delighter' },
  INDIFFERENT: { bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB', label: 'Indifferent' },
  REVERSE: { bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA', label: 'Reverse' },
};

const MOSCOW_COLORS = {
  MUST: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  SHOULD: { bg: '#FFF7ED', color: '#D97706', border: '#FDE68A' },
  COULD: { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  WONT: { bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB' },
};

const KANO_MULTIPLIERS = {
  BASIC: 1.3, PERFORMANCE: 1.0,
  DELIGHTER: 0.8, INDIFFERENT: 1.0, REVERSE: 1.0,
};

const MOSCOW_MULTIPLIERS = {
  MUST: 1.5, SHOULD: 1.2, COULD: 1.0, WONT: 0.5,
};

const STATUS_COLORS = {
  AI_SCORED: { bg: '#F0FDF4', color: '#16A34A' },
  PENDING_SCORING: { bg: '#FFF7ED', color: '#D97706' },
  APPROVED: { bg: '#EFF6FF', color: '#2563EB' },
  REJECTED: { bg: '#FEF2F2', color: '#DC2626' },
  OVERRIDE_REQUESTED: { bg: '#F5F3FF', color: '#7C3AED' },
};

function ScoreBar({ value, max = 100 }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct >= 70 ? '#16A34A' : pct >= 40 ? '#D97706' : '#DC2626';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        flex: 1, height: '6px', backgroundColor: '#F3F4F6',
        borderRadius: '9999px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          backgroundColor: color, borderRadius: '9999px',
          transition: 'width 0.3s ease',
        }} />
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: '700', color, minWidth: '2.5rem' }}>
        {value?.toFixed(1)}
      </span>
    </div>
  );
}

function Badge({ label, style }) {
  return (
    <span style={{
      padding: '0.2rem 0.6rem', borderRadius: '9999px',
      fontSize: '0.7rem', fontWeight: '600',
      border: `1px solid ${style.border}`,
      backgroundColor: style.bg, color: style.color,
    }}>
      {label}
    </span>
  );
}

// Each card auto-translates all AI-generated text when expanded
function BacklogTaskCard({ task, index, isExpanded, onToggle, onOverride, onDora, isAdmin, onDelete, isSelectedForCompare, onToggleCompare, compareCount }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const tx = useTranslatedTask(task, isExpanded);
  const [generatingWp, setGeneratingWp] = useState(false);

  const handleWorkspace = async (e) => {
    e.stopPropagation();
    setGeneratingWp(true);
    try {
      const wp = await workplaceService.generate(task.id);
      navigate(`/workplace/${wp.id}`);
    } catch {
      setGeneratingWp(false);
    }
  };

  const kano = KANO_COLORS[task.kanoCategory] || KANO_COLORS.INDIFFERENT;
  const moscow = MOSCOW_COLORS[task.moscowLabel] || MOSCOW_COLORS.COULD;
  const status = STATUS_COLORS[task.status] || STATUS_COLORS.PENDING_SCORING;
  const multiplier = task.multiplierApplied ??
    (KANO_MULTIPLIERS[task.kanoCategory] || 1.0) * (MOSCOW_MULTIPLIERS[task.moscowLabel] || 1.0);

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '0.75rem',
      border: '1px solid #F0F0F0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      borderLeft: `4px solid ${moscow.color}`,
    }}>
      <div
        onClick={onToggle}
        style={{
          padding: '1rem 1.25rem', display: 'flex',
          alignItems: 'center', gap: '1rem', cursor: 'pointer',
        }}
      >
        {/* Rank */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          backgroundColor: index < 3 ? '#1A1A2E' : '#F3F4F6',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{
            fontSize: '0.78rem', fontWeight: '700',
            color: index < 3 ? '#CC2027' : '#6B7280',
          }}>
            #{index + 1}
          </span>
        </div>

        {/* Title + badges */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
            <p style={{
              fontSize: '0.875rem', fontWeight: '600', color: '#111827',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {task.title}
            </p>
            <span style={{
              fontSize: '0.68rem', fontWeight: '500',
              backgroundColor: status.bg, color: status.color,
              padding: '0.1rem 0.5rem', borderRadius: '9999px',
            }}>
              {task.status?.replace(/_/g, ' ')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.72rem',
              color: task.taskTypeColor || '#6B7280',
              backgroundColor: task.taskTypeColor ? `${task.taskTypeColor}15` : '#F3F4F6',
              padding: '0.1rem 0.5rem', borderRadius: '4px',
              border: `1px solid ${task.taskTypeColor ? `${task.taskTypeColor}30` : '#E5E7EB'}`,
              fontWeight: '500',
            }}>
              {task.taskType}
            </span>
            <span style={{ color: '#E5E7EB' }}>·</span>
            <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{task.submittedBy}</span>
            {task.kanoCategory && <Badge label={kano.label} style={kano} />}
            {task.moscowLabel && <Badge label={task.moscowLabel} style={moscow} />}
          </div>
        </div>

        {/* Score */}
        {task.finalScore != null && (
          <div style={{ minWidth: '120px' }}>
            <p style={{ fontSize: '0.68rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>
              {t('rice_score')}
            </p>
            <ScoreBar value={task.finalScore} max={150} />
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          {task.finalScore != null && (
            <button
              onClick={handleWorkspace}
              disabled={generatingWp}
              title="Generate Workspace"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.4rem 0.75rem', backgroundColor: '#ECFDF5',
                border: '1.5px solid #BBF7D0', borderRadius: '0.5rem',
                fontSize: '0.75rem', fontWeight: '500',
                color: generatingWp ? '#9CA3AF' : '#16A34A',
                cursor: generatingWp ? 'not-allowed' : 'pointer',
                opacity: generatingWp ? 0.7 : 1,
              }}
            >
              {generatingWp ? <Loader2 size={12} /> : <BriefcaseBusiness size={12} />}
              {generatingWp ? '…' : t('btn_workspace')}
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleCompare(task.id); }}
            title={isSelectedForCompare ? t('btn_remove_from_compare') : t('btn_add_to_compare')}
            disabled={compareCount >= 6 && !isSelectedForCompare}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.4rem 0.75rem',
              backgroundColor: isSelectedForCompare ? '#F5F3FF' : 'white',
              border: `1.5px solid ${isSelectedForCompare ? '#C4B5FD' : '#E5E7EB'}`,
              borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: '500',
              color: isSelectedForCompare ? '#7C3AED' : '#6B7280',
              cursor: compareCount >= 6 && !isSelectedForCompare ? 'not-allowed' : 'pointer',
              opacity: compareCount >= 6 && !isSelectedForCompare ? 0.45 : 1,
            }}
          >
            {isSelectedForCompare ? <CheckSquare size={12} /> : <Square size={12} />}
            {isSelectedForCompare ? t('btn_compare_selected') : t('btn_compare')}
          </button>
          {task.finalScore != null && (
            <button
              onClick={(e) => { e.stopPropagation(); onDora(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.4rem 0.75rem', backgroundColor: '#1A1A2E',
                border: 'none', borderRadius: '0.5rem',
                fontSize: '0.75rem', fontWeight: '500',
                color: '#9CA3AF', cursor: 'pointer',
              }}
            >
              <Activity size={12} />
              DORA
            </button>
          )}
          {task.finalScore != null && (
            <button
              onClick={(e) => { e.stopPropagation(); onOverride(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.4rem 0.75rem', backgroundColor: 'white',
                border: '1.5px solid #E5E7EB', borderRadius: '0.5rem',
                fontSize: '0.75rem', fontWeight: '500',
                color: '#6B7280', cursor: 'pointer',
              }}
            >
              <Edit3 size={12} />
              {t('override')}
            </button>
          )}
          {isAdmin && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.4rem 0.75rem', backgroundColor: 'white',
                border: '1.5px solid #FECACA', borderRadius: '0.5rem',
                fontSize: '0.75rem', fontWeight: '500',
                color: '#DC2626', cursor: 'pointer',
              }}
            >
              <Trash2 size={12} />
              {t('btn_delete')}
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', color: '#9CA3AF', fontSize: '0.75rem' }}>
            {isExpanded ? '▲' : '▼'}
          </div>
        </div>
      </div>

      {/* Expanded detail — uses tx (translated task) for all AI-generated text */}
      {isExpanded && (
        <div style={{ padding: '1.25rem', borderTop: '1px solid #F9FAFB', backgroundColor: '#FAFAFA' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <p style={{
                fontSize: '0.78rem', fontWeight: '600', color: '#374151',
                marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {t('task_description')}
              </p>
              <p style={{ fontSize: '0.825rem', color: '#6B7280', lineHeight: '1.6', marginBottom: '1rem' }}>
                {tx.description}
              </p>

              {task.industryContext && (
                <>
                  <p style={{
                    fontSize: '0.78rem', fontWeight: '600', color: '#374151',
                    marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {t('ai_industry_context')}
                  </p>
                  <div style={{ padding: '0.75rem', backgroundColor: '#1A1A2E', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '0.78rem', color: '#9CA3AF', lineHeight: '1.6' }}>
                      {tx.industryContext}
                    </p>
                    <p style={{ fontSize: '0.68rem', color: '#4B5563', marginTop: '0.5rem' }}>
                      🤖 {task.modelUsed}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div>
              <p style={{
                fontSize: '0.78rem', fontWeight: '600', color: '#374151',
                marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {t('rice_breakdown')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                {[
                  { label: t('reach'), value: task.reach, max: 10 },
                  { label: t('impact'), value: task.impact, max: 10 },
                  { label: t('confidence'), value: task.confidence ? task.confidence * 10 : null, max: 10, display: task.confidence },
                  { label: t('effort'), value: task.effort, max: 10 },
                ].map(({ label, value, max, display }) => (
                  value != null && (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>{label}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#374151' }}>
                          {display !== undefined ? display : value?.toFixed(1)}
                        </span>
                      </div>
                      <ScoreBar value={value} max={max} />
                    </div>
                  )
                ))}
              </div>

              <div style={{
                padding: '0.75rem', backgroundColor: 'white',
                borderRadius: '0.5rem', border: '1px solid #F0F0F0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>{t('rice_score')}</p>
                  <p style={{ fontSize: '1rem', fontWeight: '700', color: '#111827' }}>{task.riceScore?.toFixed(2)}</p>
                </div>
                <div style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>×</div>
                <div>
                  <p style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>{t('multiplier')}</p>
                  <p style={{ fontSize: '1rem', fontWeight: '700', color: '#111827' }}>{multiplier.toFixed(2)}</p>
                </div>
                <div style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>═</div>
                <div>
                  <p style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>{t('final_score')}</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#CC2027' }}>{task.finalScore?.toFixed(1)}</p>
                </div>
              </div>

              {task.kanoReasoning && (
                <div style={{ marginTop: '0.75rem' }}>
                  <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>
                    {t('kano_reasoning')}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: '1.5' }}>
                    {tx.kanoReasoning}
                  </p>
                </div>
              )}
              {task.moscowReasoning && (
                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>
                    {t('moscow_reasoning')}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: '1.5' }}>
                    {tx.moscowReasoning}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Backlog() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [filterMoscow, setFilterMoscow] = useState('ALL');
  const [overrideTask, setOverrideTask] = useState(null);
  const [doraTask, setDoraTask] = useState(null);
  const [compareSelected, setCompareSelected] = useState(new Set());
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';
  const isPrivileged = user?.role === 'ADMIN' || user?.role === 'IT_MANAGER';

  const toggleCompare = (taskId) => {
    setCompareSelected(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) { next.delete(taskId); } else if (next.size < 6) { next.add(taskId); }
      return next;
    });
  };

  const loadTasks = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = isPrivileged
        ? await taskService.getAllTasks()
        : await taskService.getMyTasks();
      const sorted = data.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
      setTasks(sorted);
    } catch (err) {
      setError('Failed to load tasks. Make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    try {
      await taskService.deleteTask(task.id);
      setTasks(prev => prev.filter(t => t.id !== task.id));
      if (expandedId === task.id) setExpandedId(null);
    } catch {
      setError('Failed to delete task.');
    }
  };

  const filtered = filterMoscow === 'ALL'
    ? tasks
    : tasks.filter(t => t.moscowLabel === filterMoscow);

  const total = tasks.filter(t => t.moscowLabel).length;
  const ratio = {
    MUST: tasks.filter(t => t.moscowLabel === 'MUST').length,
    SHOULD: tasks.filter(t => t.moscowLabel === 'SHOULD').length,
    COULD: tasks.filter(t => t.moscowLabel === 'COULD').length,
    WONT: tasks.filter(t => t.moscowLabel === 'WONT').length,
  };

  return (
    <PageWrapper
      title={t('backlog_title')}
      subtitle={isPrivileged ? t('backlog_subtitle') : 'Your submitted tasks, ranked by AI score'}
    >

      {/* MoSCoW ratio bar — only meaningful for privileged users seeing all tasks */}
      {isPrivileged && total > 0 && (
        <div style={{
          backgroundColor: 'white', borderRadius: '0.75rem',
          padding: '1.25rem 1.5rem', marginBottom: '1.25rem',
          border: '1px solid #F0F0F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>
              {t('moscow_distribution')}
            </p>
            <p style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
              {t('moscow_target')}
            </p>
          </div>
          <div style={{ display: 'flex', height: '8px', borderRadius: '9999px', overflow: 'hidden', gap: '2px' }}>
            {[
              { key: 'MUST', color: '#DC2626' },
              { key: 'SHOULD', color: '#D97706' },
              { key: 'COULD', color: '#2563EB' },
              { key: 'WONT', color: '#9CA3AF' },
            ].map(({ key, color }) => (
              ratio[key] > 0 && (
                <div key={key} style={{ flex: ratio[key], backgroundColor: color, borderRadius: '2px' }} />
              )
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
            {[
              { key: 'MUST', color: '#DC2626', label: t('must') },
              { key: 'SHOULD', color: '#D97706', label: t('should') },
              { key: 'COULD', color: '#2563EB', label: t('could') },
              { key: 'WONT', color: '#9CA3AF', label: t('wont') },
            ].map(({ key, color, label }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: color }} />
                <span style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                  {label}: {total > 0 ? Math.round((ratio[key] / total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter + refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'MUST', 'SHOULD', 'COULD', 'WONT'].map((f) => (
            <button key={f} onClick={() => setFilterMoscow(f)}
              style={{
                padding: '0.35rem 0.85rem', borderRadius: '9999px', border: '1.5px solid',
                borderColor: filterMoscow === f ? '#CC2027' : '#E5E7EB',
                backgroundColor: filterMoscow === f ? '#FEF2F2' : 'white',
                color: filterMoscow === f ? '#CC2027' : '#6B7280',
                fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
              }}>
              {f === 'ALL' ? t('filter_all_tasks') : f}
            </button>
          ))}
        </div>
        <button onClick={loadTasks} style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.4rem 0.85rem', backgroundColor: 'white',
          border: '1.5px solid #E5E7EB', borderRadius: '0.5rem',
          fontSize: '0.78rem', color: '#6B7280', cursor: 'pointer',
        }}>
          <RefreshCw size={13} />
          {t('refresh')}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem', backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA', borderRadius: '0.75rem',
          display: 'flex', gap: '0.75rem', marginBottom: '1rem',
        }}>
          <AlertCircle size={16} color="#DC2626" />
          <p style={{ color: '#DC2626', fontSize: '0.875rem' }}>{error}</p>
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF' }}>
          <p>{t('backlog_loading')}</p>
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '3rem',
          backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #F0F0F0',
        }}>
          <Brain size={32} color="#E5E7EB" style={{ marginBottom: '0.75rem' }} />
          <p style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
            {t('backlog_empty_title')}
          </p>
          <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
            {t('backlog_empty_subtitle')}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map((task, index) => (
          <BacklogTaskCard
            key={task.id}
            task={task}
            index={index}
            isExpanded={expandedId === task.id}
            onToggle={() => setExpandedId(expandedId === task.id ? null : task.id)}
            onOverride={() => setOverrideTask(task)}
            onDora={() => setDoraTask(task)}
            isAdmin={isAdmin}
            onDelete={() => handleDelete(task)}
            isSelectedForCompare={compareSelected.has(task.id)}
            onToggleCompare={toggleCompare}
            compareCount={compareSelected.size}
          />
        ))}
      </div>

      {compareSelected.size >= 2 && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, backgroundColor: '#1A1A2E', borderRadius: '0.875rem',
          padding: '0.875rem 1.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', gap: '1rem',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale size={16} color="#A78BFA" />
            <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600' }}>
              {compareSelected.size} {t('compare_tasks_selected')}
            </span>
          </div>
          <button
            onClick={() => navigate('/compare', { state: { preSelectedIds: [...compareSelected], mode: 'tasks' } })}
            style={{
              padding: '0.5rem 1.25rem', backgroundColor: '#CC2027',
              border: 'none', borderRadius: '0.5rem',
              fontSize: '0.85rem', fontWeight: '700', color: 'white', cursor: 'pointer',
            }}
          >
            {t('compare_now')}
          </button>
          <button
            onClick={() => setCompareSelected(new Set())}
            style={{
              padding: '0.5rem 0.75rem', backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem',
              fontSize: '0.8rem', color: '#9CA3AF', cursor: 'pointer',
            }}
          >
            {t('common_clear')}
          </button>
        </div>
      )}

      {overrideTask && (
        <OverrideModal
          task={overrideTask}
          onClose={() => setOverrideTask(null)}
          onSuccess={() => { setOverrideTask(null); loadTasks(); }}
        />
      )}
      {doraTask && (
        <DoraModal
          task={doraTask}
          onClose={() => setDoraTask(null)}
          onSuccess={() => setDoraTask(null)}
        />
      )}
    </PageWrapper>
  );
}

export default Backlog;
