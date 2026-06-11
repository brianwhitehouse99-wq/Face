import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types that mirror your Supabase database schema
export type Athlete = {
  id: number
  name: string
  sport: 'NFL' | 'NBA' | 'MLB' | 'NHL' | 'CFB' | 'CBB'
  team: string
  position: string
  conference: string | null   // e.g. "Big Ten", "SEC" — null for pro athletes
  photo_url: string
  aliases: string[]           // e.g. ["mahomes", "patrick mahomes"]
  hints: string[]             // shown after wrong guesses e.g. ["Kansas City Chiefs", "Super Bowl MVP"]
  is_star: boolean            // for "Stars only" difficulty filter
  active: boolean             // set false to hide a player without deleting
}

export type DailyPick = {
  id: number
  date: string               // "2026-06-04" — one row per athlete per day
  athlete_id: number
  order: number              // 1, 2, 3 — display order for that day
  sport_filter: string       // "all" | "NFL" | "CFB" | etc.
  athlete?: Athlete          // joined
}
