import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { generateBill } from '../../api/billingApi'
import { fetchTaxSettings, calculateTax } from '../../utils/taxSettings'
import { AdminNavbar } from './OrderPage'

export default function BillPrint() {
  const [bill,    setBill]    = useState(null)
  const [tax,     setTax]     = useState({ cgst: 0, sgst: 0, enabled: false })
  const [loading, setLoading] = useState(true)
  const { orderId } = useParams()
  const navigate    = useNavigate()

  useEffect(() => {
    if (!orderId) return
    Promise.all([
      generateBill(orderId),
      fetchTaxSettings()
    ])
      .then(([billRes, taxRes]) => {
        setBill(billRes.data.data)
        setTax(taxRes)
      })
      .catch(err => console.error('Error:', err))
      .finally(() => setLoading(false))
  }, [orderId])

  const handlePrint = () => {
    window.print()
    setTimeout(() => navigate('/admin/billing'), 3000)
  }

  if (loading) return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh' }}>
      <AdminNavbar ordersCount={0} billingCount={0} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px' }}>
        <p style={{ color: '#facc15', fontSize: '20px' }}>⏳ Generating bill...</p>
      </div>
    </div>
  )

  if (!bill) return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh' }}>
      <AdminNavbar ordersCount={0} billingCount={0} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', padding: '80px' }}>
        <p style={{ color: 'red', fontSize: '20px' }}>❌ Error loading bill</p>
        <button onClick={() => navigate('/admin/billing')} style={{ backgroundColor: '#facc15', color: '#000', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: '700', cursor: 'pointer', fontSize: '16px' }}>
          ← Back to Billing
        </button>
      </div>
    </div>
  )

  const subtotal   = parseFloat(bill.total_amount || 0)
  const taxAmounts = calculateTax(subtotal, tax)
  const cgstAmt    = taxAmounts.cgst
  const sgstAmt    = taxAmounts.sgst
  const grandTotal = taxAmounts.grandTotal

  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh' }}>
      <div className="no-print">
        <AdminNavbar ordersCount={0} billingCount={0} />
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 30px rgba(0,0,0,0.4)', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ backgroundColor: '#000', padding: '24px 20px', textAlign: 'center', borderBottom: '3px solid #facc15' }}>
            <div style={{ width: '65px', height: '65px', borderRadius: '50%', backgroundColor: '#facc15', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <span style={{ color: '#000', fontWeight: '900', fontSize: '20px' }}>MR</span>
            </div>
            <h2 style={{ color: '#facc15', fontSize: 'clamp(20px,5vw,26px)', fontWeight: '900', margin: '0 0 4px', letterSpacing: '3px' }}>MR. MOGLEE</h2>
            <p style={{ color: '#a1a1aa', fontSize: 'clamp(10px,2.5vw,12px)', margin: '0 0 2px' }}>SB Cinema's Opp, Kumananchavadi, CH-56</p>
            <p style={{ color: '#a1a1aa', fontSize: 'clamp(10px,2.5vw,12px)', margin: 0 }}>📞 9363922326</p>
          </div>

          {/* Body */}
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: 'clamp(11px,2.5vw,13px)', color: '#555' }}>
              <span><strong>Table:</strong> {bill.order_details?.table_number}</span>
              <span><strong>Bill #:</strong> {bill.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: 'clamp(11px,2.5vw,13px)', color: '#555' }}>
              <span><strong>Order #:</strong> {bill.order}</span>
              <span style={{ fontSize: 'clamp(10px,2vw,12px)' }}>{new Date(bill.created_at).toLocaleString('en-IN')}</span>
            </div>

            {/* Customer info */}
            {(bill.order_details?.customer_name || bill.order_details?.customer_phone) && (
              <div style={{ background: '#facc1540', border: '1px solid #facc15', borderRadius: '8px', padding: '8px 10px', margin: '10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>👤</span>
                <div style={{ minWidth: 0 }}>
                  {bill.order_details?.customer_name && (
                    <p style={{ color: '#000', fontWeight: '700', fontSize: '13px', margin: 0 }}>{bill.order_details.customer_name}</p>
                  )}
                  {bill.order_details?.customer_phone && (
                    <p style={{ color: '#b91c1c', fontWeight: '600', fontSize: '12px', margin: 0 }}>📞 {bill.order_details.customer_phone}</p>
                  )}
                </div>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '2px dashed #e5e5e5', margin: '14px 0' }} />

            {/* Items table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(11px,2.5vw,14px)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <th style={{ textAlign: 'left', padding: '6px 0', color: '#999', fontWeight: '600' }}>Item</th>
                  <th style={{ textAlign: 'center', padding: '6px 0', color: '#999', fontWeight: '600' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '6px 0', color: '#999', fontWeight: '600' }}>Rate</th>
                  <th style={{ textAlign: 'right', padding: '6px 0', color: '#999', fontWeight: '600' }}>Amt</th>
                </tr>
              </thead>
              <tbody>
                {bill.order_details?.items?.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '6px 0', fontSize: 'clamp(10px,2.5vw,13px)' }}>{item.item_name}</td>
                    <td style={{ textAlign: 'center', padding: '6px 0' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '6px 0' }}>₹{parseFloat(item.unit_price).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', padding: '6px 0' }}>₹{parseFloat(item.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <hr style={{ border: 'none', borderTop: '2px dashed #e5e5e5', margin: '14px 0' }} />

            {/* Totals */}
            <div style={{ fontSize: 'clamp(12px,2.5vw,14px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#555' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {tax.enabled ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#555' }}>
                    <span>CGST ({tax.cgst}%)</span>
                    <span>₹{cgstAmt.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#555' }}>
                    <span>SGST ({tax.sgst}%)</span>
                    <span>₹{sgstAmt.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#aaa', fontSize: '12px' }}>
                  <span>GST</span>
                  <span>Not applicable</span>
                </div>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '2px solid #000', margin: '10px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'clamp(16px,4vw,22px)', fontWeight: '900' }}>
              <span>GRAND TOTAL</span>
              <span style={{ color: '#facc15', backgroundColor: '#000', padding: '4px 12px', borderRadius: '8px' }}>
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e5e5' }}>
              <p style={{ fontSize: 'clamp(13px,3vw,15px)', fontWeight: '700', color: '#000', margin: '0 0 4px' }}>Thank you for visiting Mr. Moglee! 🙏</p>
              <p style={{ fontSize: 'clamp(10px,2.5vw,12px)', color: '#999', margin: 0 }}>Visit us again soon!</p>
              <p style={{ fontSize: 'clamp(10px,2vw,11px)', color: '#bbb', marginTop: '4px' }}>Available on Swiggy & Zomato</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="no-print" style={{ maxWidth: '480px', margin: '14px auto 30px', display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/admin/billing')} style={{ flex: 1, backgroundColor: '#0d0d0d', color: '#facc15', border: '2px solid #facc15', borderRadius: '10px', padding: '13px', fontWeight: '700', cursor: 'pointer', fontSize: 'clamp(13px,3vw,15px)' }}>
            ← Back
          </button>
          <button onClick={handlePrint} style={{ flex: 2, background: 'linear-gradient(135deg,#facc15,#f59e0b)', color: '#000', border: 'none', borderRadius: '10px', padding: '13px', fontWeight: '900', cursor: 'pointer', fontSize: 'clamp(13px,3vw,15px)' }}>
            🖨️ Print Bill
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          @page { size: A4; margin: 10mm; }
        }
      `}</style>
    </div>
  )
}