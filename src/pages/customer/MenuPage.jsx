import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getMenu } from '../../api/menuApi'
import { useMenuRealtime } from '../../hooks/useMenuRealtime'
import toast from 'react-hot-toast'

const SLIDES = [
  { img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=90', title: 'The Primal', accent: 'Smokehouse', sub: 'SMOKEHOUSE · FRESHLY GRILLED' },
  { img: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=900&q=90', title: 'BBQ', accent: 'Drumsticks', sub: 'SIGNATURE CHICKEN DRUMSTICKS' },
  { img: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=900&q=90', title: 'Crispy', accent: 'Wings', sub: 'HOT & SPICY WINGS BUCKET' },
  { img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=90', title: 'Juicy', accent: 'Burgers', sub: 'LOADED BURGERS & COMBOS' },
  { img: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=900&q=90', title: 'Fresh', accent: 'Shawarma', sub: 'SHAWARMA & WRAPS DAILY' },
]

const FOOD_IMAGES = {
  'BBQ Chicken':          'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=200&q=80',
  'Pepper BBQ Chicken':   'https://images.unsplash.com/photo-1598103442097-8b74394b95c8?w=200&q=80',
  'Sea Food':             'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=200&q=80',
  'Veg BBQ':              'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&q=80',
  'Celebration Pack':     'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80',
  'Burger Combos':        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80',
  'Wings Combos':         'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200&q=80',
  'Lollipop Combos':      'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=200&q=80',
  'Special Combo Offer':  'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=200&q=80',
  'Starters':             'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=200&q=80',
  'Moglee Fried Chicken': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=200&q=80',
  'Burger':               'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80',
  'Extras':               'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80',
  'Shawarma':             'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=200&q=80',
  'Sandwich':             'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=200&q=80',
  'Ice Cream':            'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200&q=80',
  'Milk Shake':           'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&q=80',
  'Falooda':              'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&q=80',
  'Moglee Spl Drink':     'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200&q=80',
}

const CAT_EMOJI = {
  'BBQ Chicken':'🍗','Pepper BBQ Chicken':'🌶️','Sea Food':'🦐','Veg BBQ':'🥦',
  'Celebration Pack':'🎉','Burger Combos':'🍔','Wings Combos':'🍗','Lollipop Combos':'🍭',
  'Special Combo Offer':'⭐','Starters':'🍟','Moglee Fried Chicken':'🍗','Burger':'🍔',
  'Extras':'➕','Shawarma':'🌯','Sandwich':'🥪','Ice Cream':'🍦',
  'Milk Shake':'🥤','Falooda':'🍹','Moglee Spl Drink':'🥤',
}

const FB = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80'

export default function MenuPage() {
  const [categories, setCategories]         = useState([])
  const [cart, setCart]                     = useState({})
  const [loading, setLoading]               = useState(true)
  const [search, setSearch]                 = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [curSlide, setCurSlide]             = useState(0)
  const [searchParams]                      = useSearchParams()
  const navigate                            = useNavigate()
  const tableId                             = searchParams.get('tableId')
  const timerRef                            = useRef(null)

  const fetchMenu = useCallback(() => {
    if (!tableId) return
    setLoading(true)
    getMenu()
      .then(res => {
        // safely handle all possible response shapes
        const raw = res?.data?.data ?? res?.data ?? res ?? []
        setCategories(Array.isArray(raw) ? raw : [])
      })
      .catch(() => toast.error('Failed to load menu'))
      .finally(() => setLoading(false))
  }, [tableId])

  useEffect(() => { fetchMenu() }, [fetchMenu])

  // Supabase Realtime — re-fetch when any menu item changes
  useMenuRealtime(fetchMenu)

  useEffect(() => {
    timerRef.current = setInterval(() => setCurSlide(s => (s + 1) % SLIDES.length), 3500)
    return () => clearInterval(timerRef.current)
  }, [])

  const goSlide = (n) => {
    clearInterval(timerRef.current)
    setCurSlide((n + SLIDES.length) % SLIDES.length)
    timerRef.current = setInterval(() => setCurSlide(s => (s + 1) % SLIDES.length), 3500)
  }

  const addItem = (item) =>
    setCart(p => ({ ...p, [item.id]: { ...item, quantity: (p[item.id]?.quantity || 0) + 1 } }))

  const removeItem = (id) =>
    setCart(p => {
      const u = { ...p }
      if (u[id]?.quantity > 1) u[id] = { ...u[id], quantity: u[id].quantity - 1 }
      else delete u[id]
      return u
    })

  const cartItems  = Object.values(cart)
  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)

  const goToCart = () => navigate(`/cart?tableId=${tableId}`, { state: { cart, tableId } })

  const filtered = (categories || [])
    .map(cat => ({
      ...cat,
      items: (cat.items || []).filter(i =>
        i.is_available &&
        (search === '' || i.name.toLowerCase().includes(search.toLowerCase()))
      ),
    }))
    .filter(cat => (activeCategory === 'all' || cat.name === activeCategory) && cat.items.length > 0)

  if (!tableId) return (
    <div style={{ background: '#0c0c0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#ef4444', fontSize: 18 }}>❌ Invalid QR Code</p>
    </div>
  )

  return (
    <div style={{ background: '#0c0c0f', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans',sans-serif", width: '100%', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', paddingBottom: totalItems > 0 ? 70 : 56 }}>

      {/* HEADER */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(12,12,15,.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #26262e', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#facc15,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(250,204,21,.5)', fontSize: 12, fontWeight: 900, color: '#000', flexShrink: 0 }}>MR</div>
          <div>
            <p style={{ fontSize: 18, color: '#facc15', letterSpacing: 2, lineHeight: 1, margin: 0, fontWeight: 900 }}>MR. MOGLEE BBQ</p>
            <p style={{ fontSize: 10, color: '#f59e0b', letterSpacing: 1, margin: 0 }}>🔥 TABLE {tableId} · BBQ RESTAURANT</p>
          </div>
        </div>
        {totalItems > 0 && (
          <button onClick={goToCart} style={{ background: 'linear-gradient(135deg,#facc15,#f59e0b)', border: 'none', borderRadius: 22, padding: '7px 13px', fontWeight: 900, fontSize: 12, color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 4px 14px rgba(250,204,21,.35)', fontFamily: 'inherit' }}>
            🛒 {totalItems} · ₹{totalPrice.toFixed(0)}
          </button>
        )}
      </div>

      {/* HERO SLIDER */}
      <div style={{ position: 'relative', height: 210, overflow: 'hidden', flexShrink: 0, borderRadius: 20, margin: '10px 12px 0' }}>
        <div style={{ display: 'flex', height: '100%', transform: `translateX(-${curSlide * 100}%)`, transition: 'transform .55s cubic-bezier(.25,.46,.45,.94)' }}>
          {SLIDES.map((s, i) => (
            <div key={i} style={{ minWidth: '100%', height: '100%', position: 'relative', flexShrink: 0 }}>
              <img src={s.img} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src = FB} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(12,12,15,.95) 0%,rgba(12,12,15,.1) 55%,transparent 100%)', display: 'flex', alignItems: 'flex-end', padding: '16px 18px' }}>
                <div>
                  <p style={{ fontSize: 26, color: '#fff', lineHeight: 1.1, margin: 0, fontWeight: 900 }}>
                    {s.title} <span style={{ color: '#facc15' }}>{s.accent}</span>
                  </p>
                  <p style={{ color: '#facc15', fontSize: 12, fontWeight: 700, letterSpacing: 1, margin: '2px 0 0' }}>{s.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => goSlide(curSlide - 1)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.15)', borderRadius: '50%', width: 32, height: 32, color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', zIndex: 5 }}>‹</button>
        <button onClick={() => goSlide(curSlide + 1)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.15)', borderRadius: '50%', width: 32, height: 32, color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', zIndex: 5 }}>›</button>
        <div style={{ position: 'absolute', bottom: 10, right: 14, display: 'flex', gap: 5 }}>
          {SLIDES.map((_, i) => (
            <div key={i} onClick={() => goSlide(i)} style={{ height: 6, borderRadius: 3, cursor: 'pointer', transition: 'all .3s', background: i === curSlide ? '#facc15' : 'rgba(255,255,255,.35)', width: i === curSlide ? 18 : 6 }} />
          ))}
        </div>
      </div>

      {/* SEARCH */}
      <div style={{ position: 'relative', margin: '14px 16px 0' }}>
        <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
        <input type="text" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', background: '#16161c', border: '1.5px solid #26262e', borderRadius: 14, padding: '10px 14px 10px 37px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = '#facc15'}
          onBlur={e => e.target.style.borderColor = '#26262e'} />
      </div>

      {/* CATEGORY TABS */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 16px', scrollbarWidth: 'none' }}>
        <CatTab label="🍽️ All" active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} />
        {(categories || []).map(cat => (
          <CatTab key={cat.id} label={`${CAT_EMOJI[cat.name] || '🍴'} ${cat.name}`} active={activeCategory === cat.name} onClick={() => setActiveCategory(cat.name)} />
        ))}
      </div>

      {/* MENU LIST */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔥</div>
          <p style={{ color: '#facc15', fontSize: 16, fontWeight: 900, letterSpacing: 2 }}>LOADING MENU...</p>
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>No items found</p>
      ) : (
        filtered.map((cat, ci) => (
          <div key={cat.id} style={{ paddingBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 16px 10px' }}>
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg,#facc15,transparent)' }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: '#facc15', letterSpacing: '1.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{CAT_EMOJI[cat.name] || '🍴'} {cat.name}</span>
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg,transparent,#facc15)' }} />
              {ci === 0 && <span style={{ background: '#facc1518', border: '1px solid #facc1550', borderRadius: 6, padding: '2px 7px', fontSize: 9, color: '#facc15', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>RECOMMENDED</span>}
            </div>
            {(cat.items || []).map(item => (
              <ItemCard key={item.id} item={item} qty={cart[item.id]?.quantity || 0} catImage={FOOD_IMAGES[cat.name]} onAdd={() => addItem(item)} onRemove={() => removeItem(item.id)} />
            ))}
          </div>
        ))
      )}

      {/* CART BAR or BOTTOM NAV */}
      {totalItems > 0 ? (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'linear-gradient(135deg,#facc15,#f59e0b)', padding: '13px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, boxShadow: '0 -4px 24px rgba(250,204,21,.3)' }}>
          <div>
            <p style={{ color: '#000', fontWeight: 900, fontSize: 14, margin: 0 }}>🛒 {totalItems} item{totalItems !== 1 ? 's' : ''} added</p>
            <p style={{ color: '#78350f', fontSize: 11, fontWeight: 600, margin: 0 }}>₹{totalPrice.toFixed(0)}</p>
          </div>
          <button onClick={goToCart} style={{ background: '#000', color: '#facc15', border: 'none', borderRadius: 12, padding: '9px 18px', fontWeight: 900, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>View Cart →</button>
        </div>
      ) : (
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, display: 'flex', background: '#0f0f14', borderTop: '1px solid #26262e', zIndex: 90 }}>
          {[
            { icon: '🍽️', label: 'MENU',     key: 'menu',     path: `/menu?tableId=${tableId}` },
            { icon: '📋', label: 'ORDERS',   key: 'orders',   path: `/my-orders?tableId=${tableId}` },
            { icon: '💬', label: 'FEEDBACK', key: 'feedback', path: `/feedback?tableId=${tableId}` },
          ].map(n => (
            <button key={n.key}
              onClick={() => navigate(n.path)}
              style={{ flex: 1, padding: '10px 0', border: 'none', background: 'transparent', color: n.key === 'menu' ? '#facc15' : '#3f3f46', cursor: 'pointer', fontSize: 9, fontWeight: 700, letterSpacing: .5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: 'inherit' }}>
              <span style={{ fontSize: 19 }}>{n.icon}</span>
              {n.label}
              {n.key === 'menu' && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#facc15', marginTop: 1 }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function CatTab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ background: active ? '#facc15' : '#16161c', color: active ? '#000' : '#6b7280', border: active ? 'none' : '1px solid #26262e', borderRadius: 25, padding: '6px 13px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'inherit', boxShadow: active ? '0 4px 14px rgba(250,204,21,.28)' : 'none', transition: 'all .15s' }}>
      {label}
    </button>
  )
}

function ItemCard({ item, qty, catImage, onAdd, onRemove }) {
  return (
    <div style={{ margin: '0 16px 10px', background: '#16161c', border: '1px solid #26262e', borderRadius: 16, padding: 11, display: 'flex', gap: 11, alignItems: 'center' }}>
      <img src={item.image || catImage || FB} alt={item.name} style={{ width: 76, height: 76, borderRadius: 11, objectFit: 'cover', flexShrink: 0, border: '1px solid #26262e' }} onError={e => e.target.src = FB} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, background: item.is_veg ? '#22c55e' : '#ef4444', boxShadow: `0 0 6px ${item.is_veg ? '#22c55e60' : '#ef444460'}` }} />
          <p style={{ fontWeight: 700, fontSize: 13, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
        </div>
        {item.description && <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 5px', lineHeight: 1.3 }}>{item.description}</p>}
        <p style={{ color: '#facc15', fontWeight: 900, fontSize: 15, margin: 0 }}>₹{item.price}</p>
      </div>
      <div style={{ flexShrink: 0 }}>
        {qty > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <QtyBtn label="−" onClick={onRemove} />
            <span style={{ fontWeight: 900, fontSize: 15, color: '#facc15', minWidth: 16, textAlign: 'center' }}>{qty}</span>
            <QtyBtn label="+" onClick={onAdd} filled />
          </div>
        ) : (
          <button onClick={onAdd} style={{ background: 'linear-gradient(135deg,#facc15,#f59e0b)', color: '#000', border: 'none', borderRadius: 10, padding: '7px 13px', fontWeight: 900, cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(250,204,21,.25)' }}>+ ADD</button>
        )}
      </div>
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