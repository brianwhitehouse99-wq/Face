import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ANCHORS = `TIER S (top 1-2% — universal icons, 90-100% recognition):
Michael Jordan (NBA), LeBron James (NBA), Tom Brady (NFL), Wayne Gretzky (NHL),
Kobe Bryant (NBA), Peyton Manning (NFL), Babe Ruth (MLB), Tiger Woods (Golf)

TIER A (top 3-5% — sports fan household names, 75-90% recognition):
Patrick Mahomes (NFL), Stephen Curry (NBA), Derek Jeter (MLB), Joe Montana (NFL),
Shaquille O'Neal (NBA), Magic Johnson (NBA), Larry Bird (NBA), Barry Bonds (MLB),
Hank Aaron (MLB), Dan Marino (NFL), Jerry Rice (NFL), Emmitt Smith (NFL),
Brett Favre (NFL), Walter Payton (NFL), Barry Sanders (NFL), Mike Trout (MLB),
Shohei Ohtani (MLB), Sidney Crosby (NHL), Connor McDavid (NHL), Mario Lemieux (NHL),
Lamar Jackson (NFL), Josh Allen (NFL), Giannis Antetokounmpo (NBA), Kevin Durant (NBA),
Jack Nicklaus (Golf), Arnold Palmer (Golf), Phil Mickelson (Golf), Tim Tebow (CFB),
Travis Kelce (NFL), Aaron Rodgers (NFL), Reggie White (NFL), Ray Lewis (NFL),
Lawrence Taylor (NFL), Dick Butkus (NFL), Jim Brown (NFL), Joe Namath (NFL),
Randy Moss (NFL), Terrell Owens (NFL), Deion Sanders (NFL), Bo Jackson (NFL)

TIER B (top 6-15% — most sports fans know them, 55-75% recognition):
Justin Jefferson (NFL), Jalen Hurts (NFL), Joe Burrow (NFL), Odell Beckham Jr. (NFL),
Adrian Peterson (NFL), Jayson Tatum (NBA), Luka Doncic (NBA), Joel Embiid (NBA),
Nikola Jokic (NBA), Dwyane Wade (NBA), Dirk Nowitzki (NBA), Charles Barkley (NBA),
Patrick Roy (NHL), Mark Messier (NHL), Aaron Judge (MLB), Ken Griffey Jr. (MLB),
Cal Ripken Jr. (MLB), Randy Johnson (MLB), Tim Duncan (NBA), Allen Iverson (NBA),
Rory McIlroy (Golf), Jordan Spieth (Golf), Dustin Johnson (Golf), Bubba Watson (Golf),
Charlie Ward (CFB), Zion Williamson (CBB), Carmelo Anthony (CBB),
John Elway (NFL), Steve Young (NFL), Troy Aikman (NFL), Marshall Faulk (NFL),
Donovan McNabb (NFL), Michael Vick (NFL), LaDainian Tomlinson (NFL),
Tony Romo (NFL), Drew Brees (NFL), Eli Manning (NFL)

TIER C (top 16-35% — dedicated fans know them, 30-55% recognition):
Herman Moore (NFL), Kirk Cousins (NFL), T.J. Watt (NFL), Jared Goff (NFL),
Matt Forte (NFL), Lance Briggs (NFL), Jrue Holiday (NBA), Bradley Beal (NBA),
Joakim Noah (NBA), Richard Hamilton (NBA), Mark Buehrle (MLB), Paul Konerko (MLB),
Anthony Rizzo (MLB), Carlos Zambrano (MLB), Jonathan Toews (NHL), Steve Yzerman (NHL),
Bobby Orr (NHL), Rickie Fowler (Golf), Denard Robinson (CFB), Jimmer Fredette (CBB)

TIER D (top 36-65% — die-hard fans only, 10-30% recognition):
Chris Spielman (NFL), Trent Green (NFL), Kyle Orton (NFL), Nate Burleson (NFL),
Beno Udrih (NBA), Jason Collins (NBA), Neifi Perez (MLB), Steve Trachsel (MLB),
Garth Snow (NHL), Charley Hoffman (Golf), Mike Sainristil (CFB), Doug McDermott (CBB)

TIER E (bottom 35% — even hardcore fans may not know, under 10% recognition):
Tyler Palko (NFL), Rohan Davey (NFL), Rich King (NBA), Neil Fiala (MLB),
Brent Gauvreau (NHL), Tag Ridings (Golf), Trevor Keegan (CFB), Zabian Dowdell (CBB)`

