const LS_KEY = "my_todo_v1";
const addTaskBtn = document.querySelector('.addTaskBtn');
const totalTaskEl = document.querySelector('.totalTasks');
const inProgressTasksEl = document.querySelector('.inProgressTasks');
const doneTasksEl = document.querySelector('.doneTasks');
const tasksInfo = document.querySelector('.tasks-info');
const doNowBox = document.querySelector('.do-now-box');
const totalTasksInDoNowEl = document.querySelector('.totalTasksInDoNow');
const noTaskMsg = document.querySelector('.noTaskMsg');
const saveTaskBtn = document.querySelector('#saveTaskBtn');
const taskNameInput = document.querySelector('#taskNameInput');
const dueDateInputOrig = document.querySelector('#dueDateInput');
const taskInputBox = document.querySelector('.taskInputBox');

let tasks = []; 
let runnerActive = false;
let stopRunner = false;
const BREAK_MS = 30 * 1000;

(function ensureInputs() {
  if (!taskInputBox) return;
  let dt = document.querySelector('#dueDateInput');
  if (!dt || dt.type !== 'datetime-local') {
    if (dt) dt.remove();
    dt = document.createElement('input');
    dt.type = 'datetime-local';
    dt.id = 'dueDateInput';
    dt.style.padding = "10px";
    dt.style.borderRadius = "8px";
    dt.style.marginBottom = "5px";
    taskInputBox.insertBefore(dt, taskInputBox.querySelector('#saveTaskBtn'));
  }
  if (!document.querySelector('#durationInput')) {
    const duration = document.createElement('input');
    duration.type = 'number';
    duration.id = 'durationInput';
    duration.placeholder = 'Duration (minutes)';
    duration.min = "1";
    duration.style.padding = "10px";
    duration.style.borderRadius = "8px";
    duration.style.marginBottom = "5px";
    taskInputBox.insertBefore(duration, document.querySelector('#dueDateInput'));
  }
})();
const durationInput = document.querySelector('#durationInput');
const datetimeInput = document.querySelector('#dueDateInput');

(function ensureGlobalButtons() {
  const nav = document.querySelector('.navBar');
  if (!nav) return;
  if (!document.querySelector('#startAllBtn')) {
    const b = document.createElement('button');
    b.id = 'startAllBtn';
    b.textContent = 'Start All';
    b.className = 'glow-on-hover';
    nav.appendChild(b);
  }
  if (!document.querySelector('#endEarlyBtn')) {
    const e = document.createElement('button');
    e.id = 'endEarlyBtn';
    e.textContent = 'End Early';
    e.className = 'glow-on-hover';
    e.disabled = true;
    nav.appendChild(e);
  }
})();
const startAllBtn = document.querySelector('#startAllBtn');
const endEarlyBtn = document.querySelector('#endEarlyBtn');

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
function save(){ localStorage.setItem(LS_KEY, JSON.stringify({tasks,counts:getCounts()})); }
function load(){
  const raw = localStorage.getItem(LS_KEY);
  if(!raw) return;
  try{ const parsed = JSON.parse(raw); tasks = parsed.tasks || []; const c = parsed.counts||{}; applyCounts(c);}catch(e){console.warn(e)}
}
function getCounts(){
  return {
    total: tasks.length,
    inDoNow: tasks.filter(t=>t.status==='inProgress' || t.status==='running').length,
    inProgress: tasks.filter(t=>t.status==='inProgress' || t.status==='running').length,
    done: tasks.filter(t=>t.status==='done').length
  };
}
function applyCounts(c){ if(!c) return; totalTaskEl.textContent=c.total||0; totalTasksInDoNowEl.textContent=c.inDoNow||0; inProgressTasksEl.textContent=c.inProgress||0; doneTasksEl.textContent=c.done||0; }


load();
renderAll();

