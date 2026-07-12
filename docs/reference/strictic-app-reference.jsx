import React, { useState, useEffect, useRef } from "react";
import {
  Plus, Minus, Check, ChevronRight, ChevronLeft, ChevronDown, SkipForward,
  Trophy, X, Dumbbell, RotateCcw, Volume2, VolumeX, Settings, Play, Lock, Undo2, ArrowUp,
  TrendingUp, Share2, ArrowRight, Home, Download, Upload,
  MessageCircle, Send, Sparkles, Crown, Feather, Copy,
} from "lucide-react";

/* ════════ tokens ════════ */
const L = { bg:"#F4F4F2", surface:"#FFFFFF", line:"#ECECEA", line2:"#E0E0DD",lineField:"#8B8B85", ink:"#0A0A0A", ink2:"#6E6E6B", ink3:"#67675F", accent:"#FF4D1C", accentDeep:"#C13A12", cream:"#F8EFE7", green:"#3E9457" };
const D = { bg:"#0C0C0B", surface:"#15150F", card:"#1E1E18", line:"#2A2A24", line2:"#3A3A30", ink:"#F5F5F2", ink2:"#A4A49C", ink3:"#828278", accent:"#FF5A2C", green:"#4FB06A" };
const F = { sans:"'Inter',system-ui,sans-serif", mono:"'Inter',system-ui,sans-serif" };
/* Jedna rodina (Inter) pro vše — F.mono už není monospace font, ale ROLE pro data/štítky:
   verzálky + prostrkání + tabulkové číslice (tnum) drží hierarchii; textura je jednotná. */
const tnum = { fontFeatureSettings:'"tnum" 1' };

/* ════════ plan ════════ */
const PLAN = [
  { id:"goblet", name:"Goblet dřep", muscles:"Kvadricepsy · hýždě", kind:"main", sets:3, reps:12, restSec:120, startWeight:16, unit:"obouruč",
    how:"Stoj na šířku ramen, špičky mírně ven. Jednu těžší jednoručku chyť oběma rukama svisle a drž ji u hrudi jako pohár. Záda rovná, hrudník nahoru. Klesej dolů, zadek tlač dozadu a kolena ven, dokud nejsou stehna aspoň vodorovně, pak se přes paty zatlač nahoru.",
    why:"Největší sval těla za jeden technicky skoro neprůstřelný cvik — činka u hrudi ti automaticky narovná záda. Drží zdravé koleno a kyčel a kope do metabolismu." },
  { id:"stepup", name:"Výstupy na lavici", muscles:"Hýždě · kvadricepsy", kind:"main", sets:3, reps:12, restSec:120, startWeight:8, unit:"/ruka", perLeg:true,
    how:"Čelem k lavici, v každé ruce jednoručka podél těla. Polož celé chodidlo na lavici a přes patu té nohy se vytlač nahoru, pak se stejnou nohou pomalu spusť. Je to chození do schodů s činkami. Tlač přes horní nohu, dolů nepadej. Napoprvé klidně bez činek.",
    why:"Druhý cvik na nohy, jednostranný — srovná nerovnováhu mezi nohama a zapojí stabilizátory. Žádná osa na zádech, bezpečný pro páteř." },
  { id:"bench", name:"Bench press s jednoručkami", muscles:"Prsa · triceps · přední ramena", kind:"main", sets:3, reps:12, restSec:120, startWeight:18, unit:"/ruka",
    how:"Leh zády na lavici, v každé ruce činka nad hrudníkem, dlaně k nohám. Lokty mírně od těla. Spouštěj pomalu k hrudníku do úrovně prsou, pak svižně vytlač nahoru a lehce stáhni k sobě. Ramena do lavice, zadek neodlepuj.",
    why:"Tvůj hlavní tlak na vršek — staví prsa a zezadu i triceps a přední rameno. Jednoručky dají větší rozsah a doma nepotřebuješ dohled." },
  { id:"row", name:"Přítahy vleže na šikmé lavici", muscles:"Záda · biceps", kind:"main", sets:3, reps:12, restSec:90, startWeight:14, unit:"/ruka",
    how:"Lavice našikmo (30–45°), leh břichem, hrudník o opěrku. V každé ruce činka volně dolů, dlaně k sobě. Přitáhni k bokům, lokty veď podél těla a stáhni lopatky. Nahoře krátce zadrž, pak pomalu spusť. Lavice tě drží — nemusíš balancovat ani hlídat záda.",
    why:"Vyvažuje všechno to tlačení — bez tahů by ses hrbil a bolela by ramena. Opřený o lavici zabereš naplno a bezpečně." },
  { id:"ohp", name:"Tlak nad hlavu s jednoručkami", muscles:"Ramena · triceps", kind:"main", sets:3, reps:12, restSec:90, startWeight:12, unit:"/ruka",
    how:"Vsedě s opěrkou nebo ve stoje, činky ve výši ramen, dlaně dopředu. Vytlač nad hlavu skoro do natažení — nahoře lokty prudce nezamykej. Pomalu spusť k ramenům. Břicho zpevni, neprohýbej se v zádech.",
    why:"Staví kulatá ramena = ten dojem širokého vršku. Síla do tlaku nad hlavu je užitečná i v běžném životě." },
  { id:"curl", name:"Biceps zdvih", muscles:"Biceps", kind:"iso", sets:3, reps:12, restSec:75, startWeight:10, unit:"/ruka",
    how:"Stoj vzpřímeně, činky podél těla, dlaně dopředu. Lokty přitisknuté k bokům a nehýbej jimi. Ohýbej jen předloktí, zvedej k ramenům, nahoře zatni, pak pomalu spusť. Žádné hmitání trupem.",
    why:"Přímá práce na ruce — tvoje priorita. Na viditelný růst paží chce přímou izolaci." },
  { id:"triext", name:"Triceps extension nad hlavou", muscles:"Triceps", kind:"iso", sets:3, reps:12, restSec:75, startWeight:10, unit:"obouruč",
    how:"Vsedě nebo ve stoje chyť jednu činku obouruč a zvedni nad hlavu. Horní paže svisle u hlavy, nehýbej jimi. Ohni v loktech a spouštěj za hlavu do protažení, pak propni nahoru. Lokty u sebe, nerozjíždí se.",
    why:"Triceps jsou dvě třetiny objemu paže — chceš-li větší ruce, tohle dělá víc než biceps." },
  { id:"shrug", name:"Shrug (pokrčení rameny)", muscles:"Trapézy", kind:"iso", sets:3, reps:12, restSec:75, startWeight:20, unit:"/ruka",
    how:"Stoj vzpřímeně, činka v každé ruce podél těla. Ruce úplně natažené (lokty nepokrčuj), jen zvedni ramena co nejvýš k uším. Nahoře zatni a zadrž, pak pomalu dolů. Žádné kroužení. Pauza nahoře je klíč.",
    why:"Trapézy dělají ten mohutný dojem mezi krkem a rameny. Snesou velkou váhu = rychlý pocit progrese." },
  { id:"lateral", name:"Boční rozpažky", muscles:"Postranní ramena (šířka)", kind:"iso", optional:true, sets:3, reps:12, restSec:60, startWeight:6, unit:"/ruka",
    how:"Stoj, činky podél těla, lokty lehce pokrčené. Zvedej do stran do výše ramen (jako bys naléval ze džbánu — malíček lehce výš). Pohyb z ramen, ne hmitem, pak pomalu spusť. Lehká váha a čistě.",
    why:"Šířka ramen = úzký pas vypadá ještě užší (ten V dojem). Přesně cílí na siluetu, kterou chceš." },
  { id:"core", name:"Břicho na konec", muscles:"Střed těla", kind:"hold", optional:true, sets:3, holdMin:30, holdMax:60, restSec:45,
    how:"Plank: opři se o předloktí a špičky, tělo v jedné přímce, břicho a hýždě zpevni, boky nepovoluj. Drž, jak dlouho to jde čistě.",
    why:"Pevný střed chrání záda u všech ostatních cviků. Pupek nespálí (to dělá strava), ale staví funkční jádro." },
];

/* ════════ equipment ════════ */
const REQ = {
  goblet:{any:["db","kb"]}, stepup:{all:["bench"],any:["db","kb"]},
  bench:{all:["bench"],any:["db"]}, row:{all:["bench"],any:["db"]},
  ohp:{any:["db","bar","kb"]}, curl:{any:["db","bar","kb","bands"]},
  triext:{any:["db","bar","kb"]}, shrug:{any:["db","bar","kb"]}, lateral:{any:["db","bands"]},
};
const DEFAULT_GEAR = { db:true, bar:false, bench:true, pullup:true, kb:false, wheel:false, bands:false };
const GEAR_ITEMS = [
  { k:"db", label:"Jednoručky" }, { k:"bar", label:"Obouruční činka" },
  { k:"bench", label:"Lavice" }, { k:"pullup", label:"Hrazda" },
  { k:"kb", label:"Kettlebell" }, { k:"wheel", label:"Kolečko na břicho" },
  { k:"bands", label:"Odporové gumy" },
];
const gearLabel = (g) => GEAR_ITEMS.filter(i=>g[i.k]).map(i=>i.label.toLowerCase()).join(" · ") || "vlastní váha";
const gearOK = (e,g) => { const r=REQ[e.id]; if(!r) return true; const has=(k)=>k==="body"||!!g[k]; return (!r.all||r.all.every(has)) && (!r.any||r.any.some(has)); };

/* ════════ persistence ════════ */
const PKEY="fitcoach:progress:v5", EKEY="fitcoach:equip:v2", SKEY="fitcoach:session:v1", HKEY="fitcoach:history:v1", CKEY="fitcoach:coach:v1";
const BRAND="Strictic", FREE_COACH=3;
const PRICING=[{id:"month",label:"Měsíčně",price:"119 Kč",sub:"/měsíc"},{id:"year",label:"Ročně",price:"990 Kč",sub:"≈ 83 Kč/měs · ušetříš 30 %",best:true},{id:"life",label:"Doživotně",price:"1 990 Kč",sub:"jednorázově, navždy"}];
const GOALS=[
  {k:"strength",label:"Síla",sub:"být silnější — delší pauzy"},
  {k:"cutting",label:"Hubnutí",sub:"shodit, víc se zapotit — kratší pauzy"},
  {k:"health",label:"Zdraví & forma",sub:"cítit se dobře a udržet se"},
];
const goalDef=(k)=>GOALS.find(g=>g.k===k)||GOALS[2];
const restMultFor=(k)=>k==="strength"?1.3:k==="cutting"?0.65:1;
/* Lehčí den = kratší, ale vyvážený trénink laděný na NÁRŮST SVALŮ:
   nech páteřní komplexy (dřep, tlak, tah, tlak nad hlavu) + izolaci, kterou komplexy MINOU
   (biceps, boční delt) + core; odeber MAX 3 nejvíc redundantní — trapézy, triceps (už dřený z tlaků),
   druhý cvik na nohy. Váha se v lehkém režimu snižuje o krok a série zůstávají (objem = hlavní tahoun hypertrofie).
   Pozn.: až přibude samostatný cíl „Svaly", může se ořez zase lišit podle cíle (goal je tu proto ponechán). */
const isExerciseDone=(l)=>!!(l&&(l.status==="skipped"||(l.sets&&l.sets.length>0&&l.sets.every(s=>s.done))));
const LIGHT_CUT_ORDER=["shrug","triext","stepup","core","lateral","curl"];
const lighterPlan=(full,goal)=>{ const drop=new Set();
  for(const id of LIGHT_CUT_ORDER){ if(drop.size>=3) break; if(full.some(e=>e.id===id)) drop.add(id); }
  return full.filter(e=>!drop.has(e.id)); };
const loadJSON=async(k)=>{try{if(!window.storage)return null;const r=await window.storage.get(k);return r?JSON.parse(r.value):null;}catch{return null;}};
const saveJSON=async(k,v)=>{try{if(window.storage)await window.storage.set(k,JSON.stringify(v));}catch{}};
const clearKey=async(k)=>{try{if(window.storage)await window.storage.delete(k);}catch{}};

/* ════════ audio ════════ */
function useAudio(){
  const ref=useRef(null);
  const ensure=()=>{try{if(!ref.current)ref.current=new(window.AudioContext||window.webkitAudioContext)();if(ref.current.state==="suspended")ref.current.resume();}catch{}return ref.current;};
  const tone=(c,f,s,d,v=0.18)=>{const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=f;o.connect(g);g.connect(c.destination);const t=c.currentTime+s;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.start(t);o.stop(t+d+0.03);};
  return{unlock:ensure,
    restDone:()=>{const c=ensure();if(!c)return;tone(c,660,0,.16);tone(c,880,.15,.16);tone(c,1175,.3,.34,.2);},
    tick:()=>{const c=ensure();if(!c)return;tone(c,520,0,.07,.07);},
    win:()=>{const c=ensure();if(!c)return;tone(c,784,0,.12,.14);tone(c,1047,.1,.18,.16);}};
}
const vibe=(p)=>{try{navigator.vibrate?.(p);}catch{}};
const fmt=(s)=>{s=Math.max(0,s);const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),x=s%60;return h>0?`${h}:${String(m).padStart(2,"0")}:${String(x).padStart(2,"0")}`:`${m}:${String(x).padStart(2,"0")}`;};
const fmtDur=(s)=>{const t=Math.max(0,Math.round(s/60));const h=Math.floor(t/60),m=t%60;if(h>0)return m>0?`${h} h ${m} min`:`${h} h`;if(t>0)return `${m} min`;return "<1 min";};
const arr=(n,fn)=>Array.from({length:n},(_,i)=>fn(i));
const fmtKg=(n)=>(Math.round(n*100)/100).toString().replace(".",",");
const gen=(od,krok,doo)=>{const out=[];if(krok<=0)return[od];for(let w=od;w<=doo+1e-9;w=Math.round((w+krok)*100)/100)out.push(Math.round(w*100)/100);return out;};
/* odhad 1RM (Epleyho vzorec): váha × (1 + opakování/30) — slouží jen k výběru nejtěžší série do rekordu */
const e1rm=(w,r)=>w*(1+r/30);
const fmtVol=(v)=>v>=1000?`${(v/1000).toFixed(1).replace(".",",")} t`:`${Math.round(v).toLocaleString("cs")} kg`;
const dShort=(ts)=>new Date(ts).toLocaleDateString("cs",{day:"numeric",month:"numeric"});

/* demo history — shown only until the user has 2 real sessions */
function demoHistory(){
  const N=8, today=Date.now();
  const prog={ goblet:[16,18,18,20,20,22,22,24], bench:[14,14,16,16,16,18,18,18], row:[14,14,16,16,18,18,18,20], ohp:[12,12,12,14,14,14,16,16], curl:[10,10,12,12,12,14,14,14], triext:[10,12,12,12,14,14,14,16], shrug:[20,22,24,24,26,28,28,30], lateral:[6,6,8,8,8,10,10,10] };
  const reps=[10,12,11,12,12,11,12,12];
  return arr(N,(i)=>{ const date=today-(N-1-i)*7*86400000; const ex={}; let vol=0;
    Object.entries(prog).forEach(([id,a])=>{ const w=a[i],r=reps[i]; ex[id]={w,r,e1:Math.round(e1rm(w,r)*10)/10}; vol+=w*r*3; });
    return { date, dur:2900+i*40, volume:Math.round(vol), ex, demo:true }; });
}

