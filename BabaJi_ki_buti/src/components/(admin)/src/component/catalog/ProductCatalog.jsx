// src/pages/ProductCatalog.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  ChevronDown,
  Pencil,
  Trash2,
  Package,
  X
} from 'lucide-react';
import { app } from '../../../../../auth/httpAPI';

export default function ProductCatalog() {
  // ------- UI state -------
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status'); // ACTIVE | INACTIVE | DRAFT
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // ------- Data -------
  const [rows, setRows] = useState([]);

  // ------- Edit modal state (only these 4 fields) -------
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    status: 'ACTIVE',
    sellingPrice: '',
    stock: '',
    titleEn: ''
  });
  const resetEdit = () => {
    setEditOpen(false);
    setEditingId(null);
    setEditForm({ status: 'ACTIVE', sellingPrice: '', stock: '', titleEn: '' });
  };

  // ------- Helpers to normalize backend DTO fields -------
  const normalize = (p) => {
    const id = p.productId ?? p.id;
    const title = p.titleEn ?? p.title ?? p.name ?? '—';
    const price = p.price ?? p.mrp ?? p.listPrice ?? null;
    const sellingPrice = p.sellingPrice ?? p.salePrice ?? null;
    const stock = p.stock ?? p.availableStock ?? p.quantity ?? 0;
    const status = p.status ?? p.productStatus ?? 'DRAFT';
    return { ...p, _id: id, _title: title, _price: price, _sellingPrice: sellingPrice, _stock: stock, _status: status };
  };

  // ------- Loaders -------
  const fetchAll = async () => {
    setLoading(true); setErr('');
    try {
      const { data } = await app.get('/products/all');
      const list = (data?.data ?? []).map(normalize);
      setRows(list);
    } catch (e) {
      console.log('Request URL:', (e?.config?.baseURL || '') + (e?.config?.url || ''));
      setErr(e?.response?.data?.message || e.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchByStatus = async (status) => {
    setLoading(true); setErr('');
    try {
      const { data } = await app.get(`/products/status/${status}?page=0&size=200`);
      const page = data?.data;
      const list = (page?.content ?? []).map(normalize);
      setRows(list);
    } catch (e) {
      console.log('Request URL:', (e?.config?.baseURL || '') + (e?.config?.url || ''));
      setErr(e?.response?.data?.message || e.message || 'Failed to load by status');
    } finally {
      setLoading(false);
    }
  };

  const searchApi = async (q) => {
    setLoading(true); setErr('');
    try {
      const { data } = await app.get(`/products/search?q=${encodeURIComponent(q)}&page=0&size=200`);
      const page = data?.data;
      const list = (page?.content ?? []).map(normalize);
      setRows(list);
    } catch (e) {
      console.log('Request URL:', (e?.config?.baseURL || '') + (e?.config?.url || ''));
      setErr(e?.response?.data?.message || e.message || 'Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  // ------- Effects -------
  useEffect(() => { fetchAll(); }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      const q = searchQuery.trim();
      if (q.length > 0) {
        searchApi(q);
      } else {
        if (statusFilter === 'All Status') fetchAll();
        else fetchByStatus(statusFilterToEnum(statusFilter));
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Status filter changes
  useEffect(() => {
    const q = searchQuery.trim();
    if (statusFilter === 'All Status') {
      if (q) searchApi(q); else fetchAll();
    } else {
      fetchByStatus(statusFilterToEnum(statusFilter));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // ------- Mapping for UI labels to enum path -------
  function statusFilterToEnum(label) {
    switch (label) {
      case 'ACTIVE': return 'ACTIVE';
      case 'INACTIVE': return 'INACTIVE';
      case 'DRAFT': return 'DRAFT';
      default: return 'ACTIVE';
    }
  }

  // ------- Delete -------
  const onDelete = async (row) => {
    const id = row._id;
    if (!id) return;
    const ok = window.confirm(`Delete "${row._title}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await app.delete(`/products/${id}`);
      setRows(prev => prev.filter(r => r._id !== id));
    } catch (e) {
      console.log('Request URL:', (e?.config?.baseURL || '') + (e?.config?.url || ''));
      alert(e?.response?.data?.message || e.message || 'Delete failed');
    }
  };

  // ------- Edit -------
  const openEdit = (row) => {
    setEditingId(row._id);
    setEditForm({
      status: row._status ?? 'ACTIVE',
      sellingPrice: row._sellingPrice ?? '',
      stock: row._stock ?? '',
      titleEn: row._title ?? ''
    });
    setEditOpen(true);
  };

  const onEditSave = async () => {
    if (!editingId) return;
    const payload = {
      status: editForm.status,
      sellingPrice: Number(editForm.sellingPrice),
      stock: Number(editForm.stock),
      titleEn: editForm.titleEn
    };

    try {
      const { data } = await app.put(`/products/${editingId}`, payload);
      const updated = normalize(data?.data ?? {});
      setRows(prev => prev.map(r => (r._id === editingId ? { ...r, ...updated } : r)));
      resetEdit();
    } catch (e) {
      console.log('Request URL:', (e?.config?.baseURL || '') + (e?.config?.url || ''));
      alert(e?.response?.data?.message || e.message || 'Update failed');
    }
  };

  // ------- Derived (server does filtering) -------
  const filtered = useMemo(() => rows, [rows]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Product Catalog</h1>
          <p className="text-gray-600">Manage products, pricing and stock</p>
        </div>
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium transition-colors"
          onClick={() => (window.location.href = 'catalog/addProdPage')}
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex items-center gap-3">
        <div className="flex items-center space-x-2 flex-1 max-w-xl bg-gray-50 px-3 py-2 rounded-lg">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, code, slug…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option>All Status</option>
            <option>ACTIVE</option>
            <option>INACTIVE</option>
            <option>DRAFT</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Products</h2>
        </div>

        {err && (
          <div className="px-6 py-3 text-sm text-red-600 border-b border-gray-200">{err}</div>
        )}

        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Selling Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12">
                  <div className="text-center">
                    <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <div className="text-gray-600">No products found</div>
                    <div className="text-sm text-gray-500">Try changing filters or search</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{row._title}</div>
                    <div className="text-xs text-gray-500">ID: {row._id}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row._price != null ? `₹${row._price}` : '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{row._sellingPrice != null ? `₹${row._sellingPrice}` : '—'}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {row._stock ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium
                      ${row._status === 'ACTIVE' ? 'bg-green-100 text-green-700'
                      : row._status === 'INACTIVE' ? 'bg-gray-200 text-gray-700'
                      : 'bg-orange-100 text-orange-700'}`}>
                      {row._status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 hover:bg-gray-100"
                        onClick={() => openEdit(row)}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(row)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ------- Edit Modal ------- */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={resetEdit} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Product</h3>
              <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={resetEdit}><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (English)</label>
                <input
                  type="text"
                  value={editForm.titleEn}
                  onChange={(e) => setEditForm(f => ({ ...f, titleEn: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Amrit Ayu Chyawanprash (Updated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.sellingPrice}
                    onChange={(e) => setEditForm(f => ({ ...f, sellingPrice: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="329.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm(f => ({ ...f, stock: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="150"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border hover:bg-gray-50" onClick={resetEdit}>Cancel</button>
              <button
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={onEditSave}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
