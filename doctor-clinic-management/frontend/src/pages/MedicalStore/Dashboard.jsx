import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { StatCard, Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { Loader } from '../../components/Loader/Loader';
import { Alert } from '../../components/Alerts/Alerts';
import * as pharmacyApi from '../../services/api/pharmacy';
import * as prescriptionsApi from '../../services/api/prescriptions';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { resolveProfile } from '../../utils/profile';
import './Dashboard.css';
import { useTranslation } from '../../i18n/LanguageContext';

// Backend defaults the low-stock threshold to 10 too (see
// pharmacy-service/routes/inventory_routes.py LOW_STOCK_DEFAULT_THRESHOLD),
// this just makes it explicit so the dashboard and MedicineInventory page
// agree on what "low" means.
const LOW_STOCK_THRESHOLD = 10;

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const profile = resolveProfile(user) || {};
  const storeName = profile.storeName || profile.name;
  const storeId = user?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inventoryCount, setInventoryCount] = useState(0);
  const [lowStock, setLowStock] = useState([]);
  const [pendingPrx, setPendingPrx] = useState([]);
  const [dispensedPrx, setDispensedPrx] = useState([]);
  const [doctorsById, setDoctorsById] = useState({});
  const [patientsById, setPatientsById] = useState({});

  const loadDashboard = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    setError('');
    try {
      const [inventory, lowStockRes, pending, active, dispensed, doctors, patients] = await Promise.all([
        pharmacyApi.getStoreInventory(storeId),
        pharmacyApi.getLowStock({ storeId, threshold: LOW_STOCK_THRESHOLD }),
        // Pending/active prescriptions aren't yet assigned to a store (storeId
        // is only set once dispensed), so any store can dispense any of them -
        // fetch unscoped, same as the old mock's (also unscoped) behavior.
        prescriptionsApi.getPrescriptions({ status: 'pending' }),
        prescriptionsApi.getPrescriptions({ status: 'active' }),
        pharmacyApi.getDispensedForStore(storeId),
        clinicalApi.getDoctors(),
        clinicalApi.getPatients(),
      ]);

      setInventoryCount((inventory || []).length);
      setLowStock(lowStockRes?.inventory || []);
      setPendingPrx([...(pending || []), ...(active || [])]);
      setDispensedPrx(dispensed || []);

      const dMap = {};
      (doctors || []).forEach((d) => { dMap[d.id] = d.name; });
      setDoctorsById(dMap);

      const pMap = {};
      (patients || []).forEach((p) => { pMap[p.id] = p.name; });
      setPatientsById(pMap);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dashboard data'));
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const doctorName = (id) => doctorsById[id] || 'Unknown Doctor';
  const patientName = (id) => patientsById[id] || 'Unknown Patient';

  return (
    <div className="page ms-dashboard">
      <div className="page-header">
        <h1>{t('pg.medicalStore.dashboard.welcome')}, {storeName}</h1>
        <p className="text-muted">{profile.storeCode || profile.id}{profile.email ? ` | ${profile.email}` : ''}{profile.floor ? ` | ${t('floor')}: ${profile.floor}` : ''}{profile.address ? ` | ${profile.address}` : ''}</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading ? (
        <Loader size="lg" text={t('common.loading') || 'Loading...'} />
      ) : (
        <>
          <div className="stats-row">
            <StatCard title={t('pg.medicalStore.dashboard.statPendingPrescriptions')} value={pendingPrx.length} icon="📋" color="#F97316" />
            <StatCard title={t('pg.medicalStore.dashboard.statDispensedToday')} value={dispensedPrx.length} icon="✅" color="#22C55E" />
            <StatCard title={t('pg.medicalStore.dashboard.statTotalInventory')} value={inventoryCount} icon="📦" color="#38BDF8" />
            <StatCard title={t('pg.medicalStore.dashboard.statLowStock')} value={lowStock.length} icon="⚠️" color="#EF4444" />
          </div>

          <div className="quick-actions">
            <Link to="/medical-store/pending"><Button icon="📋">{t('pg.medicalStore.dashboard.viewPending')}</Button></Link>
            <Link to="/medical-store/inventory"><Button variant="outline" icon="📦">{t('pg.medicalStore.dashboard.checkInventory')}</Button></Link>
            <Link to="/medical-store/inventory"><Button variant="outline" icon="➕">{t('pg.medicalStore.dashboard.addMedicine')}</Button></Link>
          </div>

          <div className="ms-grid">
            <Card title={t('pg.medicalStore.dashboard.pendingPrescriptionsTitle')} subtitle={`${pendingPrx.length} awaiting dispense`}>
              {pendingPrx.length === 0 ? (
                <p className="text-muted">{t('pg.medicalStore.dashboard.pendingPrescriptionsEmpty')}</p>
              ) : (
                <div className="ms-pending-list">
                  {pendingPrx.map((prx) => (
                    <div key={prx.id} className="ms-pending-item">
                       <div className="ms-pending-info">
                        <span className="ms-pending-patient">{patientName(prx.patientId)}</span>
                        <span className="text-muted">{doctorName(prx.doctorId)} | {formatDate(prx.date)}</span>
                        <span className="text-muted">{prx.medicines.length} {t('pg.medicalStore.dashboard.medicines')}</span>
                      </div>
                      <Link to={`/medical-store/pending`}><Button size="sm">{t('pg.medicalStore.dashboard.dispense')}</Button></Link>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title={t('pg.medicalStore.dashboard.lowStockTitle')}>
              {lowStock.length === 0 ? (
                <p className="text-muted">{t('pg.medicalStore.dashboard.lowStockEmpty')}</p>
              ) : (
                <div className="ms-low-stock">
                  {lowStock.map((med) => (
                    <div key={med.id} className="ms-low-item">
                      <div className="ms-low-info">
                        <span className="ms-low-name">{med.name}</span>
                        <span className="ms-low-qty" style={{ color: med.stock < 5 ? 'var(--color-error)' : 'var(--color-warning)' }}>
                          {t('pg.medicalStore.dashboard.stock')} {med.stock}
                        </span>
                      </div>
                      <Link to="/medical-store/inventory"><Button size="sm" variant="outline">{t('pg.medicalStore.dashboard.restock')}</Button></Link>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card title={t('pg.medicalStore.dashboard.recentlyDispensedTitle')}>
            {dispensedPrx.length === 0 ? (
              <p className="text-muted">{t('pg.medicalStore.dashboard.recentlyDispensedEmpty')}</p>
            ) : (
              <div className="ms-dispensed-list">
                {dispensedPrx.slice(0, 5).map((prx) => (
                  <div key={prx.id} className="ms-dispensed-item">
                    <span>{patientName(prx.patientId)}</span>
                    <span className="text-muted">{doctorName(prx.doctorId)}</span>
                    <span className="text-muted">{formatDate(prx.date)}</span>
                    <span className={`status-badge status-dispensed`}>{t('pg.medicalStore.dashboard.dispensed')}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
