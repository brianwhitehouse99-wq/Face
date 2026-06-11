'use client'

import { useState } from 'react'
import { Athlete } from '@/lib/supabase'
import { Filters } from '@/lib/athletes'
import AthleteCard from '@/components/AthleteCard'

type Props = {
  athletes: Athlete[]
  filters: Filters
  onFinish: (correct: number, totalScore: number, athleteIds: number[], results: boolean[]) => void
  challengerName?: string
  challengerScore?: number
}

export default function GameScreen({ athletes, filters, onFinish, challengerName, challengerScore }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [results, setResults] = useState<boolean[]>([])

  const sportLabel =
    filters.sport === 'all' ? 'All sports' :
    filters.sport === 'college' ? 'All college' :
    filters.conference !== 'all' ? `${filters.conference} ${filters.sport}` :
    filters.sport

  function handleResult(correct: boolean, score: number) {
    setResults(r => [...r, correct])
    setTotalScore(t => t + score)
    if (correct) { setCorrectCount(c => c + 1); setStreak(s => s + 1) }
    else { setStreak(0) }
  }

  function handleNext() {
    if (currentIndex >= athletes.length - 1) {
      const finalResults = [...results]
      onFinish(correctCount, totalScore, athletes.map(a => a.id), finalResults)
    } else {
      setCurrentIndex(i => i + 1)
    }
  }

  const segments = athletes.map((_, i) => {
    if (i < currentIndex) return 'done'
    if (i === currentIndex) return 'active'
    return 'upcoming'
  })

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-6">
      <div className="w-full max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-black tracking-tighter">
            Face<span className="text-yellow-400">.</span>
          </h1>
          <div className="flex items-center gap-2">
            {challengerName && (
              <span className="text-xs text-yellow-400 bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-full">
                Beat {challengerName}: {challengerScore?.toLocaleString()} pts
              </span>
            )}
            <span className="text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
              {sportLabel}
            </span>
          </div>
        </div>
        <div className="flex gap-3 mb-5">
          {[
            { label: 'Score', value: totalScore.toLocaleString() },
            { label: 'Streak', value: streak },
            { label: 'Left', value: Math.max(0, athletes.length - currentIndex - 1) },
          ].map(({ label, value }) => (
            <div key={label} className="flex-1 bg-zinc-900 rounded-xl py-3 text-center border border-zinc-800">
              <div className={`text-xl font-bold ${label === 'Score' ? 'text-yellow-400' : 'text-white'}`}>{value}</div>
              <div className="text-zinc-500 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 mb-6">
          {segments.map((state, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
              state === 'done' ? 'bg-emerald-500' :
              state === 'active' ? 'bg-yellow-400' : 'bg-zinc-800'
            }`} />
          ))}
        </div>
        <AthleteCard
          key={currentIndex}
          athlete={athletes[currentIndex]}
          athleteIndex={currentIndex}
          totalAthletes={athletes.length}
          onResult={handleResult}
          onNext={handleNext}
          isLast={currentIndex === athletes.length - 1}
        />
      </div>
    </div>
  )
}
