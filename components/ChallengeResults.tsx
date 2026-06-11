'use client'

type Props = {
  challenge: any
}

export default function ChallengeResults({ challenge }: Props) {
  const p1 = challenge.player1_score || 0
  const p2 = challenge.player2_score || 0
  const p1Won = p1 > p2
  const tied = p1 === p2
  const winner = tied ? 'Tie!' : p1Won ? challenge.player1_name : challenge.player2_name

  function shareResult() {
    const url = `${window.location.origin}/challenge?id=${challenge.id}`
    const text = `Face. Challenge\n${challenge.player1_name}: ${p1.toLocaleString()} pts\n${challenge.player2_name}: ${p2.toLocaleString()} pts\n${tied ? "It's a tie!" : winner + ' wins!'}\n\nCan you beat us? ${url}`
    navigator.clipboard.writeText(text).then(() => alert('Result copied to clipboard!'))
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-5xl font-black tracking-tighter mb-8">
          Face<span className="text-yellow-400">.</span>
        </h1>

        {/* Winner banner */}
        <div className={`rounded-2xl px-6 py-4 mb-6 ${tied ? 'bg-zinc-800' : 'bg-yellow-400'}`}>
          <p className={`text-2xl font-black ${tied ? 'text-white' : 'text-black'}`}>
            {tied ? "It's a tie! 🤝" : `${winner} wins! 🏆`}
          </p>
        </div>

        {/* Score comparison */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-6">
          {/* Player 1 */}
          <div className={`px-6 py-5 flex items-center justify-between ${p1Won && !tied ? 'bg-zinc-800' : ''}`}>
            <div className="text-left">
              <div className="font-bold text-base">{challenge.player1_name}</div>
              <div className="text-zinc-500 text-xs mt-0.5">{challenge.player1_correct}/{challenge.athlete_ids?.length} correct</div>
            </div>
            <div className={`text-2xl font-black ${p1Won && !tied ? 'text-yellow-400' : 'text-white'}`}>
              {p1.toLocaleString()}
            </div>
          </div>

          <div className="border-t border-zinc-800" />

          {/* Player 2 */}
          <div className={`px-6 py-5 flex items-center justify-between ${!p1Won && !tied ? 'bg-zinc-800' : ''}`}>
            <div className="text-left">
              <div className="font-bold text-base">{challenge.player2_name}</div>
              <div className="text-zinc-500 text-xs mt-0.5">{challenge.player2_correct}/{challenge.athlete_ids?.length} correct</div>
            </div>
            <div className={`text-2xl font-black ${!p1Won && !tied ? 'text-yellow-400' : 'text-white'}`}>
              {p2.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={shareResult}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-black font-bold rounded-xl transition-all"
          >
            Share result
          </button>
          <a
            href="/"
            className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all text-center block"
          >
            Play again
          </a>
        </div>
      </div>
    </div>
  )
}
