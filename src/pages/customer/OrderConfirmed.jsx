import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'

export default function OrderConfirmed() {
  const [searchParams] = useSearchParams()
  const navigate        = useNavigate()
  const location        = useLocation()
  const orderId         = searchParams.get('orderId')
  const tableId         = searchParams.get('tableId')
  const customerName    = location.state?.customerName || 'Customer'
  const customerPhone   = location.state?.customerPhone || ''

  const displayPhone = customerPhone
    ? '+91 ' + customerPhone.slice(0, 5) + '-' + customerPhone.slice(5)
    : '+91 XXXXX-XXXXX'

  return (
    <div style={{ background: '#0c0c0f', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans',sans-serif", maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
        <div style={{ width: '100%', textAlign: 'center' }}>

          {/* brand strip */}
          <p style={{ fontSize: 10, fontWeight: 900, color: '#52525b', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 26 }}>
            MR. MOGLEE BBQ
          </p>

          {/* green check ring */}
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 0 0 12px rgba(22,163,74,.14),0 0 0 24px rgba(22,163,74,.07)', animation: 'popIn .5s cubic-bezier(.34,1.56,.64,1)' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* title */}
          <h1 style={{ fontSize: 'clamp(28px,7vw,36px)', fontWeight: 900, color: '#facc15', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 5px' }}>
            ORDER PLACED!
          </h1>
          <p style={{ color: '#52525b', fontSize: 14, marginBottom: 22 }}>#{orderId}</p>

          {/* quote */}
          <div style={{ background: '#16161c', border: '1px solid #26262e', borderRadius: 14, padding: '14px 16px', marginBottom: 18 }}>
            <p style={{ color: '#d4d4d8', fontSize: 13, lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
              "Sit back and relax — your food is being freshly prepared for you!"
            </p>
          </div>

          {/* info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            <div style={{ background: '#16161c', border: '1px solid #26262e', borderRadius: 12, padding: '13px 11px', textAlign: 'left' }}>
              <p style={{ color: '#52525b', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 7px' }}>CUSTOMER</p>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: '0 0 3px' }}>{customerName}</p>
              <p style={{ color: '#6b7280', fontSize: 11, margin: 0 }}>{displayPhone}</p>
            </div>
            <div style={{ background: '#16161c', border: '1px solid #26262e', borderRadius: 12, padding: '13px 11px', textAlign: 'left' }}>
              <p style={{ color: '#52525b', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 7px' }}>STATUS</p>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', display: 'inline-block', marginRight: 6, animation: 'pulse 1.5s infinite' }} />
                <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 13 }}>Being prepared</span>
              </div>
            </div>
          </div>

          {/* ETA */}
          <div style={{ background: '#16161c', border: '1px solid #26262e', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <p style={{ color: '#52525b', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 4px' }}>ESTIMATED ARRIVAL</p>
              <p style={{ color: '#facc15', fontWeight: 900, fontSize: 26, letterSpacing: .5, margin: 0 }}>15–20 MINS</p>
            </div>
            <div style={{ width: 42, height: 42, borderRadius: '50%', border: '2px solid #facc1435', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⏱️</div>
          </div>

          {/* back to menu */}
          <button
            onClick={() => navigate(`/menu?tableId=${tableId}`)}
            style={{ width: '100%', background: 'linear-gradient(135deg,#facc15,#f59e0b)', color: '#000', border: 'none', borderRadius: 14, padding: 15, fontWeight: 900, fontSize: 15, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(250,204,21,.35)', marginBottom: 22 }}>
            BACK TO MENU
          </button>

          {/* bottom nav — only HOME and ORDERS */}
          <div style={{ display: 'flex', borderTop: '1px solid #26262e', paddingTop: 12 }}>
            {[
              { icon: '🍽️', label: 'MENU',   path: `/menu?tableId=${tableId}`,      active: false },
              { icon: '📋', label: 'ORDERS', path: `/my-orders?tableId=${tableId}`, active: true  },
            ].map(n => (
              <div
                key={n.label}
                onClick={() => navigate(n.path)}
                style={{ flex: 1, textAlign: 'center', color: n.active ? '#facc15' : '#3f3f46', fontSize: 9, fontWeight: 700, letterSpacing: .5, cursor: 'pointer', padding: '4px 0' }}
              >
                <div style={{ fontSize: 18, marginBottom: 2 }}>{n.icon}</div>
                {n.label}
                {n.active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#facc15', margin: '4px auto 0' }} />}
              </div>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes popIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.4)} }
      `}</style>
    </div>
  )
}