'use client'

import { useState } from 'react'
import SetupScreen from '@/components/SetupScreen'
import GameScreen from '@/components/GameScreen'
import FinalScreen from '@/components/FinalScreen'
import { Athlete } from '@/lib/supabase'
import { Filters } from '@/lib/athletes'

type Screen = 'setup' | 'loading' | 'game' | 'final'

export default function Home() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [filters, setFilters] = useState<Filters>({ sport: 'all', conference: 'all', difficulty: 'all', count: 3 })
  const [finalScore, setFinalScore] = useState(0)
  const [finalCorrect, setFinalCorrect] = useState(0)
  const [athleteIds, setAthleteIds] = useState<number[]>([])
  const [results, setResults] = useState<boolean[]>([])
  const [error, setError] = useState('')

  async function handleStart(selectedFilters: Filters) {
    setFilters(selectedFilters)
    setScreen('loading')
    setError('')
    try {
      const params = new URLSearchParams({
        sport: selectedFilters.sport,
        conference: selectedFilters.conference,
        difficulty: selectedFilters.difficulty,
        count: String(selectedFilters.count),
      })
      const res = await fetch(`/api/athletes?${params}`)
      const data = await res.json()
      if (!res.ok || !data.athletes?.length) {
        setError(data.error || 'No athletes found for these filters.')
        setScreen('setup')
        return
      }
      setAthletes(data.athletes)
      setScreen('game')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setScreen('setup')
    }
  }

  function handleFinish(correct: number, totalScore: number, ids: number[], gameResults: boolean[]) {
    setFinalCorrect(correct)
    setFinalScore(totalScore)
    setAthleteIds(ids)
    setResults(gameResults)
    setScreen('final')
  }

  function handleReplay() {
    setScreen('setup')
    setAthletes([])
    setFinalScore(0)
    setFinalCorrect(0)
    setAthleteIds([])
    setResults([])
  }

  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tighter mb-4 text-white">
            Face<span className="text-yellow-400">.</span>
          </h1>
          <div className="flex gap-1 justify-center">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: `${i*0.15}s`}} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'setup') {
    return (
      <>
        <SetupScreen onStart={handleStart} />
        {error && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-900 border border-red-700 text-red-200 text-sm px-5 py-3 rounded-xl">
            {error}
          </div>
        )}
      </>
    )
  }

  if (screen === 'game' && athletes.length > 0) {
    return <GameScreen athletes={athletes} filters={filters} onFinish={handleFinish} />
  }

  if (screen === 'final') {
    return (
      <FinalScreen
        correct={finalCorrect}
        total={athletes.length}
        totalScore={finalScore}
        athleteIds={athleteIds}
        sportFilter={filters.sport}
        athletes={athletes}
        results={results}
        onReplay={handleReplay}
      />
    )
  }

  return null
}
