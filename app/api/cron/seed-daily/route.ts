import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This route is called by Vercel Cron at midnight every day
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/seed-daily", "schedule": "0 0 * * *" }] }

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role can bypass RLS
)

const SPORT_FILTERS = ['all', 'NFL', 'NBA', 'MLB', 'NHL', 'CFB', 'CBB', 'college']
const PICKS_PER_FILTER = 5 // seed 5 so users can choose 1, 3, or 5

export async function GET(request: NextRequest) {
  // Basic auth check — set CRON_SECRET in your Vercel env vars
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]

  // Check if today's picks already exist
  const { data: existing } = await supabaseAdmin
    .from('daily_picks')
    .select('id')
    .eq('date', today)
    .limit(1)

  if (existing?.length) {
    return NextResponse.json({ message: 'Already seeded for today' })
  }

  const inserts = []

  for (const sportFilter of SPORT_FILTERS) {
    // Fetch a pool of eligible athletes for this filter
    let query = supabaseAdmin
      .from('athletes')
      .select('id')
      .eq('active', true)

    if (sportFilter === 'college') {
      query = query.in('sport', ['CFB', 'CBB'])
    } else if (sportFilter !== 'all') {
      query = query.eq('sport', sportFilter)
    }

    const { data: pool } = await query

    if (!pool?.length) continue

    // Shuffle and pick top N
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, PICKS_PER_FILTER)

    shuffled.forEach((athlete, index) => {
      inserts.push({
        date: today,
        athlete_id: athlete.id,
        order: index + 1,
        sport_filter: sportFilter,
      })
    })
  }

  const { error } = await supabaseAdmin.from('daily_picks').insert(inserts)

  if (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }

  return NextResponse.json({ message: `Seeded ${inserts.length} picks for ${today}` })
}
