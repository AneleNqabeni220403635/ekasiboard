import { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { supabase } from '../supabase'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const C_SECTION_BOUNDS = [
  [-34.0380, 18.6490],
  [-34.0270, 18.6630],
]

export default function CreatePost() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [rewardAmount, setRewardAmount] = useState('')
  const [categories, setCategories] = useState([])
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [eventDatetime, setEventDatetime] = useState('')
  const [availability, setAvailability] = useState('')
  const [tradingHours, setTradingHours] = useState('')
  const [highAlert, setHighAlert] = useState(false)
  const [existingImageUrls, setExistingImageUrls] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [loadingPost, setLoadingPost] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id: editPostId } = useParams()

  useEffect(() => {
    if (user === null) navigate('/login')
  }, [user])

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('*').order('name')
      setCategories(data || [])
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    async function fetchPost() {
      if (!editPostId || !user) return
      setLoadingPost(true)
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', editPostId)
        .single()

      if (error || !data || data.user_id !== user.id) {
        navigate('/create-post')
        return
      }

      setIsEdit(true)
      setTitle(data.title || '')
      setDescription(data.description || '')
      setCategoryId(data.category_id)
      setRewardAmount(data.reward_amount ? String(data.reward_amount) : '')
      setEventDatetime(data.event_datetime ? new Date(data.event_datetime).toISOString().slice(0, 16) : '')
      setAvailability(data.availability || '')
      setTradingHours(data.trading_hours || '')
      setHighAlert(data.high_alert || false)
      setExistingImageUrls(data.image_urls || [])
      setLoadingPost(false)
    }
    fetchPost()
  }, [editPostId, user])

  function handleImageChange(e) {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 4) {
      setError('You can upload a maximum of 4 images.')
      return
    }
    setImages(prev => [...prev, ...files])
    const previews = files.map(f => URL.createObjectURL(f))
    setImagePreviews(prev => [...prev, ...previews])
  }

  function removeImage(index) {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  function removeExistingImage(index) {
    setExistingImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function openDropdown() {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
    setDropdownOpen(o => !o)
  }

  async function handleSubmit() {
    setError(null)

    if (!title.trim() || !description.trim() || !categoryId) {
      setError('Please fill in title, description and category.')
      return
    }

    setLoading(true)

    // Preserve existing images and upload any new ones
    let imageUrls = [...existingImageUrls]
    for (const image of images) {
      const ext = image.name.split('.').pop()
      const filename = `${user.id}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filename, image)
      if (uploadError) {
        setError('Image upload failed: ' + uploadError.message)
        setLoading(false)
        return
      }
      const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(filename)
      imageUrls.push(urlData.publicUrl)
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category_id: categoryId,
      reward_amount: rewardAmount ? parseFloat(rewardAmount) : null,
      image_urls: imageUrls.length > 0 ? imageUrls : null,
      event_datetime: eventDatetime || null,
      availability: availability || null,
      trading_hours: tradingHours || null,
      high_alert: highAlert || false,
    }

    if (isEdit && editPostId) {
      const { error: updateError } = await supabase
        .from('posts')
        .update(payload)
        .eq('id', editPostId)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }
      navigate(`/post/${editPostId}`)
    } else {
      const { error: insertError } = await supabase.from('posts').insert({
        ...payload,
        user_id: user.id,
        is_resolved: false,
      })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }
      navigate('/')
    }
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
    fontFamily: "'Segoe UI', sans-serif",
  }

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 })
  const dropdownRef = useRef(null)

  const labelStyle = {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: '#aaa',
    display: 'block',
    marginBottom: '0.4rem',
    textAlign: 'left',
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Fixed satellite map background */}
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

      {/* Scrollable content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '3rem 2rem 7rem',
        overflow: 'visible',
      }}>
        <div style={{
          background: 'rgba(15,10,5,0.82)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderRadius: '20px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '560px',
          border: '1px solid rgba(255,107,0,0.25)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,107,0,0.08)',
          overflow: 'visible',
        }}>

          {/* Header — centered */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: '#ff6b00', fontSize: '1.9rem', marginBottom: '0.3rem', letterSpacing: '-0.5px' }}>
              {isEdit ? 'Edit Post' : 'Create a Post'}
            </h1>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>
              {isEdit ? 'Update your post details for the community' : 'Share something ekasi'}
            </p>
            <div style={{ width: '48px', height: '2px', background: 'linear-gradient(90deg, transparent, #ff6b00, transparent)', margin: '0.9rem auto 0' }} />
          </div>

          {/* Error */}
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

          {/* Title */}
          <label style={labelStyle}>Title *</label>
          <input
            type="text"
            placeholder="e.g. Lost dog in Sidima Crescent"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#ff6b00'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,107,0,0.3)'}
          />

          {/* Description */}
          <label style={labelStyle}>Description *</label>
          <textarea
            placeholder="Give details about your post..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
            onFocus={e => e.target.style.borderColor = '#ff6b00'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,107,0,0.3)'}
          />

          {/* Category-specific fields */}
          {(() => {
            const sel = categories.find(c => c.id === categoryId)
            const slug = sel?.slug
            if (!slug) return null

            if (slug === 'events' || slug === 'announcements' || (slug && slug.includes('event'))) {
              return (
                <>
                  <label style={labelStyle}>Event Date & Time</label>
                  <input type="datetime-local" value={eventDatetime} onChange={e => setEventDatetime(e.target.value)} style={inputStyle} />
                </>
              )
            }

            if (slug === 'jobs' || slug === 'services') {
              return (
                <>
                  <label style={labelStyle}>Availability</label>
                  <input type="text" placeholder="e.g. Weekdays 9am–5pm" value={availability} onChange={e => setAvailability(e.target.value)} style={inputStyle} />
                </>
              )
            }

            if (slug === 'local-businesses' || slug === 'businesses') {
              return (
                <>
                  <label style={labelStyle}>Trading Hours</label>
                  <input type="text" placeholder="e.g. Mon–Fri 8am–4pm" value={tradingHours} onChange={e => setTradingHours(e.target.value)} style={inputStyle} />
                </>
              )
            }

            if (slug === 'lost-and-found' || slug === 'safety-alerts') {
              return (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                  <input type="checkbox" checked={highAlert} onChange={e => setHighAlert(e.target.checked)} />
                  <span style={{ color: '#fff' }}>High alert (send attention badge)</span>
                </label>
              )
            }

            return null
          })()}

          {/* Images */}
          <label style={labelStyle}>
            Images <span style={{ color: '#666', fontWeight: 'normal' }}>— optional, max 4</span>
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px dashed rgba(255,107,0,0.4)',
            background: 'rgba(255,107,0,0.05)',
            color: '#ff6b00',
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginBottom: '1rem',
            boxSizing: 'border-box',
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,0,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,107,0,0.05)'}
          >
            📷 Choose Images
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>

          {/* Image previews */}
          {(existingImageUrls.length > 0 || imagePreviews.length > 0) && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}>
              {existingImageUrls.map((src, i) => (
                <div key={`existing-${i}`} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={src} alt={`existing-${i}`} style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
                  <button
                    onClick={() => removeExistingImage(i)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(0,0,0,0.7)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >✕</button>
                </div>
              ))}
              {imagePreviews.map((src, i) => (
                <div key={`preview-${i}`} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={src} alt={`preview-${i}`} style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
                  <button
                    onClick={() => removeImage(i)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(0,0,0,0.7)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Category — portal dropdown */}
          <label style={labelStyle}>Category *</label>
          <div style={{ position: 'relative', marginBottom: '1rem' }} ref={dropdownRef}>
            <div
              onClick={openDropdown}
              style={{
                ...inputStyle,
                marginBottom: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                color: categoryId ? '#f5f5f5' : '#888',
                borderColor: dropdownOpen ? '#ff6b00' : 'rgba(255,107,0,0.3)',
                userSelect: 'none',
              }}
            >
              <span>{categoryId ? categories.find(c => c.id === categoryId)?.name : 'Select a category'}</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{dropdownOpen ? '▲' : '▼'}</span>
            </div>
          </div>

          {dropdownOpen && ReactDOM.createPortal(
            <div style={{
              position: 'absolute',
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              background: '#1a0a00',
              border: '1px solid #ff6b00',
              borderRadius: '8px',
              zIndex: 99999,
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
            }}>
              {categories.map((cat, i) => (
                <div
                  key={cat.id}
                  onMouseDown={() => { setCategoryId(cat.id); setDropdownOpen(false) }}
                  style={{
                    padding: '0.75rem 1rem',
                    color: categoryId === cat.id ? '#ff6b00' : '#f5f5f5',
                    background: categoryId === cat.id ? 'rgba(255,107,0,0.12)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    borderBottom: i < categories.length - 1 ? '1px solid rgba(255,107,0,0.1)' : 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,0,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = categoryId === cat.id ? 'rgba(255,107,0,0.12)' : 'transparent'}
                >
                  {cat.name}
                </div>
              ))}
            </div>,
            document.body
          )}

          {/* Back link */}
          <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem', color: '#ff6b00', textDecoration: 'none', fontSize: '0.9rem' }}>← Back to Board</Link>

          {/* Amount (dynamic label based on category) */}
          <label style={labelStyle}>
            {(() => {
              const sel = categories.find(c => c.id === categoryId)
              if (!sel) return 'Amount (R)'
              if (sel.slug === 'lost-and-found' || sel.slug === 'safety-alerts') return 'Reward Amount (R)'
              if (sel.slug === 'jobs') return 'Salary (R)'
              return 'Price (R)'
            })()} <span style={{ color: '#666', fontWeight: 'normal' }}>— optional</span>
          </label>
          <input
            type="number"
            placeholder="e.g. 200"
            value={rewardAmount}
            onChange={e => setRewardAmount(e.target.value)}
            min="0"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#ff6b00'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,107,0,0.3)'}
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: loading ? 'rgba(255,107,0,0.5)' : 'linear-gradient(135deg, #ff6b00, #e05500)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(255,107,0,0.35)',
              transition: 'opacity 0.2s, box-shadow 0.2s',
            }}>
            {loading ? (isEdit ? 'Saving...' : 'Posting...') : (isEdit ? 'Save Changes' : 'Post to eKasi Board')}
          </button>
        </div>
      </div>

      {/* Fixed footer */}
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
          © 2026 eKasi Board · C-Section, Khayelitsha · Yonke into eC-Section 🏘️
        </p>
      </footer>
    </div>
  )
}