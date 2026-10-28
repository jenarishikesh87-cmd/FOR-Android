import {
  registerUser,
  verifyEmailOtp,
  resendEmailOtp,
  loginUser,
  logoutUser,
  getCurrentSession
} from "./auth.js";
(() => {
  'use strict';
  const STORE_KEY = 'for-workout-data-v1';
  const DOW = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const SHORT_DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const SHORT_MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const EXERCISE_ROWS = [
    ['Barbell Bench Press','Chest','Mid chest','Barbell'],['Incline Barbell Bench Press','Chest','Upper chest','Barbell'],['Incline Dumbbell Press','Chest','Upper chest','Dumbbells'],['Flat Dumbbell Press','Chest','Mid chest','Dumbbells'],['Decline Bench Press','Chest','Lower chest','Barbell'],['Chest Press Machine','Chest','Mid chest','Machine'],['Pec Deck Fly','Chest','Mid chest','Machine'],['Cable Crossover','Chest','Mid chest','Cable'],['Low-to-High Cable Fly','Chest','Upper chest','Cable'],['High-to-Low Cable Fly','Chest','Lower chest','Cable'],['Push-Up','Chest','Mid chest','Bodyweight'],['Weighted Dip','Chest','Lower chest','Bodyweight'],
    ['Lat Pulldown','Back','Lats','Cable'],['Wide-Grip Lat Pulldown','Back','Lats','Cable'],['Neutral-Grip Lat Pulldown','Back','Lats','Cable'],['Pull-Up','Back','Lats','Bodyweight'],['Assisted Pull-Up','Back','Lats','Machine'],['Barbell Row','Back','Mid back','Barbell'],['Pendlay Row','Back','Mid back','Barbell'],['Chest-Supported Row','Back','Mid back','Machine'],['Seated Cable Row','Back','Mid back','Cable'],['One-Arm Dumbbell Row','Back','Lats','Dumbbells'],['Straight-Arm Pulldown','Back','Lats','Cable'],['T-Bar Row','Back','Mid back','Machine'],['Rack Pull','Back','Spinal erectors','Barbell'],['Face Pull','Back','Rear delts','Cable'],['Reverse Pec Deck','Back','Rear delts','Machine'],['Dumbbell Shrug','Back','Traps','Dumbbells'],['Barbell Shrug','Back','Traps','Barbell'],
    ['Overhead Press','Shoulders','Front delts','Barbell'],['Seated Dumbbell Shoulder Press','Shoulders','Front delts','Dumbbells'],['Arnold Press','Shoulders','Front delts','Dumbbells'],['Dumbbell Lateral Raise','Shoulders','Side delts','Dumbbells'],['Cable Lateral Raise','Shoulders','Side delts','Cable'],['Front Raise','Shoulders','Front delts','Dumbbells'],['Rear Delt Fly','Shoulders','Rear delts','Dumbbells'],['Upright Row','Shoulders','Side delts','Barbell'],
    ['Barbell Curl','Biceps','Long and short heads','Barbell'],['EZ-Bar Curl','Biceps','Long and short heads','EZ bar'],['Incline Dumbbell Curl','Biceps','Long head','Dumbbells'],['Hammer Curl','Biceps','Brachialis','Dumbbells'],['Preacher Curl','Biceps','Short head','Machine'],['Cable Curl','Biceps','Biceps','Cable'],['Concentration Curl','Biceps','Short head','Dumbbells'],
    ['Triceps Pushdown','Triceps','Lateral head','Cable'],['Rope Pushdown','Triceps','Lateral head','Cable'],['Overhead Cable Extension','Triceps','Long head','Cable'],['Skull Crusher','Triceps','Long head','EZ bar'],['Close-Grip Bench Press','Triceps','All heads','Barbell'],['Dumbbell Overhead Extension','Triceps','Long head','Dumbbells'],['Bench Dip','Triceps','All heads','Bodyweight'],
    ['Back Squat','Quads','Quads and glutes','Barbell'],['Front Squat','Quads','Quads','Barbell'],['Leg Press','Quads','Quads','Machine'],['Hack Squat','Quads','Quads','Machine'],['Bulgarian Split Squat','Quads','Quads and glutes','Dumbbells'],['Leg Extension','Quads','Quads','Machine'],['Romanian Deadlift','Hamstrings','Hamstrings and glutes','Barbell'],['Conventional Deadlift','Hamstrings','Posterior chain','Barbell'],['Sumo Deadlift','Hamstrings','Posterior chain','Barbell'],['Lying Leg Curl','Hamstrings','Hamstrings','Machine'],['Seated Leg Curl','Hamstrings','Hamstrings','Machine'],['Hip Thrust','Glutes','Glutes','Barbell'],['Glute Bridge','Glutes','Glutes','Bodyweight'],['Walking Lunge','Glutes','Quads and glutes','Dumbbells'],['Standing Calf Raise','Calves','Gastrocnemius','Machine'],['Seated Calf Raise','Calves','Soleus','Machine'],['Good Morning','Hamstrings','Hamstrings and spinal erectors','Barbell'],
    ['Cable Crunch','Abs','Upper abs','Cable'],['Hanging Knee Raise','Abs','Lower abs','Bodyweight'],['Hanging Leg Raise','Abs','Lower abs','Bodyweight'],['Plank','Abs','Core stability','Bodyweight'],['Side Plank','Abs','Obliques','Bodyweight'],['Ab Wheel Rollout','Abs','Core stability','Wheel'],['Russian Twist','Abs','Obliques','Bodyweight'],['Wrist Curl','Forearms','Wrist flexors','Dumbbells'],['Reverse Wrist Curl','Forearms','Wrist extensors','Dumbbells'],["Farmer's Walk",'Forearms','Grip','Dumbbells'],
    ['Treadmill Run','Cardio','Cardio endurance','Treadmill'],['Incline Walk','Cardio','Low-impact cardio','Treadmill'],['Stationary Cycling','Cardio','Cardio endurance','Bike'],['Rowing Machine','Cardio','Full-body cardio','Machine'],['Elliptical','Cardio','Low-impact cardio','Machine'],['Jump Rope','Cardio','Cardio endurance','Rope']
  ];
  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const BASE_EXERCISES = EXERCISE_ROWS.map(([name,muscle,focus,equipment]) => ({id:slug(name),name,muscle,focus,equipment,custom:false}));
  const EXERCISE_ICONS = {Chest:'🏋️',Back:'🧗',Shoulders:'💪',Biceps:'💪',Triceps:'💪',Quads:'🦵',Hamstrings:'🦵',Glutes:'🦿',Calves:'🦶',Abs:'🎯',Forearms:'✊',Cardio:'🏃'};
  // Plan indexes follow JavaScript day numbers: Sunday=0 through Saturday=6.
  const DEFAULT_PLAN = [
    {name:'Rest',rest:true,exercises:[]},
    {name:'Push',rest:false,exercises:[['Barbell Bench Press',4,'8–10',120],['Incline Dumbbell Press',3,'8–12',90],['Seated Dumbbell Shoulder Press',3,'8–12',90],['Dumbbell Lateral Raise',3,'12–15',60],['Rope Pushdown',3,'10–15',60]]},
    {name:'Pull',rest:false,exercises:[['Lat Pulldown',4,'8–12',90],['Barbell Row',3,'8–10',120],['Seated Cable Row',3,'10–12',90],['Face Pull',3,'12–15',60],['EZ-Bar Curl',3,'10–12',60]]},
    {name:'Legs',rest:false,exercises:[['Back Squat',4,'6–10',150],['Romanian Deadlift',3,'8–10',120],['Leg Press',3,'10–12',90],['Seated Leg Curl',3,'10–15',75],['Standing Calf Raise',4,'12–15',60]]},
    {name:'Push',rest:false,exercises:[['Incline Barbell Bench Press',4,'6–10',120],['Flat Dumbbell Press',3,'8–12',90],['Overhead Press',3,'6–10',120],['Cable Lateral Raise',3,'12–15',60],['Overhead Cable Extension',3,'10–15',60]]},
    {name:'Pull',rest:false,exercises:[['Pull-Up',3,'AMRAP',120],['Chest-Supported Row',4,'8–12',90],['One-Arm Dumbbell Row',3,'10–12',75],['Reverse Pec Deck',3,'12–15',60],['Hammer Curl',3,'10–12',60]]},
    {name:'Legs',rest:false,exercises:[['Front Squat',3,'8–10',120],['Hip Thrust',3,'8–12',90],['Walking Lunge',3,'10 each',90],['Lying Leg Curl',3,'10–15',75],['Seated Calf Raise',4,'12–15',60]]}
  ].map(day => ({...day,exercises:day.exercises.map(([name,sets,reps,rest])=>({id:slug(name),sets,reps,rest}))}));

  const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const parseDate = iso => new Date(`${iso}T12:00:00`);
  const plusDays = (iso, n) => { const d=parseDate(iso); d.setDate(d.getDate()+n); return localDate(d); };
  const dateDay = iso => parseDate(iso).getDay();
  const fmtDate = iso => { const d=parseDate(iso); return `${SHORT_DOW[d.getDay()]}, ${d.getDate()} ${SHORT_MONTH[d.getMonth()]}`; };
  const fmtLongDate = iso => parseDate(iso).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
  const todayISO = () => localDate(new Date());
  const getDefaultState = () => ({
    version:1, profile:{name:'Athlete',username:'',avatar:'',joinedAt:todayISO()},
    plan:JSON.parse(JSON.stringify(DEFAULT_PLAN)), logs:{}, drafts:{}, restOverrides:{}, selectedDate:todayISO(), view:'home', editPlanDay:new Date().getDay(),
    metrics:{weight:[],fat:[],photos:[]}, dailyStats:{}, supplements:[], supplementLogs:{}, snoozedUntil:{}, notified:{}, customExercises:[], friends:[],
    settings:{unit:'kg',restTimer:90,theme:'light',friendShareName:true,friendShareUsername:true,friendSharePRs:true}, libraryFilter:'All', libraryFocus:'All regions', librarySearch:'', progressExercise:'barbell-bench-press', progressPeriod:'3m', calendarOffset:0
  });
  function loadState(){
    try {
      const raw=localStorage.getItem(STORE_KEY);
      if(!raw) return getDefaultState();
      const obj=JSON.parse(raw);
      const d=getDefaultState();
      return {...d,...obj,profile:{...d.profile,...obj.profile},metrics:{...d.metrics,...obj.metrics},settings:{...d.settings,...obj.settings},plan:Array.isArray(obj.plan)&&obj.plan.length===7?obj.plan:d.plan};
    } catch(e){ return getDefaultState(); }
  }
  let state=loadState();
  const $ = sel => document.querySelector(sel);
  const app = $('#app');
  let toastTimer;
  function save(){
    try { localStorage.setItem(STORE_KEY,JSON.stringify(state)); }
    catch(e){ if(location.protocol!=='file:') notify('Storage is almost full. Export a backup and remove a few progress photos.'); }
  }
  function notify(message){
    const el=$('#toast'); if(!el) return;
    el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2700);
  }
  function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function allExercises(){return [...BASE_EXERCISES,...(state.customExercises||[])];}
  function exerciseById(id){return allExercises().find(e=>e.id===id)||{id,name:'Custom exercise',muscle:'Other',focus:'Custom',equipment:'Other',custom:true};}
  function dayPlanForDate(iso){
    const log=state.logs[iso];
    if(log?.type==='rest') return {name:'Rest',rest:true,exercises:[],manual:!!log.manual};
    let p=state.plan[dateDay(iso)]||{name:'Rest',rest:true,exercises:[]};
    if(state.restOverrides[iso]==='rest') return {name:'Rest',rest:true,exercises:[],manual:true};
    if(state.restOverrides[iso]==='workout'&&p.rest){
      for(let i=1;i<=7;i++){const candidate=state.plan[(dateDay(iso)-i+7)%7];if(candidate&&!candidate.rest)return {...candidate,manual:true};}
    }
    return p;
  }
  function priorWeight(exId, beforeDate){
    const dates=Object.keys(state.logs).filter(d=>d<beforeDate&&state.logs[d]?.type==='workout').sort().reverse();
    for(const d of dates){const ex=(state.logs[d].exercises||[]).find(x=>x.id===exId);if(ex){const ss=(ex.sets||[]).filter(s=>s.done&&Number(s.weight)>0);if(ss.length)return Math.max(...ss.map(s=>Number(s.weight)));}}
    return '';
  }
  function draftFromPlan(iso){
    const plan=dayPlanForDate(iso);
    const pExercises=(plan.exercises||[]).map(p=>{
      const ex=exerciseById(p.id), suggested=priorWeight(p.id,iso);
      return {id:p.id,name:ex.name,muscle:ex.muscle,focus:ex.focus,equipment:ex.equipment,distance:'',duration:'',sets:Array.from({length:Math.max(1,Number(p.sets)||3)},()=>({weight:suggested,reps:firstRep(p.reps),done:false,distance:'',duration:''})),targetSets:Number(p.sets)||3,targetReps:p.reps||'8–12',rest:Number(p.rest)||90};
    });
    return {date:iso,name:plan.name||'Workout',startedAt:new Date().toISOString(),exercises:pExercises,notes:''};
  }
  function firstRep(text){const m=String(text||'8').match(/\d+/);return m?Number(m[0]):8;}
  function ensureDraft(iso){ if(!state.drafts[iso]) state.drafts[iso]=draftFromPlan(iso); return state.drafts[iso]; }
  function kgToDisplay(kg){if(kg===''||kg===null||kg===undefined||!Number.isFinite(Number(kg)))return '';return Number((state.settings.unit==='lb'?Number(kg)*2.2046226218:Number(kg)).toFixed(2)).toString();}
  function displayToKg(v){const n=Number(v);if(v===''||!Number.isFinite(n))return '';return state.settings.unit==='lb'?n/2.2046226218:n;}
  function unit(){return state.settings.unit||'kg';}
  function fmtWeight(kg, precision=1){if(kg===''||kg===null||kg===undefined||!Number.isFinite(Number(kg)))return '—';const n=state.settings.unit==='lb'?Number(kg)*2.2046226218:Number(kg);return `${Number(n.toFixed(precision))} ${unit()}`;}
  function fmtVolume(kgVolume){const n=state.settings.unit==='lb'?kgVolume*2.2046226218:kgVolume;return `${Math.round(n).toLocaleString()} ${unit()}`;}
  function setCount(session){return (session?.exercises||[]).reduce((a,e)=>a+(e.sets||[]).filter(s=>s.done).length,0);}
  function sessionVolume(session){return (session?.exercises||[]).reduce((sum,e)=>sum+(e.sets||[]).filter(s=>s.done).reduce((z,s)=>z+(Number(s.weight)||0)*(Number(s.reps)||0),0),0);}
  function totalReps(session){return (session?.exercises||[]).reduce((sum,e)=>sum+(e.sets||[]).filter(s=>s.done).reduce((z,s)=>z+(Number(s.reps)||0),0),0);}
  function totalDistance(session){return (session?.exercises||[]).reduce((sum,e)=>sum+((e.muscle==='Cardio'&&(e.sets||[]).some(s=>s.done))?(Number(e.distance)||0):0),0);}
  function formatDistance(km){return `${Number((km||0).toFixed(2))} km`; }
  function workLogs(){return Object.entries(state.logs).filter(([d,l])=>l?.type==='workout').sort(([a],[b])=>a.localeCompare(b));}
  function overallStats(){const logs=workLogs().map(([,l])=>l);return {workouts:logs.length,volume:logs.reduce((s,l)=>s+sessionVolume(l),0),sets:logs.reduce((s,l)=>s+setCount(l),0),reps:logs.reduce((s,l)=>s+totalReps(l),0),distance:logs.reduce((s,l)=>s+totalDistance(l),0)};}
  function allPRs(){const prs={}; for(const [,log] of workLogs()){for(const ex of log.exercises||[]){for(const set of ex.sets||[]){if(set.done&&Number(set.weight)>0){const prev=prs[ex.id];if(!prev||Number(set.weight)>prev.weight)prs[ex.id]={id:ex.id,name:ex.name||exerciseById(ex.id).name,weight:Number(set.weight),reps:Number(set.reps)||0,date:log.date};}}}}return prs;}
  function currentStatsForRange(period){
    const now=parseDate(todayISO());let cutoff='0000-01-01';if(period==='3m'){const d=new Date(now);d.setMonth(d.getMonth()-3);cutoff=localDate(d);}else if(period==='6m'){const d=new Date(now);d.setMonth(d.getMonth()-6);cutoff=localDate(d);}else if(period==='1y'){const d=new Date(now);d.setFullYear(d.getFullYear()-1);cutoff=localDate(d);}return workLogs().filter(([date])=>date>=cutoff);
  }
  function weightHistory(id,period){
    const entries=[];for(const [date,log] of currentStatsForRange(period)){let best=0;for(const ex of log.exercises||[]){if(ex.id===id){for(const s of ex.sets||[])if(s.done&&Number(s.weight)>best)best=Number(s.weight);}}if(best>0)entries.push({date,value:best});}return entries;
  }
  function profileInitials(){return (state.profile.name||'A').split(/\s+/).slice(0,2).map(s=>s[0]||'').join('').toUpperCase();}
  function profileAvatar(className='avatar-big'){return state.profile.avatar?`<div class="${className} avatar-photo"><img src="${esc(state.profile.avatar)}" alt="Profile picture"></div>`:`<div class="${className}">${esc(profileInitials())}</div>`;}
  function applyTheme(){const theme=state.settings?.theme==='dark'?'dark':'light';document.documentElement.dataset.theme=theme;const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=theme==='dark'?'#09090b':'#ed1c24';}
  function dateIsDone(iso){return state.logs[iso]?.type==='workout';}
  function bottomNav(){const items=[['home','⌂','Home'],['workout','🏋️','Train'],['progress','↗','Progress'],['library','▦','Library'],['more','•••','More']];const active=['supplements','body','nutrition','calendar','friends','account','settings','routine'].includes(state.view)?'more':state.view;return `<nav class="bottom-nav" aria-label="Main navigation">${items.map(([id,icon,label])=>`<button class="nav-item ${active===id?'active':''}" data-action="set-view" data-view="${id}"><span class="nav-icon">${icon}</span><span>${label}</span></button>`).join('')}</nav>`;}
  function heading(title,subtitle='',right=''){return `<div class="page-heading"><div><h1>${title}</h1>${subtitle?`<p>${subtitle}</p>`:''}</div>${right}</div>`;}
  function metricCard(icon,label,value,caption,action=''){return `<div class="metric-card" ${action?`data-action="set-view" data-view="${action}"`:''}><div class="metric-head"><span>${label}</span><span class="metric-icon">${icon}</span></div><div class="metric-value">${value}</div><div class="metric-caption">${caption||' '}</div></div>`;}
  function dayStrip(iso){const d=parseDate(iso);const start=new Date(d);const weekStart=(d.getDay()+6)%7;start.setDate(d.getDate()-weekStart);const days=[];for(let i=0;i<7;i++){const dt=new Date(start);dt.setDate(start.getDate()+i);const id=localDate(dt),plan=dayPlanForDate(id),active=id===iso;days.push(`<button class="day-pill ${active?'active':''} ${plan.rest?'rest':''} ${dateIsDone(id)?'done':''}" data-action="select-date" data-date="${id}"><span>${SHORT_DOW[dt.getDay()]}</span><strong>${dt.getDate()}</strong><span>${plan.rest?'Rest':plan.name}</span></button>`);}return `<div class="day-strip">${days.join('')}</div>`;}
  function renderHome(){
    const date=state.selectedDate||todayISO(),plan=dayPlanForDate(date),log=state.logs[date],draft=state.drafts[date],daily=state.dailyStats[date]||{},stats=overallStats(),lastWeight=state.metrics.weight.slice().sort((a,b)=>b.date.localeCompare(a.date))[0],lastFat=state.metrics.fat.slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
    const isToday=date===todayISO();let heroTitle,heroCopy,heroButton;
    if(log?.type==='workout'){heroTitle='Session completed';heroCopy=`Nice work. ${setCount(log)} sets logged and ${fmtVolume(sessionVolume(log))} of training volume.`;heroButton=`<button class="btn btn-light" data-action="set-view" data-view="workout">View workout →</button>`;}
    else if(plan.rest){heroTitle='Recovery day';heroCopy=`${isToday?'Today':'This day'} is set aside for rest. Recovery is part of the plan.`;heroButton=`<button class="btn btn-light" data-action="train-anyway">Train anyway →</button>`;}
    else if(draft){heroTitle=`${plan.name} day`;heroCopy=`Your session is ready to continue. Your saved plan is waiting.`;heroButton=`<button class="btn btn-light" data-action="set-view" data-view="workout">Continue workout →</button>`;}
    else{heroTitle=`${plan.name} day`;heroCopy=`${plan.exercises.length} planned exercises. Log each set and track your progress over time.`;heroButton=`<button class="btn btn-light" data-action="start-session">Start workout →</button>`;}
    const w=stats.workouts;
    return `${heading('Home',isToday?fmtLongDate(date):fmtLongDate(date),`<button class="btn btn-outline btn-small" data-action="quick-log">＋ Log</button>`)}
      <section class="hero"><img class="hero-logo" src="icons/for-logo.png" alt="FOR logo"><div class="eyebrow">${isToday?'Today’s training': 'Selected day'}</div><h2>${esc(heroTitle)}</h2><p>${esc(heroCopy)}</p><div class="hero-bottom"><div class="hero-stat">LIFETIME WORKOUTS<strong>${w}</strong></div>${heroButton}</div></section>
      <div class="section-title">Your snapshot <button class="inline-link" data-action="set-view" data-view="progress">See progress ↗</button></div>
      <div class="grid-2">${metricCard('🏋️','Workouts',String(w),'All sessions', 'progress')}${metricCard('▤','Volume',fmtVolume(stats.volume),'Logged training', 'progress')}${metricCard('👟','Steps',Number(daily.steps||0).toLocaleString(),`${(daily.stepGoal||8000).toLocaleString()} daily goal`,'nutrition')}${metricCard('☾','Sleep',daily.sleep?`${daily.sleep}h`:'—','Target: 8 hours','nutrition')}</div>
      <div class="section-title">Training week <small>Rest days are planned, not missed</small></div><div class="card">${dayStrip(date)}<div class="row-between small muted"><span>Tap a day to open its log</span><button class="inline-link" data-action="set-view" data-view="calendar">Calendar →</button></div></div>
      <div class="section-title">Body <button class="inline-link" data-action="set-view" data-view="body">Update →</button></div><div class="grid-2">${metricCard('⚖️','Weight',lastWeight?fmtWeight(lastWeight.value):'—',lastWeight?`Updated ${fmtDate(lastWeight.date)}`:'No data yet','body')}${metricCard('◒','Body fat',lastFat?`${Number(lastFat.value).toFixed(1)}%`:'—',lastFat?`Updated ${fmtDate(lastFat.date)}`:'No data yet','body')}</div>
      <div class="section-title">Today’s routine <button class="inline-link" data-action="set-view" data-view="routine">Edit plan</button></div>
      ${plan.rest?`<div class="rest-banner"><div class="rest-icon">🌿</div><h3>Rest and recover</h3><p>Your plan has a rest day here. No streaks, no guilt—just recovery.</p><button class="btn btn-outline btn-small" data-action="train-anyway">Change to workout</button></div>`: `<div class="card">${plan.exercises.slice(0,4).map((p,i)=>{const ex=exerciseById(p.id);return `<div class="row" style="padding:8px 0"><div class="exercise-symbol">${EXERCISE_ICONS[ex.muscle]||'🏋️'}</div><div class="grow"><div class="weight-bold">${esc(ex.name)}</div><div class="small muted">${esc(ex.muscle)} · ${p.sets} sets × ${esc(p.reps)}</div></div><span class="chip">${i+1}</span></div>`}).join('')}${plan.exercises.length>4?`<div class="small muted">+ ${plan.exercises.length-4} more exercises</div>`:''}<div class="rule"></div><button class="btn btn-full" data-action="${draft?'set-view':'start-session'}" ${draft?'data-view="workout"':''}>${draft?'Continue session':'Start workout'} →</button></div>`}
      <div class="section-title">Supplements <button class="inline-link" data-action="set-view" data-view="supplements">Manage →</button></div>${renderSupplementQuick(date)}
      <div class="footer-note">FOR v0.1 · Your data stays on this device for now.</div>`;
  }
  function renderSupplementQuick(date){if(!state.supplements.length)return `<div class="card row-between"><div><div class="weight-bold">Set your reminders</div><div class="small muted">Add supplements and their usual times.</div></div><button class="btn btn-soft btn-small" data-action="set-view" data-view="supplements">＋ Add</button></div>`;const todays=state.supplements.filter(s=>s.enabled!==false&&(s.days||[0,1,2,3,4,5,6]).includes(dateDay(date)));return `<div class="card">${todays.slice(0,3).map(s=>{const key=`${date}_${s.id}`,status=state.supplementLogs[key];return `<div class="row" style="padding:6px 0"><div class="supplement-icon">💊</div><div class="grow"><div class="weight-bold">${esc(s.name)}</div><div class="small muted">${esc(s.dose||'Dose not set')} · ${esc(s.time||'No time')}</div></div><span class="chip ${status==='taken'?'chip-green':status==='skip'?'chip-red':''}">${status==='taken'?'Taken':status==='skip'?'Skipped': 'Pending'}</span></div>`}).join('')}${todays.length>3?`<div class="small muted">+${todays.length-3} more</div>`:''}<div class="rule"></div><button class="btn btn-outline btn-full" data-action="set-view" data-view="supplements">Open reminders →</button></div>`;}
  function renderWorkout(){
    const date=state.selectedDate||todayISO(),plan=dayPlanForDate(date),log=state.logs[date],draft=state.drafts[date];
    const right=`<button class="btn btn-outline btn-small" data-action="set-view" data-view="routine">Edit plan</button>`;
    let content=`${heading('Workout',fmtLongDate(date),right)}${dayStrip(date)}`;
    if(log?.type==='rest') return `${content}<div class="rest-banner"><div class="rest-icon">🌿</div><h3>Rest day</h3><p>${log.manual?'You marked this day as rest.':'Rest is planned for this day.'} This is part of your routine, not a broken streak.</p><div class="grid-2"><button class="btn btn-outline" data-action="clear-rest">Use plan</button><button class="btn" data-action="train-anyway">Train anyway</button></div></div><div class="section-title">Weekly plan <small>Repeats every week</small></div><div class="card">${plan.exercises.length?renderPlanMini(plan):'<div class="small muted">No workout assigned here.</div>'}<button class="btn btn-soft btn-full" style="margin-top:12px" data-action="set-view" data-view="routine">Edit weekly routine</button></div>`;
    if(log?.type==='workout'&&!draft){const completedSets=setCount(log);return `${content}<div class="card"><div class="row-between"><span class="chip chip-green">✓ Completed</span><span class="small muted">${esc(log.completedAt?new Date(log.completedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):'Saved')}</span></div><h2 style="margin:12px 0 4px">${esc(log.name||plan.name||'Workout')} complete</h2><p class="small muted" style="margin-top:0">${(log.exercises||[]).length} exercises · ${completedSets} completed sets · ${fmtVolume(sessionVolume(log))} volume</p><div class="grid-3"><div class="metric-card"><div class="metric-caption">Sets</div><div class="metric-value">${completedSets}</div></div><div class="metric-card"><div class="metric-caption">Reps</div><div class="metric-value">${totalReps(log)}</div></div><div class="metric-card"><div class="metric-caption">Volume</div><div class="metric-value" style="font-size:16px">${fmtVolume(sessionVolume(log))}</div></div></div><div class="rule"></div>${(log.exercises||[]).map(ex=>`<div class="row-between" style="padding:7px 0"><div><div class="weight-bold">${esc(ex.name||exerciseById(ex.id).name)}</div><div class="small muted">${(ex.sets||[]).filter(s=>s.done).length} sets logged</div></div><span class="chip">${fmtWeight(Math.max(0,...(ex.sets||[]).filter(s=>s.done).map(s=>Number(s.weight)||0)))}</span></div>`).join('')}<div class="rule"></div><div class="grid-2"><button class="btn btn-outline" data-action="edit-session">Edit session</button><button class="btn btn-soft" data-action="set-view" data-view="progress">View progress</button></div></div>`;}
    if(!draft){return `${content}<div class="card"><div class="row"><div class="exercise-symbol" style="height:48px;width:48px">${EXERCISE_ICONS[exerciseById(plan.exercises[0]?.id||'').muscle]||'🏋️'}</div><div class="grow"><div class="weight-bold" style="font-size:17px">${esc(plan.name||'Workout')} day</div><div class="small muted">${plan.exercises.length} exercises in your saved routine</div></div></div><div class="rule"></div>${renderPlanMini(plan)}<button class="btn btn-full" style="margin-top:14px" data-action="start-session">Start this workout →</button></div><button class="btn btn-outline btn-full" data-action="mark-rest">Mark this day as rest</button>`;}
    content+=`<div class="card"><div class="row-between"><div><div class="weight-bold">${esc(draft.name||plan.name||'Workout')}</div><div class="small muted">Mark each completed set. Your set entries save as you go.</div></div><span class="chip chip-green">LIVE LOG</span></div><div style="margin-top:13px"><div class="row-between small"><span class="muted">Set completion</span><strong>${setCount(draft)} / ${(draft.exercises||[]).reduce((a,e)=>a+e.sets.length,0)}</strong></div><div class="progress-track" style="margin-top:7px"><div class="progress-fill" style="width:${Math.min(100,setCount(draft)/Math.max(1,draft.exercises.reduce((a,e)=>a+e.sets.length,0))*100)}%"></div></div></div></div>`;
    if(!(draft.exercises||[]).length) content+=`<div class="card empty"><div class="empty-icon">＋</div><strong>No exercises in this session yet</strong><p>Add a movement from the library or edit your saved weekly plan.</p><button class="btn btn-soft" data-action="set-view" data-view="library">Open exercise library</button></div>`;
    else content+=(draft.exercises||[]).map((ex,ei)=>renderExerciseLogger(ex,ei,date)).join('');
    content+=`<div class="card"><label class="form-field">Session notes<textarea class="text-input text-area" data-field="session-notes" data-date="${date}" placeholder="How did today's workout feel?">${esc(draft.notes||'')}</textarea></label><div class="rule"></div><button class="btn btn-full" data-action="finish-session">Finish and save workout ✓</button><div style="height:8px"></div><button class="btn btn-outline btn-full" data-action="set-view" data-view="library">＋ Add exercise from library</button><div class="small muted" style="text-align:center;margin-top:10px">Only sets you tick as done count toward progress.</div></div>`;
    return content;
  }
  function renderPlanMini(plan){return (plan.exercises||[]).map((p,i)=>{const ex=exerciseById(p.id);return `<div class="row" style="padding:8px 0"><span class="exercise-symbol">${EXERCISE_ICONS[ex.muscle]||'🏋️'}</span><div class="grow"><div class="weight-bold">${esc(ex.name)}</div><div class="small muted">${p.sets} sets × ${esc(p.reps)} reps · ${p.rest||90}s rest</div></div><span class="small muted">${i+1}</span></div>`}).join('');}
  function renderExerciseLogger(ex,ei,date){
    const sets=ex.sets||[];const completed=sets.filter(s=>s.done).length;
    return `<div class="exercise-card"><div class="exercise-top"><div class="row" style="align-items:flex-start"><span class="exercise-symbol">${EXERCISE_ICONS[ex.muscle]||'🏋️'}</span><div class="grow"><div class="exercise-title">${esc(ex.name||exerciseById(ex.id).name)}</div><div class="exercise-meta">${esc(ex.muscle||exerciseById(ex.id).muscle)} · Target ${esc(ex.targetSets||sets.length)} × ${esc(ex.targetReps||'')}</div></div></div><span class="chip ${completed===sets.length&&sets.length?'chip-green':''}">${completed}/${sets.length}</span></div>${ex.muscle==='Cardio'?`<div class="form-grid" style="margin-top:14px"><label class="form-field">Distance (km)<input class="field compact" type="number" min="0" step="0.1" inputmode="decimal" value="${esc(ex.distance??'')}" placeholder="0.0" data-field="cardio-distance" data-date="${date}" data-ex="${ei}"></label><label class="form-field">Duration (min)<input class="field compact" type="number" min="0" step="1" inputmode="numeric" value="${esc(ex.duration??'')}" placeholder="0" data-field="cardio-duration" data-date="${date}" data-ex="${ei}"></label></div>`:''}<div class="set-header"><span>Set</span><span>Weight (${unit()})</span><span>Reps</span><span>Done</span></div>${sets.map((s,si)=>`<div class="set-row"><span class="set-no">${si+1}</span><input class="field compact" type="number" min="0" step="0.5" inputmode="decimal" aria-label="Set ${si+1} weight" placeholder="—" value="${esc(kgToDisplay(s.weight))}" data-field="set-weight" data-date="${date}" data-ex="${ei}" data-set="${si}"><input class="field compact" type="number" min="0" step="1" inputmode="numeric" aria-label="Set ${si+1} reps" value="${esc(s.reps??firstRep(ex.targetReps))}" data-field="set-reps" data-date="${date}" data-ex="${ei}" data-set="${si}"><button class="done-btn ${s.done?'checked':''}" aria-label="${s.done?'Mark incomplete':'Mark complete'}" data-action="toggle-set" data-date="${date}" data-ex="${ei}" data-set="${si}">${s.done?'✓':'○'}</button></div>`).join('')}<div class="exercise-actions"><button class="inline-link" data-action="add-set" data-date="${date}" data-ex="${ei}">＋ Add set</button><span class="small muted">Rest ${Number(ex.rest)||90}s</span><button class="inline-link" style="color:var(--red)" data-action="remove-exercise-from-draft" data-date="${date}" data-ex="${ei}">Remove</button></div></div>`;
  }
  function renderRoutine(){
    const di=Number(state.editPlanDay)||0;const plan=state.plan[di]||{name:'Rest',rest:true,exercises:[]};
    return `${heading('Weekly plan','Make your own repeatable routine',`<button class="btn btn-outline btn-small" data-action="set-view" data-view="workout">Done</button>`)}
      <div class="notice">Set your usual plan once. FOR will preload these exercises every week. Rest days are normal and can be changed for a specific date from the workout screen.</div>
      <div class="day-strip">${DOW.map((d,i)=>`<button class="day-pill ${i===di?'active':''} ${state.plan[i]?.rest?'rest':''}" data-action="edit-plan-day" data-day="${i}"><span>${SHORT_DOW[i]}</span><strong>${i+1}</strong><span>${state.plan[i]?.rest?'Rest':esc(state.plan[i]?.name||'Train')}</span></button>`).join('')}</div>
      <div class="card"><label class="form-field">Day name<input class="text-input" data-field="plan-day-name" data-day="${di}" value="${esc(plan.name)}" placeholder="e.g. Push A"></label><label class="row" style="margin-top:14px"><input type="checkbox" data-field="plan-day-rest" data-day="${di}" ${plan.rest?'checked':''} style="accent-color:var(--green);width:18px;height:18px"><span><strong>Make this a rest day</strong><span class="small muted" style="display:block">No workout is expected on this day.</span></span></label></div>
      ${plan.rest?`<div class="rest-banner"><div class="rest-icon">🌿</div><h3>Recovery day</h3><p>Rest is intentionally planned. No streak will be lost.</p></div>`:`<div class="section-title">Exercises for ${esc(plan.name)} <small>${plan.exercises.length} movements</small></div><div class="card">${plan.exercises.length?plan.exercises.map((p,i)=>{const ex=exerciseById(p.id);return `<div class="row" style="padding:10px 0;border-bottom:1px solid var(--line);align-items:flex-start"><span class="exercise-symbol">${EXERCISE_ICONS[ex.muscle]||'🏋️'}</span><div class="grow"><div class="weight-bold">${esc(ex.name)}</div><div class="small muted">${esc(ex.muscle)} · ${esc(ex.focus)}</div><div class="form-grid" style="margin-top:8px"><label class="form-field">Sets<input class="text-input" type="number" min="1" max="20" value="${p.sets}" data-field="plan-item-sets" data-day="${di}" data-index="${i}"></label><label class="form-field">Target reps<input class="text-input" value="${esc(p.reps)}" data-field="plan-item-reps" data-day="${di}" data-index="${i}"></label></div><label class="form-field" style="margin-top:8px">Rest (seconds)<input class="text-input" type="number" min="0" max="900" value="${p.rest||90}" data-field="plan-item-rest" data-day="${di}" data-index="${i}"></label></div><button class="icon-btn" aria-label="Remove exercise" data-action="remove-plan-item" data-day="${di}" data-index="${i}">×</button></div>`}).join(''):`<div class="empty"><div class="empty-icon">＋</div><strong>No exercises yet</strong><p>Add exercises to this training day below.</p></div>`}</div>
      <div class="card"><div class="weight-bold">Add an exercise</div><div class="form-stack" style="margin-top:12px"><label class="form-field">Exercise<select id="planExerciseSelect" class="text-input">${allExercises().slice().sort((a,b)=>a.name.localeCompare(b.name)).map(e=>`<option value="${e.id}">${esc(e.name)} · ${esc(e.muscle)}</option>`).join('')}</select></label><div class="form-grid"><label class="form-field">Sets<input id="planExerciseSets" type="number" class="text-input" min="1" max="20" value="3"></label><label class="form-field">Target reps<input id="planExerciseReps" class="text-input" value="8–12"></label></div><button class="btn btn-full" data-action="add-plan-exercise" data-day="${di}">＋ Add to ${esc(plan.name)}</button></div></div>`}
      <button class="btn btn-outline btn-full" data-action="restore-default-plan">Restore starter PPL plan</button><div class="footer-note">Your plan is stored on this device. Export backups from More → Backup & settings.</div>`;
  }
  function renderProgress(){
    const period=state.progressPeriod||'3m';const logs=currentStatsForRange(period);const range=logs.map(([,l])=>l);const stats={workouts:range.length,volume:range.reduce((s,l)=>s+sessionVolume(l),0),sets:range.reduce((s,l)=>s+setCount(l),0),reps:range.reduce((s,l)=>s+totalReps(l),0)};
    let options=allExercises().filter(e=>workLogs().some(([,l])=>(l.exercises||[]).some(x=>x.id===e.id))).sort((a,b)=>a.name.localeCompare(b.name));if(!options.length)options=[exerciseById(state.progressExercise||'barbell-bench-press')];if(!options.some(e=>e.id===state.progressExercise))state.progressExercise=options[0].id;
    const hist=weightHistory(state.progressExercise,period);const pr=allPRs();const prList=Object.values(pr).sort((a,b)=>b.weight-a.weight).slice(0,6);
    return `${heading('Progress','Your numbers, trends and personal records')}
      <div class="grid-2">${metricCard('🏋️','Workouts',String(stats.workouts),'Selected period')}${metricCard('▤','Volume',fmtVolume(stats.volume),'Completed sets')}${metricCard('✓','Sets',String(stats.sets),'Logged as done')}${metricCard('↗','Reps',String(stats.reps),'Completed reps')}${metricCard('🏃','Distance',formatDistance(stats.distance),'Cardio logged')}</div>
      <div class="section-title">Trends <small>Choose an exercise</small></div><div class="card"><div class="tabs">${[['3m','3M'],['6m','6M'],['1y','1Y'],['all','All']].map(([id,label])=>`<button class="${period===id?'active':''}" data-action="set-progress-period" data-period="${id}">${label}</button>`).join('')}</div><label class="form-field" style="margin-top:14px">Exercise<select class="text-input" data-field="progress-exercise">${options.map(e=>`<option value="${e.id}" ${e.id===state.progressExercise?'selected':''}>${esc(e.name)}</option>`).join('')}</select></label><div class="rule"></div><div class="row-between"><div><div style="font-size:27px;font-weight:850;letter-spacing:-.8px">${hist.length?fmtWeight(Math.max(...hist.map(x=>x.value))):'—'}</div><div class="small muted">${hist.length?`Best logged in ${period==='all'?'all time':period.toUpperCase()}`:'No sets logged for this exercise yet'}</div></div><div class="chart-legend"><span class="legend-dot"></span>Best weight per session</div></div><div class="chart-wrap">${renderLineChart(hist)}</div></div>
      <div class="section-title">Personal records <small>${Object.keys(pr).length} exercises</small></div><div class="card">${prList.length?prList.map(p=>`<div class="friend-pr"><div class="row"><span class="exercise-symbol">${EXERCISE_ICONS[exerciseById(p.id).muscle]||'🏋️'}</span><div><div class="weight-bold">${esc(p.name)}</div><div class="small muted">${p.reps?`${p.reps} reps · `:''}${fmtDate(p.date)}</div></div></div><div style="text-align:right"><div class="weight-bold">${fmtWeight(p.weight)}</div><div class="tiny muted">best logged set</div></div></div>`).join(''):`<div class="empty"><div class="empty-icon">🏅</div><strong>Your PR board is waiting</strong><p>Log and complete sets with weight values. FOR will calculate your personal records automatically.</p><button class="btn btn-soft" data-action="set-view" data-view="workout">Log a workout</button></div>`}</div>
      <div class="section-title">Muscle distribution <small>Training volume</small></div><div class="card">${renderMuscleDistribution(logs)}</div>
      <div class="section-title">Calendar</div><div class="card"><div class="row-between"><button class="icon-btn" data-action="calendar-shift" data-shift="-1">‹</button><div class="weight-bold">${calendarWeekLabel(state.calendarOffset||0)}</div><button class="icon-btn" data-action="calendar-shift" data-shift="1">›</button></div><div style="height:12px"></div>${renderCalendarWeek(state.calendarOffset||0)}<div class="row" style="justify-content:center;gap:14px;margin-top:12px"><span class="small muted">🟢 Workout</span><span class="small muted">🟠 Rest</span><span class="small muted">⚪ No log</span></div></div>`;
  }
  function renderLineChart(hist){if(!hist.length)return `<div class="empty" style="padding:30px 10px"><div class="empty-icon">〰️</div><strong>No progress curve yet</strong><p>Complete a few workouts with this exercise to see the trend line.</p></div>`;const vals=hist.map(x=>state.settings.unit==='lb'?x.value*2.2046226218:x.value);const min=Math.min(...vals),max=Math.max(...vals),pad=(max-min)||Math.max(5,max*.08);const lo=Math.max(0,min-pad*.15),hi=max+pad*.15;const w=320,h=140,pl=24,pr=10,pt=16,pb=25;const points=vals.map((v,i)=>({x:pl+(hist.length===1?.5:i/(hist.length-1))*(w-pl-pr),y:pt+(1-(v-lo)/(hi-lo||1))*(h-pt-pb)}));const pointStr=points.map(p=>`${p.x},${p.y}`).join(' ');const grid=[0,.5,1].map(t=>{const y=pt+t*(h-pt-pb);return `<line x1="${pl}" y1="${y}" x2="${w-pr}" y2="${y}" stroke="#e7ece7" stroke-dasharray="3 4"/>`}).join('');return `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Exercise weight trend line">${grid}<polyline points="${pointStr}" fill="none" stroke="#20815e" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>${points.map((p,i)=>`<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#fff" stroke="#20815e" stroke-width="2"><title>${esc(fmtDate(hist[i].date))}: ${esc(fmtWeight(hist[i].value))}</title></circle>`).join('')}</svg><div class="chart-labels"><span>${esc(fmtDate(hist[0].date))}</span><span>${esc(fmtDate(hist[hist.length-1].date))}</span></div>`;}
  function renderMuscleDistribution(logs){const totals={};for(const [,log] of logs){for(const ex of log.exercises||[]){const muscle=ex.muscle||exerciseById(ex.id).muscle;totals[muscle]=(totals[muscle]||0)+(ex.sets||[]).filter(s=>s.done).length;}}const sorted=Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,8);if(!sorted.length)return `<div class="empty"><div class="empty-icon">💪</div><strong>No muscle data yet</strong><p>Complete a few sessions to see how your sets are distributed across muscle groups.</p></div>`;const max=sorted[0][1]||1;return sorted.map(([name,count])=>`<div style="margin:12px 0"><div class="row-between small"><span class="weight-bold">${esc(name)}</span><span class="muted">${count} sets</span></div><div class="progress-track" style="margin-top:6px"><div class="progress-fill" style="width:${count/max*100}%"></div></div></div>`).join('');}
  function calendarStart(offset){const now=parseDate(todayISO());const start=new Date(now);start.setDate(now.getDate()-((now.getDay()+6)%7)+offset*7);return localDate(start);}
  function calendarWeekLabel(offset){const start=calendarStart(offset),end=plusDays(start,6);return `${SHORT_MONTH[parseDate(start).getMonth()]} ${parseDate(start).getDate()} – ${SHORT_MONTH[parseDate(end).getMonth()]} ${parseDate(end).getDate()}`;}
  function renderCalendarWeek(offset){const start=calendarStart(offset),days=[];for(let i=0;i<7;i++){const iso=plusDays(start,i),plan=dayPlanForDate(iso),trained=dateIsDone(iso),selected=state.selectedDate===iso;days.push(`<button class="calendar-cell ${trained?'trained':''} ${plan.rest?'restday':''} ${selected?'selected':''}" data-action="select-date" data-date="${iso}"><div class="cal-day">${SHORT_DOW[dateDay(iso)]}</div><div class="cal-date">${parseDate(iso).getDate()}</div><div class="cal-mark"></div></button>`);}return `<div class="week-grid">${days.join('')}</div>`;}
  function renderLibrary(){
    const query=(state.librarySearch||'').toLowerCase().trim(),filter=state.libraryFilter||'All';
    const base=allExercises().filter(e=>filter==='All'||e.muscle===filter);
    const regions=['All regions',...Array.from(new Set(base.map(e=>e.focus).filter(Boolean))).sort((a,b)=>a.localeCompare(b))];
    if(!regions.includes(state.libraryFocus))state.libraryFocus='All regions';
    const focus=state.libraryFocus||'All regions';
    const list=base.filter(e=>(focus==='All regions'||e.focus===focus)&&(!query||[e.name,e.muscle,e.focus,e.equipment].join(' ').toLowerCase().includes(query)));
    const categories=['All',...Array.from(new Set(allExercises().map(e=>e.muscle))).sort()];
    return `${heading('Exercise library','Browse by muscle group, exact region or equipment')}
      <div class="card"><label class="form-field">Search exercises<input class="text-input" id="librarySearch" data-field="library-search" placeholder="e.g. upper chest, lateral delts, cable" value="${esc(state.librarySearch||'')}"></label>
      <div class="filter-row" style="margin-top:10px">${categories.map(c=>`<button class="filter-chip ${filter===c?'active':''}" data-action="library-filter" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <div class="small muted" style="margin:4px 0 7px">Target region / sub-region</div><div class="filter-row">${regions.map(c=>`<button class="filter-chip ${focus===c?'active':''}" data-action="library-focus" data-focus="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <div class="small muted">${list.length} movements · select ＋ to add one to this weekday's plan</div><div class="rule"></div>${list.length?list.map(e=>`<div class="library-item"><div class="exercise-symbol">${EXERCISE_ICONS[e.muscle]||'🏋️'}</div><div class="grow"><div class="weight-bold">${esc(e.name)}</div><div class="small muted">${esc(e.muscle)} · ${esc(e.focus)}</div><div class="tiny muted">${esc(e.equipment)}${e.custom?' · Custom':''}</div></div><button class="library-add" aria-label="Add to today's routine" data-action="add-library-to-plan" data-exercise="${e.id}">＋</button></div>`).join(''):`<div class="empty"><div class="empty-icon">⌕</div><strong>No matches</strong><p>Try another region or search term, or add a custom exercise below.</p></div>`}</div>
      <div class="card"><div class="weight-bold">Add your own exercise</div><p class="small muted">Create movements or variations not already in the library.</p><form data-form="custom-exercise" class="form-stack"><label class="form-field">Exercise name<input name="name" class="text-input" required maxlength="70" placeholder="e.g. Smith machine incline press"></label><div class="form-grid"><label class="form-field">Muscle group<select name="muscle" class="text-input">${['Chest','Back','Shoulders','Biceps','Triceps','Quads','Hamstrings','Glutes','Calves','Abs','Forearms','Cardio','Other'].map(x=>`<option>${x}</option>`).join('')}</select></label><label class="form-field">Target region<input name="focus" class="text-input" placeholder="e.g. Upper chest"></label></div><label class="form-field">Equipment<input name="equipment" class="text-input" placeholder="e.g. Cable"></label><button class="btn btn-full">Save custom exercise</button></form></div>`;
  }
  function renderMore(){return `${heading('More','Manage the rest of your training toolkit')}<div class="more-grid">${[
      ['supplements','💊','Supplements','Dose times and reminders'],['body','⚖️','Body & photos','Weight, body fat, progress photos'],['nutrition','🥗','Daily health log','Steps, sleep, calories, protein'],['calendar','🗓️','Training calendar','Workouts and rest days'],['friends','👥','Friends','Share and compare snapshots'],['account','🙂','Account','Your local profile'],['settings','⚙️','Backup & settings','Export data, units, restore'],['routine','📋','Weekly plan','Edit your repeating routine']
    ].map(([view,icon,title,sub])=>`<button class="menu-card" data-action="set-view" data-view="${view}"><span class="menu-icon">${icon}</span><span><span class="menu-title">${title}</span><span class="menu-sub" style="display:block">${sub}</span></span></button>`).join('')}</div><div class="notice" style="margin-top:17px"><strong>Local-first mode.</strong> FOR currently saves to this device. Cloud accounts and live friend syncing will be connected in a later phase.</div><div class="footer-note">FOR · Fitness. Ownership. Results.</div>`;}
  function renderSupplements(){
    const date=state.selectedDate||todayISO(),di=dateDay(date);
    const eligible=state.supplements.filter(s=>(s.days||[0,1,2,3,4,5,6]).includes(di));
    return `${heading('Supplements',fmtLongDate(date),`<button class="btn btn-outline btn-small" data-action="enable-notifications">Enable alerts</button>`)}
      <div class="notice notice-warn">${window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform() ? 'Android builds can schedule reminders with the device notification system. Delivery still depends on notification/exact-alarm permissions and battery settings.' : 'Browser reminders are best-effort while FOR is open or recently active. Android may pause browser notifications in the background.'}</div>
      <div class="card"><div class="weight-bold">Today's schedule</div><p class="small muted">Log a dose as Taken, Skip it, or snooze the reminder for 30 minutes.</p>
      ${eligible.length?eligible.slice().sort((a,b)=>(a.time||'').localeCompare(b.time||'')).map(s=>{
        const key=`${date}_${s.id}`,status=state.supplementLogs[key],until=Number(state.snoozedUntil?.[key]||0);
        const statusLabel=status==='taken'?'Taken':status==='skip'?'Skipped':status==='snoozed'?(until?`Snoozed · ${new Date(until).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`:'Snoozed'):'Pending';
        const statusClass=status==='taken'?'chip-green':status==='skip'?'chip-red':status==='snoozed'?'chip-orange':'';
        return `<div class="supplement-card"><div class="supplement-icon">💊</div><div class="grow"><div class="weight-bold">${esc(s.name)}</div><div class="small muted">${esc(s.dose||'Dose not set')} · ${esc(s.time||'Time not set')}</div><div style="margin-top:6px"><span class="chip ${statusClass}">${statusLabel}</span></div><div class="supplement-actions"><button class="btn btn-soft btn-small" data-action="dose-status" data-id="${s.id}" data-status="taken" data-date="${date}">Taken</button><button class="btn btn-outline btn-small" data-action="dose-status" data-id="${s.id}" data-status="skip" data-date="${date}">Skip</button><button class="btn btn-outline btn-small" data-action="dose-status" data-id="${s.id}" data-status="snoozed" data-date="${date}">Snooze 30m</button></div></div></div>`;
      }).join(''):`<div class="empty"><div class="empty-icon">💊</div><strong>No supplements for this day</strong><p>Add a supplement below and choose its active days.</p></div>`}</div>
      <div class="section-title">Your supplements <small>${state.supplements.length} total</small></div><div class="card">${state.supplements.length?state.supplements.map(s=>`<div class="supplement-card"><div class="supplement-icon">💊</div><div class="grow"><div class="weight-bold">${esc(s.name)}</div><div class="small muted">${esc(s.dose||'Dose not set')} · ${esc(s.time||'Time not set')}</div><div class="tiny muted">${(s.days||[]).map(d=>SHORT_DOW[d]).join(', ')||'No days selected'}</div></div><label class="small"><input type="checkbox" data-field="supplement-enabled" data-id="${s.id}" ${s.enabled!==false?'checked':''} style="accent-color:var(--green)"> On</label><button class="icon-btn" data-action="delete-supplement" data-id="${s.id}">×</button></div>`).join(''):`<div class="empty"><div class="empty-icon">＋</div><strong>No supplements added</strong><p>Create your schedule here.</p></div>`}</div>
      <div class="card"><div class="weight-bold">Add a supplement</div><form class="form-stack" data-form="supplement" style="margin-top:12px"><label class="form-field">Name<input name="name" class="text-input" required maxlength="70" placeholder="e.g. Creatine"></label><label class="form-field">Dose / note<input name="dose" class="text-input" maxlength="80" placeholder="As directed on the product label"></label><label class="form-field">Reminder time<input type="time" name="time" class="text-input" required value="08:00"></label><div class="form-field">Active days<div class="day-checks">${SHORT_DOW.map((d,i)=>`<label class="day-check"><input type="checkbox" name="days" value="${i}" checked>${d}</label>`).join('')}</div></div><button class="btn btn-full">＋ Add supplement</button></form></div><div class="small muted">Reminder timing is for helping you follow your own schedule; supplement dosing should follow the product label or clinician advice.</div>`;
  }
  function renderBody(){const weights=state.metrics.weight.slice().sort((a,b)=>b.date.localeCompare(a.date)),fats=state.metrics.fat.slice().sort((a,b)=>b.date.localeCompare(a.date));return `${heading('Body & photos','Track measurements consistently over time')}<div class="grid-2">${metricCard('⚖️','Latest weight',weights[0]?fmtWeight(weights[0].value):'—',weights[0]?fmtDate(weights[0].date):'No entry')}${metricCard('◒','Body fat',fats[0]?`${Number(fats[0].value).toFixed(1)}%`:'—',fats[0]?fmtDate(fats[0].date):'No entry')}</div>
    <div class="card"><div class="weight-bold">Add a measurement</div><form class="form-stack" data-form="body-metric" style="margin-top:12px"><div class="form-grid"><label class="form-field">Metric<select name="type" class="text-input"><option value="weight">Weight (${unit()})</option><option value="fat">Body fat (%)</option></select></label><label class="form-field">Date<input type="date" name="date" class="text-input" value="${todayISO()}" required></label></div><label class="form-field">Value<input name="value" type="number" inputmode="decimal" step="0.1" min="0" class="text-input" required placeholder="Enter measurement"></label><button class="btn btn-full">Save measurement</button></form></div>
    <div class="section-title">Measurement history</div><div class="card">${weights.length||fats.length?`<div class="weight-bold">Weight</div>${weights.slice(0,8).map(x=>`<div class="row-between" style="padding:8px 0;border-bottom:1px solid var(--line)"><span class="small muted">${fmtDate(x.date)}</span><span class="weight-bold">${fmtWeight(x.value)}</span></div>`).join('')}<div class="rule"></div><div class="weight-bold">Body fat</div>${fats.slice(0,8).map(x=>`<div class="row-between" style="padding:8px 0;border-bottom:1px solid var(--line)"><span class="small muted">${fmtDate(x.date)}</span><span class="weight-bold">${Number(x.value).toFixed(1)}%</span></div>`).join('')}`:`<div class="empty"><div class="empty-icon">📈</div><strong>No measurements yet</strong><p>Enter a value to start building your history. We do not estimate missing measurements.</p></div>`}</div>
    <div class="section-title">Progress photos <small>Private on this device</small></div><div class="card"><label class="form-field">Add a progress photo<input id="photoInput" type="file" accept="image/*" capture="environment" class="text-input" style="padding:9px" /></label><div class="form-grid" style="margin-top:10px"><label class="form-field">Pose<select id="photoPose" class="text-input"><option>Front</option><option>Side</option><option>Back</option><option>Front flexed</option><option>Side flexed</option><option>Back flexed</option><option>Other</option></select></label><label class="form-field">Date<input id="photoDate" type="date" class="text-input" value="${todayISO()}"></label></div><div class="small muted" style="margin:8px 0 14px">Images are resized before saving. Keep a backup of important data, and do not publish photos you want private.</div>${state.metrics.photos.length?`<div class="photo-grid">${state.metrics.photos.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(p=>`<div class="photo-tile"><img src="${p.data}" alt="${esc(p.pose)} progress photo"><span class="photo-label">${esc(p.pose)} · ${esc(fmtDate(p.date))}</span><button class="photo-delete" data-action="delete-photo" data-id="${p.id}">×</button></div>`).join('')}</div>`:`<div class="empty"><div class="empty-icon">📷</div><strong>No photos yet</strong><p>Add optional comparison photos. They remain in local browser storage.</p></div>`}</div>`;}
  function renderNutrition(){const date=state.selectedDate||todayISO(),v=state.dailyStats[date]||{};return `${heading('Daily health log',fmtLongDate(date))}<div class="notice">This version uses manual entries. Automatic step/sleep import from Android Health Connect is a later integration.</div><div class="card"><div class="weight-bold">Log your day</div><form data-form="daily" class="form-stack" style="margin-top:12px"><label class="form-field">Date<input type="date" name="date" class="text-input" value="${date}" required></label><div class="form-grid"><label class="form-field">Steps<input type="number" name="steps" min="0" step="1" inputmode="numeric" class="text-input" value="${esc(v.steps??'')}" placeholder="e.g. 6500"></label><label class="form-field">Sleep (hours)<input type="number" name="sleep" min="0" max="24" step="0.25" inputmode="decimal" class="text-input" value="${esc(v.sleep??'')}" placeholder="e.g. 7.5"></label><label class="form-field">Calories (kcal)<input type="number" name="calories" min="0" step="1" class="text-input" value="${esc(v.calories??'')}" placeholder="Optional"></label><label class="form-field">Protein (g)<input type="number" name="protein" min="0" step="1" class="text-input" value="${esc(v.protein??'')}" placeholder="Optional"></label></div><label class="form-field">Daily step goal<input type="number" name="stepGoal" min="0" step="500" class="text-input" value="${esc(v.stepGoal??8000)}"></label><button class="btn btn-full">Save daily log</button></form></div><div class="grid-2">${metricCard('👟','Steps',Number(v.steps||0).toLocaleString(),`Goal ${(v.stepGoal||8000).toLocaleString()}`)}${metricCard('☾','Sleep',v.sleep?`${v.sleep}h`:'—','Target 8h')}${metricCard('🔥','Calories',v.calories?Number(v.calories).toLocaleString():'—','kcal')}${metricCard('🥚','Protein',v.protein?`${v.protein} g`:'—','grams')}</div>`;}
  function renderFriends(){const stats=overallStats(),prs=allPRs();return `${heading('Friends','Share and compare without paying for cloud hosting')}<div class="notice"><strong>Current mode: snapshot sharing.</strong> Each person can track privately on their own phone. Export a snapshot and send it to your friend; import their latest snapshot here to compare. It will not sync live until cloud accounts are connected.</div><div class="card"><div class="weight-bold">Sharing privacy</div><p class="small muted">Choose what to include when you manually export your next friend snapshot. Photos, body measurements, nutrition logs and supplement records are never included.</p><label class="row" style="padding:7px 0"><input type="checkbox" data-field="friend-share-name" ${state.settings.friendShareName!==false?'checked':''} style="accent-color:var(--green)"><span>Share my display name</span></label><label class="row" style="padding:7px 0"><input type="checkbox" data-field="friend-share-username" ${state.settings.friendShareUsername!==false?'checked':''} style="accent-color:var(--green)"><span>Share my username</span></label><label class="row" style="padding:7px 0"><input type="checkbox" data-field="friend-share-prs" ${state.settings.friendSharePRs!==false?'checked':''} style="accent-color:var(--green)"><span>Share my personal records</span></label><div class="small muted" style="margin-top:8px">These settings apply to future exports only. Snapshots are static files, not live connections.</div></div><div class="card"><div class="profile-big">${profileAvatar()}<div class="grow"><div class="weight-bold" style="font-size:18px">${esc(state.profile.name||'Athlete')}</div><div class="small muted">${esc(state.profile.username?'@'+state.profile.username:'Set a username in Account')}</div><div class="small muted">${stats.workouts} workouts · ${Object.keys(prs).length} PRs</div></div></div><button class="btn btn-full" style="margin-top:15px" data-action="export-friend">Export my friend snapshot</button></div>
    <div class="card"><div class="weight-bold">Add / update a friend</div><p class="small muted">Import a FOR friend snapshot JSON that your friend sent you. Ask them to export a new snapshot when you want updated stats.</p><label class="btn btn-outline btn-full" for="friendFile">Choose friend snapshot file</label><input id="friendFile" type="file" accept="application/json,.json" style="display:none"></div>
    <div class="section-title">Your friends <small>${state.friends.length}</small></div>${state.friends.length?state.friends.map(f=>{const fs=f.stats||{};const my=overallStats();return `<div class="card"><div class="row-between"><div class="row"><div class="avatar">${esc((f.name||'F').slice(0,1).toUpperCase())}</div><div><div class="weight-bold">${esc(f.name||'Friend')}</div><div class="small muted">Snapshot imported ${esc(fmtDate(f.importedAt||todayISO()))}</div></div></div><button class="icon-btn" data-action="remove-friend" data-id="${f.id}">×</button></div><div class="grid-2" style="margin-top:14px"><div class="metric-card"><div class="metric-caption">Workouts</div><div class="metric-value">${Number(fs.workouts||0)}</div><div class="small muted">You: ${my.workouts}</div></div><div class="metric-card"><div class="metric-caption">Training volume</div><div class="metric-value" style="font-size:17px">${Number(fs.volume||0).toLocaleString()} kg</div><div class="small muted">You: ${Math.round(my.volume).toLocaleString()} kg</div></div><div class="metric-card"><div class="metric-caption">Logged sets</div><div class="metric-value">${Number(fs.sets||0)}</div><div class="small muted">You: ${my.sets}</div></div><div class="metric-card"><div class="metric-caption">PRs</div><div class="metric-value">${Object.keys(f.prs||{}).length}</div><div class="small muted">You: ${Object.keys(prs).length}</div></div></div><div class="rule"></div><div class="weight-bold">Their top records</div>${Object.values(f.prs||{}).sort((a,b)=>Number(b.weight)-Number(a.weight)).slice(0,4).map(p=>`<div class="friend-pr"><span class="small">${esc(p.name)}</span><strong>${Number(p.weight||0).toFixed(1)} kg</strong></div>`).join('')||'<div class="small muted">No personal records included.</div>'}</div>`}).join(''):`<div class="card empty"><div class="empty-icon">👥</div><strong>No friends added yet</strong><p>Export your snapshot and share it. Your friend can do the same, then import their file here.</p></div>`}
    <div class="small muted" style="padding:4px 5px">Friend snapshots contain workout totals and personal-record summaries, not your progress photos or daily body measurements.</div>`;}
  function friendSnapshot(){const stats=overallStats(),prs=allPRs();return {format:'FOR-friend-snapshot',version:1,exportedAt:todayISO(),profile:{name:state.settings.friendShareName===false?'FOR Athlete':(state.profile.name||'Athlete'),username:state.settings.friendShareUsername===false?'':(state.profile.username||'')},stats,prs:state.settings.friendSharePRs===false?{}:Object.fromEntries(Object.entries(prs).map(([id,p])=>[id,{name:p.name,weight:Number(p.weight),reps:Number(p.reps)||0,date:p.date}])),sharing:{name:state.settings.friendShareName!==false,username:state.settings.friendShareUsername!==false,personalRecords:state.settings.friendSharePRs!==false},note:'FOR friend snapshot. This file contains only the selected profile details, workout totals and (optionally) PR summaries. It will not sync automatically.'};}
  function renderAccount(){const stats=overallStats();return `${heading('Account','Your profile on this device')}<div class="card"><div class="profile-big">${profileAvatar()}<div class="grow"><div style="font-size:19px;font-weight:850">${esc(state.profile.name||'Athlete')}</div><div class="small muted">${esc(state.profile.username?'@'+state.profile.username:'No username set')}</div><div class="small muted">Local profile · ${stats.workouts} workouts recorded</div></div></div><div class="rule"></div><div class="weight-bold">Profile picture</div><p class="small muted" style="margin:5px 0 12px">Choose a photo from your phone's gallery or camera. It stays on this device and is included in your local backup.</p><input id="profilePhotoInput" type="file" accept="image/*" class="visually-hidden" aria-label="Choose profile picture"><div class="grid-2"><button class="btn btn-outline" data-action="choose-profile-photo">${state.profile.avatar?'Change picture':'＋ Add picture'}</button>${state.profile.avatar?'<button class="btn btn-danger" data-action="remove-profile-photo">Remove picture</button>':'<div class="profile-hint">JPG or PNG</div>'}</div></div><div class="card"><div class="weight-bold">Edit profile</div><form data-form="profile" class="form-stack" style="margin-top:12px"><label class="form-field">Display name<input class="text-input" name="name" required maxlength="45" value="${esc(state.profile.name||'Athlete')}"></label><label class="form-field">Username (optional)<input class="text-input" name="username" maxlength="24" pattern="[A-Za-z0-9_]*" value="${esc(state.profile.username||'')}" placeholder="e.g. rishi_lifts"></label><button class="btn btn-full">Save profile</button></form></div><div class="card"><div class="weight-bold">Your training totals</div><div class="grid-2" style="margin-top:10px">${metricCard('🏋️','Workouts',stats.workouts,'All time')}${metricCard('🏅','PRs',Object.keys(allPRs()).length,'Tracked exercises')}</div><button class="btn btn-soft btn-full" style="margin-top:12px" data-action="export-backup">Export full backup</button></div><div class="notice">This is not an online login yet. The profile stays in this browser. Cloud sign-in and syncing will be connected in a later phase.</div>`;}
  function renderSettings(){return `${heading('Backup & settings','Protect your data and choose preferences')}<div class="card theme-card"><div class="row-between"><div><div class="weight-bold">Appearance</div><div class="small muted" style="margin-top:4px">Choose the FOR light or dark theme.</div></div><span class="theme-symbol">${state.settings.theme==='dark'?'☾':'☀'}</span></div><button class="btn btn-full" style="margin-top:13px" data-action="toggle-theme">Switch to ${state.settings.theme==='dark'?'light':'dark'} theme</button></div><div class="card"><div class="weight-bold">Units</div><p class="small muted">All recorded weights are stored internally in kg. Changing this option converts the displayed values, not the saved records.</p><div class="tabs">${['kg','lb'].map(u=>`<button class="${unit()===u?'active':''}" data-action="set-unit" data-unit="${u}">${u.toUpperCase()}</button>`).join('')}</div><div class="rule"></div><label class="form-field">Default rest timer (seconds)<input id="restTimerInput" class="text-input" type="number" min="0" max="900" value="${state.settings.restTimer||90}"></label><button class="btn btn-soft btn-full" style="margin-top:12px" data-action="save-settings">Save settings</button></div>
    <div class="card"><div class="weight-bold">Data backup</div><p class="small muted">Export saves your profile, routine, workout logs, supplement schedule, daily logs and measurements as a JSON file. Photos can increase file size.</p><div class="grid-2"><button class="btn btn-full" data-action="export-backup">Export backup</button><label class="btn btn-outline btn-full" for="backupFile">Restore backup</label></div><input id="backupFile" type="file" accept="application/json,.json" style="display:none"><div class="small muted" style="margin-top:10px">Restoring replaces the current FOR data on this device. Export a backup before restoring.</div></div>
    <div class="card"><div class="weight-bold">What is local-first?</div><p class="small muted">In this version, your information stays in browser storage on this device. It is not uploaded anywhere. Clearing browser data can remove it, so keep a backup in a safe place.</p></div><div class="card danger-zone"><div class="weight-bold" style="color:var(--red)">Reset this device's FOR data</div><p class="small muted">This permanently clears the records stored in this browser. Export a backup first if you may need them.</p><button class="btn btn-danger btn-full" data-action="reset-data">Reset all local data</button></div>`;}
  function renderCalendar(){const offset=state.calendarOffset||0,start=calendarStart(offset);return `${heading('Training calendar','Training and rest are both valid plan states')}<div class="card"><div class="row-between"><button class="icon-btn" data-action="calendar-shift" data-shift="-1">‹</button><div class="weight-bold">${calendarWeekLabel(offset)}</div><button class="icon-btn" data-action="calendar-shift" data-shift="1">›</button></div><div style="height:13px"></div>${renderCalendarWeek(offset)}<div class="rule"></div><div class="grid-2"><button class="btn btn-outline" data-action="select-date" data-date="${todayISO()}">Go to today</button><button class="btn btn-soft" data-action="set-view" data-view="workout">Open selected day</button></div></div><div class="section-title">Dates this week</div><div class="card">${Array.from({length:7},(_,i)=>plusDays(start,i)).map(iso=>{const l=state.logs[iso],p=dayPlanForDate(iso);return `<button style="width:100%;text-align:left;background:transparent;border:0;border-bottom:1px solid var(--line);padding:11px 0" data-action="select-date" data-date="${iso}"><div class="row-between"><div><div class="weight-bold">${esc(fmtDate(iso))}</div><div class="small muted">${l?.type==='workout'?'Workout completed':p.rest?'Rest day':`${p.name} · ${p.exercises.length} exercises`}</div></div><span class="chip ${l?.type==='workout'?'chip-green':p.rest?'chip-orange':''}">${l?.type==='workout'?'Done':p.rest?'Rest':'Planned'}</span></div></button>`}).join('')}</div>`;}
  
  let authMode = 'login';
  let authMessage = '';
  let authMessageType = 'error';
  let pendingAuthEmail = '';
  let authUser = null;
  
  function renderAuthScreen() {
    const isSignup = authMode === 'signup';
    const isOtp = authMode === 'otp';

    const field = (label, name, type, placeholder, extra = '') => `
      <label class="form-field">
        ${label}
        <input class="text-input" name="${name}" type="${type}"
          placeholder="${placeholder}" ${extra} required>
      </label>`;

    const fields = isOtp
      ? field('8-digit email verification code', 'token', 'text',
          'Enter your OTP', 'inputmode="numeric" maxlength="8" autocomplete="one-time-code"')
      : `${isSignup ? field('Username', 'username', 'text',
          'Choose a username', 'minlength="3" maxlength="24" autocomplete="username"') : ''}
         ${field('Email address', 'email', 'email',
          'you@example.com', 'autocomplete="email"')}
         ${field('Password', 'password', 'password',
          'Enter your password', 'minlength="6" autocomplete="' +
          (isSignup ? 'new-password' : 'current-password') + '"')}`;

    const title = isOtp ? 'Verify your email'
      : isSignup ? 'Create your account' : 'Welcome back';

    const subtitle = isOtp
      ? `Enter the verification code sent to ${esc(pendingAuthEmail)}.`
      : isSignup
        ? 'Start your fitness journey with FOR.'
        : 'Sign in to continue your training.';

    return `
      <main style="min-height:100dvh;display:grid;place-items:center;
        padding:24px;background:var(--bg);">
        <section class="card" style="width:100%;max-width:420px;
          padding:24px;box-sizing:border-box;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:42px;font-weight:900;letter-spacing:-2px;">
              F<span style="color:var(--red);">O</span>R
            </div>
            <div class="small muted">FITNESS. OWNERSHIP. RESULTS.</div>
          </div>
          <h1 style="margin:0 0 8px;">${title}</h1>
          <p class="small muted">${subtitle}</p>
          ${authMessage ? `
            <div class="notice ${authMessageType === 'error' ? 'notice-warn' : ''}"
              role="status">${esc(authMessage)}</div>` : ''}
          <form data-form="auth-${authMode}" class="form-stack"
            style="margin-top:18px;">
            ${fields}
            <button class="btn btn-full" type="submit">
              ${isOtp ? 'Verify email' : isSignup ? 'Create account' : 'Log in'}
            </button>
          </form>
          ${isOtp ? `
            <button class="btn btn-outline btn-full" style="margin-top:10px;"
              data-action="auth-resend">Resend verification code</button>
            <button class="inline-link" style="margin-top:16px;"
              data-action="auth-back">Back to login</button>
          ` : `
            <p class="small" style="text-align:center;margin-top:18px;">
              ${isSignup ? 'Already have an account?' : 'New to FOR?'}
              <button type="button" class="inline-link"
                data-action="auth-switch" data-mode="${isSignup ? 'login' : 'signup'}">
                ${isSignup ? 'Log in' : 'Create account'}
              </button>
            </p>
          `}
        </section>
      </main>`;
  }
  
  function renderPage(){
  if (!authUser) {
    app.innerHTML = renderAuthScreen();
    return;
  }

  applyTheme();
  let content='';switch(state.view){case'home':content=renderHome();break;case'workout':content=renderWorkout();break;case'progress':content=renderProgress();break;case'library':content=renderLibrary();break;case'more':content=renderMore();break;case'routine':content=renderRoutine();break;case'supplements':content=renderSupplements();break;case'body':content=renderBody();break;case'nutrition':content=renderNutrition();break;case'friends':content=renderFriends();break;case'account':content=renderAccount();break;case'settings':content=renderSettings();break;case'calendar':content=renderCalendar();break;default:state.view='home';content=renderHome();}app.innerHTML=`<main class="page">${content}</main>`+bottomNav();}
  function go(view){state.view=view;save();renderPage();window.scrollTo({top:0,behavior:'smooth'});}
  function download(name,data,type='application/json'){const blob=new Blob([data],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);}
  function exportBackup(){const payload={format:'FOR-backup',version:1,exportedAt:new Date().toISOString(),data:state};download(`FOR-backup-${todayISO()}.json`,JSON.stringify(payload,null,2));notify('Backup exported. Keep it somewhere safe.');}
  function safeRestore(obj){let data=obj?.format==='FOR-backup'?obj.data:obj;if(!data||typeof data!=='object'||!data.plan||!data.logs)throw new Error('This does not look like a FOR backup.');const fresh=getDefaultState();state={...fresh,...data,profile:{...fresh.profile,...data.profile},metrics:{...fresh.metrics,...data.metrics},settings:{...fresh.settings,...data.settings}};save();syncNativeReminders();renderPage();notify('Backup restored on this device.');}
  function startSession(){const date=state.selectedDate||todayISO();if(state.logs[date]?.type==='rest')delete state.logs[date];if(state.logs[date]?.type==='workout'){state.drafts[date]=JSON.parse(JSON.stringify(state.logs[date]));}else ensureDraft(date);state.view='workout';save();renderPage();}
  function finishSession(){const date=state.selectedDate||todayISO(),draft=state.drafts[date];if(!draft){notify('Start a workout before finishing.');return;}if(setCount(draft)<1){notify('Mark at least one set as done before saving.');return;}const saved=JSON.parse(JSON.stringify(draft));saved.type='workout';saved.date=date;saved.completed=true;saved.completedAt=new Date().toISOString();state.logs[date]=saved;delete state.drafts[date];delete state.restOverrides[date];save();renderPage();notify('Workout saved. Nice work!');}
  function setRest(date){delete state.drafts[date];state.logs[date]={type:'rest',date,manual:true,completed:true};delete state.restOverrides[date];save();renderPage();notify('Rest day saved. Recovery counts.');}
  function trainAnyway(date){if(state.logs[date]?.type==='rest')delete state.logs[date];state.restOverrides[date]='workout';const d=draftFromPlan(date);if(!d.exercises.length){d.name='Workout';}state.drafts[date]=d;state.view='workout';save();renderPage();notify('Workout day opened. Add or adjust exercises as needed.');}
  function toggleSet(date,ei,si){const d=state.drafts[date];if(!d||!d.exercises[ei]?.sets[si])return;d.exercises[ei].sets[si].done=!d.exercises[ei].sets[si].done;save();renderPage();}
  function addSet(date,ei){const d=state.drafts[date];if(!d||!d.exercises[ei])return;const e=d.exercises[ei],last=e.sets[e.sets.length-1]||{weight:'',reps:firstRep(e.targetReps),done:false};e.sets.push({weight:last.weight,reps:last.reps,done:false});save();renderPage();notify('Set added.');}
  function removeFromDraft(date,ei){const d=state.drafts[date];if(!d)return;d.exercises.splice(ei,1);save();renderPage();}
  function ensurePlanDay(di){if(!state.plan[di])state.plan[di]={name:'Workout',rest:false,exercises:[]};if(!Array.isArray(state.plan[di].exercises))state.plan[di].exercises=[];return state.plan[di];}
  function addPlanExercise(di,id,sets=3,reps='8–12'){const p=ensurePlanDay(di);if(!p.exercises.some(x=>x.id===id))p.exercises.push({id,sets:Number(sets)||3,reps:String(reps||'8–12'),rest:90});p.rest=false;if(!p.name||p.name==='Rest')p.name='Workout';save();}
  function addLibraryToPlan(id){const date=state.selectedDate||todayISO(),di=dateDay(date);const p=ensurePlanDay(di);addPlanExercise(di,id,3,'8–12');if(p.restOverrides)delete p.restOverrides;notify(`${exerciseById(id).name} added to ${DOW[di]}'s plan.`);renderPage();}
  function handleClick(e){const el=e.target.closest('[data-action]');if(!el)return;const a=el.dataset.action;
    switch(a){
        
      case 'auth-switch':
        authMode = el.dataset.mode === 'signup' ? 'signup' : 'login';
        authMessage = '';
        app.innerHTML = renderAuthScreen();
        break;

      case 'auth-back':
        authMode = 'login';
        authMessage = '';
        app.innerHTML = renderAuthScreen();
        break;

      case 'auth-resend':
        (async () => {
          try {
            await resendEmailOtp({ email: pendingAuthEmail });
            authMessageType = 'success';
            authMessage = 'A new verification code has been requested.';
          } catch (error) {
            authMessageType = 'error';
            authMessage = error?.message || 'Could not resend the verification code.';
          }
          app.innerHTML = renderAuthScreen();
        })();
        break;
        
      case'set-view':go(el.dataset.view);break;
      case'toggle-theme':state.settings.theme=state.settings.theme==='dark'?'light':'dark';save();renderPage();notify(`${state.settings.theme==='dark'?'Dark':'Light'} theme enabled.`);break;
      case'choose-profile-photo':$('#profilePhotoInput')?.click();break;
      case'remove-profile-photo':state.profile.avatar='';save();renderPage();notify('Profile picture removed.');break;
      case'quick-log':state.view='workout';if(!state.logs[state.selectedDate||todayISO()]&&!state.drafts[state.selectedDate||todayISO()])ensureDraft(state.selectedDate||todayISO());save();renderPage();break;
      case'select-date':state.selectedDate=el.dataset.date;state.view=el.dataset.openView||state.view;if(state.view==='home'&&el.closest('.bottom-nav'))state.view='home';save();renderPage();break;
      case'start-session':startSession();break;
      case'finish-session':finishSession();break;
      case'mark-rest':setRest(state.selectedDate||todayISO());break;
      case'clear-rest':delete state.logs[state.selectedDate||todayISO()];delete state.restOverrides[state.selectedDate||todayISO()];save();renderPage();break;
      case'train-anyway':trainAnyway(state.selectedDate||todayISO());break;
      case'toggle-set':toggleSet(el.dataset.date,Number(el.dataset.ex),Number(el.dataset.set));break;
      case'add-set':addSet(el.dataset.date,Number(el.dataset.ex));break;
      case'remove-exercise-from-draft':removeFromDraft(el.dataset.date,Number(el.dataset.ex));break;
      case'edit-session':startSession();break;
      case'edit-plan-day':state.editPlanDay=Number(el.dataset.day);save();renderPage();break;
      case'remove-plan-item':{const p=ensurePlanDay(Number(el.dataset.day));p.exercises.splice(Number(el.dataset.index),1);save();renderPage();break;}
      case'add-plan-exercise':{const di=Number(el.dataset.day),id=$('#planExerciseSelect')?.value,sets=$('#planExerciseSets')?.value||3,reps=$('#planExerciseReps')?.value||'8–12';if(id){addPlanExercise(di,id,sets,reps);renderPage();notify('Exercise added to the weekly plan.');}break;}
      case'library-filter':state.libraryFilter=el.dataset.filter;state.libraryFocus='All regions';save();renderPage();break;
      case'library-focus':state.libraryFocus=el.dataset.focus||'All regions';save();renderPage();break;
      case'add-library-to-plan':addLibraryToPlan(el.dataset.exercise);break;
      case'set-progress-period':state.progressPeriod=el.dataset.period;save();renderPage();break;
      case'calendar-shift':state.calendarOffset=(state.calendarOffset||0)+Number(el.dataset.shift);save();renderPage();break;
      case'dose-status':{const key=`${el.dataset.date}_${el.dataset.id}`,status=el.dataset.status;if(status==='snoozed'){state.supplementLogs[key]='snoozed';state.snoozedUntil=state.snoozedUntil||{};state.snoozedUntil[key]=Date.now()+30*60*1000;save();syncNativeReminders();renderPage();notify('Reminder snoozed for 30 minutes. Android builds can schedule the snooze locally.');}else{state.supplementLogs[key]=status;delete (state.snoozedUntil||{})[key];state.notified[key]=true;save();syncNativeReminders();renderPage();notify(status==='taken'?'Dose marked as taken.':'Dose marked as skipped.');}break;}
      case'delete-supplement':state.supplements=state.supplements.filter(s=>s.id!==el.dataset.id);save();syncNativeReminders();renderPage();notify('Supplement removed.');break;
      case'enable-notifications':requestNotifications();break;
      case'export-backup':exportBackup();break;
      case'export-friend':download(`FOR-friend-${slug(state.profile.name||'athlete')}-${todayISO()}.json`,JSON.stringify(friendSnapshot(),null,2));notify('Friend snapshot exported. Share the JSON file.');break;
      case'remove-friend':state.friends=state.friends.filter(f=>f.id!==el.dataset.id);save();renderPage();notify('Friend snapshot removed.');break;
      case'delete-photo':state.metrics.photos=state.metrics.photos.filter(p=>p.id!==el.dataset.id);save();renderPage();notify('Photo removed from this device.');break;
      case'set-unit':state.settings.unit=el.dataset.unit;save();renderPage();notify(`Units changed to ${unit()}.`);break;
      case'save-settings':state.settings.restTimer=Math.max(0,Math.min(900,Number($('#restTimerInput')?.value||90)));save();renderPage();notify('Settings saved.');break;
      case'restore-default-plan':if(confirm('Replace your weekly routine with the starter 6-day PPL + rest plan? Your workout history will be kept.')){state.plan=JSON.parse(JSON.stringify(DEFAULT_PLAN));save();renderPage();notify('Starter plan restored.');}break;
      case'reset-data':if(confirm('Delete all FOR data stored in this browser? Export a backup first if needed.')){localStorage.removeItem(STORE_KEY);state=getDefaultState();save();renderPage();notify('Local FOR data reset.');}break;
    }
  }
  function handleInput(e){const el=e.target;const field=el.dataset.field;if(!field)return;
    if(field==='set-weight'||field==='set-reps'){
      const d=state.drafts[el.dataset.date],ex=d?.exercises[Number(el.dataset.ex)],set=ex?.sets[Number(el.dataset.set)];if(!set)return;
      if(field==='set-weight')set.weight=displayToKg(el.value);else set.reps=el.value===''?'':Number(el.value);save();return;
    }
    if(field==='session-notes'){const d=state.drafts[el.dataset.date];if(d){d.notes=el.value;save();}return;}
    if(field==='cardio-distance'||field==='cardio-duration'){const d=state.drafts[el.dataset.date],ex=d?.exercises[Number(el.dataset.ex)];if(ex){ex[field==='cardio-distance'?'distance':'duration']=el.value===''?'':Math.max(0,Number(el.value)||0);save();}return;}
  }
  function handleChange(e){const el=e.target,field=el.dataset.field;
    if(el.id==='profilePhotoInput'){handleProfilePhotoFile(el.files?.[0]);return;}
    if(field==='set-weight'||field==='set-reps'){save();return;}
    if(field==='plan-day-name'){const p=ensurePlanDay(Number(el.dataset.day));p.name=el.value||'Workout';save();return;}
    if(field==='plan-day-rest'){const p=ensurePlanDay(Number(el.dataset.day));p.rest=!!el.checked;if(p.rest)p.name=p.name==='Rest'?'Rest':p.name;else if(p.name==='Rest')p.name='Workout';save();renderPage();return;}
    if(['plan-item-sets','plan-item-reps','plan-item-rest'].includes(field)){const p=ensurePlanDay(Number(el.dataset.day)),item=p.exercises[Number(el.dataset.index)];if(!item)return;if(field==='plan-item-sets')item.sets=Math.max(1,Math.min(20,Number(el.value)||1));if(field==='plan-item-reps')item.reps=el.value||'8–12';if(field==='plan-item-rest')item.rest=Math.max(0,Math.min(900,Number(el.value)||0));save();return;}
    if(field==='progress-exercise'){state.progressExercise=el.value;save();renderPage();return;}
    if(field==='library-search'){state.librarySearch=el.value;save();renderPage();const search=$('#librarySearch');if(search){search.focus();search.setSelectionRange(search.value.length,search.value.length);}return;}
    if(field==='supplement-enabled'){const s=state.supplements.find(x=>x.id===el.dataset.id);if(s)s.enabled=el.checked;save();syncNativeReminders();renderPage();return;}
    if(field==='friend-share-name'){state.settings.friendShareName=!!el.checked;save();renderPage();notify('Friend export privacy updated.');return;}
    if(field==='friend-share-username'){state.settings.friendShareUsername=!!el.checked;save();renderPage();notify('Friend export privacy updated.');return;}
    if(field==='friend-share-prs'){state.settings.friendSharePRs=!!el.checked;save();renderPage();notify('Friend export privacy updated.');return;}
    if(el.id==='photoInput'){handlePhotoFile(el.files?.[0]);return;}
    if(el.id==='backupFile'){restoreFile(el.files?.[0]);el.value='';return;}
    if(el.id==='friendFile'){importFriendFile(el.files?.[0]);el.value='';return;}
  }
  function formData(form){return Object.fromEntries(new FormData(form).entries());}

  
  async function handleSubmit(e) {
    const form = e.target.closest('form[data-form]');
    if (!form) return;

    e.preventDefault();

    const type = form.dataset.form;
    const fd = new FormData(form);

    if (type.startsWith('auth-')) {
      try {
        const submitButton = form.querySelector('[type="submit"]');
        if (submitButton) submitButton.disabled = true;

        authMessage = '';
        const email = String(fd.get('email') || pendingAuthEmail)
          .trim().toLowerCase();

        if (type === 'auth-signup') {
          const result = await registerUser({
            username: String(fd.get('username') || '').trim(),
            email,
            password: String(fd.get('password') || '')
          });

          if (result?.error) throw result.error;

          pendingAuthEmail = email;
          authMode = 'otp';
          authMessageType = 'success';
          authMessage = 'Verification code requested. Check your email.';
        } else if (type === 'auth-otp') {
          const result = await verifyEmailOtp({
            email: pendingAuthEmail,
            token: String(fd.get('token') || '').trim()
          });

          if (result?.error) throw result.error;

          authMode = 'login';
          authMessageType = 'success';
          authMessage = 'Email verified. You can now log in.';
        } else if (type === 'auth-login') {
          const result = await loginUser({
            email,
            password: String(fd.get('password') || '')
          });

          if (result?.error) throw result.error;

                    const session = await getCurrentSession();

          if (!session?.user?.id) {
            throw new Error(
              'Login succeeded, but the user session could not be loaded. Please try again.'
            );
          }

          authUser = session.user;
          authMessageType = 'success';
          authMessage = '';

          renderPage();
          return;
        }

        app.innerHTML = renderAuthScreen();
      } catch (error) {
        authMessageType = 'error';
        authMessage = error?.message || 'Authentication failed. Please try again.';
        app.innerHTML = renderAuthScreen();
      }
      return;
    }

    if (type === 'profile') {
      state.profile.name = String(fd.get('name') || 'Athlete').trim() || 'Athlete';
      state.profile.username = String(fd.get('username') || '').trim().replace(/^@/, '');
      save();
      renderPage();
      notify('Profile saved on this device.');
    }

    if (type === 'daily') {
      const date = String(fd.get('date') || todayISO());
      state.dailyStats[date] = {
        steps: Number(fd.get('steps') || 0),
        sleep: fd.get('sleep') === '' ? null : Number(fd.get('sleep')),
        calories: fd.get('calories') === '' ? null : Number(fd.get('calories')),
        protein: fd.get('protein') === '' ? null : Number(fd.get('protein')),
        stepGoal: Number(fd.get('stepGoal') || 8000)
      };
      state.selectedDate = date;
      save();
      renderPage();
      notify('Daily log saved.');
    }

    if (type === 'body-metric') {
      const kind = String(fd.get('type'));
      const date = String(fd.get('date') || todayISO());
      const raw = Number(fd.get('value'));

      if (!Number.isFinite(raw) || raw <= 0) {
        notify('Enter a valid positive measurement.');
        return;
      }

      const value = kind === 'weight' ? displayToKg(raw) : raw;
      state.metrics[kind].push({ id: cryptoId(), date, value });
      state.metrics[kind].sort((a, b) => a.date.localeCompare(b.date));
      save();
      renderPage();
      notify('Measurement saved.');
    }

    if (type === 'supplement') {
      const days = fd.getAll('days').map(Number);

      if (!days.length) {
        notify('Choose at least one active day.');
        return;
      }

      state.supplements.push({
        id: cryptoId(),
        name: String(fd.get('name') || '').trim(),
        dose: String(fd.get('dose') || '').trim(),
        time: String(fd.get('time') || '08:00'),
        days,
        enabled: true,
        createdAt: todayISO()
      });

      save();
      syncNativeReminders();
      renderPage();
      notify('Supplement reminder added.');
    }

    if (type === 'custom-exercise') {
      const name = String(fd.get('name') || '').trim();
      if (!name) return;

      const id = `custom-${slug(name)}-${Math.random().toString(36).slice(2, 6)}`;

      state.customExercises.push({
        id,
        name,
        muscle: String(fd.get('muscle') || 'Other'),
        focus: String(fd.get('focus') || 'Custom region'),
        equipment: String(fd.get('equipment') || 'Other'),
        custom: true
      });

      save();
      renderPage();
      notify('Custom exercise saved to your library.');
    }
        }
  

  function cryptoId(){return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;}
  async function handleProfilePhotoFile(file){if(!file)return;if(!file.type.startsWith('image/')){notify('Choose an image file.');return;}try{const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});const img=new Image();img.src=data;await img.decode();const side=Math.min(img.width,img.height),sx=(img.width-side)/2,sy=(img.height-side)/2,canvas=document.createElement('canvas');canvas.width=320;canvas.height=320;canvas.getContext('2d').drawImage(img,sx,sy,side,side,0,0,320,320);state.profile.avatar=canvas.toDataURL('image/jpeg',.78);save();renderPage();notify('Profile picture saved on this device.');}catch(err){notify('Could not process that image. Try another photo.');}}
  async function handlePhotoFile(file){if(!file)return;if(!file.type.startsWith('image/')){notify('Choose an image file.');return;}try{const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});const img=new Image();img.src=data;await img.decode();const max=760,ratio=Math.min(1,max/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.round(img.width*ratio);canvas.height=Math.round(img.height*ratio);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);const compressed=canvas.toDataURL('image/jpeg',.68);state.metrics.photos.push({id:cryptoId(),date:$('#photoDate')?.value||todayISO(),pose:$('#photoPose')?.value||'Front',data:compressed});save();renderPage();notify('Progress photo saved locally.');}catch(err){notify('Could not process that image. Try a smaller photo.');}}
  async function restoreFile(file){if(!file)return;try{const obj=JSON.parse(await file.text());if(!confirm('This will replace the current local FOR data. Continue?'))return;safeRestore(obj);}catch(err){notify(err.message||'Could not read this backup.');}}
  async function importFriendFile(file){if(!file)return;try{const obj=JSON.parse(await file.text());if(obj.format!=='FOR-friend-snapshot'||!obj.stats){notify('That file is not a FOR friend snapshot.');return;}const f={id:cryptoId(),name:String(obj.profile?.name||'Friend').slice(0,45),username:String(obj.profile?.username||''),stats:obj.stats,prs:obj.prs||{},importedAt:todayISO(),snapshotDate:obj.exportedAt||todayISO()};const old=state.friends.findIndex(x=>x.username&&x.username===f.username&&f.username);if(old>=0)state.friends[old]=f;else state.friends.push(f);save();renderPage();notify('Friend snapshot imported.');}catch(err){notify('Could not read that friend snapshot.');}}
  function syncNativeReminders(){
    const bridge=window.FORNativeNotifications;
    if(!bridge||!bridge.isAvailable())return Promise.resolve();
    return bridge.sync({supplements:state.supplements||[],supplementLogs:state.supplementLogs||{},snoozedUntil:state.snoozedUntil||{}}).catch(()=>{});
  }
  window.addEventListener('for-native-ready',syncNativeReminders);
  async function requestNotifications(){
    const nativeBridge=window.FORNativeNotifications;
    if(nativeBridge&&nativeBridge.isAvailable()){
      try{const enabled=await nativeBridge.requestPermission();if(enabled){await syncNativeReminders();notify('Android reminders enabled. Check exact-alarm and battery settings if delivery is delayed.');}else notify('Notification permission was not granted.');}
      catch(e){notify('Could not enable Android reminders. Check app notification settings.');}
      return;
    }
    if(!('Notification'in window)){notify('Notifications are not supported in this browser.');return;}
    const permission=await Notification.requestPermission();if(permission==='granted'){notify('Alerts enabled while the browser can check them. Background delivery is not guaranteed.');checkReminders(true);}else notify('Notification permission was not granted.');
  }
  function checkReminders(forcePrompt=false){
    if(window.FORNativeNotifications&&window.FORNativeNotifications.isAvailable())return;
    if(!('Notification'in window)||Notification.permission!=='granted')return;
    const now=new Date(),date=localDate(now),nowM=now.getHours()*60+now.getMinutes(),di=now.getDay();
    for(const s of state.supplements){
      if(s.enabled===false||!(s.days||[0,1,2,3,4,5,6]).includes(di)||!s.time)continue;
      const key=`${date}_${s.id}`,status=state.supplementLogs[key],snoozeAt=Number(state.snoozedUntil?.[key]||0);
      if(status==='taken'||status==='skip')continue;
      if(status==='snoozed'){
        if(snoozeAt&&Date.now()>=snoozeAt){
          delete state.supplementLogs[key];delete state.snoozedUntil[key];save();
          try{new Notification(`FOR reminder: ${s.name}`,{body:`Snooze finished. ${s.dose||'Your scheduled supplement'} · log it as taken or skipped.`,icon:'icons/for-192.png',tag:`for-snooze-${key}`});}catch(e){}
        }
        continue;
      }
      const [h,m]=s.time.split(':').map(Number),target=h*60+m,diff=nowM-target;
      if(diff<0||diff>(forcePrompt?1440:8)||state.notified[key])continue;
      state.notified[key]=true;save();
      try{new Notification(`FOR reminder: ${s.name}`,{body:`${s.dose||'Your scheduled supplement'} · ${s.time}. Open FOR to log it.`,icon:'icons/for-192.png',tag:`for-${key}`});}catch(e){}
    }
  }
  function registerSW(){if(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())return;if('serviceWorker'in navigator&&/^https?:$/.test(location.protocol)){navigator.serviceWorker.register('./sw.js').catch(()=>{});}}
  app.addEventListener('click',handleClick);app.addEventListener('input',handleInput);app.addEventListener('change',handleChange);app.addEventListener('submit',handleSubmit);
  renderPage();registerSW();checkReminders();syncNativeReminders();document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkReminders();});window.addEventListener('focus',checkReminders);setInterval(checkReminders,60000);
})();