const TIER_TO_RATING: Record<string, number> = { S:5, A:5, B:4, C:3, D:2, E:1 }

async function rateBatchWithClaude(athletes: any[]): Promise<any[]> {
  const list = athletes.map((a, i) =>
    `${i+1}. ${a.name} (${a.sport}${a.team && a.team !== 'Unknown' ? ', ' + a.team : ''})`
  ).join('\n')

  const prompt = `You are rating athletes for a sports recognition game called Face. where players identify athletes from photos.

Using these tier anchors as reference points, rate each athlete S, A, B, C, D, or E:

${ANCHORS}

CRITICAL DISTRIBUTION TARGET — aim for roughly:
- S/A tiers (Rating 5): top 5% — only true household names
- B tier (Rating 4): next 10% — solid stars most fans know
- C tier (Rating 3): next 20% — recognizable to dedicated fans
- D tier (Rating 2): next 30% — die-hard fans only
- E tier (Rating 1): bottom 35% — obscure players

Key principles about legacy vs current players:
- A legend who dominated their era is just as recognizable as a current star — Joe Montana = Josh Allen, Dan Marino = Patrick Mahomes, Walter Payton = Christian McCaffrey
- Hall of Famers from any era should be rated A or higher
- Super Bowl MVPs, league MVPs, and multi-time champions should be A tier minimum
- Do NOT penalize retired players — fame is cumulative, not time-decayed
- A player who was famous 20 years ago is still famous today

Key principles:
- Legends like Dan Marino, Jerry Rice, Walter Payton = A tier even if retired
- Current stars with multiple Pro Bowls = B or higher
- Role players and backups = D or E
- College athletes rated on college fame only
- NHL players have lower general recognition than NFL/NBA

Be GENEROUS with B and C tiers — if a typical sports fan would recognize the name, give them at least a C. Only give E to truly obscure players most fans have never heard of.

Respond ONLY with a JSON array, no other text:
[{"id":1,"rating":"A"},{"id":2,"rating":"C"}...]

Athletes to rate:
${list}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  const text = data.content?.[0]?.text || '[]'
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

export async function POST(request: NextRequest) {
  const { sport, batchSize = 30, offset = 0 } = await request.json()

  if (!sport) return NextResponse.json({ error: 'Missing sport' }, { status: 400 })
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Missing ANTHROPIC_API_KEY' }, { status: 500 })

  const { data: athletes, error } = await supabaseAdmin
    .from('athletes')
    .select('id, name, sport, team')
    .eq('sport', sport)
    .order('id')
    .range(offset, offset + batchSize - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!athletes?.length) return NextResponse.json({ done: true, processed: 0 })

  const ratings = await rateBatchWithClaude(athletes)

  let updated = 0
  for (const r of ratings) {
    const athlete = athletes[r.id - 1]
    if (!athlete) continue
    const { error: updateError } = await supabaseAdmin
      .from('athletes')
      .update({ fame_rating: TIER_TO_RATING[r.rating] || 3 })
      .eq('id', athlete.id)
    if (!updateError) updated++
  }

  return NextResponse.json({
    done: athletes.length < batchSize,
    processed: athletes.length,
    updated,
    nextOffset: offset + athletes.length,
    sample: ratings
      .filter(r => r.rating === 'S' || r.rating === 'A' || r.rating === 'B')
      .map(r => ({ name: athletes[r.id-1]?.name, rating: r.rating }))
      .slice(0, 5)
  })
}
