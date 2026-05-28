import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getReadyOrders } from '../../api/orderApi'
import { generateBill } from '../../api/billingApi'
import { fetchTaxSettings, updateTaxSettings, calculateTax } from '../../utils/taxSettings'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import { AdminNavbar } from './OrderPage'

export default function BillingPage() {
  const [readyOrders, setReadyOrders] = useState([])
  const [todayBills,  setTodayBills]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [generating,  setGenerating]  = useState(null)
  const [showTax,     setShowTax]     = useState(false)
  const [taxSettings, setTaxSettings] = useState({ cgst: 0, sgst: 0, enabled: false })
  const [taxForm,     setTaxForm]     = useState({ cgst: '', sgst: '', enabled: false })
  const navigate = useNavigate()

  const loadData = useCallback(async () => {
    try {
      const [ordRes, billRes] = await Promise.all([
        getReadyOrders(),
        API.get('/api/v1/billing/today/')
      ])
      setReadyOrders(ordRes.data.data)
      setTodayBills(billRes.data.data || [])
    } catch {
      try {
        const ordRes = await getReadyOrders()
        setReadyOrders(ordRes.data.data)
      } catch {
        toast.error('Failed to load', { id: 'b-err', duration: 2000 })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const iv = setInterval(loadData, 10000)
    return () => clearInterval(iv)
  }, [loadData])

  // load tax settings from backend on mount
  useEffect(() => {
    fetchTaxSettings().then(t => {
      setTaxSettings(t)
      setTaxForm({ cgst: t.cgst, sgst: t.sgst, enabled: t.enabled })
    })
  }, [])

  function openTaxEdit() {
    setTaxForm({
      cgst:    taxSettings.cgst,
      sgst:    taxSettings.sgst,
      enabled: taxSettings.enabled,
    })
    setShowTax(true)
  }

  async function saveTax() {
    const cgst = parseFloat(taxForm.cgst) || 0
    const sgst = parseFloat(taxForm.sgst) || 0
    if (cgst < 0 || cgst > 50 || sgst < 0 || sgst > 50) {
      toast.error('Tax must be between 0 and 50')
      return
    }
    const newSettings = { cgst, sgst, enabled: taxForm.enabled }
    const res = await updateTaxSettings(newSettings)
    if (res.success) {
      setTaxSettings(newSettings)
      setShowTax(false)
      toast.success(
        taxForm.enabled
          ? `✅ Tax saved: CGST ${cgst}% + SGST ${sgst}%`
          : '✅ GST disabled on all bills',
        { duration: 3000 }
      )
    } else {
      toast.error(res.message || 'Failed to save tax settings')
    }
  }

  const handleGenerateBill = async (orderId) => {
    setGenerating(orderId)
    try {
      await generateBill(orderId)
      toast.success('Bill generated!', { id: `bill-${orderId}`, duration: 2000 })
      navigate(`/admin/bill/${orderId}`)
    } catch {
      navigate(`/admin/bill/${orderId}`)
    } finally {
      setGenerating(null)
    }
  }

  const totalToday = todayBills.reduce((s, b) => s + parseFloat(b.grand_total || 0), 0)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff' }}>
      <AdminNavbar ordersCount={0} billingCount={readyOrders.length} />

      <div style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── TAX SETTINGS BANNER ── */}
        <div style={{
          backgroundColor: '#0d0d0d', border: '1px solid #27272a',
          borderRadius: '12px', padding: '14px 18px', marginBottom: '24px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>🧾</span>
            <div>
              <p style={{ color: '#a1a1aa', fontSize: '11px', margin: '0 0 2px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                GST Settings
              </p>
              {taxSettings.enabled ? (
                <p style={{ color: '#4ade80', fontWeight: '700', fontSize: '14px', margin: 0 }}>
                  CGST {taxSettings.cgst}% + SGST {taxSettings.sgst}%
                  <span style={{ fontSize: '11px', marginLeft: '8px', background: '#14532d', padding: '1px 8px', borderRadius: '10px' }}>ACTIVE</span>
                </p>
              ) : (
                <p style={{ color: '#71717a', fontWeight: '600', fontSize: '14px', margin: 0 }}>
                  No GST applied
                  <span style={{ fontSize: '11px', marginLeft: '8px', background: '#1a1a1a', padding: '1px 8px', borderRadius: '10px' }}>DISABLED</span>
                </p>
              )}
            </div>
          </div>
          <button
            onClick={openTaxEdit}
            style={{
              background: 'transparent', color: '#facc15',
              border: '1px solid #facc15', borderRadius: '8px',
              padding: '8px 16px', fontWeight: '700',
              fontSize: '13px', cursor: 'pointer'
            }}
          >
            ✏️ Edit Tax Settings
          </button>
        </div>

        {/* ── READY FOR BILLING ── */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <h2 style={{ color: '#4ade80', fontFamily: 'Bebas Neue,sans-serif', fontSize: 'clamp(20px,4vw,28px)', letterSpacing: '2px', margin: 0 }}>
              🟢 READY FOR BILLING
            </h2>
            <span style={{ backgroundColor: '#16a34a', color: '#fff', borderRadius: '20px', padding: '3px 12px', fontSize: '15px', fontWeight: '900' }}>
              {readyOrders.length}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#facc15' }}>Loading...</div>
          ) : readyOrders.length === 0 ? (
            <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '14px', padding: '40px', textAlign: 'center', color: '#3f3f46', fontSize: '16px' }}>
              No orders ready for billing right now 🎉
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
              {readyOrders.map(order => {
                const tax = calculateTax(parseFloat(order.total_amount), taxSettings)
                return (
                  <div key={order.id} style={{ backgroundColor: '#0d0d0d', border: '2px solid #16a34a', borderRadius: '14px', padding: '18px', transition: 'box-shadow 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(22,163,74,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <h3 style={{ color: '#4ade80', fontSize: 'clamp(20px,4vw,26px)', fontWeight: '900', margin: '0 0 4px' }}>
                      TABLE {order.table_number}
                    </h3>
                    <p style={{ color: '#71717a', fontSize: '12px', margin: '0 0 14px' }}>
                      Order #{order.id} • {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>

                    <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '10px', marginBottom: '12px' }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#e4e4e7', padding: '3px 0' }}>
                          <span style={{ flex: 1, paddingRight: '8px' }}>{item.item_name}</span>
                          <span style={{ color: '#facc15', flexShrink: 0 }}>×{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tax preview */}
                    <div style={{ backgroundColor: '#111', borderRadius: '10px', padding: '10px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#71717a', marginBottom: '4px' }}>
                        <span>Subtotal</span>
                        <span>₹{parseFloat(order.total_amount).toFixed(2)}</span>
                      </div>
                      {taxSettings.enabled && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#71717a', marginBottom: '4px' }}>
                            <span>CGST ({taxSettings.cgst}%)</span>
                            <span>₹{tax.cgst.toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#71717a', marginBottom: '6px' }}>
                            <span>SGST ({taxSettings.sgst}%)</span>
                            <span>₹{tax.sgst.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', borderTop: '1px solid #222', paddingTop: '6px' }}>
                        <span style={{ color: '#4ade80', fontSize: '14px' }}>Grand Total</span>
                        <span style={{ color: '#4ade80', fontSize: '14px' }}>₹{tax.grandTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleGenerateBill(order.id)}
                      disabled={generating === order.id}
                      style={{
                        width: '100%',
                        background: generating === order.id ? '#a16207' : 'linear-gradient(135deg,#facc15,#f59e0b)',
                        color: '#000', border: 'none', borderRadius: '10px',
                        padding: '13px', fontWeight: '900',
                        fontSize: 'clamp(14px,2.5vw,16px)',
                        cursor: generating === order.id ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {generating === order.id ? '⏳ Generating...' : '🧾 Generate Bill'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── DIVIDER ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#1a1a1a' }} />
          <span style={{ color: '#3f3f46', fontSize: '12px', whiteSpace: 'nowrap', letterSpacing: '1px' }}>TODAY'S COMPLETED BILLS</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#1a1a1a' }} />
        </div>

        {/* ── TODAY'S BILLS ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ color: '#a1a1aa', fontSize: 'clamp(16px,3vw,20px)', fontWeight: '700', margin: 0 }}>📜 Bills Today</h3>
              <span style={{ backgroundColor: '#1a1a1a', border: '1px solid #3f3f46', color: '#a1a1aa', borderRadius: '20px', padding: '2px 10px', fontSize: '13px', fontWeight: '700' }}>
                {todayBills.length}
              </span>
            </div>
            {todayBills.length > 0 && (
              <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #facc1540', borderRadius: '10px', padding: '8px 16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#71717a', fontSize: '10px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Orders</p>
                  <p style={{ color: '#facc15', fontWeight: '900', fontSize: '16px', margin: 0 }}>{todayBills.length}</p>
                </div>
                <div style={{ width: '1px', height: '30px', backgroundColor: '#1a1a1a' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#71717a', fontSize: '10px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Revenue</p>
                  <p style={{ color: '#4ade80', fontWeight: '900', fontSize: '16px', margin: 0 }}>₹{totalToday.toFixed(0)}</p>
                </div>
              </div>
            )}
          </div>

          {todayBills.length === 0 ? (
            <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '14px', padding: '32px', textAlign: 'center', color: '#3f3f46', fontSize: '14px' }}>
              No bills generated today yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[...todayBills].reverse().map((bill, idx) => (
                <div key={bill.id || idx} style={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#3f3f46'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#111', border: '1px solid #3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#71717a', fontSize: '11px', fontWeight: '700' }}>#{bill.id}</span>
                    </div>
                    <div>
                      <p style={{ color: '#e4e4e7', fontWeight: '700', fontSize: '14px', margin: 0 }}>Table {bill.order_details?.table_number || '—'}</p>
                      <p style={{ color: '#71717a', fontSize: '11px', margin: 0 }}>Order #{bill.order} • {new Date(bill.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#71717a', fontSize: '10px', margin: 0 }}>Grand Total</p>
                      <p style={{ color: '#e4e4e7', fontWeight: '900', fontSize: '16px', margin: 0 }}>₹{parseFloat(bill.grand_total || 0).toFixed(2)}</p>
                    </div>
                    <button onClick={() => navigate(`/admin/bill/${bill.order}`)} style={{ backgroundColor: '#1a1a1a', color: '#facc15', border: '1px solid #3f3f46', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                      🖨️ Reprint
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── TAX SETTINGS MODAL ── */}
      {showTax && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) setShowTax(false) }}
        >
          <div style={{ backgroundColor: '#0d0d0d', border: '2px solid #facc15', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '24px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#facc15', fontWeight: '900', fontSize: '18px', margin: 0 }}>🧾 Tax Settings</h2>
              <button onClick={() => setShowTax(false)} style={{ backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}>×</button>
            </div>

            <p style={{ color: '#71717a', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>
              Set GST percentages. Once saved, all new bills across all devices will use these values automatically.
            </p>

            {/* Enable toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
              <div>
                <p style={{ color: '#fff', fontWeight: '700', fontSize: '14px', margin: 0 }}>Enable GST</p>
                <p style={{ color: '#71717a', fontSize: '12px', margin: 0 }}>
                  {taxForm.enabled ? 'GST applied on all bills' : 'No GST on bills'}
                </p>
              </div>
              <div
                onClick={() => setTaxForm(f => ({ ...f, enabled: !f.enabled }))}
                style={{ width: '48px', height: '26px', borderRadius: '13px', backgroundColor: taxForm.enabled ? '#16a34a' : '#3f3f46', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: '3px', transition: 'left 0.2s', left: taxForm.enabled ? '25px' : '3px' }} />
              </div>
            </div>

            {/* CGST */}
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>CGST %</label>
            <input
              type="number"
              value={taxForm.cgst}
              onChange={e => setTaxForm(f => ({ ...f, cgst: e.target.value }))}
              placeholder="e.g. 2.5"
              min="0" max="50" step="0.5"
              disabled={!taxForm.enabled}
              style={{ width: '100%', backgroundColor: taxForm.enabled ? '#000' : '#111', border: '2px solid #3f3f46', borderRadius: '10px', padding: '11px 14px', color: taxForm.enabled ? '#fff' : '#555', fontSize: '15px', outline: 'none', marginBottom: '14px', boxSizing: 'border-box', opacity: taxForm.enabled ? 1 : 0.5 }}
              onFocus={e => { if (taxForm.enabled) e.target.style.borderColor = '#facc15' }}
              onBlur={e => e.target.style.borderColor = '#3f3f46'}
            />

            {/* SGST */}
            <label style={{ display: 'block', color: '#a1a1aa', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>SGST %</label>
            <input
              type="number"
              value={taxForm.sgst}
              onChange={e => setTaxForm(f => ({ ...f, sgst: e.target.value }))}
              placeholder="e.g. 2.5"
              min="0" max="50" step="0.5"
              disabled={!taxForm.enabled}
              style={{ width: '100%', backgroundColor: taxForm.enabled ? '#000' : '#111', border: '2px solid #3f3f46', borderRadius: '10px', padding: '11px 14px', color: taxForm.enabled ? '#fff' : '#555', fontSize: '15px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box', opacity: taxForm.enabled ? 1 : 0.5 }}
              onFocus={e => { if (taxForm.enabled) e.target.style.borderColor = '#facc15' }}
              onBlur={e => e.target.style.borderColor = '#3f3f46'}
            />

            {/* Live preview */}
            {taxForm.enabled && (parseFloat(taxForm.cgst) > 0 || parseFloat(taxForm.sgst) > 0) && (
              <div style={{ backgroundColor: '#111', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '13px' }}>
                <p style={{ color: '#71717a', margin: '0 0 6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Preview on ₹1000 order</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', marginBottom: '3px' }}>
                  <span>Subtotal</span><span>₹1000.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', marginBottom: '3px' }}>
                  <span>CGST ({taxForm.cgst}%)</span>
                  <span>₹{((1000 * parseFloat(taxForm.cgst || 0)) / 100).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa', marginBottom: '6px' }}>
                  <span>SGST ({taxForm.sgst}%)</span>
                  <span>₹{((1000 * parseFloat(taxForm.sgst || 0)) / 100).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80', fontWeight: '700', borderTop: '1px solid #222', paddingTop: '6px' }}>
                  <span>Grand Total</span>
                  <span>₹{(1000 + (1000 * (parseFloat(taxForm.cgst || 0) + parseFloat(taxForm.sgst || 0))) / 100).toFixed(2)}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowTax(false)} style={{ flex: 1, backgroundColor: 'transparent', color: '#a1a1aa', border: '1px solid #3f3f46', borderRadius: '10px', padding: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                Cancel
              </button>
              <button onClick={saveTax} style={{ flex: 2, background: 'linear-gradient(135deg,#facc15,#f59e0b)', color: '#000', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '14px' }}>
                Save Tax Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}