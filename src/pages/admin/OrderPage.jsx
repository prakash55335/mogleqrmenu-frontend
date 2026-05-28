import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getPendingOrders, updateOrderStatus } from '../../api/orderApi'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'

/* ─── Shared Navbar ─────────────────────────────────────────────── */
export function AdminNavbar({ ordersCount, billingCount }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const active = (path) => pathname === path
  const btnStyle = (path) => ({
    display: 'flex', alignItems: 'center', gap: '6px',
    backgroundColor: active(path) ? '#facc15' : 'transparent',
    color: active(path) ? '#000' : '#a1a1aa',
    border: active(path) ? 'none' : '1px solid #3f3f46',
    borderRadius: '8px', padding: '8px 14px',
    fontWeight: '700', cursor: 'pointer', fontSize: '13px',
    transition: 'all 0.15s',
  })
  const badge = (n) => n > 0 ? (
    <span style={{ backgroundColor: '#ef4444', color: '#fff', borderRadius: '20px', padding: '1px 7px', fontSize: '11px', fontWeight: '900', minWidth: '18px', textAlign: 'center', lineHeight: '16px' }}>{n}</span>
  ) : null
  return (
    <div style={{ backgroundColor: '#0a0a0a', borderBottom: '2px solid #facc15', padding: '10px 16px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 20px rgba(250,204,21,0.08)' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#facc15,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(250,204,21,0.4)', flexShrink: 0 }}>
            <span style={{ color: '#000', fontWeight: '900', fontSize: '11px', fontFamily: 'Bebas Neue,sans-serif' }}>MR</span>
          </div>
          <div>
            <h1 style={{ color: '#facc15', fontWeight: '900', fontSize: '16px', margin: 0, letterSpacing: '1px' }}>Mr. Moglee</h1>
            <p style={{ color: '#71717a', fontSize: '10px', margin: 0 }}>BBQ Restaurant</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/admin/orders')} style={btnStyle('/admin/orders')}>📋 Orders {badge(ordersCount)}</button>
          <button onClick={() => navigate('/admin/billing')} style={btnStyle('/admin/billing')}>💳 Billing {badge(billingCount)}</button>
          <button onClick={() => navigate('/admin/tables')} style={btnStyle('/admin/tables')}>🔲 Tables</button>
          <button onClick={() => navigate('/admin/menu')} style={btnStyle('/admin/menu')}>🍽️ Menu</button>
          <button onClick={() => { logout(); navigate('/admin/login') }} style={{ backgroundColor: 'transparent', color: '#71717a', border: '1px solid #3f3f46', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Logout</button>
        </div>
      </div>
    </div>
  )
}

/* ─── Edit Order Modal ───────────────────────────────────────────── */
function EditOrderModal({ order, onClose, onSave }) {
  const [items, setItems] = useState(order.items.map(i => ({ ...i, menu_item_id: i.menu_item_id || (i.menu_item && i.menu_item.id) || i.menu_item, _qty: i.quantity })))
  const [note, setNote] = useState(order.customer_note || '')
  const [saving, setSaving] = useState(false)
  const [menuItems, setMenuItems] = useState([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    API.get('/api/v1/menu/').then(res => { const all = []; res.data.data.forEach(cat => cat.items.forEach(i => all.push(i))); setMenuItems(all) })
      .catch(() => toast.error('Could not load menu items', { id: 'menu-err', duration: 2000 }))
  }, [])

  const updateQty = (idx, delta) => setItems(prev => { const u = [...prev]; const nq = (u[idx]._qty || u[idx].quantity) + delta; if (nq <= 0) u.splice(idx, 1); else u[idx] = { ...u[idx], _qty: nq }; return u })
  const addItem = (m) => { const ex = items.findIndex(i => i.menu_item_id === m.id); if (ex >= 0) updateQty(ex, 1); else setItems(p => [...p, { item_name: m.name, menu_item_id: m.id, unit_price: m.price, quantity: 1, _qty: 1, subtotal: m.price }]); setSearch(''); setShowAdd(false) }

  const handleSave = async () => {
    if (items.length === 0) { toast.error('Order must have at least one item', { id: 'edit-err', duration: 2000 }); return }
    if (items.filter(i => !i.menu_item_id).length > 0) { toast.error('Some items missing ID. Remove and re-add.', { id: 'edit-err', duration: 3000 }); return }
    setSaving(true)
    try {
      await API.patch(`/api/v1/orders/${order.id}/edit/`, { customer_note: note || '', items: items.map(i => ({ menu_item_id: i.menu_item_id, quantity: i._qty || i.quantity })) })
      toast.success(`Order #${order.id} updated!`, { id: 'edit-ok', duration: 2000 }); onSave()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update order', { id: 'edit-err', duration: 4000 })
    } finally { setSaving(false) }
  }

  const filtered = menuItems.filter(m => m.is_available && m.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
  const total = items.reduce((s, i) => s + (i.unit_price || 0) * (i._qty || i.quantity), 0)

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ backgroundColor: '#0d0d0d', border: '2px solid #facc15', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '88vh', overflow: 'auto', padding: '20px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ color: '#facc15', fontWeight: '900', fontSize: '18px', margin: 0 }}>✏️ Edit Order — Table {order.table_number}</h2>
          <button onClick={onClose} style={{ backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}>×</button>
        </div>
        <p style={{ color: '#71717a', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Current Items</p>
        {items.length === 0 ? <div style={{ padding: '20px', textAlign: 'center', color: '#71717a', backgroundColor: '#111', borderRadius: '8px', marginBottom: '10px' }}>No items. Add items below.</div>
          : items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a1a1a' }}>
              <div><p style={{ color: '#fff', fontWeight: '700', fontSize: '13px', margin: 0 }}>{item.item_name}</p><p style={{ color: '#facc15', fontSize: '12px', margin: 0 }}>₹{item.unit_price} × {item._qty || item.quantity}</p></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => updateQty(idx, -1)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #facc15', backgroundColor: 'transparent', color: '#facc15', cursor: 'pointer', fontSize: '16px', fontWeight: '700' }}>−</button>
                <span style={{ color: '#facc15', fontWeight: '900', minWidth: '20px', textAlign: 'center' }}>{item._qty || item.quantity}</span>
                <button onClick={() => updateQty(idx, 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', backgroundColor: '#facc15', color: '#000', cursor: 'pointer', fontSize: '16px', fontWeight: '700' }}>+</button>
              </div>
            </div>
          ))}
        <div style={{ marginTop: '14px' }}>
          <button onClick={() => setShowAdd(!showAdd)} style={{ backgroundColor: '#1a1a1a', color: '#facc15', border: '1px dashed #facc15', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', width: '100%' }}>{showAdd ? '✕ Cancel' : '+ Add Item'}</button>
          {showAdd && <div style={{ marginTop: '10px' }}>
            <input type="text" placeholder="Search menu items..." value={search} onChange={e => setSearch(e.target.value)} autoFocus
              style={{ width: '100%', backgroundColor: '#111', border: '2px solid #3f3f46', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '14px', outline: 'none', marginBottom: '8px' }}
              onFocus={e => e.target.style.borderColor = '#facc15'} onBlur={e => e.target.style.borderColor = '#3f3f46'} />
            {search.length > 0 && (filtered.length > 0 ? filtered.map(m => (
              <div key={m.id} onClick={() => addItem(m)} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#111', borderRadius: '8px', marginBottom: '4px', cursor: 'pointer', border: '1px solid #222' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#facc15'} onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}>
                <span style={{ color: '#fff', fontSize: '13px' }}>{m.name}</span>
                <span style={{ color: '#facc15', fontWeight: '700', fontSize: '13px' }}>₹{m.price}</span>
              </div>
            )) : <div style={{ padding: '10px', textAlign: 'center', color: '#71717a', fontSize: '13px' }}>No items found</div>)}
          </div>}
        </div>
        <div style={{ marginTop: '14px' }}>
          <label style={{ color: '#71717a', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Special Instructions</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Any special requests..."
            style={{ width: '100%', backgroundColor: '#111', border: '2px solid #3f3f46', borderRadius: '10px', padding: '10px', color: '#fff', fontSize: '13px', outline: 'none', resize: 'none' }}
            onFocus={e => e.target.style.borderColor = '#facc15'} onBlur={e => e.target.style.borderColor = '#3f3f46'} />
        </div>
        <div style={{ marginTop: '14px', padding: '12px', backgroundColor: '#111', borderRadius: '10px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#a1a1aa', fontSize: '14px' }}>Updated Total</span>
          <span style={{ color: '#facc15', fontWeight: '900', fontSize: '18px' }}>₹{total.toFixed(2)}</span>
        </div>
        <button onClick={handleSave} disabled={saving || items.length === 0} style={{ width: '100%', background: saving || items.length === 0 ? '#a16207' : 'linear-gradient(135deg,#facc15,#f59e0b)', color: '#000', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: '900', fontSize: '16px', cursor: saving || items.length === 0 ? 'not-allowed' : 'pointer', opacity: items.length === 0 ? 0.5 : 1 }}>
          {saving ? '⏳ Saving...' : items.length === 0 ? '⚠️ Add items first' : '✅ Save Changes'}
        </button>
      </div>
    </div>
  )
}

/* ─── Order Card ─────────────────────────────────────────────────── */
function OrderCard({ order, onStatusChange, onEdit }) {

  // ✅ THE FIX: Print using hidden iframe so print dialog closes and
  // window.confirm works immediately after — no popup blocking
  const handlePrintKOT = () => {
    // Build KOT HTML
    const kotHTML = `<!DOCTYPE html>
<html><head><title>KOT-${order.id}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  @page{size:80mm auto;margin:4mm}
  body{font-family:'Courier New',monospace;font-size:13px;width:72mm;padding:4mm;color:#000;background:#fff}
  .center{text-align:center}.bold{font-weight:bold}
  .big{font-size:16px;font-weight:bold;text-align:center;margin:4px 0}
  .line{border-top:1px dashed #000;margin:6px 0}
  .row{display:flex;justify-content:space-between;padding:3px 0}
  .note{border:1px solid #000;padding:4px 8px;margin:6px 0;font-weight:bold}
  .footer{text-align:center;margin-top:10px;font-size:12px}
  .spacer{height:10mm}
</style></head><body>
  <p class="big">*** KITCHEN ORDER ***</p>
  <p class="center bold" style="font-size:14px">MR. MOGLEE BBQ</p>
  <div class="line"></div>
  <div class="row"><span class="bold">TABLE</span><span class="bold" style="font-size:18px">${order.table_number}</span></div>
  <p>Order # : ${order.id}</p>
  <p>Time    : ${new Date(order.created_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})}</p>
  <p>Date    : ${new Date(order.created_at).toLocaleDateString('en-IN')}</p>
  ${order.customer_note ? `<div class="line"></div><div class="note">NOTE: ${order.customer_note}</div>` : ''}
  <div class="line"></div>
  <p class="bold">ITEMS TO PREPARE:</p>
  <div class="line"></div>
  ${order.items.map((item,i)=>`<div class="row"><span>${i+1}. ${item.item_name.length>24?item.item_name.substring(0,24)+'...':item.item_name}</span><span class="bold">x${item.quantity}</span></div>`).join('')}
  <div class="line"></div>
  <p class="footer bold">** PREPARE IMMEDIATELY **</p>
  <div class="spacer"></div>
</body></html>`

    // Create hidden iframe for printing
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(kotHTML)
    doc.close()

    // Wait for content to load then print
    iframe.onload = () => {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()

      // ✅ After print dialog closes, show confirm
      // Use requestAnimationFrame to ensure print dialog is fully closed
      const showConfirm = () => {
        document.body.removeChild(iframe)
        const confirmed = window.confirm(
          `✅ Order #${order.id} — Table ${order.table_number}\n\nMove this order to Billing?`
        )
        if (confirmed) {
          onStatusChange(order.id, 'ready')
        }
      }

      // Small delay to let print dialog close
      setTimeout(showConfirm, 500)
    }
  }

  return (
    <div style={{ backgroundColor: '#0d0d0d', border: '2px solid #facc15', borderRadius: '14px', padding: '16px', transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(250,204,21,0.15)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <h3 style={{ color: '#facc15', fontSize: 'clamp(18px,4vw,24px)', fontWeight: '900', margin: 0 }}>TABLE {order.table_number}</h3>
          <p style={{ color: '#71717a', fontSize: '11px', margin: '2px 0 0' }}>Order #{order.id} • {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ backgroundColor: '#facc1520', border: '1px solid #facc15', color: '#facc15', borderRadius: '20px', padding: '3px 10px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>{order.status}</span>
          <button onClick={() => onEdit(order)} style={{ backgroundColor: '#ef4444', color: '#fff', border: '1.5px solid #b91c1c', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dc2626'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ef4444'}>✏️ Edit</button>
        </div>
      </div>

      {/* Customer Info */}
      {(order.customer_name || order.customer_phone) && (
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #facc1540', borderRadius: '8px', padding: '8px 10px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', flexShrink: 0 }}>👤</span>
          <div style={{ minWidth: 0 }}>
            {order.customer_name && <p style={{ color: '#fff', fontWeight: '700', fontSize: '13px', margin: 0 }}>{order.customer_name}</p>}
            {order.customer_phone && <p style={{ color: '#facc15', fontWeight: '600', fontSize: '12px', margin: 0 }}>📞 {order.customer_phone}</p>}
          </div>
        </div>
      )}

      {/* Items */}
      <div style={{ borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a', padding: '8px 0', margin: '8px 0' }}>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '13px', color: '#e4e4e7' }}>
            <span style={{ flex: 1, paddingRight: '8px' }}>{item.item_name}</span>
            <span style={{ color: '#facc15', fontWeight: '700', flexShrink: 0 }}>×{item.quantity}</span>
          </div>
        ))}
      </div>

      {/* Note */}
      {order.customer_note && (
        <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #facc1540', borderRadius: '8px', padding: '7px 10px', marginBottom: '10px', fontSize: '12px', color: '#facc15' }}>📝 {order.customer_note}</div>
      )}

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ color: '#71717a', fontSize: '13px' }}>Total</span>
        <span style={{ color: '#facc15', fontWeight: '900', fontSize: '16px' }}>₹{order.total_amount}</span>
      </div>

      {/* Print KOT Button */}
      <button onClick={handlePrintKOT} style={{
        width: '100%', background: 'linear-gradient(135deg,#1d4ed8,#1e40af)',
        border: 'none', color: '#fff', borderRadius: '10px', padding: '12px',
        fontWeight: '900', cursor: 'pointer', fontSize: 'clamp(13px,2.5vw,15px)', letterSpacing: '0.5px'
      }}>🖨️ Print KOT</button>
    </div>
  )
}

/* ─── Orders Page ────────────────────────────────────────────────── */
export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [editOrder, setEditOrder] = useState(null)

  const loadOrders = useCallback(async () => {
    try {
      const res = await getPendingOrders()
      setOrders(res.data.data)
    } catch {
      toast.error('Failed to load orders', { id: 'load-err', duration: 2000 })
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    loadOrders()
    const iv = setInterval(loadOrders, 10000)
    return () => clearInterval(iv)
  }, [loadOrders])

  const handleStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      toast.success(`Order #${orderId} sent to billing ✅`, { id: `st-${orderId}`, duration: 2000 })
      loadOrders()
    } catch { toast.error('Failed to update', { id: 'st-err', duration: 2000 }) }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff' }}>
      <AdminNavbar ordersCount={orders.length} billingCount={0} />
      <div style={{ padding: '16px', maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <h2 style={{ color: '#facc15', fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(22px,5vw,32px)', letterSpacing: '2px', margin: 0 }}>📋 ACTIVE ORDERS</h2>
          <span style={{ background: 'linear-gradient(135deg,#facc15,#f59e0b)', color: '#000', borderRadius: '20px', padding: '3px 14px', fontSize: '16px', fontWeight: '900' }}>{orders.length}</span>
          <span style={{ color: '#71717a', fontSize: '12px', marginLeft: 'auto' }}>Auto refresh every 10s</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#facc15', fontSize: '18px' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#3f3f46', fontSize: '18px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>No active orders right now
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
            {orders.map(order => <OrderCard key={order.id} order={order} onStatusChange={handleStatus} onEdit={setEditOrder} />)}
          </div>
        )}
      </div>
      {editOrder && <EditOrderModal order={editOrder} onClose={() => setEditOrder(null)} onSave={() => { setEditOrder(null); loadOrders() }} />}
    </div>
  )
}