if(addTaskBtn) addTaskBtn.addEventListener('click',()=>{ taskInputBox.style.display = taskInputBox.style.display === 'none' ? 'flex' : 'none'; });
if(taskNameInput) taskNameInput.addEventListener('input',checkInputs);
if(datetimeInput) datetimeInput.addEventListener('input',checkInputs);
if(durationInput) durationInput.addEventListener('input',checkInputs);
if(saveTaskBtn) { saveTaskBtn.disabled=true; saveTaskBtn.addEventListener('click',()=>{
  const name = taskNameInput.value.trim(); const dt = datetimeInput.value; const dur = Number(durationInput.value);
  if(!name||!dt||!dur) return;
  const t = { id:uid(), name, scheduledISO:new Date(dt).toISOString(), durationSec: Math.max(1,Math.round(dur))*60, status:'notStarted', level:'low', startedAt:null, completedAt:null, log:[] };
  tasks.push(t); save(); renderAll();
  taskNameInput.value=''; datetimeInput.value=''; durationInput.value=''; taskInputBox.style.display='none';
}); }

function checkInputs(){ saveTaskBtn.disabled = !(taskNameInput.value.trim() && datetimeInput.value && durationInput.value && Number(durationInput.value)>0); }

function renderAll(){
  tasksInfo.innerHTML = '';
  const mainTasks = tasks.filter(t=>t.status !== 'inProgress' && t.status !== 'running');
  if(mainTasks.length===0) noTaskMsg.style.display='block'; else noTaskMsg.style.display='none';
  mainTasks.forEach(t=> tasksInfo.appendChild(renderTaskCard(t)));
  Array.from(doNowBox.querySelectorAll('.task')).forEach(el=> el.remove());
  const doNowTasks = tasks.filter(t=> t.status==='inProgress' || t.status==='running' || t.status==='done' || t.status==='skipped');
  doNowTasks.forEach(t=> doNowBox.appendChild(renderTaskCard(t)));

  const c = getCounts();
  totalTaskEl.textContent = c.total;
  inProgressTasksEl.textContent = c.inProgress;
  doneTasksEl.textContent = c.done;
  totalTasksInDoNowEl.textContent = c.inDoNow;
  save();
}

