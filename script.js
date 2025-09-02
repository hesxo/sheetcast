// ---------- CONFIG ----------
// Publish ONE sheet as CSV and paste the URL here.
// Sheet columns: Round, Bracket, Team, Score
//    Round: 1 | 2 | 3
//    Bracket examples: "Match 1", "Match 2", "Semifinal 1", "Final", etc.

const MATCHES_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRjf44FpdFrQj5zjERLd8ZoBQodwSuhAprXzcOZ6q3X05x8tlFGyJF716f4o6_c_ar5aJG0BamVTzk1/pub?gid=354344717&single=true&output=csv";

// ---------- UTIL ----------
const $ = (s) => document.querySelector(s);
const lastUpdated = $("#lastUpdated");
const statusEl = $("#sheetStatus");
const roundEls = {1: $("#round1"), 2: $("#round2"), 3: $("#round3")};
const leaderboardEl = $("#leaderboard");
const refreshBtn = $("#refreshBtn");
const refreshSelect = $("#refreshSelect");

function parseCSV(text){
  const rows=[]; let row=[], val='', q=false;
  text = text.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  for(let i=0;i<text.length;i++){
    const c=text[i], n=text[i+1];
    if(c==='"'){ if(q && n==='"'){ val+='"'; i++; } else { q=!q; } }
    else if(c===',' && !q){ row.push(val); val=''; }
    else if(c==='\n' && !q){ row.push(val); rows.push(row); row=[]; val=''; }
    else { val+=c; }
  }
  if(val!==''||row.length){ row.push(val); rows.push(row); }
  return rows.filter(r=>r.some(c=>String(c).trim()!==''));
}

async function fetchCSV(url){
  const res = await fetch(url, { cache: "no-store" });
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseCSV(await res.text());
}

function groupMatches(rows){
  // Expect headers: Round, Bracket, Team, Score
  if(rows.length===0) return {1:[],2:[],3:[]};
  const [hdr,...data]=rows;
  const idx = {
    round: hdr.findIndex(h => /round/i.test(h)),
    bracket: hdr.findIndex(h => /bracket|match|semifinal|final/i.test(h)),
    team: hdr.findIndex(h => /team/i.test(h)),
    score: hdr.findIndex(h => /score|points?/i.test(h)),
  };
  const groups={1:{},2:{},3:{}};
  for(const r of data){
    const rd = parseInt(r[idx.round],10);
    if(![1,2,3].includes(rd)) continue;
    const br = (r[idx.bracket]||"").trim()||"Match";
    const team = (r[idx.team]||"").trim();
    const score = (r[idx.score]||"").trim();
    if(!groups[rd][br]) groups[rd][br] = [];
    groups[rd][br].push({team, score});
  }
  // Convert to array with title + two teams
  const out={1:[],2:[],3:[]};
  for(const rd of [1,2,3]){
    for(const [br, teams] of Object.entries(groups[rd])){
      // keep input order; if more than 2, show all
      out[rd].push({title: br, teams});
    }
  }
  // Sort brackets naturally
  const nat = (a,b)=>String(a.title).localeCompare(String(b.title),undefined,{numeric:true,sensitivity:'base'});
  out[1].sort(nat); out[2].sort(nat); out[3].sort(nat);
  return out;
}

function renderMatches(grouped){
  for(const rd of [1,2,3]){
    const host = roundEls[rd];
    const list = grouped[rd]||[];
    // Use a map to track existing matches by title
    const existing = {};
    Array.from(host.children).forEach(child => {
      if(child.classList.contains('match')){
        const h4 = child.querySelector('h4');
        if(h4) existing[h4.textContent] = child;
      }
    });
    // Track which titles are present
    const seen = new Set();
    list.forEach((m, idx) => {
      seen.add(m.title);
      let wrap = existing[m.title];
      if(!wrap){
        wrap = document.createElement("div");
        wrap.className = "match";
        const h = document.createElement("h4");
        h.textContent = m.title;
        wrap.appendChild(h);
        host.appendChild(wrap);
      }
      // Update teams in place
      // Remove/add only as needed
      let teamRows = Array.from(wrap.querySelectorAll('.team'));
      // Remove extra rows
      while(teamRows.length > m.teams.length){
        teamRows.pop().remove();
      }
      // Update or add rows
      m.teams.forEach((t, i) => {
        let row = teamRows[i];
        if(!row){
          row = document.createElement("div");
          row.className = "team" + (i%2 ? " alt" : "");
          wrap.appendChild(row);
        }
        row.className = "team" + (i%2 ? " alt" : "");
        let name = row.querySelector('.name');
        let score = row.querySelector('.score');
        if(!name){
          name = document.createElement("div");
          name.className = "name";
          row.appendChild(name);
        }
        if(!score){
          score = document.createElement("div");
          score.className = "score";
          row.appendChild(score);
        }
        name.textContent = t.team||"-";
        score.textContent = t.score||"-";
      });
    });
    // Remove matches not in new data
    Object.keys(existing).forEach(title => {
      if(!seen.has(title)){
        existing[title].remove();
      }
    });
    // If no matches, show no data (only if container is empty)
    if(!list.length && !host.querySelector('.match')){
      const noData = document.createElement('div');
      noData.className = 'match';
      noData.innerHTML = '<h4>No data</h4><div class="team"><div class="name">—</div><div class="score">-</div></div>';
      host.appendChild(noData);
    }
  }
}

