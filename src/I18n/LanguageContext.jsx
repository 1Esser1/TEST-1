import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translateText, translateBatch, clearTranslationCache } from './translateService';

const LanguageContext = createContext();

// Static UI labels — pre-translated for instant rendering
// No API call needed for these
const UI_LABELS = {
  en: {
    nav_dashboard: 'Dashboard', nav_tasks: 'Tasks',
    nav_backlog: 'Backlog', nav_scoring: 'AI Scoring',
    nav_compare: 'Compare',
    nav_reports: 'Reports', nav_settings: 'Settings',
    nav_admin: 'Admin Panel', nav_signout: 'Sign out',
    nav_main: 'Main', nav_administration: 'Administration',
    auth_welcome: 'Welcome back',
    auth_signin_subtitle: 'Sign in to your PriorIT account',
    auth_email: 'Email address', auth_password: 'Password',
    auth_signin_btn: 'Sign in', auth_signing_in: 'Signing in...',
    auth_no_account: 'No account?',
    auth_request_access: 'Request access',
    auth_access_note: 'Access level is determined by your IT profile.',
    reg_title: 'Create your account',
    reg_subtitle: 'All fields marked * are required',
    reg_name: 'Full name *', reg_email: 'Email address *',
    reg_role: 'Role *', reg_password: 'Password *',
    reg_confirm_password: 'Confirm password *',
    reg_upload_photo: 'Upload photo',
    reg_submit: 'Request access', reg_submitting: 'Submitting...',
    reg_already_account: 'Already have an account?',
    reg_success: 'Registration successful! Please wait for admin approval.',
    reg_select_role: 'Select your role',
    reg_password_weak: 'Weak', reg_password_medium: 'Medium',
    reg_password_strong: 'Strong',
    reg_passwords_no_match: 'Passwords do not match',
    role_developer: 'IT Developer', role_erp: 'ERP Team',
    role_product: 'Product / Mobile Team',
    role_manager: 'IT Manager', role_admin: 'Administrator',
    dash_title: 'Dashboard',
    dash_total_tasks: 'Total Tasks', dash_ai_scored: 'AI Scored',
    dash_must_do: 'Must Do', dash_avg_score: 'Avg Score',
    dash_pending: 'Pending Scoring', dash_overridden: 'Overridden',
    dash_moscow_ratio: 'MoSCoW Must Ratio',
    dash_on_target: '✓ On target', dash_off_target: '⚠ Off target',
    dash_moscow_dist: 'MoSCoW Distribution',
    dash_top5: 'Top 5 Tasks by Score',
    dash_top_ranked: 'Top Ranked Tasks',
    dash_no_tasks: 'No scored tasks yet',
    dash_go_submit: 'Go to Tasks and submit your first task',
    dash_refresh: 'Refresh', dash_target: 'Target: 60%',
    task_title: 'Submit New Task',
    task_subtitle: 'Describe your task — AI will handle Kano, MoSCoW, and RICE scoring',
    task_details: 'Task Details', task_type: 'Task Type *',
    task_name: 'Task Title *', task_description: 'Description *',
    task_description_hint: 'The more detail, the more accurate the AI scoring.',
    task_kano_section: 'Kano Signal',
    task_kano_subtitle: 'How would users react if this feature was missing?',
    task_submit: '🤖 Submit for AI Scoring',
    task_submitting: 'Submitting...', task_clear: 'Clear form',
    task_success: 'Task submitted! The AI will score it shortly.',
    task_ai_note: 'AI Scoring Engine',
    task_loading_types: 'Loading task types...',
    kano_complain: 'They would complain',
    kano_complain_desc: 'Users expect this — Basic need',
    kano_appreciate: 'They would appreciate it',
    kano_appreciate_desc: 'Users notice and value it — Performance',
    kano_surprised: 'They would be surprised',
    kano_surprised_desc: "Users don't expect it — Delighter",
    kano_wont_notice: "They wouldn't notice",
    kano_wont_notice_desc: 'Little impact on satisfaction — Indifferent',
    backlog_title: 'Task Backlog',
    backlog_subtitle: 'Ranked by AI-computed RICE score',
    backlog_all: 'All tasks', backlog_override: 'Override',
    backlog_dora: 'DORA', backlog_no_tasks: 'No tasks found',
    backlog_go_submit: 'Submit a task to see it scored here.',
    scoring_title: 'AI Scoring',
    scoring_subtitle: 'Full AI reasoning and RICE breakdown',
    scoring_total: 'Total Scored', scoring_avg: 'Avg Final Score',
    scoring_confidence: 'Avg Confidence',
    scoring_high_conf: 'High Confidence',
    scoring_no_tasks: 'No scored tasks',
    scoring_industry: '🌍 Industry Context',
    scoring_rice: 'RICE Variables', scoring_reasoning: 'AI Reasoning',
    admin_title: 'Admin Panel',
    admin_subtitle: 'Manage user registration requests',
    admin_approve: 'Approve', admin_reject: 'Reject',
    admin_requests: 'Pending Registration Requests',
    admin_all_clear: 'All caught up',
    admin_no_pending: 'No pending registration requests.',
    admin_processing: 'Processing...',
    export_title: 'Export Reports',
    export_subtitle: 'Generate PDF or Excel reports',
    export_excel_btn: 'Export Excel (.xlsx)',
    export_pdf_btn: 'Export PDF Report',
    export_generating: 'Generating...',
    settings_title: 'Settings',
    settings_subtitle: 'Manage your account and preferences',
    settings_profile: 'My Profile',
    settings_permissions: 'Roles & Permissions',
    settings_ai: 'AI Scoring Config',
    settings_notifications: 'Notifications',
    settings_language: 'Language & Localization',
    settings_save: 'Save changes',
    dora_title: 'DORA Metrics Panel',
    dora_subtitle: 'Manually estimated delivery performance indicators',
    dora_lead_time: 'Avg Lead Time', dora_freq: 'Deploy Frequency',
    dora_high_risk: 'High Risk Tasks', dora_tracked: 'Total Tracked',
    dora_no_data: 'No DORA indicators yet.',
    common_loading: 'Loading...', common_refresh: 'Refresh',
    common_cancel: 'Cancel', common_save: 'Save',
    // Scoring page
    filter_all_kano: 'All', filter_all_moscow: 'All',
    refresh: 'Refresh',
    scoring_loading: 'Loading scores...',
    scoring_empty_title: 'No scored tasks',
    scoring_empty_subtitle: 'Submit a task to see AI scoring here.',
    task_description: 'Description',
    industry_context: 'Industry Context',
    ai_industry_context: 'AI Industry Context',
    rice_variables: 'RICE Variables',
    reach: 'Reach', impact: 'Impact',
    confidence: 'Confidence', effort: 'Effort',
    rice_formula: 'RICE × Multiplier = Final Score',
    ai_reasoning: 'AI Reasoning',
    ai_confidence_level: 'AI Confidence Level',
    final_score: 'Final Score',
    // Backlog page
    moscow_distribution: 'MoSCoW Distribution',
    moscow_target: 'Target: 60% Must / 20% Should / 20% Could',
    must: 'Must', should: 'Should', could: 'Could', wont: "Won't",
    filter_all_tasks: 'All tasks',
    backlog_loading: 'Loading backlog...',
    backlog_empty_title: 'No tasks found',
    backlog_empty_subtitle: 'Submit a task to see it scored here.',
    rice_breakdown: 'RICE Breakdown',
    rice_score: 'RICE Score',
    multiplier: 'Multiplier',
    kano_reasoning: 'Kano Reasoning',
    moscow_reasoning: 'MoSCoW Reasoning',
    override: 'Override',
    // Dashboard page
    dash_subtitle_greeting: "here's your prioritization overview",
    dash_in_backlog: 'In the backlog',
    dash_pending_subtitle: 'Waiting for AI',
    dash_overridden_subtitle: 'Manager overrides applied',
    dash_charts_moscow: 'MoSCoW Distribution',
    dash_charts_moscow_target: 'Target: 60% Must / 20% Should / 20% Could',
    dash_charts_top5: 'Top 5 Tasks by Score',
    dash_ranked_by_rice: 'Ranked by final RICE score',
    dash_top_ranked_subtitle: 'Highest priority items in the backlog',
    dash_no_scored: 'No scored tasks yet',
    dash_go_scoring: 'Go to Tasks and submit your first task for AI scoring',
    dash_loading: 'Loading dashboard...',
    dora_lead_subtitle: 'Approval to deployment',
    dora_freq_subtitle: 'Most common cadence',
    dora_high_risk_subtitle: 'High or Critical risk',
    dora_tracked_subtitle: 'Tasks with DORA data',
    dora_no_data_hint: 'No DORA indicators yet. Go to Backlog → click DORA on any scored task to add indicators.',
    dora_indicators: 'indicators',
    nav_workplace: 'Workplace',
    workplace_title: 'Workplace',
    workplace_subtitle: 'AI-powered task planning & progress tracking',
    workplace_generate_btn: 'Generate Workplace',
    workplace_empty_title: 'No workplaces yet',
    workplace_empty_subtitle: 'Generate an AI-powered workplace for any of your tasks — get subtasks, tips, banking benchmarks and DORA estimates.',
    workplace_no_tasks: 'No tasks available',
    workplace_no_tasks_hint: 'Submit a task first to generate a workplace',
    workplace_pick_task: 'Select a task',
    workplace_pick_subtitle: 'AI will generate a full implementation plan with subtasks, tips and banking benchmarks',
    workplace_search_tasks: 'Search tasks...',
    workplace_generating: 'Generating AI plan...',
    workplace_open: 'Open',
    workplace_regenerate: 'Regenerate',
    workplace_back: 'Workplaces',
    workplace_overall_plan: 'Implementation Plan',
    workplace_tips: 'Tips & Best Practices',
    workplace_benchmarks: 'Banking Benchmarks',
    workplace_dora: 'DORA Estimates',
    workplace_progress: 'Progress',
    workplace_est_hours: 'Est. Hours',
    workplace_subtasks: 'subtasks',
    workplace_total: 'Total Workplaces',
    workplace_active: 'Active',
    workplace_completed: 'Completed',
    workplace_loading: 'Loading workplaces...',
    workplace_cancel: 'Cancel',
    workplace_status_active: 'Active',
    workplace_status_completed: 'Completed',
    workplace_status_archived: 'Archived',
    subtask_todo: 'To Do',
    subtask_in_progress: 'In Progress',
    subtask_done: 'Done',
    subtask_low: 'Low',
    subtask_medium: 'Medium',
    subtask_high: 'High',
    subtask_tips: 'tips',
    subtask_hide_tips: 'Hide tips',
    subtask_actual: 'actual',
    benchmark_source: 'Source',
    dora_change_risk: 'Change Failure Risk',
    dora_recovery_plan: 'Recovery Plan',
    // Compare page
    compare_title: 'Comparative Analysis',
    compare_subtitle: 'Score and rank banking features or existing tasks side by side',
    compare_mode_features: 'Banking Features',
    compare_mode_features_desc: 'Compare features or concepts — virement, paiement mobile, biometric login…',
    compare_mode_tasks: 'Existing Tasks',
    compare_mode_tasks_desc: 'Pick from your scored backlog and compare them head-to-head',
    compare_max_reached: 'Maximum reached',
    compare_add_feature: 'Add Feature',
    compare_feature: 'Feature',
    compare_category: 'Category',
    compare_optional: '(optional)',
    compare_feature_name: 'Feature name *',
    compare_description: 'Description *',
    compare_remove: 'Remove',
    compare_clear_all: 'Clear All',
    compare_context_label: 'Additional Context',
    compare_context_hint: 'Constraints, deadlines, or strategic context that should influence the ranking.',
    compare_ai_title: 'AI Comparative Engine',
    compare_ai_note_tasks: 'tasks will be re-evaluated simultaneously — Kano, MoSCoW and RICE in one pass — then ranked head-to-head. Scores may differ from individual backlog scores.',
    compare_ai_note_features_pre: 'All',
    compare_ai_note_features: 'features are scored simultaneously — Kano, MoSCoW and RICE in one pass — then ranked with 15+ years of MENA banking expertise.',
    compare_loading_tasks_msg: 'Loading tasks from backlog…',
    compare_no_tasks_title: 'No scored tasks found',
    compare_no_tasks_hint: 'Submit and score tasks in the Tasks page first, then come back to compare them.',
    compare_selected: 'selected',
    compare_select_min: 'Select at least',
    compare_select_max_text: 'Select up to',
    compare_more: 'more',
    compare_spots: 'spots left',
    compare_clear_selection: 'Clear selection',
    compare_clear: 'Clear',
    compare_analyzing_subtitle: 'AI is analyzing your items…',
    compare_analyzing: 'Analyzing',
    compare_items: 'items',
    compare_applying: 'Applying Kano · MoSCoW · RICE simultaneously…',
    compare_recommendation: 'Recommendation',
    compare_overall_analysis: 'Overall Analysis',
    compare_rice_breakdown: 'RICE Breakdown',
    compare_new_comparison: 'New Comparison',
    compare_start_new: 'Start a New Comparison',
    compare_task_pill: 'Task',
    compare_feature_pill: 'Feature',
    compare_why_rank: 'Why this rank',
    compare_outranks: 'Outranks #',
    compare_btn: 'Compare',
    compare_features_word: 'Features',
    compare_tasks_word: 'Tasks',
    compare_score_label: 'Score',
    compare_final_label: 'Final',
    compare_ranked: 'ranked',
    compare_rank_label: 'Rank #',
    // Backlog new buttons
    btn_workspace: 'Workspace',
    btn_compare: 'Compare',
    btn_compare_selected: 'Selected',
    btn_add_to_compare: 'Add to compare',
    btn_remove_from_compare: 'Remove from compare',
    compare_now: 'Compare Now',
    compare_tasks_selected: 'tasks selected',
    btn_delete: 'Delete',
    common_clear: 'Clear',
    // DORA deployment frequency
    freq_multiple: 'Multiple/Day',
    freq_daily: 'Daily',
    freq_weekly: 'Weekly',
    freq_monthly: 'Monthly',
    freq_less_monthly: '< Monthly',
  },
  fr: {
    nav_dashboard: 'Tableau de bord', nav_tasks: 'Tâches',
    nav_backlog: 'Backlog', nav_scoring: 'Scoring IA',
    nav_compare: 'Comparer',
    nav_reports: 'Rapports', nav_settings: 'Paramètres',
    nav_admin: 'Panneau Admin', nav_signout: 'Déconnexion',
    nav_main: 'Principal', nav_administration: 'Administration',
    auth_welcome: 'Bon retour',
    auth_signin_subtitle: 'Connectez-vous à votre compte PriorIT',
    auth_email: 'Adresse e-mail', auth_password: 'Mot de passe',
    auth_signin_btn: 'Se connecter', auth_signing_in: 'Connexion...',
    auth_no_account: 'Pas de compte ?',
    auth_request_access: "Demander l'accès",
    auth_access_note: "Le niveau d'accès est déterminé par votre profil IT.",
    reg_title: 'Créer votre compte',
    reg_subtitle: 'Tous les champs marqués * sont obligatoires',
    reg_name: 'Nom complet *', reg_email: 'Adresse e-mail *',
    reg_role: 'Rôle *', reg_password: 'Mot de passe *',
    reg_confirm_password: 'Confirmer le mot de passe *',
    reg_upload_photo: 'Télécharger une photo',
    reg_submit: "Demander l'accès", reg_submitting: 'Envoi...',
    reg_already_account: 'Vous avez déjà un compte ?',
    reg_success: "Inscription réussie ! Veuillez attendre l'approbation.",
    reg_select_role: 'Sélectionnez votre rôle',
    reg_password_weak: 'Faible', reg_password_medium: 'Moyen',
    reg_password_strong: 'Fort',
    reg_passwords_no_match: 'Les mots de passe ne correspondent pas',
    role_developer: 'Développeur IT', role_erp: 'Équipe ERP',
    role_product: 'Équipe Produit / Mobile',
    role_manager: 'Responsable IT', role_admin: 'Administrateur',
    dash_title: 'Tableau de bord',
    dash_total_tasks: 'Total Tâches', dash_ai_scored: 'Scorées par IA',
    dash_must_do: 'Must Do', dash_avg_score: 'Score Moyen',
    dash_pending: 'En attente de scoring',
    dash_overridden: 'Remplacées',
    dash_moscow_ratio: 'Ratio MoSCoW Must',
    dash_on_target: "✓ Dans l'objectif",
    dash_off_target: '⚠ Hors objectif',
    dash_moscow_dist: 'Distribution MoSCoW',
    dash_top5: 'Top 5 Tâches par Score',
    dash_top_ranked: 'Tâches prioritaires',
    dash_no_tasks: 'Aucune tâche scorée',
    dash_go_submit: 'Soumettez votre première tâche',
    dash_refresh: 'Actualiser', dash_target: 'Objectif : 60%',
    task_title: 'Soumettre une tâche',
    task_subtitle: "Décrivez votre tâche — l'IA gérera le scoring",
    task_details: 'Détails de la tâche', task_type: 'Type de tâche *',
    task_name: 'Titre *', task_description: 'Description *',
    task_description_hint: 'Plus de détails = scoring plus précis.',
    task_kano_section: 'Signal Kano',
    task_kano_subtitle: 'Comment réagiraient les utilisateurs?',
    task_submit: '🤖 Soumettre pour scoring IA',
    task_submitting: 'Envoi...', task_clear: 'Effacer',
    task_success: 'Tâche soumise ! Scoring en cours.',
    task_ai_note: 'Moteur de scoring IA',
    task_loading_types: 'Chargement...',
    kano_complain: 'Ils se plaindraient',
    kano_complain_desc: 'Besoin basique',
    kano_appreciate: 'Ils apprécieraient',
    kano_appreciate_desc: 'Performance',
    kano_surprised: 'Ils seraient surpris',
    kano_surprised_desc: 'Enchantement',
    kano_wont_notice: 'Ils ne remarqueraient pas',
    kano_wont_notice_desc: 'Indifférent',
    backlog_title: 'Backlog des tâches',
    backlog_subtitle: 'Classé par score RICE de l\'IA',
    backlog_all: 'Toutes', backlog_override: 'Remplacer',
    backlog_dora: 'DORA', backlog_no_tasks: 'Aucune tâche',
    backlog_go_submit: 'Soumettez une tâche pour la voir ici.',
    scoring_title: 'Scoring IA',
    scoring_subtitle: 'Raisonnement IA complet et détail RICE',
    scoring_total: 'Total Scorées', scoring_avg: 'Score Moyen',
    scoring_confidence: 'Confiance Moyenne',
    scoring_high_conf: 'Haute Confiance',
    scoring_no_tasks: 'Aucune tâche scorée',
    scoring_industry: '🌍 Contexte Industriel',
    scoring_rice: 'Variables RICE', scoring_reasoning: 'Raisonnement IA',
    admin_title: 'Panneau Admin',
    admin_subtitle: "Gérer les demandes d'inscription",
    admin_approve: 'Approuver', admin_reject: 'Rejeter',
    admin_requests: "Demandes d'inscription en attente",
    admin_all_clear: 'Tout est à jour',
    admin_no_pending: "Aucune demande d'inscription en attente.",
    admin_processing: 'Traitement...',
    export_title: 'Exporter les rapports',
    export_subtitle: 'Générer des rapports PDF ou Excel',
    export_excel_btn: 'Exporter Excel (.xlsx)',
    export_pdf_btn: 'Exporter Rapport PDF',
    export_generating: 'Génération...',
    settings_title: 'Paramètres',
    settings_subtitle: "Gérez votre compte et les préférences",
    settings_profile: 'Mon profil',
    settings_permissions: 'Rôles et permissions',
    settings_ai: 'Config scoring IA',
    settings_notifications: 'Notifications',
    settings_language: 'Langue et localisation',
    settings_save: 'Enregistrer',
    dora_title: 'Panneau Métriques DORA',
    dora_subtitle: 'Indicateurs de performance estimés manuellement',
    dora_lead_time: 'Délai moyen', dora_freq: 'Fréquence déploiement',
    dora_high_risk: 'Tâches à risque élevé', dora_tracked: 'Total suivi',
    dora_no_data: 'Aucun indicateur DORA.',
    common_loading: 'Chargement...', common_refresh: 'Actualiser',
    common_cancel: 'Annuler', common_save: 'Enregistrer',
    filter_all_kano: 'Tout', filter_all_moscow: 'Tout',
    refresh: 'Actualiser',
    scoring_loading: 'Chargement des scores...',
    scoring_empty_title: 'Aucune tâche scorée',
    scoring_empty_subtitle: 'Soumettez une tâche pour voir le scoring IA ici.',
    task_description: 'Description',
    industry_context: 'Contexte Industriel',
    ai_industry_context: 'Contexte Industriel IA',
    rice_variables: 'Variables RICE',
    reach: 'Portée', impact: 'Impact',
    confidence: 'Confiance', effort: 'Effort',
    rice_formula: 'RICE × Multiplicateur = Score Final',
    ai_reasoning: 'Raisonnement IA',
    ai_confidence_level: 'Niveau de Confiance IA',
    final_score: 'Score Final',
    moscow_distribution: 'Distribution MoSCoW',
    moscow_target: 'Objectif : 60% Must / 20% Should / 20% Could',
    must: 'Must', should: 'Should', could: 'Could', wont: "Won't",
    filter_all_tasks: 'Toutes',
    backlog_loading: 'Chargement du backlog...',
    backlog_empty_title: 'Aucune tâche trouvée',
    backlog_empty_subtitle: 'Soumettez une tâche pour la voir ici.',
    rice_breakdown: 'Détail RICE',
    rice_score: 'Score RICE',
    multiplier: 'Multiplicateur',
    kano_reasoning: 'Raisonnement Kano',
    moscow_reasoning: 'Raisonnement MoSCoW',
    override: 'Remplacer',
    dash_subtitle_greeting: "voici votre aperçu de priorisation",
    dash_in_backlog: 'Dans le backlog',
    dash_pending_subtitle: 'En attente de l\'IA',
    dash_overridden_subtitle: 'Remplacements manager appliqués',
    dash_charts_moscow: 'Distribution MoSCoW',
    dash_charts_moscow_target: 'Objectif : 60% Must / 20% Should / 20% Could',
    dash_charts_top5: 'Top 5 Tâches par Score',
    dash_ranked_by_rice: 'Classé par score RICE final',
    dash_top_ranked_subtitle: 'Éléments prioritaires du backlog',
    dash_no_scored: 'Aucune tâche scorée',
    dash_go_scoring: 'Allez dans Tâches et soumettez votre première tâche',
    dash_loading: 'Chargement du tableau de bord...',
    dora_lead_subtitle: 'Approbation jusqu\'au déploiement',
    dora_freq_subtitle: 'Cadence la plus fréquente',
    dora_high_risk_subtitle: 'Risque élevé ou critique',
    dora_tracked_subtitle: 'Tâches avec données DORA',
    dora_no_data_hint: 'Aucun indicateur DORA. Allez dans Backlog → cliquez DORA sur une tâche scorée.',
    dora_indicators: 'indicateurs',
    nav_workplace: 'Espace de travail',
    workplace_title: 'Espace de travail',
    workplace_subtitle: "Planification des tâches pilotée par l'IA",
    workplace_generate_btn: 'Générer un espace de travail',
    workplace_empty_title: 'Aucun espace de travail',
    workplace_empty_subtitle: "Générez un espace de travail IA pour l'une de vos tâches — sous-tâches, conseils, benchmarks bancaires et estimations DORA.",
    workplace_no_tasks: 'Aucune tâche disponible',
    workplace_no_tasks_hint: 'Soumettez une tâche en premier',
    workplace_pick_task: 'Sélectionner une tâche',
    workplace_pick_subtitle: "L'IA génèrera un plan complet avec sous-tâches, conseils et benchmarks",
    workplace_search_tasks: 'Rechercher des tâches...',
    workplace_generating: 'Génération du plan IA...',
    workplace_open: 'Ouvrir',
    workplace_regenerate: 'Régénérer',
    workplace_back: 'Espaces de travail',
    workplace_overall_plan: "Plan d'implémentation",
    workplace_tips: 'Conseils et bonnes pratiques',
    workplace_benchmarks: 'Benchmarks bancaires',
    workplace_dora: 'Estimations DORA',
    workplace_progress: 'Progression',
    workplace_est_hours: 'Heures est.',
    workplace_subtasks: 'sous-tâches',
    workplace_total: 'Total espaces',
    workplace_active: 'Actifs',
    workplace_completed: 'Terminés',
    workplace_loading: 'Chargement...',
    workplace_cancel: 'Annuler',
    workplace_status_active: 'Actif',
    workplace_status_completed: 'Terminé',
    workplace_status_archived: 'Archivé',
    subtask_todo: 'À faire',
    subtask_in_progress: 'En cours',
    subtask_done: 'Terminé',
    subtask_low: 'Faible',
    subtask_medium: 'Moyen',
    subtask_high: 'Élevé',
    subtask_tips: 'conseils',
    subtask_hide_tips: 'Masquer',
    subtask_actual: 'réel',
    benchmark_source: 'Source',
    dora_change_risk: 'Risque de défaillance',
    dora_recovery_plan: 'Plan de récupération',
  },
  ar: {
    nav_dashboard: 'لوحة التحكم', nav_tasks: 'المهام',
    nav_backlog: 'قائمة الأعمال',
    nav_scoring: 'تقييم الذكاء الاصطناعي',
    nav_compare: 'مقارنة',
    nav_reports: 'التقارير', nav_settings: 'الإعدادات',
    nav_admin: 'لوحة الإدارة', nav_signout: 'تسجيل الخروج',
    nav_main: 'الرئيسية', nav_administration: 'الإدارة',
    auth_welcome: 'مرحباً بعودتك',
    auth_signin_subtitle: 'تسجيل الدخول إلى حساب PriorIT',
    auth_email: 'البريد الإلكتروني', auth_password: 'كلمة المرور',
    auth_signin_btn: 'تسجيل الدخول',
    auth_signing_in: 'جاري تسجيل الدخول...',
    auth_no_account: 'ليس لديك حساب؟',
    auth_request_access: 'طلب الوصول',
    auth_access_note: 'مستوى الوصول يحدده ملفك الشخصي في تقنية المعلومات.',
    reg_title: 'إنشاء حسابك',
    reg_subtitle: 'جميع الحقول المعلمة بـ * مطلوبة',
    reg_name: 'الاسم الكامل *', reg_email: 'البريد الإلكتروني *',
    reg_role: 'الدور *', reg_password: 'كلمة المرور *',
    reg_confirm_password: 'تأكيد كلمة المرور *',
    reg_upload_photo: 'رفع صورة',
    reg_submit: 'طلب الوصول', reg_submitting: 'جاري الإرسال...',
    reg_already_account: 'لديك حساب بالفعل؟',
    reg_success: 'تم التسجيل بنجاح! يرجى انتظار موافقة المسؤول.',
    reg_select_role: 'اختر دورك',
    reg_password_weak: 'ضعيف', reg_password_medium: 'متوسط',
    reg_password_strong: 'قوي',
    reg_passwords_no_match: 'كلمات المرور غير متطابقة',
    role_developer: 'مطور تقنية المعلومات', role_erp: 'فريق ERP',
    role_product: 'فريق المنتج / الهاتف',
    role_manager: 'مدير تقنية المعلومات', role_admin: 'مدير النظام',
    dash_title: 'لوحة التحكم',
    dash_total_tasks: 'إجمالي المهام',
    dash_ai_scored: 'مُقيَّمة بالذكاء الاصطناعي',
    dash_must_do: 'يجب تنفيذها', dash_avg_score: 'متوسط الدرجة',
    dash_pending: 'في انتظار التقييم', dash_overridden: 'تم تجاوزها',
    dash_moscow_ratio: 'نسبة Must في MoSCoW',
    dash_on_target: '✓ في الهدف', dash_off_target: '⚠ خارج الهدف',
    dash_moscow_dist: 'توزيع MoSCoW',
    dash_top5: 'أعلى 5 مهام بالدرجة',
    dash_top_ranked: 'المهام ذات الأولوية',
    dash_no_tasks: 'لا توجد مهام مُقيَّمة بعد',
    dash_go_submit: 'انتقل إلى المهام وأرسل مهمتك الأولى',
    dash_refresh: 'تحديث', dash_target: 'الهدف: 60%',
    task_title: 'إرسال مهمة جديدة',
    task_subtitle: 'صف مهمتك — سيتولى الذكاء الاصطناعي التقييم',
    task_details: 'تفاصيل المهمة', task_type: 'نوع المهمة *',
    task_name: 'عنوان المهمة *', task_description: 'الوصف *',
    task_description_hint: 'كلما قدمت تفاصيل أكثر، كان التقييم أكثر دقة.',
    task_kano_section: 'إشارة Kano',
    task_kano_subtitle: 'كيف سيتفاعل المستخدمون إذا غابت هذه الميزة؟',
    task_submit: '🤖 إرسال للتقييم بالذكاء الاصطناعي',
    task_submitting: 'جاري الإرسال...', task_clear: 'مسح النموذج',
    task_success: 'تم إرسال المهمة! سيتم تقييمها قريباً.',
    task_ai_note: 'محرك التقييم بالذكاء الاصطناعي',
    task_loading_types: 'جاري تحميل الأنواع...',
    kano_complain: 'سيشكون',
    kano_complain_desc: 'حاجة أساسية',
    kano_appreciate: 'سيقدرون ذلك',
    kano_appreciate_desc: 'أداء',
    kano_surprised: 'سيفاجأون',
    kano_surprised_desc: 'إسعاد',
    kano_wont_notice: 'لن يلاحظوا',
    kano_wont_notice_desc: 'غير مبالٍ',
    backlog_title: 'قائمة الأعمال',
    backlog_subtitle: 'مرتبة حسب درجة RICE للذكاء الاصطناعي',
    backlog_all: 'الجميع', backlog_override: 'تجاوز',
    backlog_dora: 'DORA', backlog_no_tasks: 'لا توجد مهام',
    backlog_go_submit: 'أرسل مهمة لرؤيتها مُقيَّمة هنا.',
    scoring_title: 'تقييم الذكاء الاصطناعي',
    scoring_subtitle: 'التفسير الكامل وتفصيل RICE',
    scoring_total: 'إجمالي المُقيَّمة',
    scoring_avg: 'متوسط الدرجة النهائية',
    scoring_confidence: 'متوسط الثقة',
    scoring_high_conf: 'ثقة عالية',
    scoring_no_tasks: 'لا توجد مهام مُقيَّمة',
    scoring_industry: '🌍 السياق الصناعي',
    scoring_rice: 'متغيرات RICE',
    scoring_reasoning: 'تفسير الذكاء الاصطناعي',
    admin_title: 'لوحة الإدارة',
    admin_subtitle: 'إدارة طلبات التسجيل',
    admin_approve: 'موافقة', admin_reject: 'رفض',
    admin_requests: 'طلبات التسجيل المعلقة',
    admin_all_clear: 'لا توجد طلبات معلقة',
    admin_no_pending: 'لا توجد طلبات تسجيل معلقة حالياً.',
    admin_processing: 'جاري المعالجة...',
    export_title: 'تصدير التقارير',
    export_subtitle: 'إنشاء تقارير PDF أو Excel',
    export_excel_btn: 'تصدير Excel (.xlsx)',
    export_pdf_btn: 'تصدير تقرير PDF',
    export_generating: 'جاري الإنشاء...',
    settings_title: 'الإعدادات',
    settings_subtitle: 'إدارة حسابك وتفضيلات التطبيق',
    settings_profile: 'ملفي الشخصي',
    settings_permissions: 'الأدوار والصلاحيات',
    settings_ai: 'إعداد تقييم الذكاء الاصطناعي',
    settings_notifications: 'الإشعارات',
    settings_language: 'اللغة والتوطين',
    settings_save: 'حفظ التغييرات',
    dora_title: 'لوحة مقاييس DORA',
    dora_subtitle: 'مؤشرات أداء التسليم المقدَّرة يدوياً',
    dora_lead_time: 'متوسط وقت التسليم',
    dora_freq: 'تكرار النشر',
    dora_high_risk: 'مهام عالية الخطورة',
    dora_tracked: 'إجمالي المتتبعة',
    dora_no_data: 'لا توجد مؤشرات DORA.',
    common_loading: 'جاري التحميل...', common_refresh: 'تحديث',
    common_cancel: 'إلغاء', common_save: 'حفظ',
    filter_all_kano: 'الكل', filter_all_moscow: 'الكل',
    refresh: 'تحديث',
    scoring_loading: 'جاري تحميل الدرجات...',
    scoring_empty_title: 'لا توجد مهام مُقيَّمة',
    scoring_empty_subtitle: 'أرسل مهمة لرؤية تقييم الذكاء الاصطناعي هنا.',
    task_description: 'الوصف',
    industry_context: 'السياق الصناعي',
    ai_industry_context: 'السياق الصناعي للذكاء الاصطناعي',
    rice_variables: 'متغيرات RICE',
    reach: 'الوصول', impact: 'التأثير',
    confidence: 'الثقة', effort: 'الجهد',
    rice_formula: 'RICE × المضاعف = الدرجة النهائية',
    ai_reasoning: 'تفسير الذكاء الاصطناعي',
    ai_confidence_level: 'مستوى ثقة الذكاء الاصطناعي',
    final_score: 'الدرجة النهائية',
    moscow_distribution: 'توزيع MoSCoW',
    moscow_target: 'الهدف: 60% Must / 20% Should / 20% Could',
    must: 'Must', should: 'Should', could: 'Could', wont: "Won't",
    filter_all_tasks: 'الجميع',
    backlog_loading: 'جاري تحميل قائمة الأعمال...',
    backlog_empty_title: 'لا توجد مهام',
    backlog_empty_subtitle: 'أرسل مهمة لرؤيتها مُقيَّمة هنا.',
    rice_breakdown: 'تفصيل RICE',
    rice_score: 'درجة RICE',
    multiplier: 'المضاعف',
    kano_reasoning: 'تفسير Kano',
    moscow_reasoning: 'تفسير MoSCoW',
    override: 'تجاوز',
    dash_subtitle_greeting: 'إليك نظرة عامة على تحديد أولوياتك',
    dash_in_backlog: 'في قائمة الأعمال',
    dash_pending_subtitle: 'في انتظار الذكاء الاصطناعي',
    dash_overridden_subtitle: 'تجاوزات المدير مطبقة',
    dash_charts_moscow: 'توزيع MoSCoW',
    dash_charts_moscow_target: 'الهدف: 60% Must / 20% Should / 20% Could',
    dash_charts_top5: 'أعلى 5 مهام بالدرجة',
    dash_ranked_by_rice: 'مرتبة حسب درجة RICE النهائية',
    dash_top_ranked_subtitle: 'العناصر ذات الأولوية في قائمة الأعمال',
    dash_no_scored: 'لا توجد مهام مُقيَّمة بعد',
    dash_go_scoring: 'انتقل إلى المهام وأرسل مهمتك الأولى للتقييم',
    dash_loading: 'جاري تحميل لوحة التحكم...',
    dora_lead_subtitle: 'من الموافقة حتى النشر',
    dora_freq_subtitle: 'الإيقاع الأكثر شيوعاً',
    dora_high_risk_subtitle: 'مخاطر عالية أو حرجة',
    dora_tracked_subtitle: 'مهام ببيانات DORA',
    dora_no_data_hint: 'لا توجد مؤشرات DORA بعد. انتقل إلى Backlog → انقر DORA على أي مهمة مُقيَّمة.',
    dora_indicators: 'مؤشرات',
    nav_workplace: 'مساحة العمل',
    workplace_title: 'مساحة العمل',
    workplace_subtitle: 'تخطيط المهام بالذكاء الاصطناعي وتتبع التقدم',
    workplace_generate_btn: 'إنشاء مساحة عمل',
    workplace_empty_title: 'لا توجد مساحات عمل',
    workplace_empty_subtitle: 'أنشئ مساحة عمل ذكاء اصطناعي لأي مهمة — مهام فرعية ونصائح ومعايير مصرفية وتقديرات DORA.',
    workplace_no_tasks: 'لا توجد مهام',
    workplace_no_tasks_hint: 'أرسل مهمة أولاً لإنشاء مساحة عمل',
    workplace_pick_task: 'اختر مهمة',
    workplace_pick_subtitle: 'سيُنشئ الذكاء الاصطناعي خطة تنفيذ كاملة مع مهام فرعية ونصائح',
    workplace_search_tasks: 'بحث في المهام...',
    workplace_generating: 'جاري إنشاء الخطة...',
    workplace_open: 'فتح',
    workplace_regenerate: 'إعادة إنشاء',
    workplace_back: 'مساحات العمل',
    workplace_overall_plan: 'خطة التنفيذ',
    workplace_tips: 'نصائح وأفضل الممارسات',
    workplace_benchmarks: 'معايير القطاع المصرفي',
    workplace_dora: 'تقديرات DORA',
    workplace_progress: 'التقدم',
    workplace_est_hours: 'الساعات المقدرة',
    workplace_subtasks: 'مهام فرعية',
    workplace_total: 'إجمالي المساحات',
    workplace_active: 'نشط',
    workplace_completed: 'مكتمل',
    workplace_loading: 'جاري التحميل...',
    workplace_cancel: 'إلغاء',
    workplace_status_active: 'نشط',
    workplace_status_completed: 'مكتمل',
    workplace_status_archived: 'مؤرشف',
    subtask_todo: 'للتنفيذ',
    subtask_in_progress: 'قيد التنفيذ',
    subtask_done: 'مكتمل',
    subtask_low: 'منخفض',
    subtask_medium: 'متوسط',
    subtask_high: 'مرتفع',
    subtask_tips: 'نصائح',
    subtask_hide_tips: 'إخفاء',
    subtask_actual: 'فعلي',
    benchmark_source: 'المصدر',
    dora_change_risk: 'مخاطر التغيير',
    dora_recovery_plan: 'خطة الاسترداد',
  },
};

