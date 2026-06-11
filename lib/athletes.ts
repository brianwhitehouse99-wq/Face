import { supabase, Athlete } from './supabase'

export type Filters = {
  sport: string       // "all" | "NFL" | "NBA" | "MLB" | "NHL" | "CFB" | "CBB" | "college" | "GOLF"
  conference: string  // "all" | "Big Ten" | "SEC" | "Big 12" | "ACC" | "Pac-12"
  difficulty: string  // "all" | "1" | "2" | "3" | "4" | "5"
  count: number       // 1 | 3 | 5
  team: string        // "all" | specific team name
}

export async function getDailyAthletes(filters: Filters): Promise<Athlete[]> {
  return getRandomAthletes(filters)
}

export async function getRandomAthletes(filters: Filters): Promise<Athlete[]> {
  let query = supabase
    .from('athletes')
    .select('*')
    .eq('active', true)

  // Sport filter
  if (filters.sport === 'college') {
    query = query.in('sport', ['CFB', 'CBB'])
  } else if (filters.sport !== 'all') {
    query = query.eq('sport', filters.sport)
  }

  // Conference filter (college only)
  if (filters.conference !== 'all') {
    query = query.eq('conference', filters.conference)
  }

  // Team filter
  if (filters.team && filters.team !== 'all') {
    query = query.eq('team', filters.team)
  }

  // Difficulty filter
  if (filters.difficulty !== 'all') {
    query = query.eq('fame_rating', parseInt(filters.difficulty))
  }

  // College sports minimum fame rating
  if ((filters.sport === 'CFB' || filters.sport === 'CBB' || filters.sport === 'college') && filters.difficulty === 'all') {
    query = query.gte('fame_rating', 3)
  }

  const { data, error } = await query

  if (error || !data) {
    console.error('Error fetching athletes:', error)
    return []
  }

  const shuffled = data.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, filters.count)
}

export function checkGuess(guess: string, athlete: Athlete): boolean {
  const normalized = guess.toLowerCase().trim().replace(/[^a-z ]/g, '')
  return athlete.aliases?.some(alias => {
    const a = alias.toLowerCase()
    return normalized === a || normalized.includes(a) || a.includes(normalized)
  }) || false
}
