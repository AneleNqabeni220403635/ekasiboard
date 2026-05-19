// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const payload = await req.json()
    const record = payload.record // NEW post row

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Load the post with category and poster info
    const { data: post } = await supabase
      .from('posts')
      .select('id, title, category_id, user_id, categories(name, slug), profiles(username, phone_number)')
      .eq('id', record.id)
      .single()

    if (!post) return new Response('Post not found', { status: 404 })

    const siteUrl = Deno.env.get('SITE_URL') ?? 'https://your-site.example'
    const postLink = `${siteUrl}/post/${post.id}`

    // Fetch recipients: opted-in, have phone, exclude poster
    const { data: recipients } = await supabase
      .from('profiles')
      .select('id, phone_number, callmebot_apikey, whatsapp_notifications')
      .eq('whatsapp_notifications', true)
      .not('phone_number', 'is', null)
      .neq('id', post.user_id)

    if (!recipients || recipients.length === 0) return new Response('No recipients', { status: 200 })

    const messageBase = encodeURIComponent(
      `eKasi Board — New ${post.categories?.name ?? 'post'}: "${post.title}" · View: ${postLink}`
    )

    let successCount = 0
    const errors = []

    for (const r of recipients) {
      try {
        const phone = r.phone_number.replace(/\s+/g, '')
        const waPhone = phone.startsWith('0') ? '27' + phone.slice(1) : phone

        // Prefer user's personal CallMeBot API key
        if (r.callmebot_apikey) {
          await fetch(
            `https://api.callmebot.com/whatsapp.php?phone=${waPhone}&text=${messageBase}&apikey=${r.callmebot_apikey}`
          )
          successCount++
        } else {
          // Fallback: use account-level API key from environment
          const accountApiKey = Deno.env.get('CALLMEBOT_APIKEY')
          if (accountApiKey) {
            await fetch(
              `https://api.callmebot.com/whatsapp.php?phone=${waPhone}&text=${messageBase}&apikey=${accountApiKey}`
            )
            successCount++
          } else {
            errors.push(`No API key for ${r.id}`)
          }
        }
      } catch (err) {
        errors.push(`Error sending to ${r.id}: ${err.message}`)
      }
    }

    console.log(`Sent ${successCount}/${recipients.length} notifications. Errors: ${errors.join('; ')}`)

    return new Response(
      JSON.stringify({ success: true, sent: successCount, total: recipients.length, errors }),
      { status: 200 }
    )
  } catch (err) {
    console.error('Function error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
