'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Athlete = {
  id: number
  name: string
  sport: string
  team: string
  position: string
  photo_url: string
  fame_rating: number
  photo_approved: boolean | null
}

const RATING_LABELS: Record<number, string> = {
  5: '⭐ Superstar',
  4: '🏅 Fan Favorite',
  3: '👟 Roster Player',
  2: '🔍 Deep Cut',
  1: '❓ Who?',
}

export default function ReviewPhotos() {
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sport, setSport] = useState('all')
  const [reviewed, setReviewed] = useState(0)

  useEffect(() => {
    fetchAthletes()
  }, [sport])

  async function fetchAthletes() {
    setLoading(true)
    let query = supabase
      .from('athletes')
      .select('id, name, sport, team, position, photo_url, fame_rating, photo_approved')
      .is('photo_approved', null)
      .order('fame_rating', { ascending: false })
      .limit(200)

    if (sport !== 'all') query = query.eq('sport', sport)

    const { data } = await query
    setAthletes(data || [])
    setCurrent(0)
    setLoading(false)
  }

  async function approve() {
    const athlete = athletes[current]
    await supabase.from('athletes').update({ photo_approved: true }).eq('id', athlete.id)
    setReviewed(r => r + 1)
    next()
  }

  async function reject() {
    const athlete = athletes[current]
    await supabase.from('athletes').update({ photo_approved: false }).eq('id', athlete.id)
    setReviewed(r => r + 1)
    next()
  }

  function next() {
    if (current < athletes.length - 1) {
      setCurrent(c => c + 1)
    } else {
      fetchAthletes()
    }
  }

  function skip() {
    next()
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#09090b',color:'#fff'}}>
      Loading athletes...
    </div>
  )

  if (!athletes.length) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#09090b',color:'#fff',flexDirection:'column',gap:16}}>
      <div style={{fontSize:48}}>🎉</div>
      <div style={{fontSize:24,fontWeight:600}}>All photos reviewed!</div>
      <button onClick={fetchAthletes} style={{marginTop:16}}>Reload</button>
    </div>
  )

  const athlete = athletes[current]

  return (
    <div style={{
      minHeight:'100vh',
      background:'#09090b',
      color:'#fff',
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
      padding:'2rem 1rem',
      fontFamily:'system-ui,sans-serif'
    }}>
      {/* Header */}
      <div style={{width:'100%',maxWidth:500,marginBottom:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h1 style={{fontSize:20,fontWeight:700}}>Photo Review</h1>
          <span style={{fontSize:13,color:'#71717a'}}>{reviewed} reviewed this session</span>
        </div>

        {/* Sport filter */}
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {['all','NFL','NBA','MLB','NHL','CFB','CBB','GOLF'].map(s => (
            <button
              key={s}
              onClick={() => setSport(s)}
              style={{
                padding:'4px 12px',
                borderRadius:20,
                border:'1px solid',
                borderColor: sport === s ? '#facc15' : '#3f3f46',
                background: sport === s ? '#facc15' : 'transparent',
                color: sport === s ? '#000' : '#fff',
                fontSize:12,
                cursor:'pointer'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div style={{width:'100%',maxWidth:500,marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#71717a',marginBottom:4}}>
          <span>{current + 1} of {athletes.length}</span>
          <span>{Math.round(((current+1)/athletes.length)*100)}%</span>
        </div>
        <div style={{height:4,background:'#27272a',borderRadius:2}}>
          <div style={{
            height:'100%',
            background:'#facc15',
            borderRadius:2,
            width:`${((current+1)/athletes.length)*100}%`,
            transition:'width 0.3s'
          }}/>
        </div>
      </div>

      {/* Athlete card */}
      <div style={{
        width:'100%',
        maxWidth:500,
        background:'#18181b',
        borderRadius:16,
        overflow:'hidden',
        border:'1px solid #27272a'
      }}>
        {/* Photo */}
        <div style={{
          width:'100%',
          aspectRatio:'1',
          background:'#09090b',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          overflow:'hidden'
        }}>
          <img
            src={athlete.photo_url}
            alt={athlete.name}
            style={{width:'100%',height:'100%',objectFit:'cover'}}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%2327272a"/><text x="50" y="55" text-anchor="middle" fill="%2371717a" font-size="14">No photo</text></svg>'
            }}
          />
        </div>

        {/* Info */}
        <div style={{padding:'1rem 1.25rem'}}>
          <div style={{fontSize:22,fontWeight:700,marginBottom:4}}>{athlete.name}</div>
          <div style={{display:'flex',gap:8,marginBottom:8,flexWrap:'wrap'}}>
            <span style={{
              fontSize:12,padding:'2px 10px',borderRadius:20,
              background:'#27272a',color:'#a1a1aa'
            }}>{athlete.sport}</span>
            <span style={{
              fontSize:12,padding:'2px 10px',borderRadius:20,
              background:'#27272a',color:'#a1a1aa'
            }}>{athlete.position || 'Unknown position'}</span>
            <span style={{
              fontSize:12,padding:'2px 10px',borderRadius:20,
              background:'#27272a',color:'#a1a1aa'
            }}>{athlete.team}</span>
          </div>
          <div style={{fontSize:13,color:'#facc15'}}>
            {RATING_LABELS[athlete.fame_rating] || 'Unrated'}
          </div>
        </div>

        {/* Actions */}
        <div style={{padding:'0 1.25rem 1.25rem',display:'flex',gap:8}}>
          <button
            onClick={approve}
            style={{
              flex:1,padding:'12px',borderRadius:12,border:'none',
              background:'#16a34a',color:'#fff',fontSize:16,
              cursor:'pointer',fontWeight:600
            }}
          >
            ✅ Good photo
          </button>
          <button
            onClick={reject}
            style={{
              flex:1,padding:'12px',borderRadius:12,border:'none',
              background:'#dc2626',color:'#fff',fontSize:16,
              cursor:'pointer',fontWeight:600
            }}
          >
            ❌ Bad photo
          </button>
        </div>
        <div style={{padding:'0 1.25rem 1.25rem'}}>
          <button
            onClick={skip}
            style={{
              width:'100%',padding:'10px',borderRadius:12,
              border:'1px solid #3f3f46',background:'transparent',
              color:'#71717a',fontSize:14,cursor:'pointer'
            }}
          >
            Skip for now
          </button>
        </div>
      </div>

      <div style={{marginTop:16,fontSize:12,color:'#3f3f46'}}>
        Use keyboard: ← Reject | → Approve | ↓ Skip
      </div>
    </div>
  )
}