/* ════════ chart atoms ════════ */
function BigChart({data,h=110,color="#FF4D1C",format,labels,insideTextColor="#0A0A0A"}){
  /* Sloupcový graf s PEVNOU šířkou sloupce a popiskem u KAŽDÉHO sloupce — uvnitř, když je ve
     sloupci na popisek místo, jinak nad ním (práh podle skutečné výšky pruhu v px, ne odhadem).
     Sloupce se nikdy nenatahují na celou šířku (to dřív dělalo z jednoho záznamu obří pruh a
     rozbíjelo centrování popisku u krajních sloupců) — když se všechny nevejdou, graf se prostě
     rozjede vodorovně (swipe na mobilu, scroll na PC) a zobrazení se posune na nejnovější záznam.
     Datum je jen jednou dole jako rozsah, ne u každého sloupce (u desítek záznamů by to byl šum). */
  if(!data||data.length<1)return <div style={{height:h}}/>;
  const trackRef=useRef(null);
  useEffect(()=>{ const el=trackRef.current; if(el) el.scrollLeft=el.scrollWidth; },[data.length]);
  useEffect(()=>{ const id="strictic-chart-style"; if(document.getElementById(id))return; const st=document.createElement("style"); st.id=id; st.textContent=".vbars::-webkit-scrollbar{display:none}.vbars{scrollbar-width:none;-ms-overflow-style:none}"; (document.head||document.documentElement).appendChild(st); },[]);
  const TN={fontVariantNumeric:"tabular-nums"};
  const vals=data, labs=labels||[];
  const n=vals.length;
  const min=Math.min(...vals),max=Math.max(...vals),span=(max-min)||1;
  const frac=(v)=>n===1?0.62:(0.3+0.7*((v-min)/span));
  const fmt=format||((v)=>String(v));
  const colW=42, gap=8, gutter=20;
  return (
    <div>
      <div ref={trackRef} className="vbars" style={{overflowX:n>1?"auto":"hidden",overflowY:"hidden",WebkitOverflowScrolling:"touch"}}>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"flex-end",gap,height:h+gutter,width:"max-content",minWidth:"100%"}}>
          {vals.map((v,i)=>{
            const bh=Math.max(2,Math.round(frac(v)*h));
            const inside=bh>=30, isLast=i===n-1;
            return (
              <div key={i} style={{flex:`0 0 ${colW}px`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:h+gutter}}>
                {!inside&&<span style={{fontFamily:F.mono,fontSize:10,fontWeight:isLast?700:500,color:isLast?color:"#8B8B85",whiteSpace:"nowrap",marginBottom:4,...TN}}>{fmt(v)}</span>}
                <div style={{width:"100%",height:bh,borderRadius:"6px 6px 0 0",background:color,display:"flex",alignItems:"flex-start",justifyContent:"center"}}>
                  {inside&&<span style={{fontFamily:F.mono,fontSize:10,fontWeight:isLast?700:600,color:insideTextColor,whiteSpace:"nowrap",marginTop:6,...TN}}>{fmt(v)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {labs.length>1&&<div style={{marginTop:8,fontFamily:F.mono,fontSize:9.5,color:"#8B8B85",textAlign:"right"}}>{labs[0]} – {labs[labs.length-1]}</div>}
    </div>
  );
}

function Logo({size=28,color="currentColor"}){
  /* Nahá značka bez podkladu — barva textu, ne brand oranžová (ta je vyhrazená pro akce).
     Uzavřená verze s tmavým čtvercem + oranžová žije jen v PWA ikonách na ploše telefonu.
     Kresba je užší než vysoká (poměr ~0,744) — size = výška, šířka se dopočítá, ať sedí vedle textu. */
  const h=size, w=Math.round(size*(1116/1500));
  return(
  <svg width={w} height={h} viewBox="0 0 1116 1500" fill="none" style={{display:"block",flex:"0 0 auto"}} aria-hidden="true">
    <path d="M0 738.156V1059.89L663.321 1442.86V1121.13L0 738.156Z" fill={color}/>
    <path d="M352.97 0L0 203.781V631.843L762.289 1071.95V1500L1115.26 1296.22V868.168L352.97 428.051V0Z" fill={color}/>
    <path d="M451.938 57.1396V378.878L1115.26 761.847V440.108L451.938 57.1396Z" fill={color}/>
  </svg>
);}
function Wordmark({sub=true}){return(
  <div style={{display:"flex",alignItems:"center",gap:9}}>
    <Logo size={28}/>
    <div><div style={{fontFamily:F.sans,fontWeight:700,fontSize:16,letterSpacing:"-.02em",lineHeight:1}}>{BRAND}</div>
    {sub&&<div style={{fontFamily:F.mono,fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:L.ink3,marginTop:3}}>poctivý kouč</div>}</div>
  </div>
);}
function CountUp({value,format,ms=650}){
  const [v,setV]=useState(0);
  useEffect(()=>{ let raf; const t0=performance.now(); const tick=(t)=>{const p=Math.min(1,(t-t0)/ms);setV(value*(1-Math.pow(1-p,3)));if(p<1)raf=requestAnimationFrame(tick);}; raf=requestAnimationFrame(tick); return()=>cancelAnimationFrame(raf); },[value]); // eslint-disable-line
  return <>{format?format(v):Math.round(v).toLocaleString("cs")}</>;
}

/* ════════ atoms ════════ */
function Stepper({ label, value, onDec, onInc, onSet, dark, active }){
  const t=dark?D:L;
  const [edit,setEdit]=useState(false);
  const [draft,setDraft]=useState("");
  const rep=useRef(null);
  const repeated=useRef(false);
  const startRep=(fn)=>{ stopRep(); repeated.current=false; rep.current=setTimeout(()=>{ rep.current=setInterval(()=>{ repeated.current=true; fn(); },80); },350); };
  const stopRep=()=>{ if(rep.current){ clearTimeout(rep.current); clearInterval(rep.current); rep.current=null; } };
  const tap=(fn)=>{ if(repeated.current){ repeated.current=false; return; } fn(); };
  useEffect(()=>()=>stopRep(),[]);
  const commit=()=>{ const v=parseFloat(String(draft).replace(",",".")); if(!isNaN(v)&&onSet)onSet(v); setEdit(false); };
  const btn={width:56,height:56,flex:"0 0 auto",display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",border:"none",color:t.ink,cursor:"pointer",touchAction:"manipulation",userSelect:"none"};
  return(
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontFamily:F.mono,fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:t.ink3,marginBottom:6,textAlign:"center"}}>{label}</div>
      <div style={{display:"flex",alignItems:"center",border:`1px solid ${t.line2}`,borderRadius:14,overflow:"hidden",background:dark?D.bg:t.surface}}>
        <button aria-label={`${label}: ubrat`} onClick={()=>tap(onDec)} onPointerDown={()=>startRep(onDec)} onPointerUp={stopRep} onPointerLeave={stopRep} onPointerCancel={stopRep} style={btn}><Minus size={19}/></button>
        {edit ? (
          <input autoFocus aria-label={label} type="text" inputMode="decimal" value={draft} onChange={e=>setDraft(e.target.value)} onBlur={commit} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();commit();}else if(e.key==="Escape")setEdit(false);}} style={{flex:1,width:"100%",minWidth:0,textAlign:"center",fontFamily:F.mono,fontWeight:700,fontSize:24,...tnum,color:t.accent,background:"transparent",borderTop:"none",borderBottom:"none",borderLeft:`1px solid ${t.line}`,borderRight:`1px solid ${t.line}`,padding:"11px 0"}}/>
        ) : (
          <button onClick={()=>{ if(onSet){ setDraft(String(value).replace(".",",")); setEdit(true); } }} aria-label={`${label}: zadat hodnotu`} style={{flex:1,textAlign:"center",fontFamily:F.mono,fontWeight:700,fontSize:24,...tnum,color:active?t.accent:t.ink,borderLeft:`1px solid ${t.line}`,borderRight:`1px solid ${t.line}`,padding:"11px 0",background:"transparent",borderTop:"none",borderBottom:"none",cursor:onSet?"text":"default"}}>{value}</button>
        )}
        <button aria-label={`${label}: přidat`} onClick={()=>tap(onInc)} onPointerDown={()=>startRep(onInc)} onPointerUp={stopRep} onPointerLeave={stopRep} onPointerCancel={stopRep} style={btn}><Plus size={19}/></button>
      </div>
    </div>
  );
}
function Disc({ children, dim, dark }){
  const t=dark?D:L;
  return <div style={{flex:"0 0 auto",width:38,height:38,borderRadius:"50%",background:dim?"transparent":(dark?"#000":t.ink),border:`2px solid ${dim?t.line2:t.accent}`,color:dim?t.accent:(dark?t.ink:"#fff"),fontFamily:F.sans,fontWeight:600,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>{children}</div>;
}

/* StepDots — decorative progress indicator (one filled bar per step).
   Non-interactive on purpose: the textual "CVIK x/N" is the accessible source of truth,
   so this is aria-hidden and carries no tap targets. states[i] ∈ "done"|"current"|"upcoming". */
function StepDots({ states, fill, track }){
  return (
    <div aria-hidden="true" style={{display:"flex",gap:3,marginTop:6}}>
      {states.map((s,i)=>(
        <div key={i} style={{flex:1,height:4,borderRadius:6,background:s==="upcoming"?track:fill,opacity:s==="current"?.5:1,transition:"background .3s, opacity .3s"}}/>
      ))}
    </div>
  );
}

/* ════════ main ════════ */
function AppInner(){
  const [phase,setPhase]=useState("loading");
  const [idx,setIdx]=useState(0);
  const [logs,setLogs]=useState({});
  const [progress,setProgress]=useState({});
  const [history,setHistory]=useState([]);
  const [fromSummary,setFromSummary]=useState(false);
  const [coachMsgs,setCoachMsgs]=useState([]);
  const [coachInput,setCoachInput]=useState("");
  const [coachLoading,setCoachLoading]=useState(false);
  const [coachFree,setCoachFree]=useState(FREE_COACH);
  const [plus,setPlus]=useState(false);
  const [showPlans,setShowPlans]=useState(false);
  const [equip,setEquip]=useState({ weights:gen(2,2,24), muted:false, gear:DEFAULT_GEAR });
  const gear = equip.gear || DEFAULT_GEAR;
  const goal = equip.goal || "health";
  const restFor=(e)=>Math.max(20,Math.round((((e&&e.restSec)||90)*restMultFor(goal))/5)*5);
  const [easy,setEasy]=useState(false);
  const basePlan = PLAN.filter(e=>gearOK(e,gear));
  const plan = easy ? lighterPlan(basePlan, goal) : basePlan;
  const lightDropEx = basePlan.filter(e=>!lighterPlan(basePlan, goal).some(k=>k.id===e.id));
  const lightDropIds = new Set(lightDropEx.map(e=>e.id));
  const [toastMsg,setToastMsg]=useState(null);
  const toastT=useRef(null);
  const toast=(m)=>{ if(toastT.current)clearTimeout(toastT.current); setToastMsg(m); toastT.current=setTimeout(()=>setToastMsg(null),2200); };
  const fileRef=useRef(null);
  const exportData=async()=>{ try{ const keys=[PKEY,EKEY,SKEY,HKEY,CKEY]; const data={}; for(const k of keys){ data[k]=await loadJSON(k); } const blob=new Blob([JSON.stringify({app:"strictic",v:1,exported:new Date().toISOString(),data},null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`strictic-zaloha-${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),2000); toast("Záloha stažena"); }catch{ toast("Zálohu se nepodařilo vytvořit"); } };
  const importData=(f)=>{ if(!f)return; const r=new FileReader(); r.onload=async()=>{ try{ const parsed=JSON.parse(String(r.result)); const d=parsed&&parsed.data?parsed.data:parsed; if(!d||typeof d!=="object")throw new Error("bad"); for(const k of Object.keys(d)){ if(d[k]!=null)await saveJSON(k,d[k]); } toast("Obnoveno"); setTimeout(()=>location.reload(),600); }catch{ toast("Soubor se nepodařilo načíst"); } }; r.readAsText(f); };
  const [su,setSu]=useState({ od:2, krok:2, do:24, weights:gen(2,2,24), first:true });
  const [editList,setEditList]=useState(false);
  const [wDetail,setWDetail]=useState(false);
  const [progIdx,setProgIdx]=useState(0);
  const heroTrackRef=useRef(null); const scrollRaf=useRef(0);
  useEffect(()=>{ const id="strictic-hcar-style"; if(document.getElementById(id))return; const st=document.createElement("style"); st.id=id; st.textContent=".hcar::-webkit-scrollbar{display:none}.hcar{scrollbar-width:none;-ms-overflow-style:none}"; (document.head||document.documentElement).appendChild(st); },[]);
  useEffect(()=>{ if(phase!=="pokrok")return; const onKey=(e)=>{ if(e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return; const el=heroTrackRef.current; if(!el)return; const w=el.clientWidth||1; const cur=Math.round(el.scrollLeft/w); el.scrollTo({left:Math.max(0,cur+(e.key==="ArrowRight"?1:-1))*w,behavior:"smooth"}); }; window.addEventListener("keydown",onKey); return()=>window.removeEventListener("keydown",onKey); },[phase]);
  const [custom,setCustom]=useState("");
  const [resumable,setResumable]=useState(null);
  const [startedAt,setStartedAt]=useState(null);
  const [now,setNow]=useState(Date.now());
  const [rest,setRest]=useState(null);
  const [hold,setHold]=useState({ si:null, secs:0 });
  const [focusSet,setFocusSet]=useState(null);
  const [whyOpen,setWhyOpen]=useState({});
  const [howOpen,setHowOpen]=useState({});
  const [pop,setPop]=useState(false);
  const [confirmNew,setConfirmNew]=useState(false);
  const [confirm,setConfirm]=useState(null);
  const [shareSheet,setShareSheet]=useState(null);
  const [dim,setDim]=useState(false);
  const restPlayed=useRef(false);
  const wakeRef=useRef(null);
  const restModalRef=useRef(null);
  const restReturnFocus=useRef(null);
  const demoRef=useRef(null);
  const getDemo=()=>{ if(!demoRef.current)demoRef.current=demoHistory(); return demoRef.current; };
  const audio=useAudio();
  const sfx={tick:()=>!equip.muted&&audio.tick(),restDone:()=>!equip.muted&&audio.restDone(),win:()=>!equip.muted&&audio.win()};
  const haptic=(p)=>{ if(!equip.muted) vibe(p); };

  useEffect(()=>{
    if(!document.getElementById("gf-fc")){const l=document.createElement("link");l.id="gf-fc";l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";document.head.appendChild(l);}
    if(!document.getElementById("gs-fc")){const s=document.createElement("style");s.id="gs-fc";s.textContent=`*:focus-visible{outline:2px solid #FF5A2C;outline-offset:2px;border-radius:5px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(hover:hover){button:hover{filter:brightness(.96)}}button:active{filter:brightness(.93)}.pulse{animation:pl 1.4s ease-in-out infinite}@keyframes pl{0%,100%{opacity:1}50%{opacity:.3}}.exfade{animation:exf .32s cubic-bezier(.2,.7,.2,1)}@keyframes exf{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@media(prefers-reduced-motion:reduce){.pulse,.exfade{animation:none}*{transition:none!important}}`;document.head.appendChild(s);}
  },[]);

  useEffect(()=>{(async()=>{
    const p=await loadJSON(PKEY);if(p)setProgress(p);
    const h=await loadJSON(HKEY);if(Array.isArray(h))setHistory(h);
    const s=await loadJSON(SKEY);if(s&&s.logs&&Date.now()-(s.ts||0)<6*3600*1000)setResumable(s);
    const c=await loadJSON(CKEY);if(c){if(typeof c.free==="number")setCoachFree(c.free);if(Array.isArray(c.msgs))setCoachMsgs(c.msgs);if(c.plus)setPlus(true);}
    const e=await loadJSON(EKEY);
    if(e&&e.weights?.length){setEquip(e);setPhase("home");} else {setSu({od:2,krok:2,do:24,weights:gen(2,2,24),gear:{...DEFAULT_GEAR},goal:"health",first:true});setPhase("intro");}
  })();},[]);

  useEffect(()=>{ if(phase!=="workout")return; const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t); },[phase]);
  useEffect(()=>{ if(!rest)return; if(rest.left<=0){if(!restPlayed.current){restPlayed.current=true;sfx.restDone();haptic([0,60,40,60]);}const t=setTimeout(()=>setRest(null),2200);return()=>clearTimeout(t);} const t=setTimeout(()=>setRest((r)=>r?{...r,left:r.left-1}:null),1000);return()=>clearTimeout(t); },[rest]); // eslint-disable-line
  useEffect(()=>{ if(phase!=="workout")return; let lock=null; const acquire=async()=>{ try{ if(document.visibilityState==="visible"&&navigator.wakeLock){ lock=await navigator.wakeLock.request("screen"); } }catch(_){} }; acquire(); const onVis=()=>{ if(document.visibilityState==="visible")acquire(); }; document.addEventListener("visibilitychange",onVis); return()=>{ document.removeEventListener("visibilitychange",onVis); try{ lock&&lock.release(); }catch(_){} }; },[phase]);
  useEffect(()=>{ if(hold.si===null)return; const t=setInterval(()=>setHold((h)=>h.si===null?h:{...h,secs:h.secs+1}),1000);return()=>clearInterval(t); },[hold.si]);
  /* persist in-progress session for resume */
  useEffect(()=>{ if(phase!=="workout"||!startedAt)return; const el=Math.floor((Date.now()-startedAt)/1000); saveJSON(SKEY,{idx,logs,elapsed:el,ts:Date.now(),easy}); },[logs,idx,phase,startedAt]); // eslint-disable-line
  /* drží obrazovku vzhůru během tréninku (Wake Lock); znovu vyžádá po návratu z pozadí */
  useEffect(()=>{ if(phase!=="workout"||typeof navigator==="undefined"||!("wakeLock"in navigator))return;
    const acquire=async()=>{try{if(document.visibilityState==="visible"&&(!wakeRef.current||wakeRef.current.released)){wakeRef.current=await navigator.wakeLock.request("screen");}}catch{}};
    const onVis=()=>{if(document.visibilityState==="visible")acquire();};
    acquire(); document.addEventListener("visibilitychange",onVis);
    return()=>{document.removeEventListener("visibilitychange",onVis);try{wakeRef.current&&!wakeRef.current.released&&wakeRef.current.release();}catch{}wakeRef.current=null;};
  },[phase]);
  /* klidové ztmavení (OLED úspora): po nečinnosti spadne do skoro černé; jakýkoli dotek probudí */
  useEffect(()=>{ if(phase!=="workout"){setDim(false);return;} let timer;
    const arm=()=>{setDim(false);clearTimeout(timer);timer=setTimeout(()=>setDim(true),45000);};
    const onAct=()=>arm(); arm();
    document.addEventListener("pointerdown",onAct,{passive:true}); document.addEventListener("keydown",onAct);
    return()=>{clearTimeout(timer);document.removeEventListener("pointerdown",onAct);document.removeEventListener("keydown",onAct);};
  },[phase,!!rest]); // eslint-disable-line
  /* přístupný focus trap modálu pauzy: drží fokus uvnitř, Esc zavře, po zavření fokus vrátí */
  useEffect(()=>{ if(!rest)return; const root=restModalRef.current; if(!root)return;
    restReturnFocus.current=document.activeElement;
    const getF=()=>Array.from(root.querySelectorAll('button:not([disabled]),[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])'));
    const id=requestAnimationFrame(()=>{const f=getF();const t=f[f.length-1]||root;t&&t.focus&&t.focus({preventScroll:true});});
    const onKey=(e)=>{ if(e.key==="Escape"){e.preventDefault();setRest(null);return;} if(e.key!=="Tab")return; const els=getF(); if(!els.length){e.preventDefault();return;} const first=els[0],last=els[els.length-1]; if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();} else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();} };
    root.addEventListener("keydown",onKey);
    return()=>{ cancelAnimationFrame(id); root.removeEventListener("keydown",onKey); try{restReturnFocus.current&&restReturnFocus.current.focus&&restReturnFocus.current.focus({preventScroll:true});}catch{} };
  },[!!rest]); // eslint-disable-line

  /* po přepnutí cviku / obrazovky skoč na začátek okna, ať jsi vždy u série a nemusíš rolovat nahoru */
  useEffect(()=>{ try{window.scrollTo({top:0,left:0,behavior:"auto"});}catch(_){try{window.scrollTo(0,0);}catch(__){}} },[phase,idx]);

  const ex=plan[idx];
  const log=logs[ex?.id];
  const elapsed=startedAt?Math.floor((now-startedAt)/1000):0;
  const W=equip.weights&&equip.weights.length?equip.weights:gen(2,2,24);
  const nearestW=(w)=>W.reduce((a,b)=>Math.abs(b-w)<Math.abs(a-w)?b:a,W[0]);
  const stepW=(w,dir)=>{const n=nearestW(w);const i=Math.min(W.length-1,Math.max(0,W.indexOf(n)+dir));return W[i];};
  const nextUp=(w)=>{for(const x of W)if(x>w+1e-9)return x;return null;};
  const nextDown=(w)=>{for(let i=W.length-1;i>=0;i--)if(W[i]<w-1e-9)return W[i];return null;};

  const sync=(nl)=>{if(easy)return;const np={...progress};plan.forEach((e)=>{const l=nl[e.id];if(!l||e.kind==="hold")return;np[e.id]={...np[e.id],weights:l.sets.map(s=>s.weight)};});setProgress(np);saveJSON(PKEY,np);};
  const toggleMute=()=>{const ne={...equip,muted:!equip.muted};setEquip(ne);saveJSON(EKEY,ne);};

  const buildInit=(lite=false)=>{const init={};
    (lite?lighterPlan(basePlan, goal):basePlan).forEach((e)=>{const sv=progress[e.id];
      init[e.id]=e.kind==="hold"?{sets:arr(e.sets,()=>({done:false,secs:0})),status:"pending"}
        :{sets:arr(e.sets,(i)=>{const base=sv?.weights?.[i]??e.startWeight;const w=lite?(nextDown(base)??base):base;return {reps:e.reps,weight:nearestW(w),done:false};}),status:"pending"};});
    return init;};
  const start=(lite=false)=>{ audio.unlock(); setResumable(null); setConfirmNew(false); setEasy(lite); setLogs(buildInit(lite));setIdx(0);setStartedAt(Date.now());setWhyOpen({});setHowOpen({});setRest(null);setHold({si:null,secs:0});setPhase("workout"); };
  const resume=()=>{ audio.unlock(); setEasy(!!resumable.easy); setLogs(resumable.logs);setIdx(resumable.idx||0);setStartedAt(Date.now()-(resumable.elapsed||0)*1000);setResumable(null);setWhyOpen({});setHowOpen({});setRest(null);setHold({si:null,secs:0});setPhase("workout"); };
  const deleteSession=(rec)=>{ const nh=history.filter(s=>s.date!==rec.date); setHistory(nh); saveJSON(HKEY,nh); toast("Trénink smazán"); };
  const discardWorkout=()=>{ clearKey(SKEY); setResumable(null); setRest(null); setHold({si:null,secs:0}); setLogs({}); setIdx(0); setStartedAt(null); setEasy(false); setWhyOpen({}); setHowOpen({}); setPhase("home"); };
  const doShare=async(spec,filename)=>{ try{
    const c=await buildShareCanvas(spec); if(!c){toast("Nepodařilo se vytvořit obrázek");return;}
    const blob=await new Promise(r=>c.toBlob(r,"image/png",0.95)); if(!blob){toast("Nepodařilo se vytvořit obrázek");return;}
    const file=new File([blob],filename,{type:"image/png"});
    if(navigator.canShare&&navigator.canShare({files:[file]})){ try{ await navigator.share({files:[file]}); return; }catch(e){ if(e&&e.name==="AbortError")return; } }
    setShareSheet({url:URL.createObjectURL(blob),blob,filename});
  }catch(e){ toast("Sdílení se nezdařilo"); } };
  const closeShare=()=>setShareSheet(s=>{ if(s&&s.url){try{URL.revokeObjectURL(s.url);}catch{}} return null; });
  const copyShareBlob=async(blob)=>{ try{ if(navigator.clipboard&&window.ClipboardItem){ await navigator.clipboard.write([new window.ClipboardItem({[blob.type]:blob})]); return true; } }catch(e){} return false; };
  const openComposer=async(net)=>{ if(!shareSheet)return; const ok=await copyShareBlob(shareSheet.blob); const u=encodeURIComponent("https://"+SHARE_URL); const t=encodeURIComponent("Můj domácí trénink ve Strictic."); const href=net==="x"?`https://twitter.com/intent/tweet?text=${t}&url=${u}`:`https://www.facebook.com/sharer/sharer.php?u=${u}`; window.open(href,"_blank","noopener,noreferrer"); toast(ok?"Obrázek je ve schránce — v příspěvku dej Ctrl/⌘+V":"Otevřel jsem příspěvek — obrázek přilož ze staženého souboru"); };

  const adj=(si,field,dir)=>setLogs((p)=>{const cur=p[ex.id].sets[si][field];
    let v; if(field==="weight"){v=stepW(cur,dir); if(v===cur)vibe(7);} else v=Math.max(0,cur+dir);
    return{...p,[ex.id]:{...p[ex.id],sets:p[ex.id].sets.map((s,i)=>i===si?{...s,[field]:v}:s)}};});
  const adjSet=(si,field,val)=>setLogs((p)=>({...p,[ex.id]:{...p[ex.id],sets:p[ex.id].sets.map((s,i)=>i===si?{...s,[field]:val}:s)}}));

  const completeOrRest=(nextLogs)=>{ const done=plan.every((e)=>isExerciseDone(nextLogs[e.id])); const finalLogs=done?{...nextLogs,[ex.id]:{...nextLogs[ex.id],status:"done"}}:nextLogs; setLogs(finalLogs); if(done){finish(finalLogs);}else{restPlayed.current=false;const r=restFor(ex);setRest({left:r,total:r});} };
  const logSet=(si)=>{ const cur=logs[ex.id];const set=cur.sets[si];let sets=cur.sets.map((s,i)=>i===si?{...s,done:true}:s);if(ex.kind!=="hold"&&si+1<sets.length)sets=sets.map((s,i)=>i===si+1?{...s,reps:set.reps,weight:set.weight}:s);const nextLogs={...logs,[ex.id]:{...cur,sets}};sync(nextLogs); sfx.tick();haptic(14);setFocusSet(null); completeOrRest(nextLogs); };
  const undoSet=(si)=>{ setLogs((p)=>{const np={...p,[ex.id]:{...p[ex.id],sets:p[ex.id].sets.map((s,i)=>i===si?{...s,done:false}:s)}};sync(np);return np;}); setRest(null); setFocusSet(null); };
  const startHold=(si)=>{ audio.unlock(); setHold({si,secs:0}); };
  const stopHold=(si)=>{ const cur=logs[ex.id];const nextLogs={...logs,[ex.id]:{...cur,sets:cur.sets.map((s,i)=>i===si?{...s,done:true,secs:hold.secs}:s)}}; sfx.tick();haptic(14);setHold({si:null,secs:0}); completeOrRest(nextLogs); };

  const hitGoal=ex&&ex.kind!=="hold"&&!easy&&log?.sets.every(s=>s.done)&&log?.sets.every(s=>s.reps>=ex.reps);
  const workW=log?.sets?.[0]?.weight??ex?.startWeight??0;
  const nu=nextUp(workW); const atCeiling=ex&&ex.kind!=="hold"&&nu===null;
  useEffect(()=>{ if(hitGoal){sfx.win();setPop(true);const t=setTimeout(()=>setPop(false),900);return()=>clearTimeout(t);} },[hitGoal]); // eslint-disable-line

  const go=(dir)=>{ setLogs((p)=>{const l=p[ex.id];const any=l.sets.some(s=>s.done);const np={...p,[ex.id]:{...l,status:l.status==="skipped"?"skipped":(any?"done":"pending")}};sync(np);return np;}); setRest(null);setHold({si:null,secs:0});setFocusSet(null); if(dir>0&&idx>=plan.length-1)finish();else setIdx((i)=>Math.min(plan.length-1,Math.max(0,i+dir))); };
  const goTo=(j)=>{ setLogs((p)=>{const l=p[ex.id];const any=l.sets.some(s=>s.done);const np={...p,[ex.id]:{...l,status:l.status==="skipped"?"skipped":(any?"done":"pending")}};sync(np);return np;}); setRest(null);setHold({si:null,secs:0});setFocusSet(null); setIdx(Math.max(0,Math.min(plan.length-1,j))); };
  const saveEdit=()=>{ sync(logs); setFocusSet(null); };
  const skip=()=>{ setLogs((p)=>({...p,[ex.id]:{...p[ex.id],status:"skipped"}})); setRest(null);setHold({si:null,secs:0});setFocusSet(null); if(idx>=plan.length-1)finish();else setIdx((i)=>i+1); };

  const askCoach=async(text)=>{
    const t=(text||"").trim(); if(!t||coachLoading)return;
    if(!plus&&coachFree<=0){ setPhase("paywall"); return; }
    const next=[...coachMsgs,{role:"user",content:t}];
    const newFree=plus?coachFree:coachFree-1;
    setCoachMsgs(next); setCoachInput(""); setCoachLoading(true); setCoachFree(newFree); saveJSON(CKEY,{free:newFree,msgs:next,plus});
    try{
      const ctx=plan.filter(e=>e.kind!=="hold").map(e=>`${e.name} ${fmtKg(nearestW(progress[e.id]?.weights?.[0]??e.startWeight))} kg`).join(", ");
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-6",max_tokens:1000,
        system:`Jsi kouč v aplikaci ${BRAND}. Mluv česky a tykej. Značka stojí na radikální poctivosti a nule hype. Uživatel je praktický minimalista, cvičí doma. Vybavení: ${gearLabel(gear)}${gear.db?` (nastavitelné jednoručky ${W[0]}–${W[W.length-1]} kg)`:""}. Plán full-body 3× týdně, cíl 12 opakování v sérii; po dosažení 12 ve všech sériích se zvedá váha. Aktuální pracovní váhy: ${ctx}. Cíl uživatele: ${goalDef(goal).label} (${goalDef(goal).sub}). Drž rady v rámci jeho vybavení. Odpovídej krátce, věcně a konkrétně, bez vaty a bez tlačení doplňků. Nic kategoricky neslibuj. U zdravotních potíží (bolest atd.) nediagnostikuj a doporuč odborníka.`,
        messages:next.map(m=>({role:m.role,content:m.content})),
      })});
      const data=await res.json();
      const txt=((data&&data.content)||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n").trim()||"Promiň, teď se mi nepovedlo odpovědět. Zkus to prosím znovu.";
      const out=[...next,{role:"assistant",content:txt}]; setCoachMsgs(out); saveJSON(CKEY,{free:newFree,msgs:out,plus});
    }catch(err){
      const out=[...next,{role:"assistant",content:"Spojení s koučem teď neklaplo. Zkus to prosím za chvíli."}]; setCoachMsgs(out); saveJSON(CKEY,{free:newFree,msgs:out,plus});
    }
    setCoachLoading(false);
  };
  const buyPlus=()=>{ setPlus(true); saveJSON(CKEY,{free:coachFree,msgs:coachMsgs,plus:true}); setPhase("coach"); };

  /* fixed-target progression + session history for the Progress screen */
  const finish=(srcLogs)=>{
    const lg=srcLogs||logs;
    let volume=0; const np={...progress}; const rec={date:Date.now(),dur:elapsed,volume:0,ex:{}};
    plan.forEach((e)=>{ const l=lg[e.id]; if(!l)return;
      if(e.kind==="hold"){ np[e.id]={...np[e.id], secs:l.sets.map(s=>s.secs||0)}; return; }
      if(l.status==="skipped"){ let best=null; l.sets.forEach(s=>{ if(s.done){ volume+=s.reps*s.weight; const v=e1rm(s.weight,s.reps); if(!best||v>best.e1)best={w:s.weight,r:s.reps,e1:Math.round(v*10)/10}; } }); if(best)rec.ex[e.id]=best; if(np[e.id]&&np[e.id].bump)np[e.id]={...np[e.id],bump:null}; return; }
      let best=null; l.sets.forEach(s=>{ if(s.done){ volume+=s.reps*s.weight; const v=e1rm(s.weight,s.reps); if(!best||v>best.e1)best={w:s.weight,r:s.reps,e1:Math.round(v*10)/10}; } });
      if(best) rec.ex[e.id]=best;
      const allTarget=l.sets.every(s=>s.done)&&l.sets.every(s=>s.reps>=e.reps);
      const w0=l.sets[0]?.weight??e.startWeight; const up=nextUp(w0);
      if(easy){ np[e.id]={ weights:(progress[e.id]?.weights??l.sets.map(()=>e.startWeight)), bump:null }; }
      else if(allTarget&&up!==null){ np[e.id]={ weights:l.sets.map(()=>up), bump:{from:w0,to:up} }; }
      else { np[e.id]={ weights:l.sets.map(s=>s.weight), bump:null }; }
    });
    np._last={date:Date.now(),volume}; rec.volume=volume; if(easy)rec.easy=true;
    setProgress(np); saveJSON(PKEY,np);
    if(Object.keys(rec.ex).length){ const nh=[...history,rec].slice(-120); setHistory(nh); saveJSON(HKEY,nh); }
    clearKey(SKEY); setPhase("summary");
  };

  /* ════ LOADING ════ */
  if(phase==="loading")return <div style={{minHeight:"100vh",background:L.bg}}/>;

  const trapTab=(e)=>{ if(e.key!=="Tab")return; const els=Array.from(e.currentTarget.querySelectorAll('button:not([disabled]),[href],input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')); if(!els.length){e.preventDefault();return;} const first=els[0],last=els[els.length-1]; if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();} else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();} };
  const confirmModal = confirm ? (
    <div role="dialog" aria-modal="true" aria-label={confirm.title} onKeyDown={(e)=>{if(e.key==="Escape")setConfirm(null);else trapTab(e);}} onClick={(e)=>{if(e.target===e.currentTarget)setConfirm(null);}} style={{position:"fixed",inset:0,zIndex:60,background:"rgba(10,10,10,.55)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{width:"100%",maxWidth:360,background:L.bg,borderRadius:18,border:`1px solid ${L.line2}`,padding:"22px",boxShadow:"0 24px 60px -15px rgba(10,10,10,.5)"}}>
        <h3 style={{fontFamily:F.sans,fontWeight:600,fontSize:16,margin:"0 0 8px",letterSpacing:"-.02em",color:L.ink}}>{confirm.title}</h3>
        <p style={{fontSize:14,color:L.ink2,lineHeight:1.5,margin:"0 0 18px"}}>{confirm.body}</p>
        <div style={{display:"flex",gap:10}}>
          <button autoFocus onClick={()=>setConfirm(null)} style={{flex:1,padding:"13px",borderRadius:14,border:`1px solid ${L.line2}`,background:L.surface,color:L.ink,fontFamily:F.sans,fontWeight:600,fontSize:14,cursor:"pointer",touchAction:"manipulation"}}>Zrušit</button>
          <button onClick={()=>{const fn=confirm.onYes;setConfirm(null);fn&&fn();}} style={{flex:1,padding:"13px",borderRadius:14,border:"none",background:L.accent,color:"#0C0C0B",fontFamily:F.sans,fontWeight:700,fontSize:14,cursor:"pointer",touchAction:"manipulation"}}>{confirm.confirmLabel||"Smazat"}</button>
        </div>
      </div>
    </div>
  ) : null;

  const shareModal = shareSheet ? (
    <div role="dialog" aria-modal="true" aria-label="Sdílet" onKeyDown={(e)=>{if(e.key==="Escape")closeShare();else trapTab(e);}} onClick={(e)=>{if(e.target===e.currentTarget)closeShare();}} style={{position:"fixed",inset:0,zIndex:70,background:"rgba(10,10,10,.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:"22px",overflowY:"auto"}}>
      <div style={{width:"100%",maxWidth:390,background:L.bg,borderRadius:18,border:`1px solid ${L.line2}`,padding:"18px",boxShadow:"0 24px 60px -15px rgba(10,10,10,.5)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <h3 style={{fontFamily:F.sans,fontWeight:600,fontSize:16,margin:0,color:L.ink}}>Sdílet</h3>
          <button onClick={closeShare} aria-label="Zavřít" style={{width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6,border:"none",background:"transparent",color:L.ink3,cursor:"pointer"}}><X size={17}/></button>
        </div>
        <img src={shareSheet.url} alt="Náhled karty" style={{width:"100%",borderRadius:14,display:"block",border:`1px solid ${L.line}`}}/>
        <button autoFocus onClick={async()=>{ const ok=await copyShareBlob(shareSheet.blob); toast(ok?"Zkopírováno — vlož přes Ctrl/⌘+V":"Kopírování tu nejde, použij Stáhnout"); }} style={{width:"100%",marginTop:14,display:"flex",alignItems:"center",justifyContent:"center",gap:9,background:L.accent,color:"#0C0C0B",border:"none",borderRadius:14,padding:"15px",fontFamily:F.sans,fontWeight:700,fontSize:16,cursor:"pointer"}}><Copy size={18}/> Kopírovat obrázek</button>
        <button onClick={()=>{ const a=document.createElement("a"); a.href=shareSheet.url; a.download=shareSheet.filename; document.body.appendChild(a); a.click(); a.remove(); toast("Obrázek stažen"); }} style={{width:"100%",marginTop:9,display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:L.surface,border:`1px solid ${L.line2}`,color:L.ink,fontFamily:F.sans,fontWeight:600,fontSize:14,borderRadius:14,padding:"13px",cursor:"pointer"}}><Download size={17}/> Stáhnout obrázek</button>
        <div style={{display:"flex",gap:9,marginTop:9}}>
          <button onClick={()=>openComposer("x")} style={{flex:1,padding:"11px",borderRadius:14,border:`1px solid ${L.line2}`,background:L.surface,color:L.ink2,fontFamily:F.sans,fontWeight:600,fontSize:14,cursor:"pointer"}}>X / Twitter</button>
          <button onClick={()=>openComposer("fb")} style={{flex:1,padding:"11px",borderRadius:14,border:`1px solid ${L.line2}`,background:L.surface,color:L.ink2,fontFamily:F.sans,fontWeight:600,fontSize:14,cursor:"pointer"}}>Facebook</button>
        </div>
        <p style={{fontFamily:F.mono,fontSize:12,color:L.ink3,textAlign:"center",margin:"12px 4px 2px",lineHeight:1.55}}>Tip: na X i Facebooku dej v příspěvku Ctrl/⌘+V — obrázek se vloží ze schránky. Na Instagram nahraj stažený soubor. Weby neumí přijmout obrázek přímo z appky.</p>
      </div>
    </div>
  ) : null;

  /* ════ INTRO (onboarding) ════ */
  if(phase==="intro"){
    const points=[
      {icon:<TrendingUp size={18} color={L.accentDeep}/>,t:"Progrese bez přemýšlení",d:"Dáš cíl, appka ti sama navýší váhu. Nic nepočítáš."},
      {icon:<MessageCircle size={18} color={L.accentDeep}/>,t:"Kouč, co odpoví narovinu",d:"Zasekneš se? Zeptáš se. Žádné kecy, žádné prodávání doplňků."},
      {icon:<Check size={18} color={L.accentDeep}/>,t:"Poctivost, ne hype",d:"Ukážeme ti, co reálně zvedneš — ne marnivá čísla."},
    ];
    return(
      <Shell>
        <div style={{minHeight:"82vh",display:"flex",flexDirection:"column"}}>
          <div style={{paddingTop:8}}><Wordmark/></div>
          <div style={{paddingTop:40}}>
            <h1 style={{...h1,fontSize:"clamp(36px,10vw,58px)"}}>Domácí kouč,<br/>co ti <span style={{color:L.accent}}>nelže</span>.</h1>
            <p style={{fontSize:16,color:L.ink2,maxWidth:"40ch",margin:"16px 0 0",lineHeight:1.5}}>Posiluješ doma s činkami. My pohlídáme postup i rovinu — ty jen makáš.</p>
            <div style={{marginTop:32,display:"flex",flexDirection:"column",gap:18}}>
              {points.map((p,i)=>(<div key={i} style={{display:"flex",gap:13,alignItems:"flex-start"}}>
                <div style={{flex:"0 0 auto",width:40,height:40,borderRadius:14,background:L.surface,border:`1px solid ${L.line2}`,display:"flex",alignItems:"center",justifyContent:"center"}}>{p.icon}</div>
                <div style={{flex:1}}><div style={{fontFamily:F.sans,fontWeight:600,fontSize:16}}>{p.t}</div><div style={{fontSize:14,color:L.ink2,marginTop:2,lineHeight:1.45}}>{p.d}</div></div>
              </div>))}
            </div>
          </div>
          <div style={{marginTop:"auto",paddingTop:40,paddingBottom:6}}>
            <button onClick={()=>setPhase("setup")} style={{...ctaDark,marginTop:0}}>Pojďme na to <ArrowRight size={19}/></button>
            <p style={{fontFamily:F.mono,fontSize:10,letterSpacing:".02em",color:L.ink3,textAlign:"center",marginTop:13,lineHeight:1.5}}>Žádný spam, žádné triky. Logování a progrese zdarma navždy.</p>
          </div>
        </div>
      </Shell>
    );
  }

  /* ════ SETUP ════ */
  if(phase==="setup"){
    const kroky=[1,1.25,2,2.5,5];
    const setGen=(patch)=>setSu((s)=>{const ns={...s,...patch};ns.weights=gen(ns.od,ns.krok,ns.do);return ns;});
    const removeW=(w)=>setSu((s)=>({...s,weights:s.weights.filter((x)=>x!==w)}));
    const addW=()=>{const v=parseFloat(custom.replace(",","."));if(!isNaN(v)&&v>0)setSu((s)=>({...s,weights:[...new Set([...s.weights,Math.round(v*100)/100])].sort((a,b)=>a-b)}));setCustom("");};
    const gsu = su.gear || DEFAULT_GEAR;
    const toggleGear=(k)=>setSu((s)=>({...s,gear:{...(s.gear||DEFAULT_GEAR),[k]:!(s.gear||DEFAULT_GEAR)[k]}}));
    const fitCount = PLAN.filter(e=>gearOK(e,gsu)).length;
    const showWDetail = !su.first || wDetail; /* první spuštění: detail vah sbalený, stačí preset */
    return(
      <Shell>
        {!su.first&&<div style={{marginBottom:6}}><button onClick={()=>setPhase("home")} aria-label="Zpět" style={{...ghost,color:L.ink,marginLeft:-8}}><ChevronLeft size={20}/></button></div>}
        <div style={{borderTop:`5px solid ${L.ink}`,paddingTop:18}}>
          <p style={kick}>Tvoje vybavení</p>
          <h1 style={h1}>Co máš<br/>doma?</h1>
          <p style={{fontSize:14,color:L.ink2,maxWidth:"42ch",margin:"14px 0 0",lineHeight:1.5}}>Vyber, s čím cvičíš. Plán i kouč se přizpůsobí — radíme <b>jen to, co reálně máš</b>.</p>
        </div>
        <div style={{marginTop:22,display:"flex",flexWrap:"wrap",gap:8}}>
          {GEAR_ITEMS.map(it=>{const on=!!gsu[it.k];return(
            <button key={it.k} onClick={()=>toggleGear(it.k)} aria-pressed={on} style={{display:"inline-flex",alignItems:"center",gap:7,padding:"10px 14px",borderRadius:999,cursor:"pointer",fontFamily:F.sans,fontWeight:600,fontSize:14,background:on?L.cream:L.surface,color:on?L.ink:L.ink2,border:`${on?2:1}px solid ${on?L.accent:L.line2}`,touchAction:"manipulation"}}>
              {on?<Check size={15} color={L.accentDeep}/>:<Plus size={15} color={L.ink3}/>}{it.label}
            </button>);})}
        </div>
        <p style={{fontFamily:F.mono,fontSize:12,letterSpacing:".01em",color:fitCount<3?L.accentDeep:L.ink2,marginTop:12,lineHeight:1.5}}>{fitCount>=3?`Sestavíme ${fitCount} cviků na míru tvému vybavení.`:`Přidej aspoň jednoručky nebo činku — teď by vyšly jen ${fitCount} cviky.`}</p>
        {gsu.db&&(<>
        <div style={{borderTop:`1px solid ${L.line}`,marginTop:24,paddingTop:18}}><h2 style={{fontFamily:F.mono,fontSize:12,letterSpacing:".14em",textTransform:"uppercase",color:L.ink2,fontWeight:500,margin:"0 0 3px"}}>Váhy jednoruček</h2><p style={{fontSize:14,color:L.ink3,margin:0,lineHeight:1.45}}>Zadej rozsah a skok — navyšujeme jen tyhle reálné váhy.</p></div>
        <div style={{marginTop:14,display:"flex",flexWrap:"wrap",gap:8}}>
          {[{l:"2–24 kg · po 2",od:2,krok:2,do:24},{l:"2–32 kg · po 2",od:2,krok:2,do:32},{l:"Pevný pár 2×8",od:8,krok:2,do:8},{l:"Pevný pár 2×10",od:10,krok:2,do:10}].map(p=>{const on=su.od===p.od&&su.krok===p.krok&&su.do===p.do;return(
            <button key={p.l} onClick={()=>setGen({od:p.od,krok:p.krok,do:p.do})} aria-pressed={on} style={{padding:"9px 13px",borderRadius:999,cursor:"pointer",fontFamily:F.mono,fontSize:12,fontWeight:600,...tnum,background:on?L.ink:L.surface,color:on?"#fff":L.ink2,border:`1px solid ${on?L.ink:L.line2}`,touchAction:"manipulation"}}>{p.l}</button>);})}
        </div>
        {!showWDetail&&(
          <div style={{marginTop:12,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,border:`1px solid ${L.line}`,background:L.surface,borderRadius:14,padding:"12px 14px"}}>
            <span style={{fontFamily:F.mono,fontSize:14,...tnum,color:L.ink}}>{su.weights.length} vah · {fmtKg(su.weights[0]||0)}–{fmtKg(su.weights[su.weights.length-1]||0)} kg</span>
            <button onClick={()=>setWDetail(true)} style={{background:"transparent",border:"none",color:L.accentDeep,fontFamily:F.mono,fontSize:12,letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer",padding:0}}>Upravit detailně</button>
          </div>
        )}
        {showWDetail&&(<>
        <div style={{marginTop:14,display:"flex",gap:10}}>
          {[["Nejlehčí","od"],["Nejtěžší","do"]].map(([lab,key])=>(
            <div key={key} style={{flex:1}}>
              <div style={fieldLabel}>{lab}</div>
              <div style={{display:"flex",alignItems:"center",border:`1px solid ${L.lineField}`,borderRadius:14,overflow:"hidden",background:L.surface}}>
                <button aria-label={`${lab} ubrat`} onClick={()=>setGen({[key]:Math.max(key==="od"?1:su.od, Math.round((su[key]-(key==="do"?su.krok:1))*100)/100)})} style={stBtn}><Minus size={17}/></button>
                <div style={{flex:1,textAlign:"center",fontFamily:F.mono,fontWeight:700,fontSize:19,...tnum,padding:"13px 0",borderLeft:`1px solid ${L.line}`,borderRight:`1px solid ${L.line}`}}>{fmtKg(su[key])}<span style={{fontSize:12,color:L.ink3}}> kg</span></div>
                <button aria-label={`${lab} přidat`} onClick={()=>setGen({[key]:Math.min(80, Math.round((su[key]+(key==="do"?su.krok:1))*100)/100)})} style={stBtn}><Plus size={17}/></button>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:16}}>
          <div style={fieldLabel}>Skok</div>
          <div style={{display:"flex",gap:6,border:`1px solid ${L.lineField}`,borderRadius:14,padding:4,background:L.surface}}>
            {kroky.map((v)=>{const on=su.krok===v;return <button key={v} onClick={()=>setGen({krok:v})} aria-pressed={on} style={{flex:1,fontFamily:F.mono,fontSize:14,fontWeight:700,...tnum,padding:"11px 0",borderRadius:14,cursor:"pointer",touchAction:"manipulation",background:on?L.ink:"transparent",color:on?"#fff":L.ink2,border:"none"}}>{fmtKg(v)}</button>;})}
          </div>
        </div>
        <div style={{marginTop:22}}>
          <div style={{...fieldLabel,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>Tvoje váhy · {su.weights.length}</span>
            <button onClick={()=>setEditList(v=>!v)} style={{background:"transparent",border:"none",color:L.accentDeep,fontFamily:F.mono,fontSize:12,letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer"}}>{editList?"hotovo":"upravit jednotlivě"}</button>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7,border:`1px solid ${L.line}`,background:L.surface,borderRadius:14,padding:13}}>
            {su.weights.map((w)=> editList ? (
              <button key={w} onClick={()=>removeW(w)} aria-label={`odebrat ${fmtKg(w)} kg`} style={{fontFamily:F.mono,fontSize:14,fontWeight:700,...tnum,padding:"7px 10px",borderRadius:14,border:`1px solid ${L.line2}`,background:L.bg,color:L.ink,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:5,touchAction:"manipulation"}}>{fmtKg(w)}<X size={11} color={L.ink3}/></button>
            ) : (
              <span key={w} style={{fontFamily:F.mono,fontSize:14,fontWeight:700,...tnum,padding:"7px 10px",borderRadius:14,background:L.bg,color:L.ink,border:`1px solid ${L.line}`}}>{fmtKg(w)}</span>
            ))}
          </div>
          {editList&&(
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <input value={custom} onChange={(e)=>setCustom(e.target.value)} inputMode="decimal" aria-label="přidat váhu" placeholder="např. 17,5" style={{flex:1,fontFamily:F.mono,fontSize:14,padding:"12px 13px",borderRadius:14,border:`1px solid ${L.lineField}`,background:L.surface,color:L.ink}}/>
              <button onClick={addW} style={{padding:"0 18px",borderRadius:14,border:`1px solid ${L.line2}`,background:L.surface,color:L.ink,fontFamily:F.sans,fontWeight:600,fontSize:14,cursor:"pointer"}}>Přidat</button>
            </div>
          )}
        </div>
        </>)}
        </>)}
        <div style={{borderTop:`1px solid ${L.line}`,marginTop:24,paddingTop:18}}>
          <h2 style={{fontFamily:F.mono,fontSize:12,letterSpacing:".14em",textTransform:"uppercase",color:L.ink2,fontWeight:500,margin:"0 0 3px"}}>Tvůj cíl</h2>
          <p style={{fontSize:14,color:L.ink3,margin:"0 0 12px",lineHeight:1.45}}>Naladí délku pauz mezi sériemi a rady kouče. Plán zůstává univerzální full-body.</p>
          <div role="radiogroup" aria-label="Tvůj cíl" style={{display:"flex",flexDirection:"column",gap:8}}>
            {GOALS.map(g=>{const on=(su.goal||"health")===g.k;return(
              <button key={g.k} role="radio" onClick={()=>setSu(s=>({...s,goal:g.k}))} aria-checked={on} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"13px 15px",borderRadius:14,cursor:"pointer",textAlign:"left",background:on?L.cream:L.surface,color:L.ink,border:`${on?2:1}px solid ${on?L.accent:L.line2}`,touchAction:"manipulation"}}>
                <span style={{display:"flex",flexDirection:"column"}}><span style={{fontFamily:F.sans,fontWeight:600,fontSize:16}}>{g.label}</span><span style={{fontFamily:F.mono,fontSize:12,color:L.ink3,marginTop:2}}>{g.sub}</span></span>
                <span style={{flex:"0 0 auto",width:22,height:22,borderRadius:"50%",border:`2px solid ${on?L.accent:L.line2}`,display:"flex",alignItems:"center",justifyContent:"center"}}>{on&&<span style={{width:10,height:10,borderRadius:"50%",background:L.accent}}/>}</span>
              </button>);})}
          </div>
        </div>
        <button onClick={()=>{const ws=su.weights.length?su.weights:gen(2,2,24);const ne={weights:ws,muted:equip.muted,gear:su.gear||DEFAULT_GEAR,goal:su.goal||"health"};setEquip(ne);saveJSON(EKEY,ne);setEditList(false);setPhase("home");toast("Uloženo");}} style={ctaDark}><Check size={19}/> Uložit a pokračovat</button>
        {!su.first&&(<div style={{marginTop:16}}>
          <div style={{fontFamily:F.mono,fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:L.ink3,marginBottom:9}}>Data</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={exportData} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"13px",borderRadius:14,border:`1px solid ${L.line2}`,background:L.surface,color:L.ink,fontFamily:F.sans,fontWeight:600,fontSize:14,cursor:"pointer"}}><Download size={16}/> Zálohovat</button>
            <button onClick={()=>fileRef.current&&fileRef.current.click()} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"13px",borderRadius:14,border:`1px solid ${L.line2}`,background:L.surface,color:L.ink,fontFamily:F.sans,fontWeight:600,fontSize:14,cursor:"pointer"}}><Upload size={16}/> Obnovit</button>
          </div>
          <input ref={fileRef} type="file" accept="application/json,.json" style={{display:"none"}} onChange={(ev)=>{const f=ev.target.files&&ev.target.files[0];importData(f);ev.target.value="";}}/>
          <p style={{fontFamily:F.mono,fontSize:10,color:L.ink3,marginTop:9,lineHeight:1.5}}>Záloha stáhne soubor se všemi tréninky i nastavením. Obnova ho načte zpět (přepíše aktuální data).</p>
        </div>)}
        {su.first&&<p style={{fontFamily:F.mono,fontSize:10,color:L.ink3,textAlign:"center",marginTop:12}}>Půjde kdykoli změnit přes ozubené kolo</p>}
      </Shell>
    );
  }

  /* ════ HOME ════ */
  if(phase==="home"){
    const last=progress._last; const lo=W[0], hi=W[W.length-1];
    const stuck=(()=>{ if(history.length<3)return null; for(const e of plan){ if(e.kind==="hold")continue; const s=history.filter(h=>h.ex&&h.ex[e.id]).slice(-3); if(s.length>=3&&s[2].e1<=s[0].e1+0.01)return e; } return null; })();
    const resCount=resumable?Object.values(resumable.logs||{}).filter(l=>l.sets?.some(s=>s.done)).length:0;
    return(
      <Shell>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <Wordmark/>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>{setCoachInput("");setPhase("coach");}} style={iconBtn} aria-label="Kouč"><MessageCircle size={18} color={L.ink}/></button>
            <button onClick={()=>{setFromSummary(false);setPhase("pokrok");}} style={iconBtn} aria-label="Pokrok"><TrendingUp size={18} color={L.ink}/></button>
            <button onClick={()=>{setSu({od:W[0],krok:Math.round(((W[1]??W[0]+2)-W[0])*100)/100||2,do:W[W.length-1],weights:[...W],gear:{...gear},goal:goal,first:false});setEditList(false);setPhase("setup");}} style={iconBtn} aria-label="Nastavení"><Settings size={18} color={L.ink}/></button>
          </div>
        </div>
        <div style={{borderTop:`5px solid ${L.ink}`,paddingTop:18}}>
          <p style={kick}>Doma · {gearLabel(gear)} · {goalDef(goal).label}</p>
          <h1 style={h1}>Celé tělo<br/>3× týdně</h1>
          <p style={{fontSize:14,color:L.ink2,maxWidth:"44ch",margin:"14px 0 0",lineHeight:1.5}}>Jdi cvičit, sérii zapiš ťuknutím. Váhy se ukládají a po splnění se ti samy navýší.</p>
        </div>
        {last&&<button onClick={()=>{setFromSummary(false);setPhase("pokrok");}} style={{marginTop:18,display:"inline-flex",alignItems:"center",gap:8,fontFamily:F.mono,fontSize:12,letterSpacing:".08em",color:L.ink2,background:L.surface,border:`1px solid ${L.line}`,borderRadius:18,padding:"7px 13px",cursor:"pointer"}}><TrendingUp size={13} color={L.accentDeep}/> Historie · naposledy {relDate(last.date)} <ArrowRight size={12} color={L.ink3}/></button>}
        {stuck&&(<button type="button" onClick={()=>{setCoachInput(`Zasekl jsem se na cviku ${stuck.name} — pořád stejná váha. Co s tím?`);setPhase("coach");}} style={{marginTop:14,width:"100%",textAlign:"left",font:"inherit",display:"flex",alignItems:"center",gap:11,background:L.cream,border:`1px solid ${L.accent}`,borderRadius:14,padding:"12px 14px",cursor:"pointer"}}>
          <div style={{flex:"0 0 auto",width:34,height:34,borderRadius:"50%",background:L.ink,display:"flex",alignItems:"center",justifyContent:"center"}}><MessageCircle size={16} color={L.accent}/></div>
          <div style={{flex:1,minWidth:0}}><div style={{fontFamily:F.sans,fontWeight:600,fontSize:14}}>Zasekl ses na {stuck.name}</div><div style={{fontSize:14,color:L.ink2,marginTop:1}}>Zeptej se kouče, proč a co s tím.</div></div>
          <ArrowRight size={16} color={L.accentDeep}/>
        </button>)}
        <div style={{marginTop:22,display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:9}}>
          <span style={{fontFamily:F.mono,fontSize:12,letterSpacing:".14em",textTransform:"uppercase",color:L.ink2,fontWeight:500}}>Tvůj příští trénink</span>
          <span style={{fontFamily:F.mono,fontSize:10,color:L.ink3}}>činka {fmtKg(lo)}–{fmtKg(hi)} kg</span>
        </div>
        {(()=>{const changed=plan.filter(e=>progress[e.id]?.bump);return changed.length>0?(<div style={{marginBottom:10,display:"flex",alignItems:"flex-start",gap:9,background:L.cream,border:`1px solid ${L.line2}`,borderRadius:14,padding:"11px 13px"}}><ArrowUp size={15} color={L.accentDeep} style={{flex:"0 0 auto",marginTop:1}}/><div style={{fontSize:14,color:L.ink,lineHeight:1.45}}><b>Od minule navýšeno:</b> {changed.map(e=>`${e.name.split(" ")[0]} ${fmtKg(nearestW(progress[e.id].weights[0]))} kg`).join(" · ")}</div></div>):null;})()}
        {(()=>{
          const Row=(e,j)=>{const sv=progress[e.id];const w=nearestW(sv?.weights?.[0]??e.startWeight);const bumped=sv?.bump;const n=j+1;return(
            <div key={e.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderTop:j?`1px solid ${L.line}`:"none"}}>
              <Disc>{n}</Disc>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:F.sans,fontWeight:600,fontSize:16,lineHeight:1.1}}>{e.name}</div>
                <div style={{fontFamily:F.mono,fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:L.ink3,marginTop:3}}>{e.muscles}</div>{lightDropIds.has(e.id)&&<div style={{fontFamily:F.mono,fontSize:10,letterSpacing:".02em",color:L.ink2,marginTop:3}}>není v lehčím tréninku</div>}
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:F.mono,fontSize:14,fontWeight:700,color:bumped?L.accentDeep:L.ink,...tnum}}>{e.kind==="hold"?`${e.holdMin}–${e.holdMax}s`:`${fmtKg(w)} kg`}</div>
                {bumped?(<div style={{fontFamily:F.mono,fontSize:10,fontWeight:600,color:L.accentDeep,marginTop:1,display:"inline-flex",alignItems:"center",gap:2,justifyContent:"flex-end",...tnum}}><ArrowUp size={11} color={L.accentDeep}/>z {fmtKg(bumped.from)} kg</div>):(<div style={{fontFamily:F.mono,fontSize:10,color:L.ink3,marginTop:1}}>{e.kind==="hold"?"3 série":`${e.unit} · 3×${e.reps}`}</div>)}
              </div>
            </div>);};
          return <div style={{border:`1px solid ${L.line}`,background:L.surface,borderRadius:14,overflow:"hidden"}}>{plan.map((e,j)=>Row(e,j))}</div>;
        })()}
        {resumable ? (
          confirmNew ? (
            <div style={{marginTop:22,border:`1px solid ${L.line2}`,background:L.surface,borderRadius:14,padding:"16px"}}>
              <div style={{fontSize:14,color:L.ink,lineHeight:1.5,marginBottom:12}}>Smazat rozdělaný trénink a začít znovu? Postup se ztratí.</div>
              <div style={{display:"flex",gap:9}}>
                <button onClick={()=>{setConfirmNew(false);start(false);}} style={{flex:1,background:L.ink,color:"#fff",fontFamily:F.sans,fontWeight:600,fontSize:14,border:"none",borderRadius:14,padding:"13px",cursor:"pointer"}}>Ano, nový</button>
                <button onClick={()=>setConfirmNew(false)} style={{flex:1,background:"transparent",border:`1px solid ${L.line2}`,color:L.ink2,fontFamily:F.sans,fontWeight:600,fontSize:14,borderRadius:14,padding:"13px",cursor:"pointer"}}>Zpět</button>
              </div>
            </div>
          ) : (
          <>
            <button onClick={resume} style={{...ctaDark,background:L.green,color:"#0C0C0B"}}><Play size={19}/> Pokračovat · cvik {(resumable.idx||0)+1}/{Object.keys(resumable.logs||{}).length}</button>
            <button onClick={()=>setConfirmNew(true)} style={{width:"100%",marginTop:10,background:"transparent",border:`1px solid ${L.line2}`,color:L.ink2,fontFamily:F.sans,fontWeight:600,fontSize:14,borderRadius:14,padding:"13px",cursor:"pointer"}}>Začít nový trénink</button>
          </>
          )
        ) : (
          <>
            <button onClick={()=>start(false)} style={ctaDark}><Dumbbell size={20}/> Jdu cvičit</button>
            <button onClick={()=>start(true)} style={{width:"100%",marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"transparent",border:`1px solid ${L.line2}`,color:L.ink2,fontFamily:F.sans,fontWeight:600,fontSize:14,borderRadius:14,padding:"13px",cursor:"pointer"}}><Feather size={16} color={L.accentDeep}/> Lehčí trénink</button>
            <p style={{textAlign:"center",fontFamily:F.mono,fontSize:10,color:L.ink3,margin:"9px 0 0",letterSpacing:".02em",lineHeight:1.5}}>kratší výběr, o stupeň lehčí — pracovní váhy ani postup se nemění</p>
          </>
        )}
        {toastMsg&&<div role="status" style={{position:"fixed",left:"50%",bottom:24,transform:"translateX(-50%)",zIndex:50,background:L.ink,color:"#fff",fontFamily:F.sans,fontWeight:600,fontSize:14,padding:"11px 18px",borderRadius:999,boxShadow:"0 10px 34px -8px rgb(10 10 10 / .55)",display:"inline-flex",alignItems:"center",gap:8,maxWidth:"calc(100% - 44px)"}}><Check size={15} color={L.accent}/>{toastMsg}</div>}
      </Shell>
    );
  }

  /* ════ SUMMARY ════ */
  if(phase==="summary"){
    let volume=0,setsDone=0;const bumps=[],skipped=[],capped=[];
    plan.forEach((e)=>{const l=logs[e.id];if(!l)return;if(l.status==="skipped"){skipped.push(e.name);return;}
      if(e.kind==="hold"){setsDone+=l.sets.filter(s=>s.done).length;return;}
      l.sets.forEach(s=>{if(s.done){setsDone++;volume+=s.reps*s.weight;}});
      const sv=progress[e.id];
      if(sv&&sv.bump){bumps.push({name:e.name,from:sv.bump.from,to:sv.bump.to});}
      else{const allTarget=l.sets.every(s=>s.done)&&l.sets.every(s=>s.reps>=e.reps);if(allTarget&&nextUp(l.sets[0]?.weight??e.startWeight)===null)capped.push(e.name);}});
    const pjEx=plan.find(e=>e.id==="bench")||plan.find(e=>e.kind==="main");
    const pjCur=nearestW(progress[pjEx.id]?.weights?.[0]??pjEx.startWeight);
    let pjW=pjCur; for(let i=0;i<3;i++){const u=nextUp(pjW);if(u!=null)pjW=u;}
    const showProj=history.length<=3&&pjW>pjCur;
    return(
      <Shell>
        <div style={{marginBottom:18}}><Wordmark sub={false}/></div>
        <div style={{borderTop:`5px solid ${L.ink}`,paddingTop:18}}><p style={kick}>Trénink hotový</p><h1 style={{...h1,fontSize:"clamp(32px,9vw,52px)"}}>Dobrá práce</h1></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:22}}>
          <Stat label="Čas" value={fmtDur(elapsed)}/><Stat label="Objem" value={<CountUp value={volume}/>} unit="kg"/><Stat label="Série" value={String(setsDone)}/>
        </div>
        {easy&&(<div style={{marginTop:14,display:"flex",alignItems:"center",gap:9,border:`1px solid ${L.line2}`,background:L.surface,borderRadius:14,padding:"14px 16px"}}><Feather size={16} color={L.accentDeep} style={{flex:"0 0 auto"}}/><span style={{fontSize:14,color:L.ink2,lineHeight:1.45}}>Lehčí trénink — kratší výběr, o stupeň lehčí. Tvoje <b style={{color:L.ink}}>pracovní váhy zůstávají</b> a postup se neřeší; příští plný trénink jede od nich.</span></div>)}
        {bumps.length>0&&(
          <div style={{marginTop:14,border:`2px solid ${L.accent}`,background:L.cream,borderRadius:14,padding:"16px"}}>
            <h3 style={h3}><Trophy size={16} color={L.accentDeep}/> Navýšeno pro příště</h3>
            {bumps.map((g)=>(<div key={g.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderTop:`1px solid ${L.line}`,fontSize:14}}><span>{g.name}</span><span style={{fontFamily:F.mono,fontWeight:700,...tnum}}><span style={{color:L.ink3}}>{fmtKg(g.from)}</span> <ArrowUp size={12} color={L.accentDeep} style={{verticalAlign:"middle"}}/> <span style={{color:L.accentDeep}}>{fmtKg(g.to)} kg</span></span></div>))}
            <p style={{fontSize:14,color:L.ink2,margin:"11px 0 0",lineHeight:1.45}}>Dal jsi 12 ve všech sériích, tak ti to příště začne na vyšší váze. <b>Cíl zůstává 12, nemusíš nic dělat.</b></p>
          </div>
        )}
        {capped.length>0&&(<div style={{marginTop:14,border:`1px solid ${L.line2}`,background:L.surface,borderRadius:14,padding:"16px"}}><h3 style={h3}><span aria-hidden="true">🏔️</span> Na stropě činek</h3><p style={{fontSize:14,color:L.ink2,margin:0,lineHeight:1.5}}>U <b>{capped.join(", ")}</b> jsi na nejtěžší čince, co máš. Místo váhy přidávej opakování nad 12, zpomal spouštění (3–4 s dolů) nebo přidej sérii.</p></div>)}
        {skipped.length>0&&(<div style={{marginTop:14,border:`1px solid ${L.line}`,background:L.surface,borderRadius:14,padding:"16px"}}><h3 style={h3}><SkipForward size={15} color={L.ink3}/> Přeskočeno</h3><div style={{fontSize:14,color:L.ink2}}>{skipped.join(" · ")}</div></div>)}
        {bumps[0]&&(<div style={{marginTop:14,border:`1px solid ${L.line2}`,background:L.ink,color:"#fff",borderRadius:14,padding:"16px"}}>
          <div style={{fontFamily:F.mono,fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(255,255,255,.55)",marginBottom:6}}>Příště tě čeká</div>
          <div style={{fontFamily:F.sans,fontWeight:600,fontSize:19,letterSpacing:"-.02em"}}>{bumps[0].name} · <span style={{color:L.accent,...tnum}}>{fmtKg(bumps[0].to)} kg</span></div>
          <div style={{fontSize:14,color:"rgba(255,255,255,.7)",marginTop:4}}>Máš na to. Příště to potvrdíš.</div>
        </div>)}
        {showProj&&(<div style={{marginTop:14,border:`1px solid ${L.line2}`,background:L.cream,borderRadius:14,padding:"16px"}}>
          <div style={{fontFamily:F.mono,fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:L.accentDeep,marginBottom:6}}>Kam tě to může dovést</div>
          <div style={{fontSize:14,color:L.ink,lineHeight:1.5}}>Když přijdeš <b>2× týdně</b>, za 8 týdnů můžeš dát <b>{pjEx.name.split(" ")[0]}</b> kolem <b style={{color:L.accentDeep,...tnum}}>{fmtKg(pjW)} kg</b>.</div>
        </div>)}
        <button onClick={()=>{const exc=plan.filter(e=>{const l=logs[e.id];return l&&l.status!=="skipped"&&l.sets&&l.sets.some(s=>s.done);}).length; doShare({type:"workout",kicker:"Trénink hotový",volume:volume.toLocaleString("cs"),time:fmtDur(elapsed),exercises:String(exc),highlights:bumps.map(b=>`${b.name.split(" ")[0]}  ${fmtKg(b.from)} \u2192 ${fmtKg(b.to)} kg`),foot:new Date().toLocaleDateString("cs")},"strictic-trenink.png");}} style={{marginTop:16,width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:9,background:L.cream,border:`1.5px solid ${L.accent}`,color:L.ink,fontFamily:F.sans,fontWeight:700,fontSize:16,borderRadius:14,padding:"14px",cursor:"pointer"}}><Share2 size={18} color={L.accentDeep}/> Sdílet trénink</button>
        <button onClick={()=>{setCoachInput("");setPhase("coach");}} style={{marginTop:14,width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"transparent",border:`1px solid ${L.line2}`,color:L.ink,fontFamily:F.sans,fontWeight:600,fontSize:14,borderRadius:14,padding:"13px",cursor:"pointer"}}><MessageCircle size={16} color={L.accentDeep}/> Probrat trénink s koučem</button>
        <button onClick={()=>{setFromSummary(true);setPhase("pokrok");}} style={ctaDark}><TrendingUp size={19}/> Zobrazit pokrok</button>
        <button onClick={()=>setPhase("home")} style={{width:"100%",marginTop:10,background:"transparent",border:`1px solid ${L.line2}`,color:L.ink2,fontFamily:F.sans,fontWeight:600,fontSize:14,borderRadius:14,padding:"13px",cursor:"pointer"}}>Zpátky na plán</button>
        {shareModal}
      </Shell>
    );
  }

  /* ════ POKROK (progress) ════ */
  if(phase==="pokrok"){
    const secLabel={fontFamily:F.mono,fontSize:12,letterSpacing:".14em",textTransform:"uppercase",color:L.ink2,fontWeight:500};
    if(history.length<1){return(
      <div style={{minHeight:"100vh",background:L.bg,color:L.ink,fontFamily:F.sans,WebkitFontSmoothing:"antialiased"}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          <div style={{position:"sticky",top:0,zIndex:5,background:L.bg,borderBottom:`1px solid ${L.line}`,padding:"14px 22px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={()=>setPhase(fromSummary?"summary":"home")} aria-label="Zpět" style={{...ghost,color:L.ink}}><ChevronLeft size={20}/></button>
            <h1 style={{fontFamily:F.mono,fontSize:12,letterSpacing:".14em",textTransform:"uppercase",color:L.ink2,margin:0}}>Tvůj pokrok</h1>
            <button onClick={()=>setPhase("home")} aria-label="Domů" style={{...ghost,color:L.ink2}}><Home size={18}/></button>
          </div>
          <div role="main" style={{padding:"22px 22px 60px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",minHeight:"58vh",justifyContent:"center"}}>
            <div style={{width:56,height:56,borderRadius:14,background:L.surface,border:`1px solid ${L.line2}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:18}}><TrendingUp size={26} color={L.accentDeep}/></div>
            <h2 style={{fontFamily:F.sans,fontWeight:600,fontSize:24,letterSpacing:"-.02em",margin:0}}>Zatím tu nic není</h2>
            <p style={{fontSize:14,color:L.ink2,maxWidth:"34ch",margin:"10px 0 0",lineHeight:1.5}}>Odcvič první trénink a uvidíš přesně, o kolik jsi zesílil. Žádná vymyšlená čísla — jen tvoje.</p>
            <button onClick={()=>setPhase("home")} style={{...ctaDark,maxWidth:280}}><Dumbbell size={19}/> Zpátky na plán</button>
          </div>
        </div>
      </div>
    );}
    const hist=history;
    const exData=plan.filter(e=>e.kind!=="hold").map(e=>{
      const series=hist.filter(s=>s.ex&&s.ex[e.id]).map(s=>({date:s.date,...s.ex[e.id]}));
      if(series.length<1)return null; const first=series[0],lastp=series[series.length-1];
      const deltaPct=first.e1>0?Math.round((lastp.e1/first.e1-1)*100):0;
      const wDelta=first.w>0?Math.round((lastp.w/first.w-1)*100):0;
      return {id:e.id,name:e.name,first,last:lastp,series,deltaPct,wDelta};
    }).filter(Boolean).sort((a,b)=>b.wDelta-a.wDelta||b.deltaPct-a.deltaPct);
    const volSeries=hist.map(s=>s.volume);
    const totalVol=hist.reduce((a,s)=>a+(s.volume||0),0);
    const weeksSpan=hist.length>1?Math.max(1,Math.round((hist[hist.length-1].date-hist[0].date)/(7*86400000))):0;
    const last30=hist.filter(s=>s.date>Date.now()-30*86400000).length;
    const weekDots=arr(10,(k)=>{const end=Date.now()-(9-k)*7*86400000;return hist.some(s=>s.date>end-7*86400000&&s.date<=end);});
    const lastGapDays=hist.length?Math.floor((Date.now()-hist[hist.length-1].date)/86400000):99;
    const consMsg=lastGapDays>12?"Chvíli jsi nebyl — život se stane, jedem dál.":last30>=8?"Skvělý rytmus. Tohle dělá výsledky.":last30>=4?"Solidní pravidelnost, drž to.":"Začínáš — klíč je se vracet.";
    const shareEx=(d)=>{ doShare({type:"exercise",kicker:"Můj pokrok",name:d.name,fromW:fmtKg(d.first.w),toW:fmtKg(d.last.w),reps:d.last.r,deltaPct:d.wDelta,count:d.series.length,spark:d.series.map(p=>p.w),foot:new Date().toLocaleDateString("cs")},"strictic-cvik.png"); };
    return(
      <div style={{minHeight:"100vh",background:L.bg,color:L.ink,fontFamily:F.sans,WebkitFontSmoothing:"antialiased"}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          <div style={{position:"sticky",top:0,zIndex:5,background:L.bg,borderBottom:`1px solid ${L.line}`,padding:"14px 22px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={()=>setPhase(fromSummary?"summary":"home")} aria-label="Zpět" style={{...ghost,color:L.ink}}><ChevronLeft size={20}/></button>
            <h1 style={{fontFamily:F.mono,fontSize:12,letterSpacing:".14em",textTransform:"uppercase",color:L.ink2,margin:0}}>Tvůj pokrok{weeksSpan?` · ${weeksSpan} týdnů`:""}</h1>
            <button onClick={()=>setPhase("home")} aria-label="Domů" style={{...ghost,color:L.ink2}}><Home size={18}/></button>
          </div>
          <div role="main" style={{padding:"22px 22px 60px"}}>
            {hist.length<3&&(<div style={{marginBottom:18,padding:"12px 14px",background:L.surface,border:`1px solid ${L.line}`,borderRadius:14,fontSize:14,color:L.ink2,lineHeight:1.5}}>Teprve začínáš — po pár trénincích tu u každého cviku uvidíš, jak ti roste váha.</div>)}

            {exData.length>0&&(()=>{
              const i=Math.min(progIdx,exData.length-1);
              const page=(dir)=>{ const el=heroTrackRef.current; if(!el)return; const w=el.clientWidth||1; const cur=Math.round(el.scrollLeft/w); el.scrollTo({left:Math.max(0,Math.min(exData.length-1,cur+dir))*w,behavior:"smooth"}); };
              const goDot=(j)=>{ const el=heroTrackRef.current; if(!el)return; el.scrollTo({left:j*(el.clientWidth||1),behavior:"smooth"}); };
              const arrowBtn={width:32,height:32,borderRadius:999,border:`1px solid ${L.line2}`,background:L.surface,color:L.ink,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flex:"0 0 auto",touchAction:"manipulation"};
              return (
              <section aria-roledescription="carousel" aria-label="Pokrok po cvicích">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"0 2px 10px"}}>
                  <h2 style={{...secLabel,margin:0}}>Pokrok po cvicích</h2>
                  <span style={{fontFamily:F.mono,fontSize:12,color:L.ink3,...tnum}}>{i+1}/{exData.length}</span>
                </div>
                <div style={{display:"flex",alignItems:"stretch",gap:8}}>
                  <div ref={heroTrackRef} className="hcar" onScroll={(e)=>{const el=e.currentTarget; if(scrollRaf.current)return; scrollRaf.current=requestAnimationFrame(()=>{scrollRaf.current=0; const w=el.clientWidth||1; const j=Math.max(0,Math.min(exData.length-1,Math.round(el.scrollLeft/w))); setProgIdx(p=>p!==j?j:p);});}}
                    style={{flex:1,minWidth:0,display:"flex",overflowX:exData.length>1?"auto":"hidden",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",borderRadius:18}}>
                    {exData.map((x,xi)=>{const xstart=x.series.length===1,xup=x.wDelta>0,xdn=x.wDelta<0;return(
                    <div key={x.id} style={{flex:"0 0 100%",scrollSnapAlign:"center",boxSizing:"border-box"}}>
                     <div style={{border:`1px solid ${L.line2}`,background:L.surface,borderRadius:18,padding:"18px 18px 16px",boxShadow:"0 1px 2px rgba(10,10,10,.04),0 20px 44px -24px rgba(10,10,10,.18)"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                        <span style={{fontFamily:F.mono,fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:xi===0&&xup?L.accentDeep:L.ink3,fontWeight:600}}>{xi===0&&xup?"Tvůj největší pokrok":xstart?"Startovní čára":xup?"Zesílil jsi":xdn?"Tentokrát níž":"Držíš se"}</span>
                        <span style={{fontFamily:F.mono,fontSize:12,fontWeight:700,...tnum,color:xup?L.accentDeep:L.ink3}}>{xstart?"1. záznam":xup?`+${x.wDelta} %`:xdn?`${x.wDelta} %`:"beze změny"}</span>
                      </div>
                      <div style={{fontFamily:F.sans,fontWeight:600,fontSize:19,letterSpacing:"-.02em",marginTop:9,lineHeight:1.15}}>{x.name}</div>
                      <div style={{display:"flex",alignItems:"baseline",gap:10,marginTop:13,flexWrap:"wrap"}}>
                        {!xstart&&<span style={{fontFamily:F.sans,fontWeight:500,fontSize:19,...tnum,color:L.ink3}}>{fmtKg(x.first.w)} kg</span>}
                        {!xstart&&<ArrowRight size={16} color={xup?L.accent:L.ink3}/>}
                        <span style={{fontFamily:F.sans,fontWeight:700,fontSize:30,letterSpacing:"-.02em",...tnum,color:xup?L.accent:L.ink,lineHeight:1}}>{fmtKg(x.last.w)} kg</span>
                        <span style={{fontFamily:F.mono,fontSize:12,...tnum,color:L.ink3}}>× {x.last.r} opak.</span>
                      </div>
                      <div style={{fontFamily:F.mono,fontSize:12,...tnum,color:L.ink3,marginTop:7}}>pracovní váha na sérii{x.series.length>=2?` · odhad síly ${fmtKg(x.first.e1)} → ${fmtKg(x.last.e1)} kg`:""}</div>
                      <div style={{marginTop:14}}><BigChart data={x.series.map(p=>p.w)} h={88} format={(v)=>`${fmtKg(v)} kg`} labels={x.series.map(p=>dShort(p.date))}/></div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:13,paddingTop:13,borderTop:`1px solid ${L.line}`}}>
                        <span style={{fontFamily:F.mono,fontSize:10,...tnum,color:L.ink3}}>{x.series.length} {x.series.length===1?"trénink":x.series.length<=4?"tréninky":"tréninků"}</span>
                        <button onClick={()=>shareEx(x)} style={{display:"inline-flex",alignItems:"center",gap:7,background:L.ink,color:"#fff",fontFamily:F.sans,fontWeight:600,fontSize:14,border:"none",borderRadius:14,padding:"9px 14px",cursor:"pointer",touchAction:"manipulation"}}><Share2 size={14}/> Sdílet tenhle cvik</button>
                      </div>
                     </div>
                    </div>);})}
                  </div>
                </div>
                {exData.length>1&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginTop:14}}>
                  <button onClick={()=>page(-1)} aria-label="Předchozí cvik" style={arrowBtn}><ChevronLeft size={17}/></button>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {exData.map((_,j)=><button key={j} onClick={()=>goDot(j)} aria-label={`Cvik ${j+1}`} aria-current={j===i} style={{width:j===i?18:7,height:7,borderRadius:999,border:"none",padding:0,cursor:"pointer",background:j===i?L.accent:L.line2,transition:"width .18s ease",touchAction:"manipulation"}}/>)}
                  </div>
                  <button onClick={()=>page(1)} aria-label="Další cvik" style={arrowBtn}><ChevronRight size={17}/></button>
                </div>}
              </section>);
            })()}

            <div style={{marginTop:22}}>
              <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:12}}>
                <h2 style={{...secLabel,margin:0}}>Objem za trénink</h2><span style={{fontFamily:F.mono,fontSize:12,color:L.ink3}}>{hist.length} tréninků</span>
              </div>
              <div style={{border:`1px solid ${L.line}`,background:L.surface,borderRadius:14,padding:"16px 16px 12px"}}>
                <div style={{fontFamily:F.sans,fontWeight:600,fontSize:24,...tnum,letterSpacing:"-.02em"}}><CountUp value={totalVol} format={fmtVol}/> <span style={{fontSize:12,color:L.ink3,fontWeight:400}}>zvednuto celkem</span></div>
                <div style={{marginTop:14}}><BigChart data={volSeries} h={96} color={L.ink} insideTextColor="#fff" format={fmtVol} labels={hist.map(s=>dShort(s.date))}/></div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontFamily:F.mono,fontSize:10,color:L.ink3}}><span>{dShort(hist[Math.max(0,hist.length-14)].date)}</span><span>{dShort(hist[hist.length-1].date)}</span></div>
              </div>
            </div>


            <div style={{marginTop:24}}>
              <h2 style={{...secLabel,margin:0}}>Pravidelnost</h2>
              <div style={{marginTop:12,border:`1px solid ${L.line}`,background:L.surface,borderRadius:14,padding:"16px"}}>
                <div style={{fontFamily:F.sans,fontWeight:600,fontSize:24,...tnum,letterSpacing:"-.02em"}}>{last30} <span style={{fontSize:14,color:L.ink3,fontWeight:400}}>tréninků za 30 dní</span></div>
                <div style={{display:"flex",gap:6,marginTop:14,alignItems:"center"}}>
                  {weekDots.map((on,i)=>(<div key={i} style={{flex:1,height:8,borderRadius:6,background:on?L.accent:"#8B8B85"}}/>))}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:7,fontFamily:F.mono,fontSize:10,color:L.ink3}}><span>před 10 týdny</span><span>teď</span></div>
                <p style={{fontSize:14,color:L.ink2,margin:"13px 0 0",lineHeight:1.5}}>{consMsg}</p>
              </div>
            </div>

            <div style={{marginTop:24}}>
              <h2 style={{...secLabel,margin:0}}>Historie tréninků · {hist.length}</h2>
              <div style={{marginTop:12,border:`1px solid ${L.line}`,background:L.surface,borderRadius:14,overflow:"hidden"}}>
                {[...hist].slice(-30).reverse().map((s,i)=>(
                  <div key={s.date||i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 8px 10px 14px",borderTop:i?`1px solid ${L.line}`:"none"}}>
                    <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
                      <span style={{fontFamily:F.sans,fontWeight:500,fontSize:14,display:"inline-flex",alignItems:"center",gap:6}}>{relDate(s.date)}{s.easy&&<span style={{fontFamily:F.mono,fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:L.accentDeep,background:L.cream,border:`1px solid ${L.accent}`,borderRadius:6,padding:"2px 6px"}}>lehčí</span>}</span>
                      <span style={{fontFamily:F.mono,fontSize:12,...tnum,color:L.ink3,marginTop:2}}>{Object.keys(s.ex||{}).length} cviků · {s.volume.toLocaleString("cs")} kg{s.dur?` · ${fmtDur(s.dur)}`:""}</span>
                    </div>
                    <button onClick={()=>setConfirm({title:"Smazat tento trénink?",body:`Záznam z ${relDate(s.date)} (${s.volume.toLocaleString("cs")} kg) se odstraní z historie i z grafů. Akci nelze vrátit.`,confirmLabel:"Smazat",onYes:()=>deleteSession(s)})} aria-label={`Smazat trénink ${relDate(s.date)}`} style={{flex:"0 0 auto",width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:14,background:"transparent",border:"none",color:L.ink3,cursor:"pointer",touchAction:"manipulation"}}><X size={16}/></button>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={()=>setPhase("home")} style={{...ctaDark,marginTop:26}}><Home size={18}/> Zpátky na plán</button>
            {confirmModal}{shareModal}
          </div>
        </div>
      </div>
    );
  }

  /* ════ COACH (AI chat) ════ */
  if(phase==="coach"){
    const sugg=["Zasekl jsem se, co s tím?","Jak jíst pro růst svalů?","Stačí mi 3× týdně?","Bolí mě rameno u tlaku"];
    const send=()=>askCoach(coachInput);
    return(
      <div style={{minHeight:"100vh",background:L.bg,color:L.ink,fontFamily:F.sans,display:"flex",flexDirection:"column",WebkitFontSmoothing:"antialiased"}}>
        <div style={{maxWidth:480,margin:"0 auto",width:"100%",flex:1,display:"flex",flexDirection:"column"}}>
          <div style={{position:"sticky",top:0,zIndex:5,background:L.bg,borderBottom:`1px solid ${L.line}`,padding:"13px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={()=>setPhase("home")} aria-label="Zpět" style={{...ghost,color:L.ink}}><ChevronLeft size={20}/></button>
            <div style={{display:"flex",alignItems:"center",gap:8}}><MessageCircle size={16} color={L.accent}/><h1 style={{fontFamily:F.sans,fontWeight:600,fontSize:16,margin:0}}>Kouč</h1></div>
            <span style={{fontFamily:F.mono,fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:plus?L.accentDeep:L.ink3}}>{plus?"Plus":`${Math.max(0,coachFree)} zdarma`}</span>
          </div>
          <div role="main" style={{flex:1,overflowY:"auto",padding:"18px"}}>
            {coachMsgs.length===0&&(
              <div>
                <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:16}}>
                  <div style={{flex:"0 0 auto",width:30,height:30,borderRadius:"50%",background:L.ink,display:"flex",alignItems:"center",justifyContent:"center"}}><Sparkles size={15} color={L.accent}/></div>
                  <div style={{background:L.surface,border:`1px solid ${L.line}`,borderRadius:"4px 14px 14px 14px",padding:"12px 14px",fontSize:14,lineHeight:1.5,color:L.ink}}>Jsem tvůj kouč. Ptej se narovinu — proč se ti něco nedaří, jak jíst, jak často. Odpovím bez keců.</div>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {sugg.map(q=>(<button key={q} onClick={()=>setCoachInput(q)} style={{fontFamily:F.sans,fontSize:14,color:L.ink2,background:L.surface,border:`1px solid ${L.line2}`,borderRadius:18,padding:"8px 13px",cursor:"pointer"}}>{q}</button>))}
                </div>
              </div>
            )}
            <div role="log" aria-live="polite" style={{display:"flex",flexDirection:"column",gap:12}}>
              {coachMsgs.map((m,i)=> m.role==="user" ? (
                <div key={i} style={{alignSelf:"flex-end",maxWidth:"82%",background:L.ink,color:"#fff",borderRadius:"14px 14px 4px 14px",padding:"12px 14px",fontSize:14,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{m.content}</div>
              ) : (
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",maxWidth:"92%"}}>
                  <div style={{flex:"0 0 auto",width:30,height:30,borderRadius:"50%",background:L.ink,display:"flex",alignItems:"center",justifyContent:"center",marginTop:1}}><Sparkles size={15} color={L.accent}/></div>
                  <div style={{background:L.surface,border:`1px solid ${L.line}`,borderRadius:"4px 14px 14px 14px",padding:"12px 14px",fontSize:14,lineHeight:1.55,color:L.ink,whiteSpace:"pre-wrap"}}>{m.content}</div>
                </div>
              ))}
              {coachLoading&&(<div style={{display:"flex",gap:10,alignItems:"center"}}><div style={{flex:"0 0 auto",width:30,height:30,borderRadius:"50%",background:L.ink,display:"flex",alignItems:"center",justifyContent:"center"}}><Sparkles size={15} color={L.accent}/></div><span style={{fontFamily:F.mono,fontSize:12,color:L.ink3}}>kouč píše…</span></div>)}
            </div>
          </div>
          {!plus&&coachFree<=0 ? (
            <div style={{padding:"14px 18px",borderTop:`1px solid ${L.line}`,background:L.cream}}>
              <div style={{fontSize:14,color:L.ink,marginBottom:10,lineHeight:1.5}}>Bezplatné zprávy došly. Zbytek appky zůstává zdarma — neomezený kouč je ve <b>Plus</b>.</div>
              <button onClick={()=>setPhase("paywall")} style={{...ctaDark,marginTop:0}}><Sparkles size={18}/> Odemknout Plus</button>
            </div>
          ) : (
            <div style={{padding:"12px 14px",borderTop:`1px solid ${L.line}`,background:L.bg,display:"flex",gap:9,alignItems:"flex-end"}}>
              <textarea value={coachInput} aria-label="Dotaz na kouče" onChange={e=>setCoachInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} rows={1} placeholder="Napiš dotaz…" style={{flex:1,resize:"none",fontFamily:F.sans,fontSize:16,lineHeight:1.4,padding:"12px 14px",borderRadius:14,border:`1px solid ${L.lineField}`,background:L.surface,color:L.ink,maxHeight:120}}/>
              <button onClick={send} disabled={coachLoading||!coachInput.trim()} aria-label="Odeslat" style={{flex:"0 0 auto",width:48,height:48,borderRadius:14,border:"none",background:coachInput.trim()?L.accent:L.line2,color:coachInput.trim()?"#0C0C0B":L.ink3,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><Send size={18}/></button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ════ PAYWALL (honest) ════ */
  if(phase==="paywall"){
    const freeList=["Logování tréninku","Automatická progrese vah","Celý Progress a historie","Všechno ostatní v appce"];
    const plusList=["Neomezené konverzace s koučem","Rada přesně ve chvíli, kdy se zasekneš","Tipy a úpravy plánu na míru tobě"];
    return(
      <Shell>
        <div style={{display:"flex",alignItems:"center",marginBottom:14}}>
          <button onClick={()=>setPhase("coach")} aria-label="Zpět" style={{...ghost,color:L.ink,marginLeft:-8}}><ChevronLeft size={20}/></button>
        </div>
        <div style={{borderTop:`5px solid ${L.accent}`,paddingTop:18}}>
          <p style={{...kick,color:L.accentDeep}}>Strictic Plus</p>
          <h1 style={h1}>Kouč<br/>bez limitů</h1>
          <p style={{fontSize:14,color:L.ink2,maxWidth:"42ch",margin:"14px 0 0",lineHeight:1.5}}>Tohle je jediná placená část. <b style={{color:L.ink}}>Zbytek appky zůstává zdarma navždy</b> — žádný trik.</p>
        </div>
        <div style={{marginTop:20,border:`2px solid ${L.accent}`,background:L.cream,borderRadius:14,padding:"16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:F.sans,fontWeight:600,fontSize:16,marginBottom:10}}><Crown size={16} color={L.accentDeep}/> S Plus dostaneš</div>
          {plusList.map(x=>(<div key={x} style={{display:"flex",gap:9,alignItems:"flex-start",padding:"5px 0",fontSize:14}}><Check size={17} color={L.accentDeep} style={{flex:"0 0 auto",marginTop:1}}/><span>{x}</span></div>))}
        </div>
        <div style={{marginTop:14,border:`1px solid ${L.line}`,background:L.surface,borderRadius:14,padding:"14px"}}>
          <div style={{fontFamily:F.mono,fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:L.ink3,marginBottom:11}}>Ukázka — takhle kouč mluví</div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:9}}>
            <div style={{maxWidth:"82%",background:L.ink,color:"#fff",borderRadius:"14px 14px 4px 14px",padding:"10px 13px",fontSize:14,lineHeight:1.4}}>Zasekl jsem se na benchi na 22 kg, třetí trénink stejně. Co s tím?</div>
          </div>
          <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
            <div style={{flex:"0 0 auto",width:28,height:28,borderRadius:"50%",background:L.accent,display:"flex",alignItems:"center",justifyContent:"center",marginTop:1}}><MessageCircle size={15} color="#0C0C0B"/></div>
            <div style={{maxWidth:"82%",background:L.cream,border:`1px solid ${L.line2}`,borderRadius:"14px 14px 14px 4px",padding:"10px 13px",fontSize:14,lineHeight:1.45,color:L.ink}}>Plató na 22 je normální, ne tvoje chyba. Zkus tři věci: zpomal spouštění na 3 s, přidej jednu sérii navíc a příště dej 22 ještě jednou s plným odpočinkem. Když ani pak ne, chvíli to drž — tělo dožene. Žádný zázračný trik.</div>
          </div>
        </div>
        <button onClick={buyPlus} style={{...ctaDark,marginTop:16,background:L.accent,color:"#0C0C0B",boxShadow:"0 2px 6px rgb(255 77 28 / .25), 0 14px 30px -12px rgb(255 77 28 / .5)"}}><Sparkles size={18}/> Začít 7 dní zdarma</button>
        <p style={{fontSize:14,color:L.ink2,textAlign:"center",maxWidth:"42ch",margin:"11px auto 0",lineHeight:1.5}}>Pak <b style={{color:L.ink}}>990 Kč/rok</b> (≈ 83 Kč/měs). Den před koncem ti připomeneme — <b style={{color:L.ink}}>nezaplatíš omylem</b>. Zrušíš kdykoli dvěma ťuky.</p>
        <button onClick={()=>setShowPlans(s=>!s)} aria-expanded={showPlans} style={{width:"100%",marginTop:18,marginBottom:4,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"transparent",border:"none",color:L.ink2,fontFamily:F.mono,fontSize:12,letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer",padding:"8px"}}>Další možnosti plateb <ChevronDown size={14} style={{transform:showPlans?"rotate(180deg)":"none",transition:".2s"}}/></button>
        {showPlans&&<div style={{marginTop:6}}>
          {PRICING.map(p=>(
            <button key={p.id} onClick={buyPlus} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9,padding:"16px",borderRadius:14,cursor:"pointer",background:L.surface,color:L.ink,border:`${p.best?2:1}px solid ${p.best?L.accent:L.line2}`}}>
              <span style={{display:"flex",flexDirection:"column",alignItems:"flex-start"}}><span style={{fontFamily:F.sans,fontWeight:600,fontSize:16}}>{p.label}{p.best&&<span style={{fontFamily:F.mono,fontSize:10,letterSpacing:".14em",textTransform:"uppercase",marginLeft:8,color:L.accentDeep}}>nejlepší</span>}</span><span style={{fontFamily:F.mono,fontSize:12,color:L.ink3,marginTop:3}}>{p.sub}</span></span>
              <span style={{fontFamily:F.sans,fontWeight:700,fontSize:19,...tnum}}>{p.price}</span>
            </button>
          ))}
        </div>}
        <div style={{marginTop:14,border:`1px solid ${L.line}`,background:L.surface,borderRadius:14,padding:"16px"}}>
          <div style={{fontFamily:F.mono,fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:L.ink3,marginBottom:7}}>Proč to něco stojí</div>
          <p style={{fontSize:14,color:L.ink2,margin:0,lineHeight:1.55}}>Kouč běží na AI, která nás stojí peníze za každou zprávu. Proto je za zdí jen on. Žádné mizející slevy, žádné odpočty — když se ti to nevyplatí, zrušíš to kdykoli.</p>
        </div>
        <div style={{marginTop:14,marginBottom:8}}>
          {freeList.map(x=>(<div key={x} style={{display:"flex",gap:9,alignItems:"center",padding:"4px 0",fontSize:14,color:L.ink2}}><Check size={15} color={L.green} style={{flex:"0 0 auto"}}/><span>{x} · <span style={{color:L.ink3}}>zdarma navždy</span></span></div>))}
        </div>
      </Shell>
    );
  }

  /* ════ WORKOUT (dark) ════ */
  const sets=log.sets;
  const firstUndone=sets.findIndex(s=>!s.done);
  const allDone=firstUndone===-1;
  const lastDoneIdx=allDone?sets.length-1:firstUndone-1;
  const howShown=!!howOpen[ex.id], whyShown=!!whyOpen[ex.id];
  const bump=progress[ex.id]?.bump;
  const editing=focusSet!=null;
  const heroIdx=editing?focusSet:firstUndone;
  const heroSet=heroIdx>=0?sets[heroIdx]:null;
  const doneCount=sets.filter(s=>s.done).length;
  const anyLogged=plan.some(e=>{const l=logs[e.id];return l&&l.sets&&l.sets.some(s=>s.done);});
  const frontier=plan.findIndex((e)=>!isExerciseDone(logs[e.id]));
  const reviewing=frontier!==-1&&idx<frontier;
  const navMax=frontier===-1?plan.length-1:frontier; /* nejdál dosažitelné šipkou = aktuální cvik (frontier); dál jen přes „Další cvik“/„Přeskočit“ */
  const restCtx=(()=>{ if(!rest)return null;
    if(!allDone){ const ni=firstUndone; const s=sets[ni];
      return { label:"Pauza mezi sériemi", head:`Další série · ${ni+1} z ${sets.length}`, exName:ex.name,
        kg: ex.kind==="hold"?null:`${fmtKg(s.weight)} kg`, reps: ex.kind==="hold"?null:ex.reps,
        holdTxt: ex.kind==="hold"?`výdrž ${ex.holdMin}–${ex.holdMax} s`:null,
        cta:`Začít sérii ${ni+1}`, act:()=>setRest(null) }; }
    if(idx<plan.length-1){ const nx=plan[idx+1]; const nl=logs[nx.id]; const nw=(nl&&nl.sets&&nl.sets[0])?nl.sets[0].weight:null;
      return { label:"Pauza před dalším cvikem", head:"Další cvik", exName:nx.name,
        kg: (nx.kind!=="hold"&&nw!=null)?`${fmtKg(nw)} kg`:null, reps: nx.kind==="hold"?null:nx.reps,
        holdTxt: nx.kind==="hold"?`výdrž ${nx.holdMin}–${nx.holdMax} s`:null,
        cta:"Další cvik", act:()=>go(1) }; }
    return { label:"Pauza — poslední cvik hotový", head:"Hotovo", exName:"Byl to poslední cvik v tréninku", kg:null, reps:null, holdTxt:null, cta:"Dokončit trénink", act:()=>go(1) }; })();
  return(
    <div style={{minHeight:"100vh",background:D.bg,color:D.ink,fontFamily:F.sans,WebkitFontSmoothing:"antialiased"}}>
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <div style={{position:"sticky",top:0,zIndex:5,background:D.bg,borderBottom:`1px solid ${D.line}`,padding:"13px 22px 11px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:2}}>
              <button onClick={()=>go(-1)} disabled={idx===0} aria-label="Předchozí cvik" style={{...ghost,color:D.ink,opacity:idx===0?.3:1}}><ChevronLeft size={19}/></button>
              <button onClick={()=>go(1)} disabled={idx>=navMax} aria-label="Další cvik" style={{...ghost,color:D.ink,opacity:idx>=navMax?.3:1}}><ChevronRight size={19}/></button>
            </div>
            <div style={{fontFamily:F.mono,fontSize:12,letterSpacing:".08em",color:D.ink2,...tnum}}>CVIK {idx+1}/{plan.length} · {fmt(elapsed)}</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {easy&&<span aria-label="Lehčí trénink" style={{display:"inline-flex",alignItems:"center",gap:4,fontFamily:F.mono,fontSize:12,letterSpacing:".08em",textTransform:"uppercase",color:D.accent}}><Feather size={13}/> Lehčí</span>}
              <button onClick={toggleMute} aria-label={equip.muted?"Zapnout zvuk":"Ztlumit zvuk"} style={{...ghost,color:D.ink2}}>{equip.muted?<VolumeX size={18}/>:<Volume2 size={18}/>}</button>
            </div>
          </div>
          <StepDots fill={D.accent} track={D.line} states={plan.map((e,j)=>{const l=logs[e.id];const dn=isExerciseDone(l);return dn?"done":(j===idx?"current":"upcoming");})} />
        </div>

        <div role="main" className="exfade" key={idx} style={{padding:"20px 22px 150px"}}>
          <div style={{display:"flex",gap:13,alignItems:"flex-start"}}>
            <Disc dark>{idx+1}</Disc>
            <div style={{flex:1,minWidth:0}}>
              <h1 style={{fontFamily:F.sans,fontWeight:600,fontSize:24,lineHeight:1.05,color:D.ink,margin:0}}>{ex.name}{ex.perLeg&&<span style={{fontSize:14,color:D.ink2}}> · na nohu</span>}</h1>
              <div style={{fontFamily:F.mono,fontSize:12,letterSpacing:".08em",textTransform:"uppercase",color:D.ink2,marginTop:5}}>{ex.muscles}</div>
            </div>
          </div>

          <div style={{display:"flex",gap:8,marginTop:16}}>
            <button onClick={()=>setHowOpen(o=>({...o,[ex.id]:!howShown}))} aria-expanded={howShown} style={{...pill,color:howShown?D.ink:D.ink2,borderColor:howShown?D.line2:D.line}}>Jak na to <ChevronDown size={14} style={{transform:howShown?"rotate(180deg)":"none",transition:".2s"}}/></button>
            <button onClick={()=>setWhyOpen(o=>({...o,[ex.id]:!whyShown}))} aria-expanded={whyShown} style={{...pill,color:D.accent,borderColor:whyShown?D.accent:D.line}}>Proč tohle <ChevronDown size={14} style={{transform:whyShown?"rotate(180deg)":"none",transition:".2s"}}/></button>
          </div>
          {howShown&&<p style={{fontSize:14,lineHeight:1.55,color:D.ink,margin:"10px 0 0",background:D.surface,border:`1px solid ${D.line}`,borderRadius:14,padding:"16px"}}>{ex.how}</p>}
          {whyShown&&<p style={{fontSize:14,lineHeight:1.55,color:D.ink,margin:"10px 0 0",background:"rgba(255,90,44,.07)",borderLeft:`3px solid ${D.accent}`,borderRadius:"0 12px 12px 0",padding:"16px"}}>{ex.why}</p>}

          {easy&&idx===0&&<div style={{marginTop:14,display:"flex",alignItems:"flex-start",gap:9,background:D.surface,border:`1px solid ${D.line}`,borderRadius:14,padding:"12px 14px"}}><Feather size={15} color={D.accent} style={{flex:"0 0 auto",marginTop:1}}/><span style={{fontSize:14,color:D.ink2,lineHeight:1.45}}>Lehčí trénink{lightDropEx.length?<> — vynecháno: <b style={{color:D.ink}}>{lightDropEx.map(e=>e.name).join(", ")}</b>.</>:", o stupeň lehčí."} Váha o stupeň níž; série i pracovní váhy zůstávají.</span></div>}
          <div style={{marginTop:18,display:"flex",gap:6}}>
              {sets.map((s,si)=>{
                const cs=s.done?"done":(si===firstUndone?"current":"upcoming");
                const inHero=si===heroIdx;
                const isEdit=editing&&si===focusSet;
                const clickable=s.done||cs==="current";
                const base={flex:1,minWidth:0,height:44,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontFamily:F.mono,fontSize:14,fontWeight:700,...tnum,cursor:clickable?"pointer":"default",touchAction:"manipulation",transition:"background .2s, border-color .2s, box-shadow .2s",padding:0};
                let st;
                if(s.done&&!isEdit) st={...base,background:D.accent,color:"#0C0C0B",border:"none"};
                else if(isEdit) st={...base,background:"rgba(255,90,44,.12)",border:`1.5px dashed ${D.accent}`,color:D.accent,boxShadow:"0 0 0 3px rgba(255,90,44,.12)"};
                else if(cs==="current") st={...base,background:"rgba(255,90,44,.08)",border:`2px solid ${D.accent}`,color:D.accent,boxShadow:inHero?"0 0 0 3px rgba(255,90,44,.14)":"none"};
                else st={...base,background:"transparent",border:`1px dashed ${D.line2}`,color:D.ink3};
                const lab=s.done?`Série ${si+1}, hotovo, ${ex.kind==="hold"?`${s.secs} sekund`:`${s.reps} opakování`} — upravit`:(cs==="current"?`Série ${si+1}, aktuální`:`Série ${si+1}, čeká`);
                return(
                  <button key={si} type="button" disabled={!clickable} onClick={clickable?(s.done?()=>setFocusSet(si):()=>setFocusSet(null)):undefined} aria-label={lab} aria-current={inHero?"step":undefined} style={st}>
                    {s.done?(ex.kind==="hold"?`${s.secs}s`:s.reps):(<>{cs==="current"&&!editing&&<span className="pulse" style={{width:6,height:6,borderRadius:"50%",background:D.accent,display:"inline-block"}}/>}{si+1}</>)}
                  </button>
                );
              })}
          </div>
          {doneCount>0&&<div style={{marginTop:8,fontFamily:F.mono,fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:D.ink3,display:"flex",alignItems:"center",gap:6}}><Undo2 size={11}/> ťukni na hotovou sérii pro úpravu</div>}

          <div className="exfade" key={`hero-${idx}-${heroIdx}-${editing?1:0}`} style={{marginTop:14}}>
          {(()=>{
            if(!editing&&allDone) return(
              <div style={{background:D.card,border:`1px solid ${D.line2}`,borderLeft:`3px solid ${D.green}`,borderRadius:14,padding:"20px 16px",display:"flex",alignItems:"center",gap:13}}>
                <div style={{flex:"0 0 auto",width:42,height:42,borderRadius:"50%",background:"rgba(63,148,87,.16)",display:"flex",alignItems:"center",justifyContent:"center"}}><Check size={22} color={D.green}/></div>
                <div><div style={{fontFamily:F.sans,fontWeight:600,fontSize:16,color:D.ink}}>Cvik hotový</div><div style={{fontFamily:F.mono,fontSize:12,color:D.ink2,marginTop:2,...tnum}}>{doneCount} z {sets.length} sérií zapsáno</div></div>
              </div>
            );
            const s=heroSet; if(!s) return null;
            const si=heroIdx;
            const showBumpH=bump&&!editing&&si===0&&ex.kind!=="hold"&&Math.abs(s.weight-bump.to)<1e-9;
            const running=hold.si===si;
            return(
              <div style={{background:D.card,border:`1px solid ${D.line2}`,borderLeft:`3px ${editing?"dashed":"solid"} ${D.accent}`,borderRadius:14,padding:"14px",boxShadow:editing?"none":"0 0 0 1px rgba(255,90,44,.12)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:ex.kind==="hold"&&!editing?2:12}}>
                  {editing?(
                    <span style={{display:"inline-flex",alignItems:"center",gap:7,fontFamily:F.mono,fontSize:12,letterSpacing:".08em",textTransform:"uppercase",color:D.accent}}><Undo2 size={12}/> Série {si+1} · úprava</span>
                  ):(
                    <span style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:F.mono,fontSize:12,letterSpacing:".08em",textTransform:"uppercase",color:D.accent}}><span className="pulse" style={{width:7,height:7,borderRadius:"50%",background:D.accent,display:"inline-block"}}/>Série {si+1} · teď</span>
                  )}
                  <span style={{fontFamily:F.mono,fontSize:12,color:D.ink2}}>cíl {ex.kind==="hold"?`${ex.holdMin}–${ex.holdMax}s`:`${ex.reps}`}</span>
                </div>
                {ex.kind==="hold"?(
                  editing?(
                    <>
                      <div style={{textAlign:"center",padding:"8px 0 12px"}}><span style={{fontFamily:F.sans,fontWeight:600,fontSize:34,...tnum,color:D.ink,lineHeight:1}}>{s.secs}s</span></div>
                      <button onClick={saveEdit} style={{...moltenOutBtn}}><Check size={16}/> Hotovo</button>
                      <button onClick={()=>undoSet(si)} style={quietRevert}><Undo2 size={13}/> Vrátit sérii</button>
                    </>
                  ):(
                    <>
                      <div style={{textAlign:"center",padding:"10px 0 14px"}}><span style={{fontFamily:F.sans,fontWeight:600,fontSize:running?46:26,...tnum,color:running?D.accent:D.ink2,lineHeight:1}}>{running?`${hold.secs}s`:"připraven"}</span></div>
                      {running?(<button onClick={()=>stopHold(si)} style={moltenBtn}><Check size={17}/> Hotovo</button>):(<button onClick={()=>startHold(si)} style={moltenOutBtn}><Play size={15}/> Spustit výdrž</button>)}
                    </>
                  )
                ):(
                  <>
                    <div style={{display:"flex",gap:12}}>
                      <Stepper dark active label="opakování" value={s.reps} onDec={()=>adj(si,"reps",-1)} onInc={()=>adj(si,"reps",1)} onSet={(v)=>adjSet(si,"reps",Math.max(0,Math.round(v)))}/>
                      <Stepper dark active label={`kg ${ex.unit}`} value={fmtKg(s.weight)} onDec={()=>adj(si,"weight",-1)} onInc={()=>adj(si,"weight",1)} onSet={(v)=>adjSet(si,"weight",nearestW(v))}/>
                    </div>
                    {showBumpH&&<div style={{display:"flex",alignItems:"center",gap:6,marginTop:10,fontFamily:F.mono,fontSize:12,letterSpacing:".03em",color:D.accent}}><ArrowUp size={12}/> navýšeno z {fmtKg(bump.from)} kg — minule jsi dal vše na {ex.reps}</div>}
                    {editing?(
                      <>
                        <button onClick={saveEdit} style={{...moltenOutBtn,marginTop:12}}><Check size={16}/> Hotovo</button>
                        <button onClick={()=>undoSet(si)} style={quietRevert}><Undo2 size={13}/> Vrátit sérii</button>
                      </>
                    ):(
                      <button onClick={()=>logSet(si)} style={{...moltenBtn,marginTop:showBumpH?10:12}}><Check size={17}/> Zapsat sérii</button>
                    )}
                  </>
                )}
              </div>
            );
          })()}
          </div>

          {hitGoal&&!easy&&(
            <div style={{marginTop:14,padding:"16px",background:"rgba(255,90,44,.1)",border:`2px solid ${D.accent}`,borderRadius:14,display:"flex",alignItems:"center",gap:12,transform:pop?"scale(1.03)":"scale(1)",transition:".25s"}}>
              <Trophy size={26} color={D.accent} style={{flex:"0 0 auto"}}/>
              <div>
                <div style={{fontFamily:F.sans,fontWeight:600,fontSize:16,color:D.ink}}>{ex.reps} ve všech sériích — máš to!</div>
                {atCeiling?(<div style={{fontSize:14,color:D.ink,marginTop:2}}>Jsi na nejtěžší čince. Příště přidej <b style={{color:D.accent}}>opakování nad {ex.reps}</b> nebo zpomal spouštění.</div>):(<div style={{fontSize:14,color:D.ink,marginTop:2}}>Příště ti to navýším na <b style={{color:D.accent,fontFamily:F.mono,...tnum}}>{fmtKg(nu)} kg</b> — cíl zůstává {ex.reps}, nemusíš nic dělat.</div>)}
              </div>
            </div>
          )}

          <div style={{display:"flex",gap:9,marginTop:18}}><button onClick={skip} style={secDark}><SkipForward size={16}/> Přeskočit cvik</button></div>
          {reviewing?(
            <button onClick={()=>goTo(frontier)} style={{...ctaLight,marginTop:10,background:"#F5F5F2",color:"#0C0C0B"}}>Pokračovat · cvik {frontier+1} <ChevronRight size={20}/></button>
          ):(
            <button onClick={()=>go(1)} style={{...ctaLight,marginTop:10,background:allDone?L.green:"#F5F5F2",color:"#0C0C0B"}}>{idx>=plan.length-1?"Dokončit trénink":"Další cvik"} <ChevronRight size={20}/></button>
          )}
          {anyLogged&&<button onClick={()=>finish(logs)} style={{width:"100%",marginTop:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"transparent",border:`1px solid ${D.line2}`,color:D.ink,fontFamily:F.sans,fontWeight:600,fontSize:14,borderRadius:14,padding:"13px",cursor:"pointer",touchAction:"manipulation"}}><Check size={16}/> Ukončit a uložit, co mám</button>}
          <button onClick={()=>setConfirm({title:"Zahodit tento trénink?",body:"Rozdělaný trénink se zruší a nic se neuloží do historie. Hodí se, když ses do něj dostal omylem.",confirmLabel:"Zahodit",onYes:discardWorkout})} style={{width:"100%",marginTop:16,background:"transparent",border:"none",color:D.ink3,fontFamily:F.mono,fontSize:12,letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer",padding:"10px",touchAction:"manipulation"}}>Ukončit a zahodit trénink</button>
        </div>

        {rest&&restCtx&&(
          <div ref={restModalRef} role="dialog" aria-modal="true" aria-label={restCtx.label}
               style={{position:"fixed",inset:0,zIndex:50,background:"#0A0A0A",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"calc(env(safe-area-inset-top) + 30px) 24px calc(env(safe-area-inset-bottom) + 26px)",touchAction:"manipulation"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><div style={{fontFamily:F.mono,fontSize:12,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(255,255,255,.6)"}}>Pauza{easy?" · lehčí den":""}</div><div style={{fontFamily:F.mono,fontSize:10,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(255,255,255,.33)",...tnum}}>celkem {fmt(elapsed)}</div></div>

            <div style={{position:"relative",width:"min(74vw,300px)",aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg viewBox="0 0 240 240" aria-hidden style={{position:"absolute",inset:0,width:"100%",height:"100%",transform:"rotate(-90deg)"}}>
                <circle cx="120" cy="120" r="110" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="9"/>
                <circle cx="120" cy="120" r="110" fill="none" stroke={rest.left<=0?"rgba(255,255,255,.3)":D.accent} strokeWidth="9" strokeLinecap="round" strokeDasharray={2*Math.PI*110} strokeDashoffset={2*Math.PI*110*(1-Math.max(0,Math.min(1,rest.left/rest.total)))} style={{transition:"stroke-dashoffset 1s linear, stroke .3s"}}/>
              </svg>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div role="timer" aria-live="off" style={{fontFamily:F.mono,fontWeight:700,fontSize:"clamp(46px,16vw,68px)",...tnum,color:rest.left<=0?D.accent:"#fff",lineHeight:1,letterSpacing:"-.02em"}}>{rest.left<=0?"0:00":fmt(rest.left)}</div>
                <div style={{fontFamily:F.mono,fontSize:12,letterSpacing:".14em",textTransform:"uppercase",color:rest.left<=0?D.accent:"rgba(255,255,255,.6)",marginTop:9}}>{rest.left<=0?"jdem!":"zbývá"}</div>
              </div>
            </div>

            <div style={{width:"100%",maxWidth:430,display:"flex",flexDirection:"column",alignItems:"center",gap:15}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,minHeight:44}}>
                <span style={{fontFamily:F.mono,fontSize:12,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(255,255,255,.5)"}}>{restCtx.head}</span>
                <span style={{fontFamily:F.sans,fontSize:16,color:"rgba(255,255,255,.62)",textAlign:"center",lineHeight:1.35}}>{restCtx.exName}{restCtx.kg?<>{" · "}<b style={{color:"#fff",fontWeight:700,...tnum}}>{restCtx.kg}</b>{" × "}{restCtx.reps}</>:restCtx.holdTxt?<>{" · "}{restCtx.holdTxt}</>:null}</span>
              </div>
              <div style={{display:"flex",alignItems:"stretch",gap:10,width:"100%"}}>
                {rest.left>0&&<button onClick={()=>setRest(r=>r?{...r,left:r.left+30,total:Math.max(r.total,r.left+30)}:r)} aria-label="Přidat 30 sekund" style={{flex:"0 0 auto",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 18px",borderRadius:14,border:"1px solid rgba(255,255,255,.18)",background:"rgba(255,255,255,.05)",color:"#fff",fontFamily:F.mono,fontSize:14,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",touchAction:"manipulation"}}>+30&nbsp;s</button>}
                <button onClick={restCtx.act} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"17px",borderRadius:14,border:"none",background:D.accent,color:"#0C0C0B",fontFamily:F.sans,fontWeight:700,fontSize:16,cursor:"pointer",touchAction:"manipulation"}}>{restCtx.cta} {allDone?<ChevronRight size={19}/>:<Play size={17}/>}</button>
              </div>
            </div>
          </div>
        )}
        {dim&&!rest&&(
          <div onClick={()=>setDim(false)} style={{position:"fixed",inset:0,zIndex:40,background:"#000",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",WebkitTapHighlightColor:"transparent"}} aria-hidden>
            <div style={{fontFamily:F.mono,fontWeight:600,fontSize:46,...tnum,color:"rgba(255,255,255,.14)",lineHeight:1}}>{fmt(elapsed)}</div>
            <div style={{position:"absolute",bottom:"calc(40px + env(safe-area-inset-bottom))",fontFamily:F.mono,fontSize:12,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(255,255,255,.2)"}}>ťukni pro probuzení</div>
          </div>
        )}
        {confirmModal}
      </div>
    </div>
  );
}

/* ════ shared ════ */
function Shell({children}){return <div style={{minHeight:"100vh",background:L.bg,color:L.ink,fontFamily:F.sans,WebkitFontSmoothing:"antialiased"}}><div role="main" style={{maxWidth:480,margin:"0 auto",padding:"28px 22px 48px"}}>{children}</div></div>;}
function Stat({label,value,unit}){return <div style={{border:`1px solid ${L.line}`,background:L.surface,borderRadius:14,padding:"14px 8px",textAlign:"center"}}><div style={{fontFamily:F.sans,fontWeight:600,fontSize:24,color:L.ink,lineHeight:1,...tnum,letterSpacing:"-.02em"}}>{value}{unit&&<span style={{fontSize:12,color:L.ink3,fontWeight:400}}> {unit}</span>}</div><div style={{fontFamily:F.mono,fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:L.ink3,marginTop:6}}>{label}</div></div>;}
function relDate(ts){const d=new Date(ts);const a=new Date(d.getFullYear(),d.getMonth(),d.getDate());const t=new Date();const b=new Date(t.getFullYear(),t.getMonth(),t.getDate());const diff=Math.round((b-a)/86400000);if(diff===0)return"dnes";if(diff===1)return"včera";if(diff>1&&diff<7)return d.toLocaleDateString("cs",{weekday:"short",day:"numeric",month:"numeric"});return d.toLocaleDateString("cs",{day:"numeric",month:"numeric",year:"numeric"});}
function drawStat(x,px,py,val,label,sans,mono){x.textAlign="left";x.fillStyle="#FFFFFF";x.font=sans(700,52);x.fillText(val,px,py);x.fillStyle="rgba(255,255,255,0.4)";x.font=mono(600,22);x.fillText(label,px,py+34);}
async function buildShareCanvas(spec){
  const S=1080, c=document.createElement("canvas"); c.width=S; c.height=S; const x=c.getContext("2d"); if(!x)return null;
  try{ if(document.fonts&&document.fonts.ready) await document.fonts.ready; }catch{}
  const M=92, ACC="#FF5A2C", WHITE="#FFFFFF";
  const sans=(w,s)=>`${w} ${s}px Inter, system-ui, sans-serif`;
  const mono=(w,s)=>`${w} ${s}px Inter, system-ui, sans-serif`;
  x.fillStyle="#0A0A0A"; x.fillRect(0,0,S,S);
  const gr=x.createRadialGradient(S*0.84,S*0.12,0,S*0.84,S*0.12,S*0.92); gr.addColorStop(0,"rgba(255,90,44,0.20)"); gr.addColorStop(1,"rgba(255,90,44,0)"); x.fillStyle=gr; x.fillRect(0,0,S,S);
  x.textBaseline="alphabetic";
  x.textAlign="left"; x.fillStyle=WHITE; x.font=sans(700,46); x.fillText("Strictic", M, M+40);
  const ww=x.measureText("Strictic").width; x.fillStyle=ACC; x.beginPath(); x.arc(M+ww+20, M+22, 7, 0, Math.PI*2); x.fill();
  x.textAlign="right"; x.fillStyle="rgba(255,255,255,0.45)"; x.font=mono(600,23); x.fillText((spec.kicker||"").toUpperCase(), S-M, M+34); x.textAlign="left";
  if(spec.type==="exercise"){
    x.fillStyle=ACC; x.font=mono(600,26); x.fillText((spec.kicker||"").toUpperCase(), M, 300);
    x.fillStyle=WHITE; x.font=sans(700,60); { let nm=spec.name, mw=S-2*M; while(x.measureText(nm).width>mw&&nm.length>4){nm=nm.slice(0,-1);} if(nm!==spec.name)nm=nm.slice(0,-1)+"…"; x.fillText(nm, M, 384); }
    const big=spec.toW+" kg"; x.fillStyle=WHITE; x.font=sans(800,150); x.fillText(big, M, 540);
    x.fillStyle="rgba(255,255,255,0.45)"; x.font=sans(600,40); x.fillText((spec.count>1? spec.fromW+" kg → " : "start · ")+spec.toW+" kg  ·  "+spec.reps+"×", M, 600);
    const sp=(spec.spark||[]).slice(-14); if(sp.length>=1){ const bx=M,bw2=S-2*M,by=648,bh=190; const mn=Math.min(...sp),mx=Math.max(...sp),rng=(mx-mn)||1;
      x.strokeStyle="rgba(255,255,255,0.1)"; x.lineWidth=2; x.beginPath(); x.moveTo(bx,by+bh); x.lineTo(bx+bw2,by+bh); x.stroke();
      const n=sp.length,gp=12,cw=(bw2-gp*(n-1))/n;
      sp.forEach((v,i)=>{ const bhv=(n===1?0.62:(0.3+0.7*((v-mn)/rng)))*bh; const px=bx+i*(cw+gp), py=by+bh-bhv; x.globalAlpha=i===n-1?1:0.5; x.fillStyle=ACC; if(x.roundRect){ x.beginPath(); x.roundRect(px,py,cw,bhv,[8,8,0,0]); x.fill(); } else { x.fillRect(px,py,cw,bhv); } }); x.globalAlpha=1;
      if(n>1){const f0=(0.3+0.7*((sp[0]-mn)/rng))*bh; x.textAlign="left"; x.fillStyle="rgba(255,255,255,0.5)"; x.font=mono(600,24); x.fillText(spec.fromW, bx, by+bh-f0-16);}
      {const fl=(n===1?0.62:(0.3+0.7*((sp[n-1]-mn)/rng)))*bh; x.textAlign="right"; x.fillStyle=WHITE; x.font=mono(700,27); x.fillText(spec.toW+" kg", bx+bw2, by+bh-fl-16); x.textAlign="left";}
    }
    if(spec.deltaPct>0) drawStat(x,M,905,"+"+spec.deltaPct+" %","SÍLA NAHORU",sans,mono);
    else drawStat(x,M,905,String(spec.count),spec.count===1?"1. ZÁZNAM":"TRÉNINKŮ",sans,mono);
  } else {
    x.fillStyle="rgba(255,255,255,0.5)"; x.font=mono(600,27); x.fillText("CELKEM ZVEDNUTO", M, 300);
    const big=String(spec.volume); x.fillStyle=WHITE; x.font=sans(800,200); x.fillText(big, M, 470);
    const bw=x.measureText(big).width; x.fillStyle=ACC; x.font=sans(700,56); x.fillText("kg", M+bw+24, 470);
    drawStat(x,M,584,spec.time,"ČAS",sans,mono);
    drawStat(x,M+330,584,spec.exercises,"CVIKŮ",sans,mono);
    const hl=spec.highlights||[]; if(hl.length){ let hy=708; x.fillStyle="rgba(255,255,255,0.5)"; x.font=mono(600,24); x.fillText("NAVÝŠENO PRO PŘÍŠTĚ", M, hy); hy+=56;
      hl.slice(0,3).forEach((t)=>{ x.fillStyle=ACC; x.font=sans(700,32); x.fillText("\u2191", M, hy); x.fillStyle=WHITE; x.font=sans(600,33); x.fillText(t, M+46, hy); hy+=54; }); }
  }
  const fy=S-150; x.strokeStyle="rgba(255,255,255,0.12)"; x.lineWidth=2; x.beginPath(); x.moveTo(M,fy); x.lineTo(S-M,fy); x.stroke();
  x.textAlign="left"; x.fillStyle="rgba(255,255,255,0.8)"; x.font=sans(600,27); x.fillText("Domácí trénink. Poctivě.", M, fy+46);
  if(spec.foot){ x.fillStyle="rgba(255,255,255,0.32)"; x.font=mono(500,22); x.fillText(spec.foot, M, fy+80); }
  x.textAlign="right"; x.fillStyle=ACC; x.font=sans(700,30); x.fillText(SHARE_URL, S-M, fy+60); x.textAlign="left";
  return c;
}
const SHARE_URL = "strictic.com"; // ← NASTAV na svou reálnou adresu (Netlify URL nebo doména), ať odkaz na kartě funguje
const kick={fontFamily:F.mono,fontSize:12,letterSpacing:".14em",textTransform:"uppercase",color:L.accentDeep,fontWeight:500,margin:"0 0 8px"};
const h1={fontFamily:F.sans,fontWeight:600,fontSize:"clamp(34px,9vw,56px)",letterSpacing:"-.02em",lineHeight:1,margin:0};
const h3={fontFamily:F.sans,fontWeight:600,fontSize:16,margin:"0 0 9px",letterSpacing:"-.02em",display:"flex",alignItems:"center",gap:8};
const fieldLabel={fontFamily:F.mono,fontSize:12,letterSpacing:".08em",textTransform:"uppercase",color:L.ink2,marginBottom:10};
const ctaDark={width:"100%",marginTop:22,display:"flex",alignItems:"center",justifyContent:"center",gap:9,background:L.ink,color:"#fff",fontFamily:F.sans,fontWeight:600,fontSize:16,letterSpacing:"-.02em",border:"none",borderRadius:14,padding:"17px 20px",cursor:"pointer",touchAction:"manipulation",boxShadow:"0 1px 2px rgb(10 10 10 / .14), 0 10px 26px -12px rgb(10 10 10 / .45)"};
const ctaLight={width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:F.sans,fontWeight:600,fontSize:16,letterSpacing:"-.02em",border:"none",borderRadius:14,padding:"17px",cursor:"pointer",touchAction:"manipulation"};
const secDark={flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,background:"transparent",color:D.ink,fontFamily:F.sans,fontWeight:600,fontSize:14,letterSpacing:"-.02em",border:`1px solid ${D.line2}`,borderRadius:14,padding:"14px 12px",cursor:"pointer",touchAction:"manipulation"};
const moltenBtn={width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:D.accent,color:"#0C0C0B",fontFamily:F.sans,fontWeight:700,fontSize:16,border:"none",borderRadius:14,padding:"15px",cursor:"pointer",touchAction:"manipulation"};
const moltenOutBtn={width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"transparent",color:D.accent,fontFamily:F.sans,fontWeight:700,fontSize:16,border:`1.5px solid ${D.accent}`,borderRadius:14,padding:"15px",cursor:"pointer",touchAction:"manipulation"};
const quietRevert={width:"100%",marginTop:8,display:"flex",alignItems:"center",justifyContent:"center",gap:7,background:"transparent",color:D.ink2,fontFamily:F.mono,fontSize:12,letterSpacing:".08em",textTransform:"uppercase",border:"none",borderRadius:14,padding:"11px",cursor:"pointer",touchAction:"manipulation"};
const ghost={display:"inline-flex",alignItems:"center",justifyContent:"center",width:44,height:44,background:"transparent",border:"none",cursor:"pointer"};
const iconBtn={display:"inline-flex",alignItems:"center",justifyContent:"center",width:44,height:44,background:L.surface,border:`1px solid ${L.line}`,borderRadius:14,cursor:"pointer",touchAction:"manipulation"};
const pill={display:"inline-flex",alignItems:"center",gap:6,minHeight:40,background:"transparent",border:`1px solid ${D.line}`,borderRadius:14,padding:"9px 13px",fontFamily:F.mono,fontSize:12,letterSpacing:".08em",textTransform:"uppercase",cursor:"pointer",touchAction:"manipulation"};
const stBtn={width:48,height:50,display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",border:"none",cursor:"pointer",color:L.ink,touchAction:"manipulation"};

class ErrorBoundary extends React.Component{
  constructor(p){ super(p); this.state={err:false}; }
  static getDerivedStateFromError(){ return {err:true}; }
  componentDidCatch(e){ try{ console.error(e); }catch(_){} }
  render(){
    if(this.state.err) return (
      <div style={{minHeight:"100vh",background:L.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{maxWidth:360,textAlign:"center"}}>
          <div style={{fontFamily:F.sans,fontWeight:600,fontSize:19,color:L.ink,marginBottom:10}}>Něco se pokazilo</div>
          <p style={{fontFamily:F.sans,fontSize:14,color:L.ink2,lineHeight:1.5,margin:"0 0 18px"}}>Aplikace narazila na chybu. Tvůj rozdělaný trénink je uložený — stačí obnovit stránku.</p>
          <button onClick={()=>{try{location.reload();}catch(_){}}} style={{...ctaLight,background:L.ink,color:"#fff"}}>Obnovit aplikaci</button>
        </div>
      </div>
    );
    return this.props.children;
  }
}
export default function App(){ return <ErrorBoundary><AppInner/></ErrorBoundary>; }
