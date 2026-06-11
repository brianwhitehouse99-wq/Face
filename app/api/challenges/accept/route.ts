import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PATCH — save player 2's results
export async function PATCH(request: NextRequest) {
  const { id, player2Name, player2Score, player2Correct } = await request.json()

  if (!id || !player2Name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('challenges')
    .update({
      player2_name: player2Name,
      player2_score: player2Score,
      player2_correct: player2Correct,
      player2_completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ challenge: data })
}
