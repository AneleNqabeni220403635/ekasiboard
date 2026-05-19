import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const C_SECTION_BOUNDS = [
  [-34.0380, 18.6490],
  [-34.0270, 18.6630],
]

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [whatsappNotifications, setWhatsappNotifications] = useState(true)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  if (user) {
    navigate('/')
    return null
  }

  async function handleRegister() {
    setLoading(true)
    setError(null)

    if (!fullName || !username || !email || !password) {
      setError('Please fill in all fields.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      username,
      full_name: fullName,
      phone_number: phoneNumber.trim() || null,
      whatsapp_notifications: whatsappNotifications,
    })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    navigate('/')
  }

  const inputStyle = {
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,107,0,0.3)',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '1rem',
    background: 'rgba(255,255,255,0.07)',
    color: '#f5f5f5',
    backdropFilter: 'blur(4px)',
    transition: 'border 0.2s',
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* satellite map background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <MapContainer
          center={[-34.0325, 18.6450]}
          zoom={17}
          minZoom={16}
          maxZoom={18}
          maxBounds={C_SECTION_BOUNDS}
          maxBoundsViscosity={1.0}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          keyboard={false}
          attributionControl={false}
          style={{ height: '100vh', width: '100vw' }}
        >
          <TileLayer url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' />
          {/* Labels overlay (roads/streets) */}
          <TileLayer
            attribution='Labels: Esri'
            url='https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}'
            opacity={0.9}
          />
        </MapContainer>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,5,0,0.72)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 110%, rgba(255,107,0,0.18) 0%, transparent 65%)' }} />
      </div>

      {/* Scrollable content area */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 2rem 7rem',
      }}>
        <div style={{
          background: 'rgba(15,10,5,0.82)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderRadius: '20px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '420px',
          border: '1px solid rgba(255,107,0,0.25)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,107,0,0.08)',
        }}>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: '#ff6b00', fontSize: '1.9rem', marginBottom: '0.3rem', letterSpacing: '-0.5px' }}>
              Join eKasi Board 🏘️
            </h1>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>C-Section, Khayelitsha</p>
            <div style={{ width: '48px', height: '2px', background: 'linear-gradient(90deg, transparent, #ff6b00, transparent)', margin: '0.9rem auto 0' }} />
          </div>

          {error && (
            <div style={{
              background: 'rgba(204,0,0,0.12)',
              border: '1px solid rgba(204,0,0,0.4)',
              color: '#ff6b6b',
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
            }}>
              {error}
            </div>
          )}

          <input type="text" placeholder="Full Name" value={fullName}
            onChange={e => setFullName(e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#ff6b00'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,107,0,0.3)'} />

          <input type="text" placeholder="Username" value={username}
            onChange={e => setUsername(e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#ff6b00'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,107,0,0.3)'} />

          <input type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#ff6b00'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,107,0,0.3)'} />

          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#ff6b00'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,107,0,0.3)'} />

          {/* Phone number — optional, used for WhatsApp contact */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <input
              type="tel"
              placeholder="WhatsApp Number (optional, e.g. +27831234567)"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0, paddingLeft: '2.8rem' }}
              onFocus={e => e.target.style.borderColor = '#ff6b00'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,107,0,0.3)'}
            />
            <span style={{
              position: 'absolute',
              left: '0.9rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1rem',
              pointerEvents: 'none',
            }}>📱</span>
          </div>
          <p style={{ color: '#666', fontSize: '0.78rem', marginBottom: '1rem', marginTop: '-0.3rem' }}>
            Your number lets people contact you via WhatsApp on your posts.
          </p>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem', color: '#ddd', fontSize: '0.95rem', lineHeight: '1.4' }}>
            <input
              type="checkbox"
              checked={whatsappNotifications}
              onChange={e => setWhatsappNotifications(e.target.checked)}
              style={{ width: '1.1rem', height: '1.1rem', marginTop: '0.2rem' }}
            />
            <span>
              Send me WhatsApp notifications for new community posts. I can turn this off anytime in my profile.
            </span>
          </label>

          <button onClick={handleRegister} disabled={loading} style={{
            width: '100%',
            padding: '0.9rem',
            background: loading ? 'rgba(255,107,0,0.5)' : 'linear-gradient(135deg, #ff6b00, #e05500)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '1.2rem',
            boxShadow: loading ? 'none' : '0 4px 16px rgba(255,107,0,0.35)',
            transition: 'opacity 0.2s, box-shadow 0.2s',
          }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#ff6b00', fontWeight: 'bold', textDecoration: 'none' }}>
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* footer */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 2,
        background: '#1a0a00',
        borderTop: '2px solid #ff6b00',
        padding: '1.5rem 2rem',
        textAlign: 'center',
      }}>
        <p style={{ color: '#ff6b00', fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.3rem' }}>
          eKasi Board
        </p>
        <p style={{ color: '#aaa', fontSize: '0.85rem' }}>
          © 2026 eKasi Board · C-Section, Khayelitsha 7784 · Yonke into eC-Section 🏘️
        </p>
      </footer>
    </div>
  )
}