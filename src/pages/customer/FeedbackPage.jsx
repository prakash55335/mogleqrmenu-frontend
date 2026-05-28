import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'

const EMOJIS = ['😞', '😐', '🙂', '😄', '🤩']
const LABELS = ['Poor', 'Fair', 'Good', 'Great', 'Excellent']

const TAGS = [
  '🔥 Loved the BBQ', '🍗 Crispy & Juicy', '⚡ Quick Service',
  '😊 Friendly Staff', '🌶️ Perfect Spice', '💯 Worth it',
  '🎉 Great Experience', '🍔 Best Burgers', '🥤 Amazing Drinks',
]

export default function FeedbackPage() {
  const [searchParams] = useSearchParams()
  const navigate        = useNavigate()
  const tableId         = searchParams.get('tableId')

  const [rating, setRating]       = useState(0)
  const [hovered, setHovered]     = useState(0)
  const [tags, setTags]           = useState([])
  const [comment, setComment]     = useState('')
  const [name, setName]           = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const toggleTag = (t) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])

  const handleSubmit = async () => {
    if (!rating) { toast.error('Please give a rating'); return }
    setSubmitting(true)
    try {
      await API.post('/api/v1/feedback/', {
        table_id:      tableId,
        customer_name: name.trim() || 'Anonymous',
        overall_rating: rating,
        tags,
        comment: comment.trim(),
      })
    } catch { /* show success anyway */ }
    finally {
      setSubmitting(false)
      setSubmitted(true)
    }
  }

  /* ── THANK YOU SCREEN ── */
  if (submitted) return (
    <div style={{ background: '#0c0c0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>

        <div style={{ width: 76, height: 76, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 0 12px rgba(22,163,74,.14),0 0 0 24px rgba(22,163,74,.07)' }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div style={{ fontSize: 40, marginBottom: 8 }}>{EMOJIS[rating - 1]}</div>
        <h1 style={{ color: '#facc15', fontSize: 28, fontWeight: 900, letterSpacing: 2, margin: '0 0 8px', textTransform: 'uppercase' }}>Thank You!</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 6px' }}>You rated us: <span style={{ color: '#facc15', fontWeight: 700 }}>{LABELS[rating - 1]}</span></p>
        <p style={{ color: '#52525b', fontSize: 13, margin: '0 0 28px', lineHeight: 1.6 }}>Your feedback helps us serve you better 🙏</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 28 }}>
          {[1,2,3,4,5].map(s => (
            <span key={s} style={{ fontSize: 28, opacity: s <= rating ? 1 : 0.2 }}>⭐</span>
          ))}
        </div>

        <button onClick={() => navigate(`/menu?tableId=${tableId}`)}
          style={{ width: '100%', background: 'linear-gradient(135deg,#facc15,#f59e0b)', color: '#000', border: 'none', borderRadius: 14, padding: '15px', fontWeight: 900, fontSize: 15, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', boxShadow: '0 4px 20px rgba(250,204,21,.35)' }}>
          Back to Menu 🍗
        </button>
      </div>
    </div>
  )

  /* ── MAIN FEEDBACK FORM ── */
  return (
    <div style={{ background: '#0c0c0f', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans',sans-serif", maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', paddingBottom: 80 }}>

      {/* HEADER */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(12,12,15,.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #26262e', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#facc15,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#000', flexShrink: 0, boxShadow: '0 0 16px rgba(250,204,21,.5)' }}>MR</div>
        <div>
          <p style={{ fontSize: 18, color: '#facc15', letterSpacing: 2, lineHeight: 1, margin: 0, fontWeight: 900 }}>FEEDBACK</p>
          <p style={{ fontSize: 10, color: '#f59e0b', letterSpacing: 1, margin: 0 }}>✨ TABLE {tableId} · SHARE YOUR EXPERIENCE</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── BIG STAR RATING ── */}
        <div style={{ background: '#16161c', border: '1px solid #26262e', borderRadius: 20, padding: '28px 20px', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 6px' }}>How was your experience?</p>
          <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 20px' }}>Tap a star to rate</p>

          {/* emoji display */}
          <div style={{ fontSize: 48, marginBottom: 16, minHeight: 60, transition: 'all .2s' }}>
            {(hovered || rating) ? EMOJIS[(hovered || rating) - 1] : '🍽️'}
          </div>

          {/* stars */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            {[1,2,3,4,5].map(s => (
              <button key={s}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 36, padding: 0, transition: 'transform .15s', transform: (hovered || rating) >= s ? 'scale(1.15)' : 'scale(1)' }}>
                <span style={{ color: (hovered || rating) >= s ? '#facc15' : '#26262e' }}>★</span>
              </button>
            ))}
          </div>

          {/* label */}
          {(hovered || rating) > 0 && (
            <p style={{ color: '#facc15', fontSize: 16, fontWeight: 900, margin: 0, letterSpacing: 1 }}>
              {LABELS[(hovered || rating) - 1]}
            </p>
          )}
        </div>

        {/* ── QUICK TAGS ── */}
        <div style={{ background: '#16161c', border: '1px solid #26262e', borderRadius: 16, padding: '16px' }}>
          <p style={{ color: '#facc15', fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 12px' }}>What did you love? (Optional)</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TAGS.map(t => (
              <button key={t} onClick={() => toggleTag(t)}
                style={{ padding: '7px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: tags.includes(t) ? 'none' : '1px solid #26262e', background: tags.includes(t) ? '#facc15' : '#0c0c0f', color: tags.includes(t) ? '#000' : '#6b7280', transition: 'all .15s', fontFamily: 'inherit' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── COMMENT ── */}
        <div>
          <label style={{ color: '#6b7280', fontSize: 10, display: 'block', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Comments (Optional)</label>
          <textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Tell us what you loved or how we can improve..."
            rows={3}
            style={{ width: '100%', background: '#16161c', border: '1.5px solid #26262e', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#facc15'}
            onBlur={e => e.target.style.borderColor = '#26262e'} />
        </div>

        {/* ── NAME ── */}
        <div>
          <label style={{ color: '#6b7280', fontSize: 10, display: 'block', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Your Name (Optional)</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Prakash"
            style={{ width: '100%', background: '#16161c', border: '1.5px solid #26262e', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#facc15'}
            onBlur={e => e.target.style.borderColor = '#26262e'} />
        </div>

        {/* ── SUBMIT ── */}
        <button onClick={handleSubmit} disabled={submitting || !rating}
          style={{ width: '100%', background: !rating || submitting ? '#1a1a22' : 'linear-gradient(135deg,#facc15,#f59e0b)', color: !rating || submitting ? '#52525b' : '#000', border: 'none', borderRadius: 14, padding: '16px', fontWeight: 900, fontSize: 15, cursor: !rating || submitting ? 'not-allowed' : 'pointer', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'inherit', boxShadow: rating && !submitting ? '0 4px 20px rgba(250,204,21,.4)' : 'none', transition: 'all .2s' }}>
          {submitting ? '⏳ Submitting...' : '✨ Submit Feedback'}
        </button>

        <p style={{ textAlign: 'center', color: '#3f3f46', fontSize: 11, margin: 0 }}>Your feedback helps us serve you better 🙏</p>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, display: 'flex', background: '#0f0f14', borderTop: '1px solid #26262e', zIndex: 90 }}>
        {[
          { icon: '🍽️', label: 'MENU',     key: 'menu',     path: `/menu?tableId=${tableId}` },
          { icon: '📋', label: 'ORDERS',   key: 'orders',   path: `/my-orders?tableId=${tableId}` },
          { icon: '💬', label: 'FEEDBACK', key: 'feedback', path: `/feedback?tableId=${tableId}` },
        ].map(n => (
          <button key={n.key} onClick={() => navigate(n.path)}
            style={{ flex: 1, padding: '10px 0', border: 'none', background: 'transparent', color: n.key === 'feedback' ? '#facc15' : '#3f3f46', cursor: 'pointer', fontSize: 9, fontWeight: 700, letterSpacing: .5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: 'inherit' }}>
            <span style={{ fontSize: 19 }}>{n.icon}</span>
            {n.label}
            {n.key === 'feedback' && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#facc15', marginTop: 1 }} />}
          </button>
        ))}
      </div>
    </div>
  )
}