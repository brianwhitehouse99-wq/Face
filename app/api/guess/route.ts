import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function similarity(a: string, b: string): number {
  if (a === b) return 1
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(a, b) / maxLen
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize('NFD')                    // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')    // remove accent marks
    .replace(/[^a-z ]/g, '')            // remove non-alpha
    .replace(/\s+/g, ' ')              // collapse spaces
    .trim()
}

function checkGuess(guess: string, athlete: any): boolean {
  const g = normalize(guess)
  if (!g || g.length < 3) return false  // minimum 3 characters

  const fullName = normalize(athlete.name)
  const parts = fullName.split(' ')
  const firstName = parts[0] || ''
  const lastName = parts[parts.length - 1] || ''

  if (g === fullName || g === firstName || g === lastName) return true

  const aliases: string[] = athlete.aliases || []
  for (const alias of aliases) {
    if (g === normalize(alias)) return true
  }

  if (similarity(g, fullName) >= 0.85) return true
  if (lastName.length >= 4 && similarity(g, lastName) >= 0.88) return true
  // Only match substring if guess is at least 4 chars AND covers most of the last name
  if (g.length >= 4 && lastName.length >= 4 && (g === lastName || lastName === g)) return true

  return false
}

export async function POST(request: NextRequest) {
  const { athleteId, guess } = await request.json()

  if (!athleteId || !guess) {
    return NextResponse.json({ error: 'Missing athleteId or guess' }, { status: 400 })
  }

  const { data: athlete, error } = await supabase
    .from('athletes')
    .select('*')
    .eq('id', athleteId)
    .single()

  if (error || !athlete) {
    return NextResponse.json({ error: 'Athlete not found' }, { status: 404 })
  }

  const correct = checkGuess(guess, athlete)

  return NextResponse.json({
    correct,
    athlete: correct ? {
      name: athlete.name,
      team: athlete.team,
      position: athlete.position,
      sport: athlete.sport,
    } : null,
  })
}
