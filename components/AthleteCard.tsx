'use client'

import { useState, useEffect, useRef } from 'react'
import { Athlete } from '@/lib/supabase'

type Props = {
  athlete: Athlete
  athleteIndex: number
  totalAthletes: number
  onResult: (correct: boolean, score: number) => void
  onNext: () => void
  isLast: boolean
}

function calcScore(seconds: number): number {
  if (seconds <= 6) return 100
  if (seconds >= 60) return 10
  return Math.round(100 - ((seconds - 6) * (90 / 54)))
}

export default function AthleteCard({ athlete, athleteIndex, totalAthletes, onResult, onNext, isLast }: Props) {
  const [guess, setGuess] = useState('')
  const [guessCount, setGuessCount] = useState(0)
  const [hintsShown, setHintsShown] = useState(0)
  const [done, setDone] = useState(false)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [score, setScore] = useState<number | null>(null)
  const startTime = useRef(Date.now())
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const maxGuesses = 3

  useEffect(() => {
    startTime.current = Date.now()
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000))
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  async function submitGuess() {
    if (done || !guess.trim()) return
    const res = await fetch('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ athleteId: athlete.id, guess }),
    })
    const data = await res.json()
    const newCount = guessCount + 1
    const secondsTaken = Math.floor((Date.now() - startTime.current) / 1000)
    setGuess('')
    setGuessCount(newCount)
    if (data.correct) {
      if (timerRef.current) clearInterval(timerRef.current)
      const earned = calcScore(secondsTaken)
      setScore(earned)
      setDone(true)
      setWasCorrect(true)
      setFeedback('')
      inputRef.current?.blur()
      onResult(true, earned)
    } else if (newCount >= maxGuesses) {
      if (timerRef.current) clearInterval(timerRef.current)
      setScore(0)
      setDone(true)
      setWasCorrect(false)
      setFeedback('')
      inputRef.current?.blur()
      onResult(false, 0)
    } else {
      setFeedback(`Not quite — ${maxGuesses - newCount} guess${maxGuesses - newCount === 1 ? '' : 'es'} left`)
      if (hintsShown < athlete.hints.length) setHintsShown(h => h + 1)
    }
  }

  function handleNoIdea() {
    if (done) return
    if (timerRef.current) clearInterval(timerRef.current)
    setScore(0)
    setDone(true)
    setWasCorrect(false)
    setFeedback('')
    inputRef.current?.blur()
    onResult(false, 0)
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-zinc-800 mb-4">
        <img src={athlete.photo_url} alt="Athlete photo" className="w-full h-full object-cover object-top" onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x400/27272a/71717a?text=No+Photo" }} />
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
          {athlete.sport} {athlete.conference ? `· ${athlete.conference}` : ''}
        </div>
        {!done && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-yellow-400 text-xl font-bold px-4 py-3 rounded-full">
            ⏱ {elapsed}s
          </div>
        )}
        {done && score !== null && (
          <div className={`absolute top-3 right-3 text-xl font-bold px-4 py-3 rounded-full ${score > 0 ? 'bg-yellow-400 text-black' : 'bg-zinc-700 text-zinc-300'}`}>
            +{score} pts
          </div>
        )}
      </div>

      {hintsShown > 0 && (
        <div className="mb-4">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">💡 Hints</p>
          <div className="flex flex-wrap gap-2">
            {athlete.hints.slice(0, hintsShown).map((hint, i) => (
              <span key={i} className="text-sm font-semibold bg-zinc-800 text-yellow-400 px-4 py-2 rounded-xl border border-zinc-600">
                {hint}
              </span>
            ))}
          </div>
        </div>
      )}

      {!done && (
        <div className="mb-4">
          <p className="text-zinc-500 text-sm mb-2">Athlete {athleteIndex + 1} of {totalAthletes} — who is this?</p>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={guess}
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitGuess()}
              placeholder="Type athlete name..."
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors"

            />
            <button onClick={submitGuess} className="px-5 py-3 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-semibold rounded-xl transition-all">
              Guess
            </button>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              {Array.from({ length: maxGuesses }).map((_, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i < guessCount ? 'bg-red-500' : 'bg-zinc-700'}`} />
              ))}
            </div>
            <button onClick={handleNoIdea} className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
              No idea 🤷
            </button>
          </div>
          {feedback && <p className="text-red-400 text-sm mt-2">{feedback}</p>}
        </div>
      )}

      {done && (
        <div className={`rounded-xl px-5 py-4 mb-4 flex items-center justify-between ${wasCorrect ? 'bg-emerald-950 border border-emerald-800' : 'bg-red-950 border border-red-900'}`}>
          <div>
            <p className={`font-bold text-base ${wasCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
              {wasCorrect ? '✓ Correct!' : '✗ ' + athlete.name}
            </p>
            <p className={`text-sm mt-0.5 ${wasCorrect ? 'text-emerald-500' : 'text-red-500'}`}>
              {athlete.position} · {athlete.team}
            </p>
          </div>
          {wasCorrect && score !== null && (
            <div className="text-right">
              <div className="text-yellow-400 font-bold text-lg">+{score}</div>
              <div className="text-zinc-500 text-xs">points</div>
            </div>
          )}
        </div>
      )}

      {done && (
        <button onClick={onNext} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-white font-semibold rounded-xl transition-all">
          {isLast ? 'See results →' : 'Next athlete →'}
        </button>
      )}
    </div>
  )
}
