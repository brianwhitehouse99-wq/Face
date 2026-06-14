import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function generateId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { athleteIds, sportFilter, player1Name, player1Score, player1Correct, challengeId, playerName, score, correct } = body

  if (challengeId && playerName !== undefined) {
    const { error } = await supabase.from('challenge_entries').insert({
      challenge_id: challengeId,
      player_name: playerName,
      score: score || 0,
      correct: correct || 0,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (!athleteIds?.length || !player1Name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const id = generateId()
  const { data, error } = await supabase.from('challenges').insert({
    id,
    athlete_ids: athleteIds,
    sport_filter: sportFilter || 'all',
    player1_name: player1Name,
    player1_score: player1Score,
    player1_correct: player1Correct,
    player1_completed_at: new Date().toISOString(),
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('challenge_entries').insert({
    challenge_id: id,
    player_name: player1Name,
    score: player1Score || 0,
    correct: player1Correct || 0,
  })

  return NextResponse.json({ challenge: data })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing challenge ID' }, { status: 400 })

  const { data: challenge, error } = await supabase.from('challenges').select('*').eq('id', id).single()
  if (error || !challenge) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })

  const { data: athletes } = await supabase.from('athletes')
    .select('id, name, sport, team, position, photo_url, hints, conference')
    .in('id', challenge.athlete_ids)

  const { data: entries } = await supabase.from('challenge_entries')
    .select('*').eq('challenge_id', id).order('score', { ascending: false })

  return NextResponse.json({ challenge, athletes, entries: entries || [] })
}
