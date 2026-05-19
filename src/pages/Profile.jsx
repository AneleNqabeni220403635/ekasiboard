import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [callmebotApiKey, setCallmebotApiKey] = useState('')
  const [whatsappNotifications, setWhatsappNotifications] = useState(true)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!user) navigate('/login')
    if (profile) {
      setFullName(profile.full_name || '')
      setUsername(profile.username || '')
      setPhoneNumber(profile.phone_number || '')
      setCallmebotApiKey(profile.callmebot_apikey || '')
      setWhatsappNotifications(profile.whatsapp_notifications ?? true)
    }
  }, [user, profile])

  async function handleUpdate() {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        username: username.trim(),
        phone_number: phoneNumber.trim(),
        callmebot_apikey: callmebotApiKey.trim(),
        whatsapp_notifications: whatsappNotifications,
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  async function handleToggleNotifications(checked) {
    setWhatsappNotifications(checked)
    setError(null)
    // optimistic UI — show saving state briefly
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ whatsapp_notifications: checked })
        .eq('id', user.id)

      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 1800)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    await supabase.from('profiles').delete().eq('id', user.id)
    await logout()
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
    background: 'rgba(255,255,255,0.05)',
    color: '#f5f5f5',
    fontFamily: "'Syne', sans-serif",
    transition: 'border 0.2s',
  }

  const labelStyle = {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: '#aaa',
    display: 'block',
    marginBottom: '0.4rem',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: "'Syne', sans-serif"
    }}>
      <div style={{
        background: '#1a1a1a',
        borderRadius: '16px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '480px',
        border: '1px solid #2a2a2a',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>

        {/* Back link */}
        <Link
          to="/"
          style={{
            display: 'inline-block',
            marginBottom: '1.5rem',
            color: '#ff6b00',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            transition: '0.2s ease',
          }}
        >
          ← Back to eKasi Board
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#ff6b00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            margin: '0 auto 1rem',
          }}>
            👤
          </div>

          <h1 style={{ color: '#ff6b00', fontSize: '1.6rem', marginBottom: '0.3rem' }}>
            My Profile
          </h1>

          <p style={{ color: '#888', fontSize: '0.9rem' }}>
            {user?.email}
          </p>
        </div>

        {/* Success */}
        {success && (
          <div style={{
            background: 'rgba(0,210,106,0.1)',
            border: '1px solid rgba(0,210,106,0.3)',
            color: '#00d26a',
            padding: '0.8rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            ✅ Profile updated successfully!
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(204,0,0,0.1)',
            border: '1px solid rgba(204,0,0,0.3)',
            color: '#ff6b6b',
            padding: '0.8rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <label style={labelStyle}>Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#ff6b00'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,107,0,0.3)'}
        />

        <label style={labelStyle}>Username</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = '#ff6b00'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,107,0,0.3)'}
        />

        <label style={labelStyle}>Phone Number (for WhatsApp contact)</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value)}
          style={inputStyle}
          placeholder="e.g. +277831234567"
          onFocus={e => e.target.style.borderColor = '#ff6b00'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,107,0,0.3)'}
        />

        {/* CallMeBot API Key */}
        <label style={labelStyle}>CallMeBot API Key</label>
        <input
          type="text"
          value={callmebotApiKey}
          onChange={e => setCallmebotApiKey(e.target.value)}
          style={inputStyle}
          placeholder="Your personal CallMeBot API key"
          onFocus={e => e.target.style.borderColor = '#ff6b00'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,107,0,0.3)'}
        />
        <p style={{ fontSize: '0.78rem', color: '#666', marginTop: '-0.6rem', marginBottom: '1rem', lineHeight: '1.4' }}>
          To receive WhatsApp notifications, send <strong style={{ color: '#888' }}>"I allow callmebot to send me messages"</strong> to <strong style={{ color: '#888' }}>+34 644 59 72 23</strong> on WhatsApp, then paste your API key above.{' '}
          <a href="https://www.callmebot.com/blog/free-api-whatsapp-messages/" target="_blank" rel="noopener noreferrer" style={{ color: '#ff6b00', textDecoration: 'none' }}>
            Get your key →
          </a>
        </p>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem', color: '#ddd', fontSize: '0.95rem', lineHeight: '1.4' }}>
          <input
            type="checkbox"
            checked={whatsappNotifications}
            onChange={e => handleToggleNotifications(e.target.checked)}
            style={{ width: '1.1rem', height: '1.1rem', marginTop: '0.2rem' }}
          />
          <span>
            Receive WhatsApp notifications for new community posts. Turn this off anytime.
          </span>
        </label>

        {/* Save button */}
        <button
          onClick={handleUpdate}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.9rem',
            background: loading ? 'rgba(255,107,0,0.5)' : '#ff6b00',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '1rem',
            fontFamily: "'Syne', sans-serif",
          }}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #2a2a2a', margin: '1.5rem 0' }} />

        {/* Delete account */}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: 'transparent',
              color: '#ff4444',
              border: '1px solid #ff4444',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: "'Syne', sans-serif",
            }}>
            Delete My Account
          </button>
        ) : (
          <div style={{
            background: 'rgba(255,68,68,0.08)',
            border: '1px solid rgba(255,68,68,0.3)',
            borderRadius: '8px',
            padding: '1.2rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#ff4444', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Are you sure? This will permanently delete your account and all your posts.
            </p>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  background: 'transparent',
                  color: '#aaa',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: "'Syne', sans-serif",
                }}>
                Cancel
              </button>

              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  background: '#ff4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontFamily: "'Syne', sans-serif",
                }}>
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}