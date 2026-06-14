'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import GameScreen from '@/components/GameScreen'
import FinalScreen from '@/components/FinalScreen'
import { Athlete } from '@/lib/supabase'

type Screen = 'loading' | 'enter-name' | 'game' | 'results'

function ChallengePageInner() {
  const searchParams = useSearchParams()
  const challengeId = searchParams.get('id')

  const [screen, setScreen] = useState<Screen>('loading')
  const [challenge, setChallenge] = useState<any>(null)
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [playerName, setPlayerName] = useState('')
  const [finalScore, setFinalScore] = useState(0)
  const [finalCorrect, setFinalCorrect] = useState(0)
  const [results, setResults] = useState<boolean[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!challengeId) { setError('Invalid challenge link'); return }
    fetchChallenge()
  }, [challengeId])

  async function fetchChallenge() {
    const res = await fetch(`/api/challenges?id=${challengeId}`)
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Challenge not found'); return }
    setChallenge(data.challenge)
    setAthletes(data.athletes || [])
    setScreen('enter-name')
  }

  async function handleFinish(correct: number, totalScore: number, ids: number[], gameResults: boolean[]) {
    setFinalCorrect(correct)
    setFinalScore(totalScore)
    setResults(gameResults)
    setScreen('results')
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter mb-4">Face<span className="text-yellow-400">.</span></h1>
          <p className="text-red-400 mb-6">{error}</p>
          <a href="/" className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl">Play Face.</a>
        </div>
      </div>
    )
  }

  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter mb-4">Face<span className="text-yellow-400">.</span></h1>
          <div className="flex gap-1 justify-center">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: `${i*0.15}s`}} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'enter-name') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-5xl font-black tracking-tighter mb-2">Face<span className="text-yellow-400">.</span></h1>
          <p className="text-zinc-400 mb-8">
            <span className="text-white font-semibold">{challenge?.player1_name}</span> challenged you!
            <br />Can you beat their score of <span className="text-yellow-400 font-bold">{challenge?.player1_score} pts</span>?
          </p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <p className="text-zinc-400 text-sm mb-4">Enter your name to start</p>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && playerName.trim() && setScreen('game')}
              placeholder="Your name..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors mb-4"
              autoFocus
            />
            <button
              onClick={() => playerName.trim() && setScreen('game')}
              disabled={!playerName.trim()}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-all disabled:opacity-40"
            >
              Accept Challenge →
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'game' && athletes.length > 0) {
    return (
      <GameScreen
        athletes={athletes}
        filters={{ sport: challenge?.sport_filter || 'all', conference: 'all', difficulty: 'all', count: athletes.length, team: 'all' }}
        onFinish={handleFinish}
        onHome={() => window.location.href = '/'}
        challengerName={challenge?.player1_name}
        challengerScore={challenge?.player1_score}
      />
    )
  }

  if (screen === 'results') {
    return (
      <FinalScreen
        correct={finalCorrect}
        total={athletes.length}
        totalScore={finalScore}
        athletes={athletes}
        results={results}
        sportFilter={challenge?.sport_filter}
        onReplay={() => window.location.href = '/'}
        challengeId={challengeId || undefined}
        playerNamePrefill={playerName}
        challengerName={challenge?.player1_name}
        challengerScore={challenge?.player1_score}
      />
    )
  }

  return null
}

export default function ChallengePage() {
  return (
    <Suspense>
      <ChallengePageInner />
    </Suspense>
  )
}
