'use client'

import { useState, useEffect } from 'react'
import { Filters } from '@/lib/athletes'

type Props = {
  onStart: (filters: Filters) => void
}

const TEAMS: Record<string, string[]> = {
  NFL: ['Arizona Cardinals','Atlanta Falcons','Baltimore Ravens','Buffalo Bills','Carolina Panthers','Chicago Bears','Cincinnati Bengals','Cleveland Browns','Dallas Cowboys','Denver Broncos','Detroit Lions','Green Bay Packers','Houston Texans','Indianapolis Colts','Jacksonville Jaguars','Kansas City Chiefs','Las Vegas Raiders','Los Angeles Chargers','Los Angeles Rams','Miami Dolphins','Minnesota Vikings','New England Patriots','New Orleans Saints','New York Giants','New York Jets','Philadelphia Eagles','Pittsburgh Steelers','San Francisco 49ers','Seattle Seahawks','Tampa Bay Buccaneers','Tennessee Titans','Washington Commanders'],
  NBA: ['Atlanta Hawks','Boston Celtics','Brooklyn Nets','Charlotte Hornets','Chicago Bulls','Cleveland Cavaliers','Dallas Mavericks','Denver Nuggets','Detroit Pistons','Golden State Warriors','Houston Rockets','Indiana Pacers','Los Angeles Clippers','Los Angeles Lakers','Memphis Grizzlies','Miami Heat','Milwaukee Bucks','Minnesota Timberwolves','New Orleans Pelicans','New York Knicks','Oklahoma City Thunder','Orlando Magic','Philadelphia 76ers','Phoenix Suns','Portland Trail Blazers','Sacramento Kings','San Antonio Spurs','Toronto Raptors','Utah Jazz','Washington Wizards'],
  MLB: ['Arizona Diamondbacks','Atlanta Braves','Baltimore Orioles','Boston Red Sox','Chicago Cubs','Chicago White Sox','Cincinnati Reds','Cleveland Guardians','Colorado Rockies','Detroit Tigers','Houston Astros','Kansas City Royals','Los Angeles Angels','Los Angeles Dodgers','Miami Marlins','Milwaukee Brewers','Minnesota Twins','New York Mets','New York Yankees','Oakland Athletics','Philadelphia Phillies','Pittsburgh Pirates','San Diego Padres','San Francisco Giants','Seattle Mariners','St. Louis Cardinals','Tampa Bay Rays','Texas Rangers','Toronto Blue Jays','Washington Nationals'],
  NHL: ['Anaheim Ducks','Arizona Coyotes','Boston Bruins','Buffalo Sabres','Calgary Flames','Carolina Hurricanes','Chicago Blackhawks','Colorado Avalanche','Columbus Blue Jackets','Dallas Stars','Detroit Red Wings','Edmonton Oilers','Florida Panthers','Los Angeles Kings','Minnesota Wild','Montreal Canadiens','Nashville Predators','New Jersey Devils','New York Islanders','New York Rangers','Ottawa Senators','Philadelphia Flyers','Pittsburgh Penguins','San Jose Sharks','Seattle Kraken','St. Louis Blues','Tampa Bay Lightning','Toronto Maple Leafs','Vancouver Canucks','Vegas Golden Knights','Washington Capitals','Winnipeg Jets'],
}

export default function SetupScreen({ onStart }: Props) {
  const [sport, setSport] = useState('all')
  const [conference, setConference] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [count, setCount] = useState(3)
  const [team, setTeam] = useState('all')
  const [showTeams, setShowTeams] = useState(false)

  const hasTeams = TEAMS[sport] !== undefined

  useEffect(() => {
    setTeam('all')
    setShowTeams(false)
  }, [sport])

  function handleStart() {
    onStart({ sport, conference: 'all', difficulty, count, team })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        <div className="mb-10">
          <h1 className="text-6xl font-black tracking-tighter">
            Face<span className="text-yellow-400">.</span>
          </h1>
          <p className="text-zinc-400 mt-2 text-sm tracking-wide">
            Test your player recognition skills!
          </p>
        </div>

        {/* Sport selector — all in one row */}
        <div className="mb-6">
          <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-3 block">
            Sport
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              ['all', 'All sports'],
              ['NFL', 'NFL'],
              ['NBA', 'NBA'],
              ['MLB', 'MLB'],
              ['NHL', 'NHL'],
              ['GOLF', 'Golf'],
              ['CFB', 'College football'],
              ['CBB', 'College basketball'],
              ['college', 'All college'],
            ].map(([val, label]) => (
              <Chip key={val} active={sport === val} onClick={() => { setSport(val); setConference('all') }}>
                {label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Team filter (pro sports only) */}
        {hasTeams && (
          <div className="mb-6">
            <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-3 block">
              Team
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              <Chip active={team === 'all'} onClick={() => { setTeam('all'); setShowTeams(false) }}>
                All teams
              </Chip>
              {team !== 'all' && (
                <Chip active={true} onClick={() => setShowTeams(!showTeams)}>
                  {team} ▾
                </Chip>
              )}
              {team === 'all' && (
                <Chip active={false} onClick={() => setShowTeams(!showTeams)}>
                  Pick a team ▾
                </Chip>
              )}
            </div>
            {showTeams && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 max-h-48 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {TEAMS[sport].map(t => (
                    <button
                      key={t}
                      onClick={() => { setTeam(t); setShowTeams(false) }}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
                        ${team === t
                          ? 'bg-yellow-400 border-yellow-400 text-black'
                          : 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-zinc-800 my-6" />

        {/* Difficulty filter */}
        <div className="mb-6">
          <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-3 block">
            Difficulty Level
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              ['all', 'Random'],
              ['5', '⭐ Superstars'],
              ['4', '🏅 Fan Favorites'],
              ['3', '👟 Roster Players'],
              ['2', '🔍 Deep Cuts'],
              ['1', '❓ Who?'],
            ].map(([val, label]) => (
              <Chip key={val} active={difficulty === val} onClick={() => setDifficulty(val)}>
                {label}
              </Chip>
            ))}
          </div>
          <p className="text-zinc-600 text-xs mt-2">
            {difficulty === 'all' && 'Random mix of players'}
            {difficulty === '5' && 'Household names — Mahomes, LeBron, Trout'}
            {difficulty === '4' && 'Starters most fans recognize'}
            {difficulty === '3' && 'Regular contributors'}
            {difficulty === '2' && 'Backups and role players'}
            {difficulty === '1' && 'Truly obscure — the ultimate challenge'}
          </p>
        </div>

        {/* Athletes per session */}
        <div className="mb-8">
          <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-3 block">
            Athletes per session
          </label>
          <div className="flex gap-2">
            {[3, 5].map(n => (
              <Chip key={n} active={count === n} onClick={() => setCount(n)}>{n}</Chip>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.98] text-black font-bold text-lg rounded-xl transition-all tracking-wide"
        >
          Play Face. →
        </button>
      </div>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all
        ${active
          ? 'bg-yellow-400 border-yellow-400 text-black'
          : 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
        }`}
    >
      {children}
    </button>
  )
}
