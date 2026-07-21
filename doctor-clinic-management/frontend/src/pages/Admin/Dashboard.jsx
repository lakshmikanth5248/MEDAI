import React, { useState, useEffect, useCallback } from 'react';
import { StatCard, Card } from '../../components/Cards';
import { DataTable } from '../../components/Tables';
import { Input, Select } from '../../components/Forms';
import { Button } from '../../components/Buttons';
import { Modal } from '../../components/Modal';
import { Alert } from '../../components/Alerts/Alerts';
import { PageLoader } from '../../components/Loader/Loader';
import * as coreApi from '../../services/api/core';
import * as clinicalApi from '../../services/api/clinical';
import * as billingApi from '../../services/api/billing';
import * as authApi from '../../services/api/auth';
import { getErrorMessage } from '../../services/apiError';
import { useAuth } from '../../context/AuthContext';
import { resolveProfile } from '../../utils/profile';
import { formatDate } from '../../utils/helpers';
import './Dashboard.css';
import { useTranslation } from '../../i18n/LanguageContext';

const STAFF_ROLES = [
  { key: 'doctor', labelKey: 'role.doctor' },
  { key: 'reception', labelKey: 'role.reception' },
  { key: 'medical_store', labelKey: 'role.medical_store' },
  { key: 'admin', labelKey: 'role.admin' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

// Field definitions per role for the "register staff" modal - departments is
// injected at render time (options need the real department id/name list).
const roleFields = (departments) => ({
  doctor: [
    { name: 'name', label: 'name', type: 'text', required: true },
    { name: 'age', label: 'age', type: 'number' },
    { name: 'gender', label: 'gender', type: 'select', options: GENDER_OPTIONS },
    { name: 'departmentId', label: 'department', type: 'select', options: departments.map((d) => ({ value: d.id, label: d.name })) },
    { name: 'specialization', label: 'specialization', type: 'text' },
    { name: 'experience', label: 'experience', type: 'number' },
    { name: 'fee', label: 'fee', type: 'number' },
    { name: 'phone', label: 'phone', type: 'text' },
    { name: 'email', label: 'email', type: 'email', required: true },
    { name: 'address', label: 'address', type: 'text' },
  ],
  reception: [
    { name: 'name', label: 'name', type: 'text', required: true },
    { name: 'phone', label: 'phone', type: 'text' },
    { name: 'email', label: 'email', type: 'email', required: true },
    { name: 'floor', label: 'floor', type: 'text' },
    { name: 'shift', label: 'shift', type: 'text' },
  ],
  medical_store: [
    { name: 'storeName', label: 'storeName', type: 'text', required: true },
    { name: 'name', label: 'name', type: 'text' },
    { name: 'phone', label: 'phone', type: 'text' },
    { name: 'email', label: 'email', type: 'email', required: true },
    { name: 'address', label: 'address', type: 'text' },
  ],
  admin: [
    { name: 'name', label: 'name', type: 'text', required: true },
    { name: 'email', label: 'email', type: 'email', required: true },
    { name: 'phone', label: 'phone', type: 'text' },
  ],
});

// Simple relative-time formatter for the activity feed (backend only gives
// an ISO timestamp, not a pre-computed "5 minutes ago" string).
function timeAgo(iso) {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const profile = resolveProfile(user) || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [bills, setBills] = useState([]);
  const [activity, setActivity] = useState([]);
  const [activeStaffCount, setActiveStaffCount] = useState(null);

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffRole, setStaffRole] = useState('doctor');
  const [staffForm, setStaffForm] = useState({});
  const [savedCreds, setSavedCreds] = useState(null);
  const [staffError, setStaffError] = useState(null);
  const [staffSaving, setStaffSaving] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, patientsRes, doctorsRes, appointmentsRes, departmentsRes, billsRes, activityRes, usersRes] = await Promise.all([
        coreApi.getDashboardSummary(),
        clinicalApi.getPatients(),
        clinicalApi.getDoctors(),
        clinicalApi.getAppointments(),
        clinicalApi.getDepartments(),
        billingApi.getBills(),
        coreApi.getActivityLog({ limit: 6 }),
        authApi.getUsers(),
      ]);
      setSummary(summaryRes);
      setPatients(patientsRes || []);
      setDoctors(doctorsRes || []);
      setAppointments(appointmentsRes || []);
      setDepartments(departmentsRes || []);
      setBills(billsRes || []);
      setActivity(activityRes || []);
      setActiveStaffCount((usersRes || []).filter((u) => u.status === 'active').length);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dashboard data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const openStaffModal = (role) => {
    setStaffRole(role);
    setStaffForm({});
    setSavedCreds(null);
    setStaffError(null);
    setStaffModalOpen(true);
  };

  const handleStaffSave = async () => {
    const fields = roleFields(departments)[staffRole];
    const requiredMissing = fields.some((f) => f.required && !String(staffForm[f.name] || '').trim());
    if (requiredMissing) {
      setStaffError('Please fill in all required fields.');
      return;
    }
    setStaffSaving(true);
    setStaffError(null);
    try {
      const payload = { role: staffRole, ...staffForm };
      if (staffRole === 'doctor' && payload.departmentId) payload.departmentId = Number(payload.departmentId);
      const res = await authApi.createStaff(payload);
      setSavedCreds({ id: res.user?.uid, password: res.defaultPassword });
      loadDashboard();
    } catch (err) {
      setStaffError(getErrorMessage(err, 'Failed to create staff account'));
    } finally {
      setStaffSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  const totalRevenue = summary?.revenue || 0;
  const pendingBillsCount = bills.filter((b) => b.status === 'pending').length;

  const monthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthlyAppointments = appointments.filter((a) => a.date?.startsWith(monthPrefix)).length;
  const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
  const totalDepartments = departments.length;
  const doctorsPerDept = departments.length ? (doctors.length / departments.length).toFixed(1) : '0';
  const newPatientsThisMonth = patients.filter((p) => p.registeredDate?.startsWith(monthPrefix)).length;

  const chartTotals = [
    {
      title: t('monthlyAppointments'),
      total: monthlyAppointments,
      sub: `${appointments.length} ${t('total')} · ${completedAppointments} ${t('completed')}`,
      icon: '📅',
      color: '#38BDF8',
      visual: 'line',
    },
    {
      title: t('revenue'),
      total: `₹${totalRevenue.toLocaleString()}`,
      sub: `${bills.length} ${t('bills')} · ${pendingBillsCount} pending`,
      icon: '💰',
      color: '#F97316',
      visual: 'bar',
    },
    {
      title: t('deptDistribution'),
      total: totalDepartments,
      sub: `${doctors.length} ${t('sidebar.doctors')} · ${doctorsPerDept} ${t('avgPerDept')}`,
      icon: '🏛️',
      color: '#14B8A6',
      visual: 'pie',
    },
    {
      title: t('patientGrowth'),
      total: `+${newPatientsThisMonth}`,
      sub: `${patients.length} ${t('total')}`,
      icon: '👥',
      color: '#22C55E',
      visual: 'area',
    },
  ];

  const patientColumns = [
    { key: 'patientId', label: t('colId') },
    { key: 'name', label: t('colName') },
    { key: 'gender', label: t('colGender') },
    { key: 'phone', label: t('colPhone') },
    { key: 'registeredDate', label: t('colRegistered'), render: (v) => formatDate(v) },
  ];

  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.registeredDate || 0) - new Date(a.registeredDate || 0))
    .slice(0, 5);

  const health = [
    { label: t('healthServerStatus'), value: t('healthOnline'), color: '#22C55E' },
    { label: t('healthDatabase'), value: t('healthConnected'), color: '#22C55E' },
    { label: t('healthSmsService'), value: t('common.active'), color: '#22C55E' },
  ];

  const fields = roleFields(departments)[staffRole];

  return (
    <div className="page admin-dashboard">
      <div className="page-header">
        <h1>{t('overview')}{profile.name ? `, ${profile.name}` : ''}</h1>
        <p className="text-muted">{profile.adminId || profile.id}{profile.email ? ` | ${profile.email}` : ''}{profile.phone ? ` | ${profile.phone}` : ''}</p>
      </div>

      {error && <Alert type="error" message={error} dismissible={false} />}

      <div className="admin-stats-grid">
        <StatCard title={t('totalPatients')} value={summary?.totalPatients ?? patients.length} icon="👥" color="#38BDF8" />
        <StatCard title={t('totalDoctors')} value={summary?.totalDoctors ?? doctors.length} icon="👨‍⚕️" color="#8B5CF6" />
        <StatCard title={t('totalAppointments')} value={appointments.length} icon="📅" color="#22C55E" />
        <StatCard title={t('revenueTotal')} value={`₹${totalRevenue.toLocaleString()}`} icon="💰" color="#F97316" />
        <StatCard title={t('todaysAppointments')} value={summary?.todayAppointments ?? 0} icon="📋" color="#EC4899" />
        <StatCard title={t('pendingBills')} value={pendingBillsCount} icon="🧾" color="#F59E0B" />
        <StatCard title={t('sidebar.departments')} value={totalDepartments} icon="🏛️" color="#14B8A6" />
        <StatCard title={t('activeUsers')} value={activeStaffCount ?? '—'} icon="👤" color="#6366F1" />
      </div>

      <Card title={t('staffRegister')}>
        <p className="text-muted staff-register-hint">{t('staffRegisterHint')}</p>
        <div className="staff-register-grid">
          {STAFF_ROLES.map((r) => (
            <button type="button" className="staff-register-btn" key={r.key} onClick={() => openStaffModal(r.key)}>
              <span className="staff-register-icon">{r.key === 'doctor' ? '👨‍⚕️' : r.key === 'reception' ? '🧑‍💼' : r.key === 'medical_store' ? '💊' : '👑'}</span>
              <span>{t(r.labelKey)}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="admin-charts">
        {chartTotals.map((c) => (
          <Card title={c.title} className="chart-card" key={c.title}>
            <div className="chart-total" style={{ color: c.color }}>
              <span className="chart-total-icon">{c.icon}</span>
              <span className="chart-total-value">{c.total}</span>
            </div>
            <p className="chart-total-sub">{c.sub}</p>
            <div className="chart-placeholder">
              <div className={`chart-${c.visual}`}></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="admin-grid">
        <Card title={t('recentRegistrations')}>
          <DataTable columns={patientColumns} data={recentPatients} />
        </Card>

        <Card title={t('systemHealth')}>
          <div className="health-list">
            {health.map((h, i) => (
              <div key={i} className="health-item">
                <div className="health-indicator" style={{ backgroundColor: h.color }} />
                <span className="health-label">{h.label}</span>
                <span className="health-value" style={{ color: h.color }}>{h.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title={t('recentActivity')}>
        <div className="activity-feed">
          {activity.length === 0 && <p className="text-muted">No recent activity.</p>}
          {activity.map((act) => (
            <div key={act.id} className="activity-item">
              <div className="activity-dot" />
              <div className="activity-content">
                <p>{act.actorName} {act.actionType}{act.targetDescription ? ` — ${act.targetDescription}` : ''}</p>
                <span className="activity-time">{timeAgo(act.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal isOpen={staffModalOpen} onClose={() => setStaffModalOpen(false)} title={`${t('staffRegister')} · ${t(STAFF_ROLES.find((r) => r.key === staffRole)?.labelKey)}`}>
        {savedCreds ? (
          <div className="staff-creds">
            <div className="staff-saved-msg">{t('created')}</div>
            <div className="cred-row"><span>{t('generatedId')}</span><strong>{savedCreds.id}</strong></div>
            <div className="cred-row"><span>{t('generatedPassword')}</span><strong>{savedCreds.password}</strong></div>
            <p className="cred-note">{t('loginWith')}</p>
            <div className="staff-form-actions">
              <Button onClick={() => setStaffModalOpen(false)}>{t('cancel')}</Button>
            </div>
          </div>
        ) : (
          <div className="staff-form">
            {staffError && <Alert type="error" message={staffError} dismissible={false} />}
            {fields.map((f) =>
              f.type === 'select' ? (
                <Select
                  key={f.name}
                  label={t(f.label)}
                  value={staffForm[f.name] || ''}
                  onChange={(e) => setStaffForm({ ...staffForm, [f.name]: e.target.value })}
                  options={f.options}
                  required={f.required}
                  placeholder={t('doctors.select')}
                />
              ) : (
                <Input
                  key={f.name}
                  label={t(f.label)}
                  type={f.type}
                  value={staffForm[f.name] || ''}
                  onChange={(e) => setStaffForm({ ...staffForm, [f.name]: e.target.value })}
                  required={f.required}
                />
              )
            )}
            <div className="staff-form-actions">
              <Button variant="secondary" onClick={() => setStaffModalOpen(false)}>{t('cancel')}</Button>
              <Button onClick={handleStaffSave} disabled={staffSaving}>{staffSaving ? '...' : t('add')}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
