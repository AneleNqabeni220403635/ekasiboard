import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { useState } from 'react'

export default function PostCard({ post, currentUserId, onClose }) {
  const [closing, setClosing] = useState(false)

  const isHighAlertCategory = (slug) => slug === 'lost-and-found' || slug === 'safety-alerts'
  const isEventCategory = (slug) => slug === 'events' || slug === 'announcements' || slug?.includes('event')
  const isJobCategory = (slug) => slug === 'jobs' || slug === 'services'
  const isBusinessCategory = (slug) => slug === 'local-businesses' || slug === 'businesses'
  const wasEdited = post?.updated_at && post?.updated_at !== post?.created_at

  async function handleClose() {
    if (!post?.id) return
    setClosing(true)
    const { error } = await supabase.from('posts').update({ is_resolved: true }).eq('id', post.id)
    setClosing(false)
    if (!error && typeof onClose === 'function') onClose()
  }

  return (
    <div className="post-card" style={{ background: '#1a1a1a', borderRadius: '12px', padding: '1.2rem', border: '1px solid #2a2a2a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', alignItems: 'flex-start' }}>
        <div>
          <span style={{ background: '#ff6b0015', color: '#ff6b00', padding: '0.2rem 0.7rem', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 'bold' }}>
            {post.categories?.name}
          </span>
          {isHighAlertCategory(post.categories?.slug) && post.high_alert && (
            <span style={{ marginLeft: '0.6rem', color: '#ff3b3b', fontWeight: 'bold' }}>🚨 High Alert</span>
          )}
          {wasEdited && (
            <span style={{ marginLeft: '0.6rem', color: '#aad400', fontWeight: 'bold' }}>Updated</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {currentUserId === post.user_id && (
            <Link to={`/edit-post/${post.id}`} style={{ color: '#fff', background: '#444', padding: '0.35rem 0.65rem', borderRadius: '8px', fontSize: '0.8rem', textDecoration: 'none' }}>
              Edit
            </Link>
          )}
          {currentUserId === post.user_id && !post.is_resolved && (
            <button onClick={handleClose} disabled={closing} style={{ background: '#ff6b00', color: '#fff', border: 'none', padding: '0.4rem 0.7rem', borderRadius: '8px', cursor: 'pointer' }}>
              {closing ? 'Closing...' : (isEventCategory(post.categories?.slug) ? 'Cancel Event' : post.categories?.slug === 'for-sale' ? 'Mark as Sold' : 'Close Post')}
            </button>
          )}
        </div>
      </div>

      <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <h3 style={{ color: '#fff', margin: '0.6rem 0 0.4rem' }}>{post.title}</h3>
        <p style={{ color: '#c0c0c0', fontSize: '0.9rem', lineHeight: 1.4 }}>{post.description?.substring(0, 120)}{post.description && post.description.length > 120 ? '...' : ''}</p>

        {isEventCategory(post.categories?.slug) && post.event_datetime && (
          <p style={{ color: '#ffd97a', marginTop: '0.6rem', fontSize: '0.9rem' }}>🗓️ {new Date(post.event_datetime).toLocaleString()}</p>
        )}

        {isJobCategory(post.categories?.slug) && post.availability && (
          <p style={{ color: '#a7f0c6', marginTop: '0.6rem', fontSize: '0.9rem' }}>📅 Availability: {post.availability}</p>
        )}

        {isBusinessCategory(post.categories?.slug) && post.trading_hours && (
          <p style={{ color: '#9fd1ff', marginTop: '0.6rem', fontSize: '0.9rem' }}>🕒 Trading: {post.trading_hours}</p>
        )}

        {post.reward_amount > 0 && (
          <p style={{ color: '#00d26a', marginTop: '0.6rem', fontSize: '0.95rem', fontWeight: 'bold' }}>
            {post.categories?.slug === 'lost-and-found' || post.categories?.slug === 'safety-alerts'
              ? `💰 Reward: R${post.reward_amount}`
              : post.categories?.slug === 'jobs'
                ? `💼 Salary: R${post.reward_amount}`
                : `🏷️ Price: R${post.reward_amount}`}
          </p>
        )}

        <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.8rem' }}>by {post.profiles?.username} • {new Date(post.created_at).toLocaleDateString()}</p>
      </Link>
    </div>
  )
}
