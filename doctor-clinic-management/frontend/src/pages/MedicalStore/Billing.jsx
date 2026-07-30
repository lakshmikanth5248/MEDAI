import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { Loader } from '../../components/Loader';
import { Alert } from '../../components/Alerts/Alerts';
import * as billingApi from '../../services/api/billing';
import * as clinicalApi from '../../services/api/clinical';
import { getErrorMessage } from '../../services/apiError';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import './Billing.css';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
];

const MedicalStoreBilling = () => {
  const [bills, setBills] = useState([]);
  const [patientsById, setPatientsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [billsData, patients] = await Promise.all([
        billingApi.getBills(),
        clinicalApi.getPatients(),
      ]);
      setBills(billsData || []);
      const pMap = {};
      (patients || []).forEach((p) => { pMap[p.id] = p; });
      setPatientsById(pMap);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load billing data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const patientName = (id) => patientsById[id]?.name || `Patient #${id}`;
  const patientCode = (id) => patientsById[id]?.patientId || '';

  const enriched = bills.map((b) => ({
    ...b,
    _patientName: patientName(b.patientId),
    _patientCode: patientCode(b.patientId),
  }));

  const filtered = enriched.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b._patientName.toLowerCase().includes(q) ||
      (b.billId || '').toLowerCase().includes(q) ||
      (b._patientCode || '').toLowerCase().includes(q);
    const matchStatus = !statusFilter || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
  const totalBills = bills.length;
  const paidBills = bills.filter((b) => b.status === 'paid').length;
  const pendingBills = bills.filter((b) => b.status === 'pending' || b.status === 'unpaid').length;
  const totalRevenue = bills
    .filter((b) => b.status === 'paid')
    .reduce((sum, b) => sum + (b.grandTotal || 0), 0);

  const openDetail = async (row) => {
    if (row.items) {
      setSelectedBill(row);
      return;
    }
    setDetailLoading(true);
    try {
      const full = await billingApi.getBill(row.id);
      setSelectedBill(full);
    } catch {
      setSelectedBill(row);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    { key: 'billId', label: 'Bill ID' },
    {
      key: 'patientId',
      label: 'Patient',
      render: (_, row) => (
        <span>
          {row._patientName}
          {row._patientCode && <span className="ms-bill-code"> ({row._patientCode})</span>}
        </span>
      ),
    },
    { key: 'date', label: 'Date', render: (v) => formatDate(v) },
    {
      key: 'grandTotal',
      label: 'Amount',
      render: (v) => <strong>₹{(v ?? 0).toFixed(2)}</strong>,
    },
    {
      key: 'paymentMethod',
      label: 'Payment',
      render: (v) => v ? <span className="ms-bill-method">{v}</span> : '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`status-badge ${getStatusBadgeClass(v)}`}>{v}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => { e.stopPropagation(); openDetail(row); }}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="page ms-billing-page">
      <div className="page-header">
        <h1>💰 Billing Records</h1>
        <p className="text-muted">View patient bills and payment status</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Stat Cards */}
      <div className="ms-billing-stats">
        <div className="ms-bill-stat-card ms-stat-total">
          <div className="ms-stat-icon">🧾</div>
          <div className="ms-stat-info">
            <div className="ms-stat-value">{totalBills}</div>
            <div className="ms-stat-label">Total Bills</div>
          </div>
        </div>
        <div className="ms-bill-stat-card ms-stat-paid">
          <div className="ms-stat-icon">✅</div>
          <div className="ms-stat-info">
            <div className="ms-stat-value">{paidBills}</div>
            <div className="ms-stat-label">Paid</div>
          </div>
        </div>
        <div className="ms-bill-stat-card ms-stat-pending">
          <div className="ms-stat-icon">⏳</div>
          <div className="ms-stat-info">
            <div className="ms-stat-value">{pendingBills}</div>
            <div className="ms-stat-label">Pending / Unpaid</div>
          </div>
        </div>
        <div className="ms-bill-stat-card ms-stat-revenue">
          <div className="ms-stat-icon">💵</div>
          <div className="ms-stat-info">
            <div className="ms-stat-value">₹{totalRevenue.toFixed(0)}</div>
            <div className="ms-stat-label">Total Revenue (Paid)</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="ms-billing-filters">
        <Input
          name="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by patient name, bill ID..."
        />
        <Select
          name="status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="All Statuses"
          options={STATUS_OPTIONS}
        />
        <Button variant="outline" size="sm" onClick={load}>
          🔄 Refresh
        </Button>
      </div>

      <Card>
        {loading ? (
          <Loader size="md" text="Loading bills..." />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={openDetail}
            emptyMessage="No billing records found."
          />
        )}
      </Card>

      {/* Bill Detail Modal */}
      <Modal
        isOpen={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        title={`Bill Details — ${selectedBill?.billId || ''}`}
        size="lg"
      >
        {detailLoading ? (
          <Loader size="sm" text="Loading details..." />
        ) : selectedBill && (
          <div className="ms-bill-detail">
            {/* Header info */}
            <div className="ms-bill-detail-header">
              <div className="ms-bill-detail-row">
                <span className="ms-bill-detail-label">Bill ID</span>
                <span className="ms-bill-detail-value">{selectedBill.billId}</span>
              </div>
              <div className="ms-bill-detail-row">
                <span className="ms-bill-detail-label">Patient</span>
                <span className="ms-bill-detail-value">
                  {patientName(selectedBill.patientId)}
                  {patientCode(selectedBill.patientId) &&
                    ` (${patientCode(selectedBill.patientId)})`}
                </span>
              </div>
              <div className="ms-bill-detail-row">
                <span className="ms-bill-detail-label">Date</span>
                <span className="ms-bill-detail-value">{formatDate(selectedBill.date)}</span>
              </div>
              <div className="ms-bill-detail-row">
                <span className="ms-bill-detail-label">Status</span>
                <span>
                  <span className={`status-badge ${getStatusBadgeClass(selectedBill.status)}`}>
                    {selectedBill.status}
                  </span>
                </span>
              </div>
              <div className="ms-bill-detail-row">
                <span className="ms-bill-detail-label">Payment Method</span>
                <span className="ms-bill-detail-value">{selectedBill.paymentMethod || '—'}</span>
              </div>
              {selectedBill.notes && (
                <div className="ms-bill-detail-row">
                  <span className="ms-bill-detail-label">Notes</span>
                  <span className="ms-bill-detail-value">{selectedBill.notes}</span>
                </div>
              )}
            </div>

            {/* Line items */}
            {selectedBill.items && selectedBill.items.length > 0 && (
              <div className="ms-bill-items-section">
                <h4>Bill Items</h4>
                <table className="ms-bill-items-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items.map((item, i) => (
                      <tr key={item.id || i}>
                        <td>{i + 1}</td>
                        <td>{item.description}</td>
                        <td>{item.quantity}</td>
                        <td>₹{(item.rate ?? 0).toFixed(2)}</td>
                        <td>₹{(item.amount ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            <div className="ms-bill-totals">
              <div className="ms-bill-total-row">
                <span>Subtotal</span>
                <span>₹{(selectedBill.subtotal ?? 0).toFixed(2)}</span>
              </div>
              {(selectedBill.discountAmt ?? 0) > 0 && (
                <div className="ms-bill-total-row">
                  <span>Discount</span>
                  <span className="text-success">-₹{(selectedBill.discountAmt ?? 0).toFixed(2)}</span>
                </div>
              )}
              <div className="ms-bill-total-row">
                <span>Tax ({selectedBill.tax ?? 0}%)</span>
                <span>₹{(selectedBill.taxAmt ?? 0).toFixed(2)}</span>
              </div>
              <div className="ms-bill-total-row ms-bill-grand-total">
                <span>Grand Total</span>
                <span>₹{(selectedBill.grandTotal ?? 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="ms-bill-detail-actions">
              <Button variant="outline" onClick={() => setSelectedBill(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicalStoreBilling;
