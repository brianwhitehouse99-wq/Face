import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function generateId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(request: NextRequest) {
  const { athleteIds, sportFilter, player1Name, player1Score, player1Correct } = await request.json()

  if (!athleteIds?.length || !player1Name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const id = generateId()

  const { data, error } = await supabase
    .from('challenges')
    .insert({
      id,
      athlete_ids: athleteIds,
      sport_filter: sportFilter || 'all',
      player1_name: player1Name,
      player1_score: player1Score,
      player1_correct: player1Correct,
      player1_completed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ challenge: data })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing challenge ID' }, { status: 400 })
  }

  const { data: challenge, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !challenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }

  const { data: athletes } = await supabase
    .from('athletes')
    .select('id, name, sport, team, position, photo_url, hints, conference')
    .in('id', challenge.athlete_ids)

  return NextResponse.json({ challenge, athletes })
}
