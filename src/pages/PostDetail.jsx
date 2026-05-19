import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [siblings, setSiblings] = useState([])

  // Contact handled via WhatsApp only (no in-app messaging)

  useEffect(() => {
    async function fetchPost() {
      const { data, error } = await supabase
        .from('posts')
        .select('*, categories(id, name, slug), profiles(username, phone_number)')
        .eq('id', id)
        .single()

      if (error || !data) {
        navigate('/')
        return
      }

      setPost(data)
      setSelectedImage(null)

      const { data: siblingData } = await supabase
        .from('posts')
        .select('id, title')
        .eq('category_id', data.category_id)
        .order('created_at', { ascending: false })

      setSiblings(siblingData || [])
      setLoading(false)
    }
    fetchPost()
  }, [id])

  // In-app messaging removed; users contact via WhatsApp link below.

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#ff6b00', fontSize: '1.1rem' }}>Loading...</p>
    </div>
  )

  if (!post) return null

  const currentIndex = siblings.findIndex(s => s.id === id)
  const prevPost = currentIndex > 0 ? siblings[currentIndex - 1] : null
  const nextPost = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null

  const phone = post.profiles?.phone_number?.replace(/\s+/g, '')
  const waNumber = phone?.startsWith('0') ? '27' + phone.slice(1) : phone
  const waMessage = encodeURIComponent(`Hi, I saw your post "${post.title}" on eKasi Board and I want to help!`)
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`

  const navBtnStyle = (disabled) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.9rem',
    borderRadius: '8px',
    border: `1px solid ${disabled ? '#333' : '#ff6b00'}`,
    background: disabled ? 'transparent' : '#ff6b00',
    color: disabled ? '#444' : '#fff',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    cursor: disabled ? 'default' : 'pointer',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flexShrink: 1,
  })

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 0.9rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,107,0,0.3)',
    background: 'rgba(255,255,255,0.05)',
    color: '#f5f5f5',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: "'Segoe UI', sans-serif",
    lineHeight: '1.5',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#f5f5f5', padding: '2rem' }}>

      {/* Back button */}
      <Link to="/" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        color: '#ff6b00',
        textDecoration: 'none',
        fontSize: '0.9rem',
        marginBottom: '1.5rem',
        fontWeight: 'bold',
      }}>
        ← Back to Board
      </Link>

      {/* Card */}
      <div style={{
        maxWidth: '760px',
        width: '100%',
        margin: '0 auto',
        background: '#1a1a1a',
        borderRadius: '16px',
        border: '1px solid #2a2a2a',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>

        {/* Images */}
        {post.image_urls && post.image_urls.length > 0 && (
          <div>
            <img
              src={selectedImage || post.image_urls[0]}
              alt="post"
              style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }}
            />
            {post.image_urls.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', padding: '0.6rem', background: '#111' }}>
                {post.image_urls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`thumb-${i}`}
                    onClick={() => setSelectedImage(url)}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: (selectedImage || post.image_urls[0]) === url ? '2px solid #ff6b00' : '2px solid transparent',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '1.5rem 1.8rem 1.8rem' }}>

          {/* Category badge */}
          <span style={{
            background: '#ff6b0015',
            color: '#ff6b00',
            padding: '0.2rem 0.8rem',
            borderRadius: '10px',
            fontSize: '0.78rem',
            fontWeight: 'bold',
          }}>
            {post.categories?.name}
          </span>

          {/* Title */}
          <h1 style={{ color: '#ffffff', fontSize: '1.6rem', margin: '0.8rem 0 0.4rem', lineHeight: 1.3 }}>
            {post.title}
          </h1>

          {/* Meta */}
          <p style={{ color: '#888', fontSize: '0.82rem', marginBottom: '1.1rem' }}>
            by <span style={{ color: '#ff6b00' }}>{post.profiles?.username}</span> · {new Date(post.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div style={{ width: '36px', height: '2px', background: '#ff6b00', marginBottom: '1.1rem' }} />

          {/* Description */}
          <p style={{ color: '#c0c0c0', fontSize: '0.97rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
            {post.description}
          </p>

          {/* Amount / compensation */}
          {post.reward_amount > 0 && (
            <div style={{
              marginTop: '1.2rem',
              padding: '0.7rem 1rem',
              background: 'rgba(0,210,106,0.08)',
              border: '1px solid rgba(0,210,106,0.3)',
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{ fontSize: '1.1rem' }}>💰</span>
              <span style={{ color: '#00d26a', fontWeight: 'bold', fontSize: '0.97rem' }}>
                {post.categories?.slug === 'lost-and-found' || post.categories?.slug === 'safety-alerts'
                  ? `Reward: R${post.reward_amount}`
                  : post.categories?.slug === 'jobs'
                  ? `Salary: R${post.reward_amount}`
                  : `Price: R${post.reward_amount}`}
              </span>
            </div>
          )}

          {/* Resolved badge */}
          {post.is_resolved && (
            <div style={{
              marginTop: '0.8rem',
              padding: '0.45rem 0.9rem',
              background: 'rgba(255,107,0,0.1)',
              border: '1px solid #ff6b00',
              borderRadius: '8px',
              color: '#ff6b00',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              display: 'inline-block',
            }}>
              ✅ Resolved
            </div>
          )}

          {/* ── Contact & Actions section ── */}
          <div className="post-detail-actions-section">
            <p className="post-detail-actions-title">
              Contact Poster
            </p>

            <div className="post-detail-actions">
              {waNumber ? (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="post-detail-whatsapp-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp {post.profiles?.username}
                </a>
              ) : (
                <div className="post-detail-action-btn post-detail-action-disabled">No contact</div>
              )}

              <Link to={`/?category=${post.categories?.id}`} className="post-detail-action-btn post-detail-action-secondary">
                More in {post.categories?.name || 'this category'}
              </Link>
            </div>
          </div>

          {/* Prev / Next navigation */}
          {siblings.length > 1 && (
            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1.1rem',
              borderTop: '1px solid #2a2a2a',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.8rem',
            }}>
              <button
                onClick={() => prevPost && navigate(`/post/${prevPost.id}`)}
                disabled={!prevPost}
                style={navBtnStyle(!prevPost)}
                title={prevPost?.title}
              >
                ← {prevPost ? prevPost.title : 'First post'}
              </button>

              <span style={{ color: '#555', fontSize: '0.75rem', flexShrink: 0 }}>
                {currentIndex + 1} / {siblings.length}
              </span>

              <button
                onClick={() => nextPost && navigate(`/post/${nextPost.id}`)}
                disabled={!nextPost}
                style={navBtnStyle(!nextPost)}
                title={nextPost?.title}
              >
                {nextPost ? nextPost.title : 'Last post'} →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}