function loadCachedAutoUI(lang) {
  try { return JSON.parse(localStorage.getItem(`priorit_autoui_${lang}`) || '{}'); } catch { return {}; }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(
    localStorage.getItem('priorit_lang') || 'en'
  );
  const [autoUI, setAutoUI] = useState(() => loadCachedAutoUI(localStorage.getItem('priorit_lang') || 'en'));

  const setLanguage = useCallback((lang) => {
    clearTranslationCache();
    setLanguageState(lang);
    localStorage.setItem('priorit_lang', lang);
    setAutoUI(loadCachedAutoUI(lang));
  }, []);

  // Auto-translate any UI_LABELS keys that have no manual translation in the current language
  useEffect(() => {
    if (language === 'en') { setAutoUI({}); return; }

    const enLabels   = UI_LABELS['en'];
    const langLabels = UI_LABELS[language] || {};
    const missingKeys = Object.keys(enLabels).filter(k => !langLabels[k]);
    if (missingKeys.length === 0) return;

    const cached = loadCachedAutoUI(language);
    const toTranslate = missingKeys.filter(k => !cached[k]);

    // Apply whatever we already have cached immediately
    if (Object.keys(cached).length > 0) setAutoUI(cached);
    if (toTranslate.length === 0) return;

    translateBatch(toTranslate.map(k => enLabels[k]), language).then(results => {
      const merged = { ...cached };
      toTranslate.forEach((key, i) => { merged[key] = results[i] || enLabels[key]; });
      setAutoUI(merged);
      localStorage.setItem(`priorit_autoui_${language}`, JSON.stringify(merged));
    });
  }, [language]);

  // Apply RTL for Arabic + set lang attribute
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // t() — manual translation → auto-translated fallback → English fallback
  const t = useCallback((key) => {
    return UI_LABELS[language]?.[key]
      || autoUI[key]
      || UI_LABELS['en']?.[key]
      || key;
  }, [language, autoUI]);

  // autoTranslate() — translates any dynamic string (AI text, etc.)
  // Returns a promise — use with useState + useEffect in components
  const autoTranslate = useCallback(async (text) => {
    if (!text || language === 'en') return text;
    return await translateText(text, language);
  }, [language]);

  // autoTranslateBatch() — translates multiple strings at once
  const autoTranslateBatch = useCallback(async (texts) => {
    if (language === 'en') return texts;
    return await translateBatch(texts, language);
  }, [language]);

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{
      language, setLanguage, t,
      autoTranslate, autoTranslateBatch, isRTL,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

// Auto-translates all AI-generated text fields in a task object.
// Pass active=false (e.g. when card is collapsed) to defer until needed.
const TASK_TEXT_FIELDS = ['description', 'kanoReasoning', 'moscowReasoning', 'industryContext'];

export function useTranslatedTask(task, active = true) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(task);

  useEffect(() => {
    if (!task) return;
    if (language === 'en' || !active) {
      setTranslated(task);
      return;
    }
    const texts = TASK_TEXT_FIELDS.map(f => task[f] || '');
    translateBatch(texts, language).then(results => {
      setTranslated({
        ...task,
        ...Object.fromEntries(TASK_TEXT_FIELDS.map((f, i) => [f, results[i] || task[f]])),
      });
    });
  }, [task?.id, language, active]);

  return translated;
}

// Auto-translates all AI-generated content in a workplace object (subtasks, tips, benchmarks, plans).
export function useTranslatedWorkplace(workplace) {
  const { language } = useLanguage();
  const [txMap, setTxMap] = useState(null);

  useEffect(() => {
    if (!workplace || language === 'en') { setTxMap(null); return; }

    const texts = [], paths = [];
    const push = (text, path) => { if (text) { texts.push(text); paths.push(path); } };

    push(workplace.overallPlan,  'overallPlan');
    push(workplace.recoveryPlan, 'recoveryPlan');
    (workplace.tips || []).forEach((tip, i) => push(tip, `tip:${i}`));
    (workplace.bankingBenchmarks || []).forEach((bm, b) => {
      push(bm.feature, `bm:${b}:feature`);
      push(bm.outcome, `bm:${b}:outcome`);
    });
    (workplace.subtasks || []).forEach((st, s) => {
      push(st.title,       `st:${s}:title`);
      push(st.description, `st:${s}:description`);
      (st.tips || []).forEach((tip, ti) => push(tip, `st:${s}:tip:${ti}`));
    });

    if (!texts.length) return;

    translateBatch(texts, language).then(results => {
      const map = {};
      paths.forEach((p, i) => { if (results[i]) map[p] = results[i]; });
      setTxMap(map);
    });
  }, [workplace?.id, language]);

  if (!workplace || language === 'en' || !txMap) return workplace;

  const get = (key, fallback) => txMap[key] || fallback;
  return {
    ...workplace,
    overallPlan:  get('overallPlan',  workplace.overallPlan),
    recoveryPlan: get('recoveryPlan', workplace.recoveryPlan),
    tips: (workplace.tips || []).map((tip, i) => get(`tip:${i}`, tip)),
    bankingBenchmarks: (workplace.bankingBenchmarks || []).map((bm, b) => ({
      ...bm,
      feature: get(`bm:${b}:feature`, bm.feature),
      outcome: get(`bm:${b}:outcome`, bm.outcome),
    })),
    subtasks: (workplace.subtasks || []).map((st, s) => ({
      ...st,
      title:       get(`st:${s}:title`,       st.title),
      description: get(`st:${s}:description`, st.description),
      tips: (st.tips || []).map((tip, ti) => get(`st:${s}:tip:${ti}`, tip)),
    })),
  };
}

// Auto-translates all AI-generated text in compare results (reasoning, recommendation, analysis).
export function useTranslatedCompareResults(results) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(results);

  useEffect(() => {
    if (!results || language === 'en') { setTranslated(results); return; }

    const texts = [], paths = [];
    const push = (text, path) => { if (text) { texts.push(text); paths.push(path); } };

    push(results.recommendation,  'recommendation');
    push(results.overallAnalysis, 'overallAnalysis');
    (results.rankedItems || []).forEach((item, i) => {
      push(item.kanoReasoning,   `item:${i}:kanoReasoning`);
      push(item.moscowReasoning, `item:${i}:moscowReasoning`);
      push(item.reasoning,       `item:${i}:reasoning`);
      push(item.versusNext,      `item:${i}:versusNext`);
      push(item.title,           `item:${i}:title`);
    });

    if (!texts.length) return;

    translateBatch(texts, language).then(txResults => {
      const map = {};
      paths.forEach((p, i) => { if (txResults[i]) map[p] = txResults[i]; });
      setTranslated({
        ...results,
        recommendation:  map['recommendation']  || results.recommendation,
        overallAnalysis: map['overallAnalysis'] || results.overallAnalysis,
        rankedItems: (results.rankedItems || []).map((item, i) => ({
          ...item,
          kanoReasoning:   map[`item:${i}:kanoReasoning`]   || item.kanoReasoning,
          moscowReasoning: map[`item:${i}:moscowReasoning`] || item.moscowReasoning,
          reasoning:       map[`item:${i}:reasoning`]       || item.reasoning,
          versusNext:      map[`item:${i}:versusNext`]      || item.versusNext,
          title:           map[`item:${i}:title`]           || item.title,
        })),
      });
    });
  }, [results, language]);

  return translated;
}