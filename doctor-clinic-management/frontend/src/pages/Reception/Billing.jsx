import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select, Textarea } from '../../components/Forms';
import { patients, bills } from '../../utils/mockData';
import { generateBillId } from '../../utils/helpers';
import './Billing.css';

const Billing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [billItems, setBillItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('fixed');
  const [tax, setTax] = useState(5);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [billGenerated, setBillGenerated] = useState(false);
  const [billId, setBillId] = useState('');

  const handleSearch = () => {
    const q = searchQuery.toLowerCase();
    const patient = patients.find((p) => p.id.toLowerCase() === q || p.name.toLowerCase().includes(q) || p.phone.includes(q));
    setSelectedPatient(patient || null);
  };

  const addItem = () => {
    setBillItems([...billItems, { id: Date.now(), description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeItem = (id) => {
    setBillItems(billItems.filter((item) => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setBillItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = (field === 'quantity' ? value : item.quantity) * (field === 'rate' ? value : item.rate);
        }
        return updated;
      })
    );
  };

  const subtotal = billItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const discountAmt = discountType === 'percent' ? (subtotal * discount) / 100 : Number(discount);
  const taxAmt = (subtotal - discountAmt) * (tax / 100);
  const grandTotal = subtotal - discountAmt + taxAmt;

  const generateBill = () => {
    const id = generateBillId();
    setBillId(id);
    setBillGenerated(true);
  };

  const billColumns = [
    { key: 'description', label: 'Description', render: (v, row) => <Input name="desc" value={v} onChange={(e) => updateItem(row.id, 'description', e.target.value)} placeholder="Item description" /> },
    { key: 'quantity', label: 'Qty', render: (v, row) => <Input name="qty" type="number" value={v} onChange={(e) => updateItem(row.id, 'quantity', Number(e.target.value))} min="1" /> },
    { key: 'rate', label: 'Rate (₹)', render: (v, row) => <Input name="rate" type="number" value={v} onChange={(e) => updateItem(row.id, 'rate', Number(e.target.value))} /> },
    { key: 'amount', label: 'Amount (₹)', render: (v) => <span>₹{(v || 0).toFixed(2)}</span> },
    {
      key: 'remove',
      label: '',
      render: (_, row) => <button className="remove-btn" onClick={() => removeItem(row.id)}>✕</button>,
    },
  ];

  const recentBillColumns = [
    { key: 'id', label: 'Bill ID' },
    { key: 'patientName', label: 'Patient' },
    { key: 'date', label: 'Date' },
    { key: 'grandTotal', label: 'Amount', render: (v) => `₹${v?.toFixed(2)}` },
    { key: 'paymentMethod', label: 'Payment' },
    { key: 'status', label: 'Status', render: (v) => <span className={`status-badge status-${v.toLowerCase()}`}>{v}</span> },
  ];

  if (billGenerated) {
    return (
      <div className="page billing-page">
        <div className="success-alert">
          <div className="success-icon">✅</div>
          <h2>Bill Generated Successfully!</h2>
          <p className="patient-id-display">Bill ID: <strong>{billId}</strong></p>
          <div className="bill-summary-card">
            <p>Patient: {selectedPatient?.name}</p>
            <p>Total: ₹{grandTotal.toFixed(2)}</p>
            <p>Payment Method: {paymentMethod}</p>
          </div>
          <div className="success-actions">
            <Button onClick={() => window.print()}>🖨️ Print Bill</Button>
            <Button variant="outline" onClick={() => { setBillGenerated(false); setBillItems([]); setSelectedPatient(null); setSearchQuery(''); setDiscount(0); }}>Generate Another</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page billing-page">
      <div className="page-header"><h1>Billing</h1></div>

      <div className="billing-search">
        <Input name="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search patient by ID, name or phone..." />
        <Button onClick={handleSearch}>🔍 Search</Button>
      </div>

      {selectedPatient && (
        <Card title="Patient Info">
          <div className="billing-patient-info">
            <div><label>Name</label><p>{selectedPatient.name}</p></div>
            <div><label>ID</label><p>{selectedPatient.id}</p></div>
            <div><label>Phone</label><p>{selectedPatient.phone}</p></div>
            <div><label>Blood Group</label><p>{selectedPatient.bloodGroup}</p></div>
          </div>
        </Card>
      )}

      <Card title="Bill Items" actions={<Button variant="outline" size="sm" icon="➕" onClick={addItem}>Add Item</Button>}>
        {billItems.length === 0 ? (
          <p className="text-muted">No items added. Click "Add Item" to start building the bill.</p>
        ) : (
          <div className="bill-items-table">
            <DataTable columns={billColumns} data={billItems} />
          </div>
        )}
      </Card>

      <div className="billing-bottom">
        <Card title="Payment Details">
          <div className="billing-form">
            <Input label="Discount" name="discount" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} helperText={discountType === 'percent' ? 'Percentage off' : 'Fixed amount'} />
            <Select label="Discount Type" name="discountType" value={discountType} onChange={(e) => setDiscountType(e.target.value)} options={[{ value: 'fixed', label: 'Fixed (₹)' }, { value: 'percent', label: 'Percentage (%)' }]} />
            <Input label="Tax (%)" name="tax" type="number" value={tax} onChange={(e) => setTax(Number(e.target.value))} />
            <Select label="Payment Method" name="payment" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} options={[{ value: 'Cash', label: 'Cash' }, { value: 'Card', label: 'Card' }, { value: 'UPI', label: 'UPI' }, { value: 'Insurance', label: 'Insurance' }]} />
            <Textarea label="Notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
          </div>
        </Card>

        <Card title="Summary">
          <div className="bill-summary">
            <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="summary-row"><span>Discount</span><span className="text-success">-₹{discountAmt.toFixed(2)}</span></div>
            <div className="summary-row"><span>Tax ({tax}%)</span><span>₹{taxAmt.toFixed(2)}</span></div>
            <div className="summary-row total"><span>Grand Total</span><span>₹{grandTotal.toFixed(2)}</span></div>
          </div>
          <Button size="lg" onClick={generateBill} disabled={!selectedPatient || billItems.length === 0}>Generate Bill</Button>
        </Card>
      </div>

      <Card title="Recent Bills">
        <DataTable columns={recentBillColumns} data={bills.slice(0, 5)} />
      </Card>
    </div>
  );
};

export default Billing;
