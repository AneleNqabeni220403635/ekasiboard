// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const payload = await req.json()
    const response = payload.record

    // Create supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get the post + poster's profile (email, phone, username)
    const { data: post } = await supabase
      .from('posts')
      .select('title, user_id, profiles(username, phone_number)')
      .eq('id', response.post_id)
      .single()

    if (!post) return new Response('Post not found', { status: 404 })

    // Get poster's email from auth.users
    const { data: userData } = await supabase.auth.admin.getUserById(post.user_id)
    const posterEmail = userData?.user?.email
    const posterPhone = post.profiles?.phone_number
    const posterName = post.profiles?.username
    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'
    const postLink = `${siteUrl}/post/${response.post_id}`

    // Get sender's username
    const { data: sender } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', response.user_id)
      .single()
    const senderName = sender?.username ?? 'Someone'

    // ── 1. Send Email via Resend ──
    if (posterEmail) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'eKasi Board <onboarding@resend.dev>',
          to: '220403635@mycput.ac.za',
          subject: `💬 ${senderName} replied to your post "${post.title}"`,
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #ff6b00;">eKasi Board</h2>
              <p>Hi ${posterName},</p>
              <p><strong>${senderName}</strong> sent a message on your post <strong>"${post.title}"</strong>:</p>
              <blockquote style="border-left: 3px solid #ff6b00; padding-left: 1rem; color: #555;">
                ${response.message}
              </blockquote>
              <a href="${postLink}" style="display:inline-block; margin-top:1rem; padding: 0.7rem 1.4rem; background:#ff6b00; color:#fff; border-radius:8px; text-decoration:none; font-weight:bold;">
                View Post
              </a>
              <p style="color:#aaa; font-size:0.85rem; margin-top:2rem;">eKasi Board · C-Section, Khayelitsha</p>
            </div>
          `,
        }),
      })
    }

    // ── 2. Send WhatsApp via CallMeBot ──
    if (posterPhone) {
      const phone = posterPhone.replace(/\s+/g, '')
      const waPhone = phone.startsWith('0') ? '27' + phone.slice(1) : phone
      const waMessage = encodeURIComponent(
        `eKasi Board: ${senderName} replied to your post "${post.title}": "${response.message}" - View: ${postLink}`
      )
      // CallMeBot requires the user's personal apikey saved in their profile
      // For now we use a generic alert — user must opt in via CallMeBot first
      const { data: profile } = await supabase
        .from('profiles')
        .select('callmebot_apikey')
        .eq('id', post.user_id)
        .single()

      if (profile?.callmebot_apikey) {
        await fetch(
          `https://api.callmebot.com/whatsapp.php?phone=${waPhone}&text=${waMessage}&apikey=${profile.callmebot_apikey}`
        )
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})