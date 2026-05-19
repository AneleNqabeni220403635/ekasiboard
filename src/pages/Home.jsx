import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Link, useSearchParams } from 'react-router-dom'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const C_SECTION_BOUNDS = [
  [-34.0380, 18.6490],
  [-34.0270, 18.6630],
]

const phrases = [
  'Siya Bambisana',
  'Linking our C-Section community',
]

export default function Home() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchParams] = useSearchParams()

  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)

  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const categoryId = categoryParam ? parseInt(categoryParam, 10) : null
    setSelectedCategory(Number.isNaN(categoryId) ? null : categoryId)
  }, [searchParams])

  useEffect(() => {
    fetchCategories()
    fetchPosts()
  }, [selectedCategory])

  useEffect(() => {
    const currentIndex = loopNum % phrases.length
    const fullText = phrases[currentIndex]

    let timeout = null

    if (!isDeleting && displayText === fullText) {
      timeout = setTimeout(() => setIsDeleting(true), 1200)
    } else if (isDeleting && displayText === '') {
      timeout = setTimeout(() => {
        setIsDeleting(false)
        setLoopNum(prev => prev + 1)
      }, 500)
    } else {
      timeout = setTimeout(() => {
        const nextText = isDeleting
          ? fullText.substring(0, displayText.length - 1)
          : fullText.substring(0, displayText.length + 1)
        setDisplayText(nextText)
      }, isDeleting ? 80 : 120)
    }

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, loopNum])

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*')
    setCategories(data || [])
  }

  async function fetchPosts() {
    let query = supabase
      .from('posts')
      .select('*, categories(name, slug), profiles(username)')
      .order('created_at', { ascending: false })

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory)
    }

    const { data } = await query
    setPosts(data || [])
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f0f0f',
        color: '#f5f5f5',
        padding: '2rem'
      }}
    >

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1
          style={{
            fontSize: '2.8rem',
            color: '#ff6b00',
            marginBottom: '0.5rem'
          }}
        >
          eKasi Board 🏘️
        </h1>

        <p style={{ color: '#b0b0b0', fontSize: '1.1rem' }}>
          <span className="home-typewriter-text">{displayText}</span>
        </p>

        <div
          style={{
            width: '60px',
            height: '3px',
            background: '#ff6b00',
            margin: '1rem auto 0'
          }}
        />
      </div>

      {/* Community Map */}
      <div
        style={{
          marginBottom: '2.5rem',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #2a2a2a',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          background: '#181818'
        }}
      >
        <div
          style={{
            background: '#1a0a00',
            padding: '0.8rem 1.2rem',
            borderBottom: '2px solid #ff6b00'
          }}
        >
          <p
            style={{
              color: '#ff6b00',
              fontWeight: 'bold',
              margin: 0,
              fontSize: '0.95rem'
            }}
          >
            📍 C-Section, Khayelitsha 7784 - Community Map
          </p>
        </div>

        <MapContainer
          center={[-34.0325, 18.6566]}
          zoom={15}
          minZoom={14}
          maxZoom={17}
          maxBounds={C_SECTION_BOUNDS}
          maxBoundsViscosity={1.0}
          style={{ height: '380px', width: '100%' }}
        >
          {/* Satellite View */}
          <TileLayer
            attribution='&copy; Esri & contributors'
            url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          />
        </MapContainer>
      </div>

      {/* Category Filter */}
      <div
        style={{
          display: 'flex',
          gap: '0.8rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
          justifyContent: 'center'
        }}
      >
        <button
          onClick={() => setSelectedCategory(null)}
          style={{
            padding: '0.5rem 1.3rem',
            borderRadius: '20px',
            border: '1px solid #ff6b00',
            background:
              selectedCategory === null ? '#ff6b00' : '#1a1a1a',
            color:
              selectedCategory === null ? '#fff' : '#ff6b00',
            cursor: 'pointer',
            fontWeight:
              selectedCategory === null ? 'bold' : 'normal'
          }}
        >
          All
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '0.5rem 1.3rem',
              borderRadius: '20px',
              border: '1px solid #ff6b00',
              background:
                selectedCategory === cat.id
                  ? '#ff6b00'
                  : '#1a1a1a',
              color:
                selectedCategory === cat.id
                  ? '#fff'
                  : '#ff6b00',
              cursor: 'pointer',
              fontWeight:
                selectedCategory === cat.id
                  ? 'bold'
                  : 'normal'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <p
            style={{
              color: '#b0b0b0',
              fontSize: '1.1rem'
            }}
          >
            No posts yet. Be the first to post!
          </p>

          <Link
            to="/create-post"
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              padding: '0.7rem 1.5rem',
              background: '#ff6b00',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            + Create First Post
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {posts.map(post => (
            <Link
              to={`/post/${post.id}`}
              key={post.id}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  background: '#1a1a1a',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid #2a2a2a',
                  transition: 'border 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#ff6b00'
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(255,107,0,0.25)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#2a2a2a'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <span
                  style={{
                    background: '#ff6b0015',
                    color: '#ff6b00',
                    padding: '0.2rem 0.8rem',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}
                >
                  {post.categories?.name}
                </span>

                <h3
                  style={{
                    color: '#ffffff',
                    margin: '0.8rem 0 0.5rem'
                  }}
                >
                  {post.title}
                </h3>

                <p
                  style={{
                    color: '#c0c0c0',
                    fontSize: '0.9rem',
                    lineHeight: '1.5'
                  }}
                >
                  {post.description.substring(0, 100)}...
                </p>

                {post.reward_amount > 0 && (
  <p style={{ color: '#00d26a', marginTop: '0.8rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
    {post.categories?.slug === 'lost-and-found' || post.categories?.slug === 'safety-alerts'
      ? `💰 Reward: R${post.reward_amount}`
      : post.categories?.slug === 'jobs'
      ? `💼 Salary: R${post.reward_amount}`
      : `🏷️ Price: R${post.reward_amount}`}
  </p>
)}

                <p
                  style={{
                    color: '#888',
                    fontSize: '0.8rem',
                    marginTop: '0.8rem'
                  }}
                >
                  by {post.profiles?.username} •{' '}
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}