function renderTaskCard(t){
  const card = document.createElement('div');
  card.className='task';
  card.draggable = true;
  card.dataset.id = t.id;

  card.innerHTML = `
    <div class="taskName">${escapeHtml(t.name)}</div>
    <hr>
    <div class="dropDowns">
      <label><select class="statusSelect"><option disabled>Status</option><option value="done">Done</option><option value="inProgress">In Progress</option><option value="notStarted">Not Started</option></select></label>
      <label><select class="levelSelect"><option disabled>Level</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
    </div>
    <hr>
    <div class="moveToDoNowBox">
      <div class="dueDateBox"><h4>Due Date</h4><div class="dueDateInput2">${new Date(t.scheduledISO).toLocaleString()}</div></div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="moveToDoNowBtn glow-on-hover">Move to do Now ➜</button>
        <div class="taskControls" style="display:flex;gap:6px;margin-top:6px"></div>
      </div>
    </div>
  `;

  const statusSelect = card.querySelector('.statusSelect');
  const levelSelect = card.querySelector('.levelSelect');
  statusSelect.value = t.status==='done' ? 'done' : (t.status==='inProgress'?'inProgress':'notStarted');
  levelSelect.value = t.level || 'low';
  updateStatusColor(statusSelect, levelSelect);
  statusSelect.addEventListener('change', ()=>{
    t.status = statusSelect.value==='done'?'done':(statusSelect.value==='inProgress'?'inProgress':'notStarted');
    if(t.status==='done'){ t.completedAt = Date.now(); t.log.push({action:'done',at:Date.now()}); }
    save(); renderAll();
  });
  levelSelect.addEventListener('change', ()=>{ t.level = levelSelect.value; save(); });
  const controls = card.querySelector('.taskControls');
  const moveBtn = document.createElement('button');
  moveBtn.className='glow-on-hover';
  moveBtn.textContent = 'Move to do Now ➜';
  moveBtn.onclick = ()=>{
    t.status = 'inProgress'; t.log.push({action:'movedToDoNow',at:Date.now()}); save(); renderAll();
  };
  controls.appendChild(moveBtn);

  const startBtn = document.createElement('button');
  startBtn.className='glow-on-hover';
  startBtn.textContent = t.status==='running' ? 'Running...' : 'Start ▶️';
  startBtn.onclick = async ()=>{
    if(t.status==='running') return;
    const scheduled = new Date(t.scheduledISO).getTime();
    if(scheduled > Date.now()){
      t.status = 'waiting'; save(); renderAll();
      while(Date.now() < scheduled){
        if(stopRunner) return;
        await sleep(1000);
      }
    }
    await runSingleTask(t.id);
  };
  controls.appendChild(startBtn);

  const completeBtn = document.createElement('button');
  completeBtn.className='glow-on-hover';
  completeBtn.textContent = 'Complete ✅';
  completeBtn.onclick = ()=>{
    if(t._interval){ clearInterval(t._interval); delete t._interval; }
    if(t.status==='inProgress' || t.status==='running') {
      t.log.push({action:'completed', at:Date.now()});
      t.completedAt = Date.now();
      t.status = 'done';
    } else {
      t.completedAt = Date.now();
      t.status = 'done';
      t.log.push({action:'completed', at:Date.now()});
    }
    save(); renderAll();
  };
  controls.appendChild(completeBtn);

  const skipBtn = document.createElement('button');
  skipBtn.className='glow-on-hover';
  skipBtn.textContent='Skip ⏭';
  skipBtn.onclick = ()=>{
    if(t._interval){ clearInterval(t._interval); delete t._interval; }
    t.status = 'skipped'; t.completedAt = Date.now(); t.log.push({action:'skipped',at:Date.now()}); save(); renderAll();
  };
  controls.appendChild(skipBtn);

  const timerDiv = document.createElement('div');
  timerDiv.className = 'timerDisplay';
  timerDiv.style.fontWeight='bold';
  timerDiv.style.marginTop='6px';
  if(t._timeLeft) timerDiv.textContent = `Time Left: ${formatTime(t._timeLeft)}`;
  card.querySelector('.moveToDoNowBox').appendChild(timerDiv);

  if(t.status==='done') { card.style.opacity='0.6'; card.querySelector('.moveToDoNowBtn').disabled = true; }
  else card.style.opacity='1';

  card.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/plain', t.id); card.style.opacity='0.4'; });
  card.addEventListener('dragend', ()=> card.style.opacity='1');
  card.addEventListener('dragover', e=> e.preventDefault());
  card.addEventListener('drop', e=>{
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    reorderTasks(draggedId, t.id);
  });

  return card;
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, ch=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch])); }
function formatTime(sec){ const m=Math.floor(sec/60); const s=sec%60; return `${m}:${s<10?'0':''}${s}`; }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

function reorderTasks(draggedId, targetId){
  const i = tasks.findIndex(x=>x.id===draggedId);
  const j = tasks.findIndex(x=>x.id===targetId);
  if(i===-1||j===-1) return;
  const [d] = tasks.splice(i,1);
  tasks.splice(j,0,d);
  save(); renderAll();
}
if(startAllBtn) startAllBtn.addEventListener('click', ()=> {
  if(runnerActive) return; runnerActive = true; stopRunner = false; startAllBtn.disabled=true; endEarlyBtn.disabled=false; runAllSequential().finally(()=>{ runnerActive=false; startAllBtn.disabled=false; endEarlyBtn.disabled=true; if(!stopRunner) showSummary(); });
});
if(endEarlyBtn) endEarlyBtn.addEventListener('click', ()=> {
  stopRunner = true;
  tasks.forEach(t=>{ if(t._interval){ clearInterval(t._interval); delete t._interval; }});
  showSummary();
});

async function runAllSequential(){
  for(let idx=0; idx<tasks.length; idx++){
    if(stopRunner) break;
    const t = tasks[idx];
    if(t.status==='done' || t.status==='skipped') continue;
    const scheduled = new Date(t.scheduledISO).getTime();
    if(scheduled > Date.now()){
      t.status='waiting'; save(); renderAll();
      while(Date.now() < scheduled){
        if(stopRunner) break;
        await sleep(1000);
      }
      if(stopRunner) break;
    }
    if(stopRunner) break;
    await runTaskById(t.id);
    if(stopRunner) break;
    await sleep(BREAK_MS);
  }
}

