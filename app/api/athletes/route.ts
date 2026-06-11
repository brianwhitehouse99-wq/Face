import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const sport = searchParams.get('sport') || 'all'
  const conference = searchParams.get('conference') || 'all'
  const difficulty = searchParams.get('difficulty') || 'all'
  const count = parseInt(searchParams.get('count') || '3')
  const team = searchParams.get('team') || 'all'

  try {
    let query = supabase
      .from('athletes')
      .select('id, name, sport, team, position, photo_url, hints, conference, fame_rating, also_known_for')
      .eq('active', true)

    // Sport filter
    if (sport === 'college') {
      query = query.or('sport.in.(CFB,CBB),also_known_for.cs.{CFB},also_known_for.cs.{CBB}')
    } else if (sport === 'CFB') {
      query = query.or('sport.eq.CFB,also_known_for.cs.{CFB}')
    } else if (sport === 'CBB') {
      query = query.or('sport.eq.CBB,also_known_for.cs.{CBB}')
    } else if (sport === 'NFL') {
      query = query.or('sport.eq.NFL,also_known_for.cs.{NFL}')
    } else if (sport === 'NBA') {
      query = query.or('sport.eq.NBA,also_known_for.cs.{NBA}')
    } else if (sport === 'MLB') {
      query = query.or('sport.eq.MLB,also_known_for.cs.{MLB}')
    } else if (sport === 'NHL') {
      query = query.or('sport.eq.NHL,also_known_for.cs.{NHL}')
    } else if (sport === 'GOLF') {
      query = query.or('sport.eq.GOLF,also_known_for.cs.{GOLF}')
    }

    // Team filter
    if (team !== 'all') {
      query = query.eq('team', team)
    }

    // Conference filter
    if (conference !== 'all') {
      query = query.eq('conference', conference)
    }

    // Fame rating filter
    if (difficulty !== 'all') {
      const rating = parseInt(difficulty)
      if (!isNaN(rating)) {
        query = query.eq('fame_rating', rating)
      }
    } else if (sport === 'CFB' || sport === 'CBB' || sport === 'college') {
      query = query.gte('fame_rating', 3)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      return NextResponse.json({ error: 'No athletes found for these filters' }, { status: 404 })
    }

    const shuffled = data.sort(() => Math.random() - 0.5).slice(0, count)
    return NextResponse.json({ athletes: shuffled, date: new Date().toISOString().split('T')[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
