import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../components/Cards';
import { Button } from '../../components/Buttons';
import { DataTable } from '../../components/Tables';
import { Input, Select } from '../../components/Forms';
import { Modal } from '../../components/Modal';
import { Loader } from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import * as pharmacyApi from '../../services/api/pharmacy';
import { getErrorMessage } from '../../services/apiError';
import './MedicineInventory.css';
import { useTranslation } from '../../i18n/LanguageContext';

const EMPTY_FORM = { name: '', category: '', stock: 0, price: 0, expiryDate: '', manufacturer: '' };

const MedicineInventory = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editModal, setEditModal] = useState(null);
  const [isAdd, setIsAdd] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      setInventory(await pharmacyApi.getStoreInventory(user.id));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load inventory'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const categories = [...new Set(inventory.map((m) => m.category).filter(Boolean))];

  const filtered = inventory.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q);
    const matchCat = !categoryFilter || m.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const perPage = 10;
  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleDelete = async (item) => {
    try {
      await pharmacyApi.deleteInventoryItem(item.id);
      setInventory((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete item'));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: editModal.name, category: editModal.category, stock: Number(editModal.stock),
        price: Number(editModal.price), expiryDate: editModal.expiryDate || null, manufacturer: editModal.manufacturer,
      };
      if (isAdd) {
        const created = await pharmacyApi.addInventoryItem(user.id, payload);
        setInventory((prev) => [...prev, created]);
      } else {
        const updated = await pharmacyApi.updateInventoryItem(editModal.id, payload);
        setInventory((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      }
      setEditModal(null);
      setIsAdd(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save item'));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: t('pg.medicalStore.medicineInventory.colMedicineName') },
    { key: 'category', label: t('pg.medicalStore.medicineInventory.colCategory') },
    {
      key: 'stock',
      label: t('pg.medicalStore.medicineInventory.colStock'),
      render: (v) => (
        <span className={`stock-indicator ${v > 20 ? 'stock-high' : v > 10 ? 'stock-medium' : 'stock-low'}`}>
          {v}
        </span>
      ),
    },
    { key: 'price', label: t('pg.medicalStore.medicineInventory.colPrice'), render: (v) => `₹${v}` },
    { key: 'expiryDate', label: t('pg.medicalStore.medicineInventory.colExpiryDate'), render: (v) => v || '—' },
    { key: 'manufacturer', label: t('pg.medicalStore.medicineInventory.colManufacturer') },
    {
      key: 'actions',
      label: t('pg.medicalStore.medicineInventory.colActions'),
      render: (_, row) => (
        <div className="action-icons">
          <button className="icon-btn" title={t('pg.medicalStore.medicineInventory.edit')} onClick={(e) => { e.stopPropagation(); setEditModal(row); setIsAdd(false); }}>✏️</button>
          <button className="icon-btn" title={t('pg.medicalStore.medicineInventory.delete')} onClick={(e) => { e.stopPropagation(); handleDelete(row); }}>🗑️</button>
        </div>
      ),
    },
  ];

  return (
    <div className="page inventory-page">
      <div className="page-header">
        <h1>{t('pg.medicalStore.medicineInventory.title')}</h1>
        <div className="inventory-actions">
          <Button icon="➕" onClick={() => { setEditModal({ ...EMPTY_FORM }); setIsAdd(true); }}>{t('pg.medicalStore.medicineInventory.addMedicine')}</Button>
        </div>
      </div>

      {error && <p className="text-error">{error}</p>}

      <div className="inventory-filters">
        <Input name="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t('pg.medicalStore.medicineInventory.searchPlaceholder')} />
        <Select name="category" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} placeholder={t('pg.medicalStore.medicineInventory.allCategories')} options={categories.map((c) => ({ value: c, label: c }))} />
      </div>

      <Card>
        {loading ? <Loader /> : (
          <>
            <DataTable columns={columns} data={paginated} emptyMessage={t('pg.medicalStore.medicineInventory.empty')} />
            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← {t('pg.medicalStore.medicineInventory.prev')}</button>
                <span>{t('pg.medicalStore.medicineInventory.page')} {page} {t('pg.medicalStore.medicineInventory.of')} {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>{t('pg.medicalStore.medicineInventory.next')} →</button>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal isOpen={!!editModal} onClose={() => { setEditModal(null); setIsAdd(false); }} title={isAdd ? t('pg.medicalStore.medicineInventory.addMedicine') : t('pg.medicalStore.medicineInventory.editMedicine')}>
        {editModal && (
          <div className="inventory-form">
            <Input label={t('pg.medicalStore.medicineInventory.labelMedicineName')} name="name" value={editModal.name} onChange={(e) => setEditModal((p) => ({ ...p, name: e.target.value }))} />
            <Select label={t('pg.medicalStore.medicineInventory.labelCategory')} name="category" value={editModal.category} onChange={(e) => setEditModal((p) => ({ ...p, category: e.target.value }))} placeholder={t('pg.medicalStore.medicineInventory.selectCategory')} options={categories.map((c) => ({ value: c, label: c }))} />
            <Input label={t('pg.medicalStore.medicineInventory.labelStock')} name="stock" type="number" value={editModal.stock} onChange={(e) => setEditModal((p) => ({ ...p, stock: Number(e.target.value) }))} />
            <Input label={t('pg.medicalStore.medicineInventory.labelPrice')} name="price" type="number" value={editModal.price} onChange={(e) => setEditModal((p) => ({ ...p, price: Number(e.target.value) }))} />
            <Input label={t('pg.medicalStore.medicineInventory.labelExpiryDate')} name="expiryDate" type="date" value={editModal.expiryDate} onChange={(e) => setEditModal((p) => ({ ...p, expiryDate: e.target.value }))} />
            <Input label={t('pg.medicalStore.medicineInventory.labelManufacturer')} name="manufacturer" value={editModal.manufacturer} onChange={(e) => setEditModal((p) => ({ ...p, manufacturer: e.target.value }))} />
            <div className="inventory-form-actions">
              <Button onClick={handleSave} disabled={saving}>{saving ? '...' : (isAdd ? t('pg.medicalStore.medicineInventory.addMedicine') : t('pg.medicalStore.medicineInventory.saveChanges'))}</Button>
              <Button variant="secondary" onClick={() => { setEditModal(null); setIsAdd(false); }} disabled={saving}>{t('pg.medicalStore.medicineInventory.cancel')}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicineInventory;