async function runTaskById(id){
  const t = tasks.find(x=>x.id===id); if(!t) return;
  t.status='running'; t.startedAt = t.startedAt || Date.now(); t.log.push({action:'started',at:Date.now()}); save(); renderAll();
  const res = await runTimerForTask(t);
  if(res==='completed'){ t.status='done'; t.completedAt = Date.now(); t.log.push({action:'completed',at:Date.now()}); }
  else if(res==='skipped'){ t.status='skipped'; t.completedAt = Date.now(); t.log.push({action:'skipped',at:Date.now()}); }
  save(); renderAll();
}

async function runSingleTask(id){
  stopRunner = false;
  await runTaskById(id);
}

function runTimerForTask(t){
  return new Promise(resolve=>{
    if(t._interval) clearInterval(t._interval);
    let left = t.durationSec;
    t._timeLeft = left;
    t._interval = setInterval(()=>{
      left--; t._timeLeft = left; save(); renderAll();
      if(left<=0){
        clearInterval(t._interval); delete t._interval; delete t._timeLeft;
        resolve('completed');
      }
      if(t._skipRequested){ clearInterval(t._interval); delete t._interval; delete t._timeLeft; t._skipRequested=false; resolve('skipped'); }
      if(t._completeRequested){ clearInterval(t._interval); delete t._interval; delete t._timeLeft; t._completeRequested=false; resolve('completed'); }
      if(stopRunner){ clearInterval(t._interval); delete t._interval; delete t._timeLeft; resolve('skipped'); }
    },1000);
  });
}

function showSummary(){
  const main = document.getElementById('main-box');
  if(!main) return alert('Main box missing');
  const container = document.createElement('div');
  container.style.padding='16px';
  container.innerHTML = `<h2 style="color:#7f32a8">Tasks Summary</h2>`;
  const grid = document.createElement('div');
  grid.style.display='grid'; grid.style.gap='8px';
  tasks.forEach(t=>{
    const card = document.createElement('div'); card.style.border='1px solid rgba(0,0,0,0.08)'; card.style.padding='10px'; card.style.borderRadius='8px';
    card.innerHTML = `<strong>${escapeHtml(t.name)}</strong><br>
      Scheduled: ${new Date(t.scheduledISO).toLocaleString()} <br>
      Duration: ${Math.round(t.durationSec/60)} min <br>
      Status: ${t.status || 'pending'} <br>
      Started: ${t.startedAt?new Date(t.startedAt).toLocaleString():'-'} <br>
      Completed: ${t.completedAt?new Date(t.completedAt).toLocaleString():'-'} <br>
      Log: ${t.log ? t.log.map(l=>l.action+'@'+new Date(l.at).toLocaleTimeString()).join(', ') : ''}
    `;
    grid.appendChild(card);
  });
  container.appendChild(grid);
  const back = document.createElement('button'); back.className='glow-on-hover'; back.textContent='Back'; back.style.marginTop='12px';
  back.onclick = ()=>{ location.reload(); };
  container.appendChild(back);
  main.innerHTML = '';
  main.appendChild(container);
}

window._endEarly = ()=>{ stopRunner=true; tasks.forEach(t=>{ if(t._interval) clearInterval(t._interval); }); showSummary(); };

tasks.forEach(t=>{ delete t._interval; delete t._timeLeft; });

function updateStatusColor(statusSelect, levelSelect){
  switch (statusSelect.value) {
    case "done":
      statusSelect.style.backgroundColor = "#03fc07"; statusSelect.style.color = "black"; break;
    case "inProgress":
      statusSelect.style.backgroundColor = "#032cfc"; statusSelect.style.color = "black"; break;
    case "notStarted":
      statusSelect.style.backgroundColor = "#a6a7ab"; statusSelect.style.color = "black"; break;
    default:
      statusSelect.style.backgroundColor = ""; statusSelect.style.color = "";
  }
  switch (levelSelect.value) {
    case "high": levelSelect.style.backgroundColor = "#f13427ff"; levelSelect.style.color = "black"; break;
    case "medium": levelSelect.style.backgroundColor = "#cfe622ff"; levelSelect.style.color = "black"; break;
    case "low": levelSelect.style.backgroundColor = "#a6a7ab"; levelSelect.style.color = "black"; break;
    default: levelSelect.style.backgroundColor = ""; levelSelect.style.color = "";
  }
}
