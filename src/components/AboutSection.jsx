import { useState } from 'react'

export default function AboutSection({ onOpen }) {
  const [open, setOpen] = useState(false)

  const openAbout = () => {
    if (onOpen) onOpen()
    setOpen(true)
  }

  return (
    <>
      <button
        onClick={openAbout}
        style={{
          textDecoration: 'none',
          fontSize: '0.9rem',
          color: '#ff6b00',
          background: 'transparent',
          border: '1px solid #ff6b00',
          padding: '0.4rem 1rem',
          borderRadius: '6px',
          fontWeight: 'bold',
          display: 'inline-block',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        About
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1.25rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '88vh',
              overflowY: 'auto',
              background: '#1a0a00',
              border: '1px solid #ff6b00',
              borderRadius: '22px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
              color: '#f5f5f5',
              fontFamily: "'Syne', sans-serif",
            }}
          >
            <div style={{ padding: '1.6rem 1.6rem 1rem', borderBottom: '2px solid #ff6b00' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <h2 style={{ color: '#ff6b00', margin: 0, fontSize: '1.7rem' }}>
                    About eKasi Board 🏘️
                  </h2>
                  <p style={{ color: '#cc9966', fontSize: '0.8rem', margin: '6px 0 0', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                    C Section, Khayelitsha · Est. 2026
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#ff6b00', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '1.6rem', lineHeight: 1.9, fontSize: '0.98rem', color: '#e8d5c0' }}>
              <p style={{ marginBottom: '1rem' }}>
                In C Section when a robbery happens the news travels slowly. A message gets sent in one WhatsApp group seen by a few ignored by most and by the time it reaches the right people the moment has passed. The neighbour two streets down never heard a thing. Yet walk outside right now and everyone has a phone in their hand scrolling chatting staying connected. The audience is already there. What was missing was one place one digital noticeboard where a single post reaches the whole community instantly keeping everyone informed aware and one step ahead.
              </p>

              <p style={{ marginBottom: '1rem' }}>
                But eKasi Board is more than a safety net. Our community is full of skilled hardworking people craftsmen service providers and everyday hustlers who have something real to offer but no platform to reach their neighbours. Nobody wants a stranger knocking at their door and nobody wants to be that stranger either. eKasi Board removes that awkwardness entirely. Post what you do let the community see who you are and build the kind of trust that turns a neighbour into a loyal customer with dignity on your own terms.
              </p>

              <p style={{ marginBottom: '1.5rem' }}>
                And when all of this comes together the alerts the opportunities the shared information something bigger happens. People start looking out for each other. A reward posted for credible information gives someone the courage to speak up. A safety alert shared at the right time keeps a family safe. A service offered reaches someone who needed it that same day. That is what eKasi Board is really about. Not just a platform but a community that moves together aware connected and stronger because of it. Siya bambisana.
              </p>

              <div style={{ borderLeft: '3px solid #ff6b00', paddingLeft: '1rem', margin: '1.5rem 0', background: 'rgba(255,107,0,0.06)', borderRadius: '0 8px 8px 0' }}>
                <p style={{ fontStyle: 'italic', margin: 0, fontSize: '1rem', color: '#fff' }}>
                  "A community that shares survives and one that connects thrives."
                </p>
                <span style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.78rem', color: '#cc9966', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  — Siya bambisana
                </span>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#aa8866', marginBottom: '1.5rem' }}>
                We are more than a website. We are a digital extension of the streets the stoeps and the WhatsApp groups that already hold this community together. eKasi Board simply makes that reach a little wider.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderTop: '1px solid rgba(255,107,0,0.3)', paddingTop: '1.25rem' }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid #ff6b00', background: '#fff' }}>
                  <img
                    src="/images/ace-dev.jpeg"
                    alt="Anele Nqabeni"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Anele Nqabeni</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#ff6b00', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Founder of eKasi Board
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#aa8866' }}>
                    From the kasi For the kasi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
