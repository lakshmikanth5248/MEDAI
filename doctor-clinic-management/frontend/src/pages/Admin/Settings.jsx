import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Select, Textarea } from '../../components/Forms';
import { Loader } from '../../components/Loader';
import * as coreApi from '../../services/api/core';
import { getErrorMessage } from '../../services/apiError';
import './Settings.css';
import { useTranslation } from '../../i18n/LanguageContext';

const DEFAULTS = {
  clinicName: 'City Hospital', clinicAddress: '1 Hospital Road, Mumbai - 400001',
  clinicPhone: '022-23456789', clinicEmail: 'info@cityhospital.com',
  smsEnabled: true, emailEnabled: true, reminderHours: 24, reminderFrequency: 'once',
  passwordPolicy: 'strong', sessionTimeoutMinutes: 30, darkMode: false,
};

const Settings = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('general');
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const settings = await coreApi.getSettings();
      setForm((prev) => ({ ...prev, ...settings }));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load settings'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await coreApi.updateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { key: 'general', label: t('settings.secGeneral') },
    { key: 'notifications', label: t('settings.secNotifications') },
    { key: 'security', label: t('settings.secSecurity') },
    { key: 'appearance', label: t('settings.secAppearance') },
  ];

  const SaveBar = () => (
    <div className="settings-save">
      <Button onClick={handleSave} disabled={saving}>{saving ? '...' : 'Save Settings'}</Button>
      {saved && <span className="text-success" style={{ marginLeft: 12 }}>Saved</span>}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <Card title="General Settings">
            <div className="settings-form">
              <Input label="Clinic Name" name="clinicName" value={form.clinicName} onChange={(e) => set('clinicName', e.target.value)} />
              <Textarea label="Address" name="clinicAddress" value={form.clinicAddress} onChange={(e) => set('clinicAddress', e.target.value)} rows={2} />
              <div className="form-row">
                <Input label="Phone" name="clinicPhone" value={form.clinicPhone} onChange={(e) => set('clinicPhone', e.target.value)} />
                <Input label="Email" name="clinicEmail" value={form.clinicEmail} onChange={(e) => set('clinicEmail', e.target.value)} />
              </div>
              <SaveBar />
            </div>
          </Card>
        );
      case 'notifications':
        return (
          <Card title="Notification Settings">
            <div className="settings-form">
              <div className="settings-toggle-row">
                <div><label>SMS Notifications</label><p className="text-muted">Send SMS reminders for appointments</p></div>
                <label className="toggle-switch"><input type="checkbox" checked={form.smsEnabled} onChange={(e) => set('smsEnabled', e.target.checked)} /><span className="toggle-slider"></span></label>
              </div>
              <div className="settings-toggle-row">
                <div><label>Email Notifications</label><p className="text-muted">Send email notifications for bills and reports</p></div>
                <label className="toggle-switch"><input type="checkbox" checked={form.emailEnabled} onChange={(e) => set('emailEnabled', e.target.checked)} /><span className="toggle-slider"></span></label>
              </div>
              <div className="form-row">
                <Input label="Reminder Timing (hours before)" name="reminderHours" type="number" value={form.reminderHours} onChange={(e) => set('reminderHours', Number(e.target.value))} />
                <Select label="Reminder Frequency" name="reminderFrequency" value={form.reminderFrequency} onChange={(e) => set('reminderFrequency', e.target.value)} options={[{ value: 'once', label: 'Once' }, { value: 'twice', label: 'Twice (24hr & 2hr before)' }]} />
              </div>
              <SaveBar />
            </div>
          </Card>
        );
      case 'security':
        return (
          <Card title="Security Settings">
            <div className="settings-form">
              <Select label="Password Policy" name="passwordPolicy" value={form.passwordPolicy} onChange={(e) => set('passwordPolicy', e.target.value)} options={[{ value: 'standard', label: 'Standard (8+ chars)' }, { value: 'strong', label: 'Strong (10+ chars, special chars)' }]} />
              <Input label="Session Timeout (minutes)" name="sessionTimeoutMinutes" type="number" value={form.sessionTimeoutMinutes} onChange={(e) => set('sessionTimeoutMinutes', Number(e.target.value))} />
              <SaveBar />
            </div>
          </Card>
        );
      case 'appearance':
        return (
          <Card title="Appearance Settings">
            <div className="settings-form">
              <div className="settings-toggle-row">
                <div><label>Dark Mode</label><p className="text-muted">Toggle between light and dark theme</p></div>
                <label className="toggle-switch"><input type="checkbox" checked={form.darkMode} onChange={(e) => set('darkMode', e.target.checked)} /><span className="toggle-slider"></span></label>
              </div>
              <SaveBar />
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page settings-page">
      <div className="page-header">
        <h1>System Settings</h1>
      </div>

      {error && <p className="text-error">{error}</p>}

      <div className="settings-layout">
        <div className="settings-sidebar">
          {sections.map((s) => (
            <button key={s.key} className={`settings-nav-item ${activeSection === s.key ? 'active' : ''}`} onClick={() => setActiveSection(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="settings-content">
          {loading ? <Loader /> : renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
