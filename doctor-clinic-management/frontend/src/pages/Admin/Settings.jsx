import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Input, Select, Textarea } from '../../components/Forms';
import './Settings.css';
import { useTranslation } from '../../i18n/LanguageContext';

const Settings = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { key: 'general', label: t('pg.admin.settings.secGeneral') },
    { key: 'notifications', label: t('pg.admin.settings.secNotifications') },
    { key: 'security', label: t('pg.admin.settings.secSecurity') },
    { key: 'appearance', label: t('pg.admin.settings.secAppearance') },
    { key: 'backup', label: t('pg.admin.settings.secBackup') },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <Card title="General Settings">
            <div className="settings-form">
              <Input label="Clinic Name" name="name" value="City Hospital" onChange={() => {}} />
              <Textarea label="Address" name="address" value="1 Hospital Road, Mumbai - 400001" onChange={() => {}} rows={2} />
              <div className="form-row">
                <Input label="Phone" name="phone" value="022-23456789" onChange={() => {}} />
                <Input label="Email" name="email" value="info@cityhospital.com" onChange={() => {}} />
              </div>
              <div className="settings-logo">
                <label className="form-label">Logo</label>
                <div className="logo-upload">
                  <div className="logo-placeholder">🏥</div>
                  <Button variant="outline" size="sm">Upload Logo</Button>
                </div>
              </div>
              <div className="settings-save">
                <Button>Save Settings</Button>
              </div>
            </div>
          </Card>
        );
      case 'notifications':
        return (
          <Card title="Notification Settings">
            <div className="settings-form">
              <div className="settings-toggle-row">
                <div><label>SMS Notifications</label><p className="text-muted">Send SMS reminders for appointments</p></div>
                <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label>
              </div>
              <div className="settings-toggle-row">
                <div><label>Email Notifications</label><p className="text-muted">Send email notifications for bills and reports</p></div>
                <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label>
              </div>
              <div className="form-row">
                <Input label="Reminder Timing (hours before)" name="reminder" type="number" value="24" onChange={() => {}} />
                <Select label="Reminder Frequency" name="freq" value="once" onChange={() => {}} options={[{ value: 'once', label: 'Once' }, { value: 'twice', label: 'Twice (24hr & 2hr before)' }]} />
              </div>
              <div className="settings-save"><Button>Save Settings</Button></div>
            </div>
          </Card>
        );
      case 'security':
        return (
          <Card title="Security Settings">
            <div className="settings-form">
              <Select label="Password Policy" name="policy" value="strong" onChange={() => {}} options={[{ value: 'standard', label: 'Standard (8+ chars)' }, { value: 'strong', label: 'Strong (10+ chars, special chars)' }]} />
              <Input label="Session Timeout (minutes)" name="timeout" type="number" value="30" onChange={() => {}} />
              <div className="settings-save"><Button>Save Settings</Button></div>
            </div>
          </Card>
        );
      case 'appearance':
        return (
          <Card title="Appearance Settings">
            <div className="settings-form">
              <div className="settings-toggle-row">
                <div><label>Dark Mode</label><p className="text-muted">Toggle between light and dark theme</p></div>
                <label className="toggle-switch"><input type="checkbox" /><span className="toggle-slider"></span></label>
              </div>
              <div className="settings-save"><Button>Save Settings</Button></div>
            </div>
          </Card>
        );
      case 'backup':
        return (
          <Card title="Backup">
            <div className="settings-form">
              <div className="backup-info">
                <p><strong>Last Backup:</strong> 2024-12-25 02:00 AM</p>
                <p><strong>Backup Size:</strong> 245 MB</p>
                <p><strong>Schedule:</strong> Daily at 2:00 AM</p>
              </div>
              <div className="settings-save">
                <Button icon="📥">Manually Backup Now</Button>
                <Button variant="outline">Restore from Backup</Button>
              </div>
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

      <div className="settings-layout">
        <div className="settings-sidebar">
          {sections.map((s) => (
            <button key={s.key} className={`settings-nav-item ${activeSection === s.key ? 'active' : ''}`} onClick={() => setActiveSection(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="settings-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
