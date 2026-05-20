import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
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
  const { profile } = useAuth()

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
      .eq('is_resolved', false)
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
      <div style={{
        textAlign: 'center',
        marginBottom: '2.5rem',
        padding: '1.5rem 1rem',
        borderRadius: '24px',
        background: 'rgba(255,107,0,0.05)',
        boxShadow: '0 0 40px rgba(255,107,0,0.18), inset 0 0 18px rgba(255,107,0,0.08)',
        border: '1px solid rgba(255,107,0,0.15)'
      }}>
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
          {/* Labels overlay (roads/streets) */}
          <TileLayer
            attribution='Labels: Esri'
            url='https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}'
            opacity={0.9}
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
          className="category-filter-btn"
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
            className="category-filter-btn"
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
                  <PostCard key={post.id} post={post} currentUserId={profile?.id} onClose={fetchPosts} />
                ))}
        </div>
      )}
    </div>
  )
}