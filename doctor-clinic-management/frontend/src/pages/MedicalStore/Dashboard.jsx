import React from 'react';
import { Link } from 'react-router-dom';
import { StatCard, Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { currentMedicalStore, prescriptions, medicineInventory, doctors } from '../../utils/mockData';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import './Dashboard.css';

const Dashboard = () => {
  const pendingPrx = prescriptions.filter((p) => p.status === 'pending' || p.status === 'active');
  const dispensedPrx = prescriptions.filter((p) => p.status === 'dispensed');
  const lowStock = medicineInventory.filter((m) => m.stock < 10);

  const doctorName = (id) => doctors.find((d) => d.id === id)?.name || 'Unknown Doctor';

  return (
    <div className="page ms-dashboard">
      <div className="page-header">
        <h1>Welcome, {currentMedicalStore.name}</h1>
        <p className="text-muted">{currentMedicalStore.address}</p>
      </div>

      <div className="stats-row">
        <StatCard title="Pending Prescriptions" value={pendingPrx.length} icon="📋" color="#F97316" />
        <StatCard title="Dispensed Today" value={dispensedPrx.length} icon="✅" color="#22C55E" />
        <StatCard title="Total Inventory Items" value={medicineInventory.length} icon="📦" color="#38BDF8" />
        <StatCard title="Low Stock Items" value={lowStock.length} icon="⚠️" color="#EF4444" />
      </div>

      <div className="quick-actions">
        <Link to="/medical-store/pending"><Button icon="📋">View Pending Prescriptions</Button></Link>
        <Link to="/medical-store/inventory"><Button variant="outline" icon="📦">Check Inventory</Button></Link>
        <Link to="/medical-store/inventory"><Button variant="outline" icon="➕">Add Medicine</Button></Link>
      </div>

      <div className="ms-grid">
        <Card title="Pending Prescriptions" subtitle={`${pendingPrx.length} awaiting dispense`}>
          {pendingPrx.length === 0 ? (
            <p className="text-muted">No pending prescriptions.</p>
          ) : (
            <div className="ms-pending-list">
              {pendingPrx.map((prx) => (
                <div key={prx.id} className="ms-pending-item">
                   <div className="ms-pending-info">
                    <span className="ms-pending-patient">{prx.patientName}</span>
                    <span className="text-muted">{doctorName(prx.doctorId)} | {formatDate(prx.date)}</span>
                    <span className="text-muted">{prx.medicines.length} medicines</span>
                  </div>
                  <Link to={`/medical-store/pending`}><Button size="sm">Dispense</Button></Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Low Stock Alerts">
          {lowStock.length === 0 ? (
            <p className="text-muted">All items are well-stocked.</p>
          ) : (
            <div className="ms-low-stock">
              {lowStock.map((med) => (
                <div key={med.id} className="ms-low-item">
                  <div className="ms-low-info">
                    <span className="ms-low-name">{med.name}</span>
                    <span className="ms-low-qty" style={{ color: med.stock < 5 ? 'var(--color-error)' : 'var(--color-warning)' }}>
                      Stock: {med.stock}
                    </span>
                  </div>
                  <Link to="/medical-store/inventory"><Button size="sm" variant="outline">Restock</Button></Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Recently Dispensed">
        {dispensedPrx.length === 0 ? (
          <p className="text-muted">No items dispensed today.</p>
        ) : (
          <div className="ms-dispensed-list">
            {dispensedPrx.slice(0, 5).map((prx) => (
              <div key={prx.id} className="ms-dispensed-item">
                <span>{prx.patientName}</span>
                <span className="text-muted">{prx.doctorName}</span>
                <span className="text-muted">{formatDate(prx.date)}</span>
                <span className={`status-badge status-dispensed`}>Dispensed</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
