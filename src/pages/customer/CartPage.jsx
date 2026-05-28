import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { placeOrder } from '../../api/orderApi'
import { fetchTaxSettings, calculateTax } from '../../utils/taxSettings'
import toast from 'react-hot-toast'

const FB = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80'

export default function CartPage() {
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const location        = useLocation()
  const tableId         = searchParams.get('tableId')

  const [cart, setCart]                   = useState(location.state?.cart || {})
  const [customerName, setCustomerName]   = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [note, setNote]                   = useState('')
  const [placing, setPlacing]             = useState(false)
  const [nameFocus, setNameFocus]         = useState(false)
  const [phoneFocus, setPhoneFocus]       = useState(false)
  const [noteFocus, setNoteFocus]         = useState(false)
  const [tax, setTax]                     = useState({ cgst: 0, sgst: 0, enabled: false })

  useEffect(() => {
    fetchTaxSettings().then(t => setTax(t))
  }, [])

  const cartItems  = Object.values(cart)
  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0)
  const subtotal   = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const taxAmounts = calculateTax(subtotal, tax)
  const gstTotal   = taxAmounts.cgst + taxAmounts.sgst
  const grandTotal = taxAmounts.grandTotal

  const addItem = (item) =>
    setCart(p => ({ ...p, [item.id]: { ...item, quantity: (p[item.id]?.quantity || 0) + 1 } }))

  const removeItem = (id) =>
    setCart(p => {
      const u = { ...p }
      if (u[id]?.quantity > 1) u[id] = { ...u[id], quantity: u[id].quantity - 1 }
      else delete u[id]
      return u
    })

  const handlePlaceOrder = async () => {
    if (!cartItems.length) return

    if (!customerName.trim()) {
      document.getElementById('nameInput').style.borderColor = '#ef4444'
      setTimeout(() => {
        const el = document.getElementById('nameInput')
        if (el) el.style.borderColor = '#26262e'
      }, 2000)
      toast.error('Please enter your name')
      return
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      document.getElementById('phoneInput').style.borderColor = '#ef4444'
      setTimeout(() => {
        const el = document.getElementById('phoneInput')
        if (el) el.style.borderColor = '#26262e'
      }, 2000)
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    setPlacing(true)
    try {
      const res = await placeOrder({
        table_id:       parseInt(tableId),
        customer_note:  note,
        customer_name:  customerName.trim(),
        customer_phone: customerPhone.trim(),
        items: cartItems.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
      })

      const key      = `orders_table_${tableId}`
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      existing.push(res.data.order_id)
      localStorage.setItem(key, JSON.stringify(existing))

      navigate(`/order-confirmed?orderId=${res.data.order_id}&tableId=${tableId}`, {
        state: { customerName: customerName.trim(), customerPhone: customerPhone.trim() }
      })
    } catch {
      toast.error('Failed to place order. Try again.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div style={{ background: '#0c0c0f', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans',sans-serif", maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <div style={{ background: 'rgba(12,12,15,.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #26262e', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate(-1)} style={{ background: '#16161c', border: '1px solid #26262e', color: '#fff', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>‹</button>
        <div>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#facc15', letterSpacing: 1.5, margin: 0 }}>Your BBQ Cart</p>
          <p style={{ fontSize: 11, color: '#52525b', margin: '2px 0 0' }}>Table {tableId} · {totalItems} item{totalItems !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* SCROLL AREA */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 100px' }}>

        {cartItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
            <p style={{ fontSize: 16, fontWeight: 700 }}>Your cart is empty</p>
            <button onClick={() => navigate(`/menu?tableId=${tableId}`)} style={{ marginTop: 16, background: 'linear-gradient(135deg,#facc15,#f59e0b)', color: '#000', border: 'none', borderRadius: 12, padding: '10px 24px', fontWeight: 900, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
              Browse Menu →
            </button>
          </div>
        )}

        {/* CART ITEMS */}
        {cartItems.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 0', borderBottom: '1px solid #26262e' }}>
            <img src={item.image || FB} alt={item.name} style={{ width: 56, height: 56, borderRadius: 11, objectFit: 'cover', flexShrink: 0, border: '1px solid #26262e' }} onError={e => e.target.src = FB} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#fff', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
              <p style={{ color: '#facc15', fontWeight: 700, fontSize: 13, margin: 0 }}>₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
              <QtyBtn label="−" onClick={() => removeItem(item.id)} />
              <span style={{ fontWeight: 900, fontSize: 15, color: '#facc15', minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
              <QtyBtn label="+" onClick={() => addItem(item)} filled />
            </div>
          </div>
        ))}

        {cartItems.length > 0 && (
          <>
            {/* CUSTOMER DETAILS */}
            <div style={{ background: '#16161c', border: '1.5px solid #facc1528', borderRadius: 14, padding: 15, marginTop: 16, marginBottom: 14 }}>
              <p style={{ color: '#facc15', fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 13px' }}>📋 Your Details (Required)</p>

              <div style={{ marginBottom: 11 }}>
                <label style={{ color: '#6b7280', fontSize: 10, display: 'block', marginBottom: 5, letterSpacing: 1, textTransform: 'uppercase' }}>Full Name *</label>
                <input id="nameInput" type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Enter your name"
                  style={{ width: '100%', background: '#0c0c0f', border: `1.5px solid ${nameFocus ? '#facc15' : '#26262e'}`, borderRadius: 11, padding: '10px 13px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .2s' }}
                  onFocus={() => setNameFocus(true)} onBlur={() => setNameFocus(false)} />
              </div>

              <div>
                <label style={{ color: '#6b7280', fontSize: 10, display: 'block', marginBottom: 5, letterSpacing: 1, textTransform: 'uppercase' }}>Mobile Number *</label>
                <input id="phoneInput" type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" maxLength={10}
                  style={{ width: '100%', background: '#0c0c0f', border: `1.5px solid ${phoneFocus ? '#facc15' : '#26262e'}`, borderRadius: 11, padding: '10px 13px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .2s' }}
                  onFocus={() => setPhoneFocus(true)} onBlur={() => setPhoneFocus(false)} />
              </div>
            </div>

            {/* SPECIAL NOTE */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: '#6b7280', fontSize: 10, display: 'block', marginBottom: 5, letterSpacing: 1, textTransform: 'uppercase' }}>Special Instructions (Optional)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Less spicy, no onion..." rows={2}
                style={{ width: '100%', background: '#16161c', border: `1.5px solid ${noteFocus ? '#facc15' : '#26262e'}`, borderRadius: 11, padding: '10px 13px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'none', lineHeight: 1.5, boxSizing: 'border-box', transition: 'border-color .2s' }}
                onFocus={() => setNoteFocus(true)} onBlur={() => setNoteFocus(false)} />
            </div>

            {/* TOTALS */}
            <div style={{ background: '#16161c', border: '1px solid #26262e', borderRadius: 14, padding: 15, marginBottom: 14 }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#52525b', marginBottom: 7 }}>
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {/* GST line — shows only if enabled */}
              {tax.enabled ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#52525b', marginBottom: 7 }}>
                  <span>GST ({tax.cgst + tax.sgst}%)</span>
                  <span>₹{gstTotal.toFixed(2)}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#3f3f46', marginBottom: 7 }}>
                  <span>GST</span>
                  <span>Not applicable</span>
                </div>
              )}

              <div style={{ height: 1, background: '#26262e', margin: '10px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 17 }}>
                <span style={{ color: '#fff' }}>Total Amount</span>
                <span style={{ color: '#facc15' }}>₹{grandTotal.toFixed(2)}</span>
              </div>

              {/* GST note */}
              {tax.enabled && (
                <p style={{ color: '#52525b', fontSize: 10, margin: '8px 0 0', textAlign: 'right', letterSpacing: 0.5 }}>
                  Incl. CGST {tax.cgst}% + SGST {tax.sgst}%
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* PLACE ORDER BUTTON */}
      {cartItems.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '12px 16px', background: '#0c0c0f', borderTop: '1px solid #26262e' }}>
          <button onClick={handlePlaceOrder} disabled={placing}
            style={{ width: '100%', background: placing ? '#78350f' : 'linear-gradient(135deg,#facc15,#f59e0b)', color: '#000', border: 'none', borderRadius: 14, padding: 15, fontWeight: 900, fontSize: 15, cursor: placing ? 'not-allowed' : 'pointer', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'inherit', boxShadow: placing ? 'none' : '0 4px 20px rgba(250,204,21,.4)' }}>
            {placing ? '⏳ Placing Order...' : `PLACE ORDER  ₹${grandTotal.toFixed(0)} →`}
          </button>
        </div>
      )}
    </div>
  )
}

function QtyBtn({ label, onClick, filled }) {
  return (
    <button onClick={onClick} style={{ width: 30, height: 30, borderRadius: '50%', border: filled ? 'none' : '2px solid #facc15', background: filled ? '#facc15' : 'transparent', color: filled ? '#000' : '#facc15', fontSize: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontFamily: 'inherit' }}>
      {label}
    </button>
  )
}