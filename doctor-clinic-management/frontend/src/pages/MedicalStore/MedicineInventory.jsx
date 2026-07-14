import React, { useState } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { medicineInventory } from '../../utils/mockData';
import './MedicineInventory.css';

const MedicineInventory = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editModal, setEditModal] = useState(null);
  const [isAdd, setIsAdd] = useState(false);

  const categories = [...new Set(medicineInventory.map((m) => m.category))];

  const filtered = medicineInventory.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q);
    const matchCat = !categoryFilter || m.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const perPage = 10;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const columns = [
    { key: 'name', label: 'Medicine Name' },
    { key: 'category', label: 'Category' },
    {
      key: 'stock',
      label: 'Stock',
      render: (v) => (
        <span className={`stock-indicator ${v > 20 ? 'stock-high' : v > 10 ? 'stock-medium' : 'stock-low'}`}>
          {v}
        </span>
      ),
    },
    { key: 'price', label: 'Price', render: (v) => `₹${v}` },
    { key: 'expiryDate', label: 'Expiry Date' },
    { key: 'manufacturer', label: 'Manufacturer' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-icons">
          <button className="icon-btn" title="Edit" onClick={(e) => { e.stopPropagation(); setEditModal(row); setIsAdd(false); }}>✏️</button>
          <button className="icon-btn" title="Delete" onClick={(e) => { e.stopPropagation(); }}>🗑️</button>
        </div>
      ),
    },
  ];

  return (
    <div className="page inventory-page">
      <div className="page-header">
        <h1>Medicine Inventory</h1>
        <div className="inventory-actions">
          <Button variant="outline" size="sm">📤 Export</Button>
          <Button icon="➕" onClick={() => { setEditModal({ name: '', category: '', stock: 0, price: 0, expiryDate: '', manufacturer: '' }); setIsAdd(true); }}>Add Medicine</Button>
        </div>
      </div>

      <div className="inventory-filters">
        <Input name="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search medicine..." />
        <Select name="category" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} placeholder="All Categories" options={categories.map((c) => ({ value: c, label: c }))} />
      </div>

      <Card>
        <DataTable columns={columns} data={paginated} emptyMessage="No medicines found" />
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </Card>

      <Modal isOpen={!!editModal} onClose={() => { setEditModal(null); setIsAdd(false); }} title={isAdd ? 'Add Medicine' : 'Edit Medicine'}>
        {editModal && (
          <div className="inventory-form">
            <Input label="Medicine Name" name="name" value={editModal.name} onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))} />
            <Select label="Category" name="category" value={editModal.category} onChange={(e) => setEditModal((p) => ({ ...p, category: e.target.value }))} placeholder="Select category" options={categories.map((c) => ({ value: c, label: c }))} />
            <Input label="Stock" name="stock" type="number" value={editModal.stock} onChange={(e) => setEditModal((p) => ({ ...p, stock: Number(e.target.value) }))} />
            <Input label="Price (₹)" name="price" type="number" value={editModal.price} onChange={(e) => setEditModal((p) => ({ ...p, price: Number(e.target.value) }))} />
            <Input label="Expiry Date" name="expiryDate" type="date" value={editModal.expiryDate} onChange={(e) => setEditModal((p) => ({ ...p, expiryDate: e.target.value }))} />
            <Input label="Manufacturer" name="manufacturer" value={editModal.manufacturer} onChange={(e) => setEditModal((p) => ({ ...p, manufacturer: e.target.value }))} />
            <div className="inventory-form-actions">
              <Button onClick={() => { setEditModal(null); setIsAdd(false); }}>{isAdd ? 'Add Medicine' : 'Save Changes'}</Button>
              <Button variant="secondary" onClick={() => { setEditModal(null); setIsAdd(false); }}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicineInventory;
