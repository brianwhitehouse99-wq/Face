'use client'

import { useState } from 'react'

type Athlete = {
  id: number
  name: string
  team: string
  position: string
  photo_url: string
}

type Props = {
  correct: number
  total: number
  totalScore: number
  athleteIds?: number[]
  sportFilter?: string
  athletes?: Athlete[]
  results?: boolean[]
  onReplay: () => void
}

export default function FinalScreen({ correct, total, totalScore, athleteIds, sportFilter, athletes, results, onReplay }: Props) {
  const [showChallenge, setShowChallenge] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [challengeLink, setChallengeLink] = useState('')
  const [creating, setCreating] = useState(false)

  const pct = correct / total
  const maxScore = total * 100
  const messages = ['Tough one — check back tomorrow!', 'Not bad, keep at it!', 'Nice game!', 'Perfect score! You really know your athletes.']
  const msgIndex = pct === 0 ? 0 : pct < 0.5 ? 1 : pct < 1 ? 2 : 3

  async function createChallenge() {
    if (!playerName.trim()) return
    setCreating(true)
    const res = await fetch('/api/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ athleteIds, sportFilter, player1Name: playerName, player1Score: totalScore, player1Correct: correct }),
    })
    const data = await res.json()
    if (data.challenge) {
      const link = `${window.location.origin}/challenge?id=${data.challenge.id}`
      setChallengeLink(link)
      navigator.clipboard.writeText(link)
    }
    setCreating(false)
  }

  function shareResult() {
    const emoji = Array.from({ length: total }, (_, i) => (results?.[i] ? '🟡' : '⚫')).join('')
    const text = `Face. ${new Date().toLocaleDateString()}\n${correct}/${total} ${emoji}\n${totalScore.toLocaleString()} pts\nPlay at face.app`
    navigator.clipboard.writeText(text).then(() => alert('Result copied!'))
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 py-10">
      <div className="w-full max-w-lg mx-auto text-center">
        <h1 className="text-5xl font-black tracking-tighter mb-6">Face<span className="text-yellow-400">.</span></h1>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-8 py-6 mb-6">
          <div className="text-6xl font-black tracking-tighter text-yellow-400 mb-1">{totalScore.toLocaleString()}</div>
          <div className="text-zinc-400 text-sm">total points</div>
          <div className="border-t border-zinc-800 mt-4 pt-4 flex justify-center gap-8">
            <div><div className="text-2xl font-bold">{correct}/{total}</div><div className="text-zinc-500 text-xs">correct</div></div>
            <div><div className="text-2xl font-bold">{Math.round((totalScore / maxScore) * 100)}%</div><div className="text-zinc-500 text-xs">of max score</div></div>
          </div>
        </div>
        <p className="text-zinc-300 text-lg mb-6">{messages[msgIndex]}</p>
        {athletes && athletes.length > 0 && (
          <div className="mb-8">
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Today's athletes</p>
            <div className="grid grid-cols-3 gap-3">
              {athletes.map((athlete, i) => (
                <div key={athlete.id} className={`rounded-xl overflow-hidden border ${results?.[i] ? 'border-yellow-400' : 'border-zinc-700'}`}>
                  <div className="relative w-full h-28 bg-zinc-800">
                    <img src={athlete.photo_url} alt={athlete.name} className="w-full h-full object-cover object-top" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <div className={`absolute top-1.5 right-1.5 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${results?.[i] ? 'bg-yellow-400 text-black' : 'bg-red-500 text-white'}`}>
                      {results?.[i] ? '✓' : '✗'}
                    </div>
                  </div>
                  <div className="px-2 py-2 bg-zinc-900">
                    <p className="text-white text-xs font-semibold leading-tight">{athlete.name}</p>
                    <p className="text-zinc-500 text-xs">{athlete.team}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!challengeLink && !showChallenge && (
          <div className="flex flex-col gap-3">
            <button onClick={() => setShowChallenge(true)} className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-black font-bold text-base rounded-xl transition-all">
              ⚔️ Challenge a friend
            </button>
            <button onClick={shareResult} className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-white font-semibold text-base rounded-xl transition-all">
              Share result
            </button>
            <button onClick={onReplay} className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-white font-semibold text-base rounded-xl transition-all">
              Play again
            </button>
          </div>
        )}
        {showChallenge && !challengeLink && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-left">
            <p className="text-white font-semibold mb-1">Challenge a friend!</p>
            <p className="text-zinc-500 text-sm mb-4">Enter your name to create a challenge link</p>
            <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createChallenge()} placeholder="Your name..." className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors mb-3" autoFocus />
            <button onClick={createChallenge} disabled={!playerName.trim() || creating} className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-all disabled:opacity-40">
              {creating ? 'Creating...' : 'Create challenge link'}
            </button>
          </div>
        )}
        {challengeLink && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-left mb-4">
            <p className="text-emerald-400 font-semibold mb-1">✓ Challenge created!</p>
            <p className="text-zinc-500 text-sm mb-3">Link copied — send it to your friend!</p>
            <div className="bg-zinc-800 rounded-xl px-4 py-3 text-zinc-300 text-sm break-all mb-3">{challengeLink}</div>
            <button onClick={() => navigator.clipboard.writeText(challengeLink).then(() => alert('Copied!'))} className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl transition-all">Copy link again</button>
          </div>
        )}
        {challengeLink && (
          <button onClick={onReplay} className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all mt-3">Play again</button>
        )}
        <p className="text-zinc-600 text-sm mt-8">Come back tomorrow for new athletes</p>
      </div>
    </div>
  )
}
