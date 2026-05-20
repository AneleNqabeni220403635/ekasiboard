import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import AboutSection from './AboutSection'

export default function Navbar() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const [loginHover, setLoginHover] = useState(false)
  const [registerHover, setRegisterHover] = useState(false)
  const [postHover, setPostHover] = useState(false)
  const [logoutHover, setLogoutHover] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <nav className="site-nav" style={{
      background: '#1a0a00',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '2px solid #ff6b00',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      fontFamily: "'Syne', sans-serif"
    }}>
      <Link to="/" style={{
        color: '#ff6b00',
        fontWeight: '800',
        fontSize: '1.4rem',
        textDecoration: 'none',
        letterSpacing: '1px',
      }}>
        eKasi Board
      </Link>

      <div className="nav-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          style={{
            textDecoration: 'none',
            fontSize: '0.9rem',
            color: '#ff6b00',
            background: 'transparent',
            border: '1px solid #ff6b00',
            padding: '0.4rem 1rem',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          About
        </button>

        <Link
          to="/create-post"
          onMouseEnter={() => setPostHover(true)}
          onMouseLeave={() => setPostHover(false)}
          style={{
            textDecoration: 'none',
            fontSize: '0.9rem',
            color: '#fff',
            background: postHover ? '#e05500' : '#ff6b00',
            padding: '0.4rem 1rem',
            borderRadius: '6px',
            fontWeight: 'bold',
            display: 'inline-block',
            transform: postHover ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.2s ease',
          }}>
          + Post
        </Link>

        {user ? (
          <>
            <Link
              to="/profile"
              style={{
                color: '#ff6b00',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              👤 {profile?.username ?? user.email}
            </Link>

            <button
              onClick={handleLogout}
              onMouseEnter={() => setLogoutHover(true)}
              onMouseLeave={() => setLogoutHover(false)}
              style={{
                fontSize: '0.9rem',
                color: logoutHover ? '#ff6b00' : '#aaa',
                background: 'transparent',
                border: `1px solid ${logoutHover ? '#ff6b00' : '#444'}`,
                padding: '0.35rem 0.9rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: "'Syne', sans-serif",
                transform: logoutHover ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              onMouseEnter={() => setLoginHover(true)}
              onMouseLeave={() => setLoginHover(false)}
              style={{
                textDecoration: 'none',
                fontSize: '0.9rem',
                color: loginHover ? '#ff6b00' : '#aaa',
                display: 'inline-block',
                transform: loginHover ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}>
              Login
            </Link>

            <Link
              to="/register"
              onMouseEnter={() => setRegisterHover(true)}
              onMouseLeave={() => setRegisterHover(false)}
              style={{
                textDecoration: 'none',
                fontSize: '0.9rem',
                color: registerHover ? '#e05500' : '#ff6b00',
                fontWeight: 'bold',
                display: 'inline-block',
                transform: registerHover ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}>
              Register
            </Link>
          </>
        )}
      </div>

      <button
        className="mobile-toggle"
        aria-label="Toggle menu"
        onClick={() => setMobileOpen(o => !o)}
        style={{
          display: 'none',
          background: 'transparent',
          border: 'none',
          color: '#ff6b00',
          fontSize: '1.25rem',
          cursor: 'pointer'
        }}
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {mobileOpen && (
        <div className="mobile-menu" style={{
          position: 'absolute',
          top: '100%',
          right: '1rem',
          background: '#1a0a00',
          border: '1px solid #2a2a2a',
          borderRadius: '8px',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 1100,
          minWidth: '180px'
        }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setMobileOpen(false)
              setTimeout(() => setAboutOpen(true), 150)
            }}
            style={{
              color: '#ff6b00',
              background: 'transparent',
              border: '1px solid #ff6b00',
              padding: '0.45rem 0.6rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            About
          </button>
          <Link to="/create-post" style={{ color: '#fff', textDecoration: 'none', padding: '0.45rem 0.6rem', borderRadius: '6px', background: '#ff6b00', fontWeight: 'bold' }}>+ Post</Link>
          {user ? (
            <>
              <Link to="/profile" style={{ color: '#ff6b00', textDecoration: 'none', padding: '0.45rem 0.6rem' }}>{profile?.username ?? user.email}</Link>
              <button onClick={() => { setMobileOpen(false); handleLogout() }} style={{ background: 'transparent', border: '1px solid #444', color: '#aaa', padding: '0.45rem 0.6rem', borderRadius: '6px' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} style={{ color: '#aaa', textDecoration: 'none', padding: '0.45rem 0.6rem' }}>Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} style={{ color: '#ff6b00', fontWeight: 'bold', textDecoration: 'none', padding: '0.45rem 0.6rem' }}>Register</Link>
            </>
          )}
        </div>
      )}
      <AboutSection open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </nav>
  )
}