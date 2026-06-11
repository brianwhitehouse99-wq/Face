import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Levenshtein distance — measures how many edits needed to turn one string into another
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

// Similarity score 0-1 (1 = identical)
function similarity(a: string, b: string): number {
  if (a === b) return 1
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(a, b) / maxLen
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z ]/g, '')
}

function checkGuess(guess: string, athlete: any): boolean {
  const g = normalize(guess)
  if (!g) return false

  const fullName = normalize(athlete.name)
  const parts = fullName.split(' ')
  const firstName = parts[0] || ''
  const lastName = parts[parts.length - 1] || ''

  // 1. Exact match on full name, first name, or last name
  if (g === fullName || g === firstName || g === lastName) return true

  // 2. Alias exact match
  const aliases: string[] = athlete.aliases || []
  for (const alias of aliases) {
    if (g === normalize(alias)) return true
  }

  // 3. Fuzzy match on full name (85% threshold)
  if (similarity(g, fullName) >= 0.85) return true

  // 4. Fuzzy match on last name (88% threshold — slightly stricter for short names)
  if (lastName.length >= 4 && similarity(g, lastName) >= 0.88) return true

  // 5. Guess contains last name or last name contains guess (for compound names)
  if (g.includes(lastName) || lastName.includes(g)) return true

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
