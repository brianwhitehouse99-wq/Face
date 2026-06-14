'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

type Entry = {
  id: string
  player_name: string
  score: number
  correct: number
  completed_at: string
}

type Challenge = {
  id: string
  sport_filter: string
  player1_name: string
  athlete_ids: number[]
}

type Athlete = {
  id: number
  name: string
  team: string
  photo_url: string
}

function LeaderboardContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 10000)
    return () => clearInterval(interval)
  }, [id])

  async function fetchLeaderboard() {
    const res = await fetch(`/api/challenges?id=${id}`)
    const data = await res.json()
    if (data.challenge) {
      setChallenge(data.challenge)
      setEntries(data.entries || [])
      setAthletes(data.athletes || [])
    }
    setLoading(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const medals = ['🥇', '🥈', '🥉']

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#09090b',color:'#fff'}}>
      Loading leaderboard...
    </div>
  )

  if (!challenge) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#09090b',color:'#fff'}}>
      Challenge not found
    </div>
  )

  const maxScore = athletes.length * 100
  const totalPlayers = entries.length

  return (
    <div style={{minHeight:'100vh',background:'#09090b',color:'#fff',padding:'2rem 1rem',fontFamily:'system-ui,sans-serif'}}>
      <div style={{maxWidth:500,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <h1 style={{fontSize:48,fontWeight:900,letterSpacing:'-2px',marginBottom:4}}>
            Face<span style={{color:'#facc15'}}>.</span>
          </h1>
          <p style={{color:'#71717a',fontSize:14}}>
            {challenge.sport_filter === 'all' ? 'All sports' : challenge.sport_filter} challenge
          </p>
        </div>

        <div style={{background:'#18181b',border:'1px solid #27272a',borderRadius:16,padding:'1rem 1.5rem',marginBottom:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:24,fontWeight:700,color:'#facc15'}}>{totalPlayers}</div>
            <div style={{fontSize:12,color:'#71717a'}}>players</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:24,fontWeight:700}}>{athletes.length}</div>
            <div style={{fontSize:12,color:'#71717a'}}>athletes</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:24,fontWeight:700}}>{maxScore}</div>
            <div style={{fontSize:12,color:'#71717a'}}>max pts</div>
          </div>
        </div>

        <div style={{marginBottom:'1.5rem'}}>
          <p style={{fontSize:12,fontWeight:600,letterSpacing:'0.1em',color:'#71717a',textTransform:'uppercase',marginBottom:12}}>
            Leaderboard
          </p>
          {entries.length === 0 ? (
            <div style={{background:'#18181b',border:'1px solid #27272a',borderRadius:16,padding:'2rem',textAlign:'center',color:'#71717a'}}>
              No entries yet — share the link to get started!
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {entries.map((entry, i) => (
                <div key={entry.id} style={{background:'#18181b',border:`1px solid ${i === 0 ? '#facc15' : '#27272a'}`,borderRadius:16,padding:'1rem 1.25rem',display:'flex',alignItems:'center',gap:12}}>
                  <div style={{fontSize:24,width:32,textAlign:'center'}}>
                    {medals[i] || `${i+1}`}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:16}}>{entry.player_name}</div>
                    <div style={{fontSize:12,color:'#71717a'}}>{entry.correct}/{athletes.length} correct</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:20,fontWeight:700,color: i === 0 ? '#facc15' : '#fff'}}>{entry.score}</div>
                    <div style={{fontSize:11,color:'#71717a'}}>pts</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {athletes.length > 0 && (
          <div style={{marginBottom:'1.5rem'}}>
            <p style={{fontSize:12,fontWeight:600,letterSpacing:'0.1em',color:'#71717a',textTransform:'uppercase',marginBottom:12}}>
              Athletes in this challenge
            </p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {athletes.map(a => (
                <div key={a.id} style={{background:'#18181b',border:'1px solid #27272a',borderRadius:12,overflow:'hidden'}}>
                  <div style={{width:'100%',aspectRatio:'1',background:'#09090b'}}>
                    <img src={a.photo_url} alt={a.name} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top'}} />
                  </div>
                  <div style={{padding:'6px 8px'}}>
                    <p style={{fontSize:11,fontWeight:600,color:'#fff',lineHeight:1.2}}>{a.name}</p>
                    <p style={{fontSize:10,color:'#71717a'}}>{a.team}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={copyLink} style={{width:'100%',padding:'14px',borderRadius:12,border:'none',background:'#facc15',color:'#000',fontSize:16,fontWeight:700,cursor:'pointer'}}>
          {copied ? '✓ Link copied!' : '📋 Copy challenge link'}
        </button>

        <p style={{textAlign:'center',fontSize:12,color:'#3f3f46',marginTop:12}}>
          Leaderboard updates automatically
        </p>
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#09090b',color:'#fff'}}>Loading...</div>}>
      <LeaderboardContent />
    </Suspense>
  )
}
