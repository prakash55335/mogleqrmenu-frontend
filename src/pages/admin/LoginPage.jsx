import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const { login, user } = useAuth()
  const navigate  = useNavigate()

  // If already logged in redirect to correct page
  useEffect(() => {
    if (user) {
    if (user.role === 'billing') navigate('/admin/billing')
    else navigate('/admin/orders')
    }
  }, [user, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(username, password)
      toast.success(`Welcome ${user.full_name}!`, {
      id: 'welcome-toast',
      duration: 3000,
       })
      if (user.role === 'kitchen') navigate('/admin/kitchen')
      else if (user.role === 'billing') navigate('/admin/billing')
      else navigate('/admin/tables')
    } catch {
      toast.error('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      backgroundColor: '#000',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '16px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%',
            backgroundColor: '#facc15', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: '14px',
            boxShadow: '0 0 40px rgba(250,204,21,0.4)'
          }}>
            <span style={{ color: '#000', fontSize: '32px', fontWeight: '900', fontFamily: 'Bebas Neue' }}>MR</span>
          </div>
          <h1 style={{
            color: '#facc15', fontSize: 'clamp(28px, 6vw, 42px)',
            fontWeight: '900', letterSpacing: '4px',
            textTransform: 'uppercase', margin: 0,
            fontFamily: 'Bebas Neue'
          }}>
            Mr. Moglee
          </h1>
          <p style={{
            color: '#ca8a04', fontSize: '12px',
            letterSpacing: '3px', textTransform: 'uppercase',
            marginTop: '6px'
          }}>
            🔥 BBQ Restaurant
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{
          backgroundColor: '#18181b',
          border: '2px solid #facc15',
          borderRadius: '20px', padding: '32px 28px',
          boxShadow: '0 0 60px rgba(250,204,21,0.1)'
        }}>
          <h2 style={{
            color: '#fff', fontSize: '20px', fontWeight: '700',
            textAlign: 'center', marginBottom: '24px', letterSpacing: '2px'
          }}>
            Admin Login
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', color: '#facc15',
              fontSize: '11px', fontWeight: '700',
              letterSpacing: '2px', textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoComplete="username"
              style={{
                width: '100%', backgroundColor: '#000',
                border: '2px solid #3f3f46', borderRadius: '10px',
                padding: '12px 16px', color: '#fff',
                fontSize: '15px', outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = '#facc15'}
              onBlur={e => e.target.style.borderColor = '#3f3f46'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block', color: '#facc15',
              fontSize: '11px', fontWeight: '700',
              letterSpacing: '2px', textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoComplete="current-password"
              style={{
                width: '100%', backgroundColor: '#000',
                border: '2px solid #3f3f46', borderRadius: '10px',
                padding: '12px 16px', color: '#fff',
                fontSize: '15px', outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = '#facc15'}
              onBlur={e => e.target.style.borderColor = '#3f3f46'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#a16207' : '#facc15',
              color: '#000', fontWeight: '900', fontSize: '16px',
              padding: '14px', borderRadius: '10px', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '2px', textTransform: 'uppercase',
              fontFamily: 'Bebas Neue',
              boxShadow: '0 4px 20px rgba(250,204,21,0.3)'
            }}
          >
            {loading ? '⏳ Logging in...' : 'LOGIN →'}
          </button>
        </form>

        <p style={{
          color: '#3f3f46', textAlign: 'center',
          fontSize: '11px', marginTop: '20px',
          letterSpacing: '2px', textTransform: 'uppercase'
        }}>
          © 2026 Mr. Moglee Restaurant
        </p>
      </div>
    </div>
  )
}