function renderLeaderboard(rows){
  // Expect headers: Team, Points
  // Use a map to track existing leaderboard rows by team
  if(rows.length===0){
    if(!leaderboardEl.querySelector('.lb-row')){
      const noData = document.createElement('div');
      noData.innerHTML = '<div>No leaderboard data</div>';
      leaderboardEl.appendChild(noData);
    }
    return;
  }
  const [hdr,...data]=rows;
  const iTeam = hdr.findIndex(h => /team/i.test(h));
  const iPts = hdr.findIndex(h => /point|score/i.test(h));
  const items = data.map(r => ({ team: r[iTeam]||"", points: parseFloat(r[iPts]||"0")||0 }))
                    .sort((a,b)=>b.points-a.points);
  const existing = {};
  Array.from(leaderboardEl.children).forEach(child => {
    if(child.classList && child.classList.contains('lb-row')){
      const name = child.querySelector('.lb-bar span:not(.lb-medal)');
      if(name) existing[name.textContent] = child;
    }
  });
  const seen = new Set();
  items.forEach((it, idx) => {
    seen.add(it.team);
    let row = existing[it.team];
    if(!row){
      row = document.createElement("div");
      row.className = "lb-row";
      leaderboardEl.appendChild(row);
    }
    // Update content in place
    let bar = row.querySelector('.lb-bar');
    if(!bar){
      bar = document.createElement('div');
      bar.className = 'lb-bar';
      row.appendChild(bar);
    }
    let medal = bar.querySelector('.lb-medal');
    if(!medal){
      medal = document.createElement('span');
      medal.className = 'lb-medal';
      bar.appendChild(medal);
    }
    medal.textContent = idx===0 ? "🥇" : idx===1 ? "🥈" : idx===2 ? "🥉" : `${idx+1}.`;
    let name = bar.querySelector('span:not(.lb-medal)');
    if(!name){
      name = document.createElement('span');
      bar.appendChild(name);
    }
    name.textContent = it.team;
    let pts = row.querySelector('.lb-points');
    if(!pts){
      pts = document.createElement('div');
      pts.className = 'lb-points';
      row.appendChild(pts);
    }
    pts.textContent = `${it.points} points`;
  });
  // Remove rows not in new data
  Object.keys(existing).forEach(team => {
    if(!seen.has(team)){
      existing[team].remove();
    }
  });
}

async function update(){
  try{
    const matchRows = MATCHES_CSV_URL ? await fetchCSV(MATCHES_CSV_URL) : [];
    const grouped = groupMatches(matchRows);
    renderMatches(grouped);

    // Always compute leaderboard from matches
    const scores = new Map();
    const [hdr,...data] = matchRows;
    if(hdr){
      const iTeam = hdr.findIndex(h => /team/i.test(h));
      const iScore = hdr.findIndex(h => /score|point/i.test(h));
      data.forEach(r => {
        const t = (r[iTeam]||"").trim();
        const s = parseFloat(r[iScore]||"0")||0;
        if(!t) return;
        scores.set(t, (scores.get(t)||0) + s);
      });
    }
    const computed = [["Team","Points"], ...[...scores.entries()].map(([t,p])=>[t,String(p)])];
    renderLeaderboard(computed);
    statusEl.textContent = "Leaderboard computed from match scores";

    lastUpdated.textContent = "Last updated: " + new Date().toLocaleTimeString();
  } catch(e){
    console.error(e);
    statusEl.textContent = "Error: " + e.message;
  }
}

// Controls
let timer=null;
function applyAuto(){
  if(timer) clearInterval(timer);
  const sec = parseInt(refreshSelect.value,10);
  if(sec>0) timer = setInterval(update, sec*1000);
}
refreshBtn.addEventListener("click", update);
refreshSelect.addEventListener("change", applyAuto);

// Init
update();
applyAuto();
