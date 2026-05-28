import { useState, useEffect, useCallback } from 'react'
import { menuApi } from '../../api/menuApi'
import ImageUpload from '../../components/menu/ImageUpload'

const EMPTY_FORM = {
  name: '', description: '', price: '',
  category: '', is_veg: false,
  is_available: true, image: ''
}

const labelStyle = {
  display: 'block', fontSize: 12,
  color: '#888', marginBottom: 4, marginTop: 14
}

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 7,
  border: '1px solid #e0e0e0', fontSize: 14,
  boxSizing: 'border-box', background: '#fafafa', outline: 'none'
}

export default function MenuManagementPage() {
  const [categories, setCategories] = useState([])
  const [selected,   setSelected]   = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [isNew,      setIsNew]      = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [openCats,   setOpenCats]   = useState({})
  const [search,     setSearch]     = useState('')
  const [toast,      setToast]      = useState('')

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  async function loadMenu() {
    const res = await menuApi.getAll()
    if (res.success) setCategories(res.data)
  }

  useEffect(() => { loadMenu() }, [])

  function selectItem(item, catId) {
    setSelected(item)
    setIsNew(false)
    setForm({
      name:         item.name,
      description:  item.description || '',
      price:        item.price,
      category:     catId,
      is_veg:       item.is_veg,
      is_available: item.is_available,
      image:        item.image || ''
    })
  }

  function startNew() {
    setSelected(null)
    setIsNew(true)
    setForm(EMPTY_FORM)
  }

  function toggleCat(id) {
    setOpenCats(p => ({ ...p, [id]: !p[id] }))
  }

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!form.name.trim() || !form.price || !form.category) {
      alert('Name, price and category are required.')
      return
    }
    setSaving(true)
    const payload = {
      ...form,
      price:    parseFloat(form.price),
      category: parseInt(form.category),
    }
    const res = isNew
      ? await menuApi.createItem(payload)
      : await menuApi.updateItem(selected.id, payload)

    if (res.success) {
      showToast(isNew ? '✓ Item added!' : '✓ Changes saved!')
      await loadMenu()
      if (isNew) {
        setIsNew(false)
        setSelected(res.data)
      }
    } else {
      alert('Error: ' + JSON.stringify(res.errors))
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!selected || !window.confirm(`Delete "${selected.name}"?`)) return
    const res = await menuApi.deleteItem(selected.id)
    if (res.success) {
      showToast('✓ Item deleted.')
      setSelected(null)
      setForm(EMPTY_FORM)
      setIsNew(false)
      await loadMenu()
    }
  }

  async function handleToggle(item, e) {
    e.stopPropagation()
    await menuApi.toggleItem(item.id)
    await loadMenu()
  }

  const filtered = search.trim()
    ? categories
        .map(c => ({
          ...c,
          items: c.items.filter(i =>
            i.name.toLowerCase().includes(search.toLowerCase())
          )
        }))
        .filter(c => c.items.length > 0)
    : categories

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', background: '#f7f7f7' }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        width: 340, minWidth: 320, background: '#fff',
        borderRight: '1px solid #eee',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>

        {/* Top bar */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #eee' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 10
          }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Menu Management</span>
            <button
              onClick={startNew}
              style={{
                background: '#FF6B35', color: '#fff', border: 'none',
                borderRadius: 6, padding: '7px 14px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}
            >
              + Add item
            </button>
          </div>
          <input
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '7px 10px', borderRadius: 6,
              border: '1px solid #ddd', fontSize: 13,
              boxSizing: 'border-box', outline: 'none'
            }}
          />
          <div style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>
            {categories.reduce((a, c) => a + c.items.length, 0)} total items
            · {categories.length} categories
          </div>
        </div>

        {/* Category + item list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map(cat => (
            <div key={cat.id}>

              {/* Category header */}
              <div
                onClick={() => toggleCat(cat.id)}
                style={{
                  padding: '10px 16px', fontWeight: 600, fontSize: 13,
                  background: '#fafafa', cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  userSelect: 'none'
                }}
              >
                <span>{cat.name}</span>
                <span style={{ fontSize: 11, color: '#bbb' }}>
                  {cat.items.length} &nbsp;{openCats[cat.id] ? '▲' : '▼'}
                </span>
              </div>

              {/* Items */}
              {openCats[cat.id] && cat.items.map(item => (
                <div
                  key={item.id}
                  onClick={() => selectItem(item, cat.id)}
                  style={{
                    padding: '10px 16px 10px 24px',
                    cursor: 'pointer', fontSize: 13,
                    borderBottom: '1px solid #f5f5f5',
                    background: selected?.id === item.id ? '#fff5f0' : '#fff',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'background 0.15s'
                  }}
                >
                  {/* Thumbnail */}
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      style={{ width: 38, height: 38, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 38, height: 38, borderRadius: 6, background: '#f0f0f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, flexShrink: 0
                    }}>
                      🍽
                    </div>
                  )}

                  {/* Name + price */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {/* Veg/non-veg dot */}
                      <span style={{
                        width: 8, height: 8, borderRadius: 2,
                        border: `1px solid ${item.is_veg ? 'green' : '#c0392b'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <span style={{
                          width: 4, height: 4, borderRadius: 1,
                          background: item.is_veg ? 'green' : '#c0392b'
                        }} />
                      </span>
                      <span style={{
                        fontWeight: 500, whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {item.name}
                      </span>
                    </div>
                    <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                      ₹{item.price}
                    </div>
                  </div>

                  {/* Available toggle button */}
                  <button
                    onClick={e => handleToggle(item, e)}
                    style={{
                      fontSize: 10, padding: '3px 8px', borderRadius: 10,
                      border: 'none', fontWeight: 600, cursor: 'pointer',
                      background: item.is_available ? '#e6f4ea' : '#fce8e6',
                      color: item.is_available ? '#2e7d32' : '#c62828',
                      flexShrink: 0
                    }}
                  >
                    {item.is_available ? 'ON' : 'OFF'}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>

        {!selected && !isNew ? (
          <div style={{ textAlign: 'center', marginTop: 120, color: '#ccc' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🍗</div>
            <div style={{ fontSize: 15, color: '#bbb' }}>
              Select an item from the left to edit,<br />
              or click <strong style={{ color: '#FF6B35' }}>+ Add item</strong> to create a new one.
            </div>
          </div>
        ) : (
          <div style={{
            maxWidth: 520, background: '#fff', borderRadius: 14,
            padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.07)'
          }}>

            <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700 }}>
              {isNew ? '+ Add new item' : `Edit — ${selected?.name}`}
            </h2>

            {/* Image upload */}
            <ImageUpload
              currentUrl={form.image}
              onUpload={url => setField('image', url)}
            />

            {/* Name */}
            <label style={labelStyle}>Item name *</label>
            <input
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              style={inputStyle}
              placeholder="e.g. Chicken Wings (5 Pcs)"
            />

            {/* Description */}
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              style={{ ...inputStyle, height: 72, resize: 'vertical' }}
              placeholder="Short description shown to customer"
            />

            {/* Price */}
            <label style={labelStyle}>Price (₹) *</label>
            <input
              type="number"
              value={form.price}
              onChange={e => setField('price', e.target.value)}
              style={inputStyle}
              placeholder="0.00"
              min="0"
              step="0.50"
            />

            {/* Category */}
            <label style={labelStyle}>Category *</label>
            <select
              value={form.category}
              onChange={e => setField('category', e.target.value)}
              style={inputStyle}
            >
              <option value="">Select a category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Checkboxes */}
            <div style={{ display: 'flex', gap: 28, margin: '18px 0 4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.is_veg}
                  onChange={e => setField('is_veg', e.target.checked)}
                />
                Veg item
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={e => setField('is_available', e.target.checked)}
                />
                Available on menu
              </label>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1, padding: '12px 0', background: saving ? '#ffb399' : '#FF6B35',
                  color: '#fff', border: 'none', borderRadius: 8,
                  fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {saving ? 'Saving...' : isNew ? 'Add item' : 'Save changes'}
              </button>

              {!isNew && (
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '12px 20px', background: '#fff',
                    color: '#c62828', border: '1px solid #f5c6c6',
                    borderRadius: 8, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%',
          transform: 'translateX(-50%)',
          background: '#2e7d32', color: '#fff',
          padding: '11px 28px', borderRadius: 8,
          fontSize: 14, fontWeight: 600, zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          pointerEvents: 'none'
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}