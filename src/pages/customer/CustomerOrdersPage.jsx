import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import API from '../../api/axiosConfig'
import { fetchTaxSettings } from '../../utils/taxSettings'

const FB = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80'

const STATUS_CONFIG = {
  pending:   { label: 'Order Received',  color: '#f59e0b', bg: '#f59e0b18', dot: '#f59e0b', icon: '🕐' },
  preparing: { label: 'Being Prepared',  color: '#3b82f6', bg: '#3b82f618', dot: '#3b82f6', icon: '👨‍🍳' },
  ready:     { label: 'Ready to Serve',  color: '#22c55e', bg: '#22c55e18', dot: '#22c55e', icon: '✅' },
  served:    { label: 'Served',          color: '#8b5cf6', bg: '#8b5cf618', dot: '#8b5cf6', icon: '🍽️' },
  billing:   { label: 'Bill Requested',  color: '#facc15', bg: '#facc1518', dot: '#facc15', icon: '🧾' },
  completed: { label: 'Completed',       color: '#6b7280', bg: '#6b728018', dot: '#6b7280', icon: '✔️' },
  billed:    { label: 'Billed',          color: '#6b7280', bg: '#6b728018', dot: '#6b7280', icon: '✔️' },
}

export default function CustomerOrdersPage() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [tax,     setTax]     = useState({ cgst: 0, sgst: 0, enabled: false })
  const [searchParams]        = useSearchParams()
  const navigate              = useNavigate()
  const tableId               = searchParams.get('tableId')

  useEffect(() => {
    fetchTaxSettings().then(t => setTax(t))
  }, [])

  useEffect(() => {
    if (!tableId) return
    fetchOrders()
    const interval = setInterval(fetchOrders, 15000)
    return () => clearInterval(interval)
  }, [tableId])

  const fetchOrders = async () => {
    try {
      const key        = `orders_table_${tableId}`
      const myOrderIds = JSON.parse(localStorage.getItem(key) || '[]')
      if (myOrderIds.length === 0) {
        setOrders([])
        setLoading(false)
        return
      }
      const results = await Promise.all(
        myOrderIds.map(id =>
          API.get(`/api/v1/orders/${id}/`)
            .then(r => r.data.data)
            .catch(() => null)
        )
      )
      setOrders(results.filter(Boolean).reverse())
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getOrderTotal = (subtotal) => {
    if (!tax.enabled) return parseFloat(subtotal)
    const gst = (parseFloat(subtotal) * (tax.cgst + tax.sgst)) / 100
    return parseFloat(subtotal) + gst
  }

  const getGstAmount = (subtotal) => {
    if (!tax.enabled) return 0
    return (parseFloat(subtotal) * (tax.cgst + tax.sgst)) / 100
  }

  const totalSpent = orders.reduce((s, o) => s + getOrderTotal(o.total_amount), 0)

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ background: '#0c0c0f', width: '100%', maxWidth: 480, minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans',sans-serif", display: 'flex', flexDirection: 'column', paddingBottom: 72 }}>

        {/* ── HEADER ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(12,12,15,0.97)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #26262e',
          padding: '14px 16px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          {/* Left — logo + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'linear-gradient(135deg,#facc15,#f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(250,204,21,0.5)',
              fontSize: 13, fontWeight: 900, color: '#000', flexShrink: 0
            }}>
              MR
            </div>
            <div>
              <p style={{ fontSize: 17, color: '#facc15', letterSpacing: 2, lineHeight: 1.2, margin: 0, fontWeight: 900 }}>
                MY ORDERS
              </p>
              <p style={{ fontSize: 10, color: '#f59e0b', letterSpacing: 1, margin: '2px 0 0' }}>
                🔥 TABLE {tableId} · LIVE TRACKING
              </p>
            </div>
          </div>

          {/* Right — total */}
          {orders.length > 0 && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ color: '#facc15', fontSize: 15, fontWeight: 900, margin: 0 }}>
                ₹{totalSpent.toFixed(0)}
              </p>
              <p style={{ color: '#52525b', fontSize: 10, margin: '2px 0 0' }}>
                {orders.length} order{orders.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* ── CONTENT ── */}
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔥</div>
              <p style={{ color: '#facc15', fontSize: 15, fontWeight: 900, letterSpacing: 2 }}>LOADING ORDERS...</p>
            </div>

          ) : orders.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#16161c', border: '2px solid #26262e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 20 }}>
                🛒
              </div>
              <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 900, margin: '0 0 8px' }}>No Orders Yet</h2>
              <p style={{ color: '#52525b', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
                You haven't placed any orders yet.<br />Browse our menu and order something delicious!
              </p>
              <button
                onClick={() => navigate(`/menu?tableId=${tableId}`)}
                style={{ background: 'linear-gradient(135deg,#facc15,#f59e0b)', color: '#000', border: 'none', borderRadius: 14, padding: '13px 24px', fontWeight: 900, fontSize: 14, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(250,204,21,0.35)' }}>
                Browse Menu 🍗
              </button>
            </div>

          ) : (
            <div style={{ padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* live refresh badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '6px 0' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e', animation: 'pulse 1.5s infinite' }} />
                <span style={{ color: '#22c55e', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
                  LIVE TRACKING · AUTO-REFRESHES
                </span>
              </div>

              {orders.map(order => {
                const cfg        = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                const subtotal   = parseFloat(order.total_amount || 0)
                const gstAmt     = getGstAmount(subtotal)
                const orderTotal = getOrderTotal(subtotal)
                const itemCount  = (order.items || []).reduce((s, i) => s + i.quantity, 0)

                return (
                  <div key={order.id} style={{
                    background: '#16161c',
                    border: `1px solid ${cfg.dot}40`,
                    borderRadius: 16,
                    overflow: 'hidden'
                  }}>

                    {/* order header */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderBottom: '1px solid #26262e'
                    }}>
                      <div>
                        <p style={{ color: '#fff', fontWeight: 900, fontSize: 15, margin: 0 }}>
                          Order #{order.id}
                        </p>
                        <p style={{ color: '#52525b', fontSize: 11, margin: '3px 0 0' }}>
                          {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* status badge */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 20,
                        background: cfg.bg, flexShrink: 0
                      }}>
                        <span style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: cfg.dot,
                          boxShadow: `0 0 6px ${cfg.dot}`,
                          display: 'inline-block', flexShrink: 0,
                          animation: order.status === 'preparing' ? 'pulse 1.5s infinite' : 'none'
                        }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>
                    </div>

                    {/* items */}
                    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={item.image || FB}
                            alt={item.name}
                            style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid #26262e' }}
                            onError={e => e.target.src = FB}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.name}
                            </p>
                            <p style={{ color: '#52525b', fontSize: 11, margin: '2px 0 0' }}>
                              x{item.quantity}
                            </p>
                          </div>
                          <p style={{ color: '#facc15', fontWeight: 900, fontSize: 13, margin: 0, flexShrink: 0 }}>
                            ₹{(parseFloat(item.unit_price) * item.quantity).toFixed(0)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* special note */}
                    {order.customer_note && order.customer_note !== 'nothing' && (
                      <div style={{ margin: '0 16px 12px', background: '#0c0c0f', border: '1px solid #26262e', borderRadius: 10, padding: '8px 12px' }}>
                        <p style={{ color: '#52525b', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 3px' }}>Note</p>
                        <p style={{ color: '#a1a1aa', fontSize: 12, fontStyle: 'italic', margin: 0 }}>"{order.customer_note}"</p>
                      </div>
                    )}

                    {/* TOTAL with GST */}
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #26262e', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#52525b', fontSize: 12 }}>
                          Subtotal · {itemCount} item{itemCount !== 1 ? 's' : ''}
                        </span>
                        <span style={{ color: '#a1a1aa', fontSize: 12 }}>
                          ₹{subtotal.toFixed(0)}
                        </span>
                      </div>

                      {tax.enabled && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#52525b', fontSize: 11 }}>
                            GST ({tax.cgst + tax.sgst}%)
                          </span>
                          <span style={{ color: '#52525b', fontSize: 11 }}>
                            + ₹{gstAmt.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        paddingTop: 8, borderTop: '1px solid #26262e'
                      }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                          {tax.enabled ? 'Total (incl. GST)' : 'Total'}
                        </span>
                        <span style={{ color: '#facc15', fontWeight: 900, fontSize: 17 }}>
                          ₹{orderTotal.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Total summary — only if more than 1 order */}
              {orders.length > 1 && (
                <div style={{ background: '#16161c', border: '1px solid #facc1540', borderRadius: 16, padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#a1a1aa', fontSize: 13, fontWeight: 700 }}>
                      Total Spent{tax.enabled ? ' (incl. GST)' : ''}
                    </span>
                    <span style={{ color: '#facc15', fontWeight: 900, fontSize: 20 }}>
                      ₹{totalSpent.toFixed(0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── BOTTOM NAV ── */}
        <div style={{
          position: 'fixed', bottom: 0,
          left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 480,
          display: 'flex',
          background: '#0f0f14',
          borderTop: '1px solid #26262e',
          zIndex: 90
        }}>
          {[
            { icon: '🍽️', label: 'MENU',     key: 'menu',     path: `/menu?tableId=${tableId}` },
            { icon: '📋', label: 'ORDERS',   key: 'orders',   path: `/my-orders?tableId=${tableId}` },
            { icon: '💬', label: 'FEEDBACK', key: 'feedback', path: `/feedback?tableId=${tableId}` },
          ].map(n => (
            <button
              key={n.key}
              onClick={() => navigate(n.path)}
              style={{
                flex: 1, padding: '11px 0',
                border: 'none', background: 'transparent',
                color: n.key === 'orders' ? '#facc15' : '#3f3f46',
                cursor: 'pointer', fontSize: 9, fontWeight: 700,
                letterSpacing: 0.5, display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: 4,
                fontFamily: 'inherit'
              }}>
              <span style={{ fontSize: 20 }}>{n.icon}</span>
              {n.label}
              {n.key === 'orders' && (
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#facc15', marginTop: 1 }} />
              )}
            </button>
          ))}
        </div>

      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.4)}}`}</style>
    </div>
  )
}