const addTaskBtn=document.querySelector('.addTaskBtn');
const totalTaskEl=document.querySelector('.totalTasks');
const inProgressTasksEl=document.querySelector('.inProgressTasks');
const doneTasksEl=document.querySelector('.doneTasks')
const tasksInfo=document.querySelector('.tasks-info');
const doNowTasks=document.querySelector('.do-now-box');
const totalTasksInDoNowEl=document.querySelector(".totalTasksInDoNow");
const noTaskMsg=document.querySelector('.noTaskMsg');
const saveTaskBtn = document.querySelector('#saveTaskBtn');
const taskNameInput = document.querySelector('#taskNameInput');
const dueDateInput = document.querySelector('#dueDateInput');
const taskInputBox = document.querySelector('.taskInputBox');

let totalTasks=0;
let totalTasksInDoNow=0;
let inProgressTasks=0;
let doneTasks=0;

saveTaskBtn.disabled=true;

addTaskBtn.addEventListener('click', () => {
  taskInputBox.style.display = taskInputBox.style.display === 'none' ? 'flex' : 'none';
});

taskNameInput.addEventListener("input", checkInputs);
dueDateInput.addEventListener("input", checkInputs);
function checkInputs() {
  if (taskNameInput.value.trim() !== "" && dueDateInput.value !== "") {
    saveTaskBtn.disabled = false;
  } 
  else {
    saveTaskBtn.disabled = true;  
  }
}

saveTaskBtn.addEventListener('click', () => {
  const taskName = taskNameInput.value.trim();
  const dueDate = dueDateInput.value;
  if (taskName && dueDate) {
    addTask(taskName,dueDate);
    taskNameInput.value = "";  
    dueDateInput.value = "";
    taskInputBox.style.display = 'none';
    saveTaskBtn.disabled=true;
  }
});

function addTask(name,dueDate){
  totalTasks++;
  totalTaskEl.textContent=totalTasks;

  const task=document.createElement('div');
  task.classList.add('task');
  task.innerHTML=
  `<div class="taskName">${name}</div>
  <hr>
  <div class="dropDowns">
    <label> 
      <select class="statusSelect">
        <option value="status" disabled selected>Status</option>
        <option value="done">Done</option>
        <option value="inProgress">In Progress</option>
        <option value="notStarted">Not Started</option>
      </select>
    </label>
    <label> 
      <select class="levelSelect">
        <option value="level" disabled selected>Level</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </label>
  </div>
  <hr>
  <div class="moveToDoNowBox">
    <div class="dueDateBox">
      <h4>Due Date</h4>
      <div class="dueDateInput2">${dueDate}</div>
    </div>
    <button class="moveToDoNowBtn glow-on-hover">Move to do Now  ➜</button>
  </div>`;

  tasksInfo.appendChild(task);
  noTaskMessage();
  
  const levelSelect=task.querySelector('.levelSelect');
  const statusSelect=task.querySelector('.statusSelect');

  updateStatusColor(statusSelect,levelSelect);

  statusSelect.addEventListener("change", ()=>updateStatusColor(statusSelect,levelSelect));
  levelSelect.addEventListener("change", () =>updateStatusColor(statusSelect, levelSelect));
  
  task.querySelector('.moveToDoNowBtn').addEventListener('click',()=>moveToDoNow(task));
}



function noTaskMessage() {
  noTaskMsg.style.display = tasksInfo.querySelectorAll('.task').length === 0 ? 'block' : 'none';
}

function moveToDoNow(task){
  totalTasksInDoNow++;
  inProgressTasks++;
  totalTasksInDoNowEl.textContent=totalTasksInDoNow;
  inProgressTasksEl.textContent=inProgressTasks;
  doNowTasks.appendChild(task)

  const moveBtn=task.querySelector('.moveToDoNowBtn');
  moveBtn.textContent="Set Timer ⏱";

  moveBtn.replaceWith(moveBtn.cloneNode(true));
  const setTimerBtn = task.querySelector('.moveToDoNowBtn');

  setTimerBtn.addEventListener('click',()=>setTimer(task));
};

function setTimer(task){
  const duration=30*60;
  let seconds=duration;
  let interval=null;
  let running =false;

  const timerDisplay=task.querySelector('.timerDisplay') || (()=>{
    const td=document.createElement('div');
    td.classList.add('timerDisplay');
    td.style.marginTop = "10px";
    td.style.fontWeight = "bold";
    td.textContent = `Time Left: 30:00`;
    task.appendChild(td);
    return td;
  })();

  const btn=task.querySelector('.moveToDoNowBtn');
  btn.textContent= "Pause ⏸";

  function startCountdown(){
  if(running)return;
  running=true;
  interval=setInterval(()=>{
    seconds--;
    const mins=Math.floor(seconds/60);
    const secs = seconds % 60;
    timerDisplay.textContent = `Time Left: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
    if(seconds<=0){
      clearInterval(interval);
      timerDisplay.textContent="Times's Up!";
      timerDisplay.style.color="red";
      btn.style.display="none";
    }
  },1000);
}
function pauseCountdown(){
  clearInterval(interval);
  running=false;
} 
btn.onclick=()=>{
  if(running){
    pauseCountdown();
    btn.textContent = "Resume ▶️";
  }
  else {
    startCountdown();
    btn.textContent = "Pause ⏸";
}};
startCountdown();
}
function updateStatusColor(statusSelect,levelSelect){
  switch (statusSelect.value) {
      case "done":
        statusSelect.style.backgroundColor = "#03fc07";
        statusSelect.style.color = "black";
        break;
      case "inProgress":
        statusSelect.style.backgroundColor = "#032cfc";
        statusSelect.style.color = "black";
        break;
      case "notStarted":
        statusSelect.style.backgroundColor = "#a6a7ab";
        statusSelect.style.color = "black";
        break;
      default:
        statusSelect.style.backgroundColor = "";
        statusSelect.style.color = "";
  }
  switch (levelSelect.value) {
      case "high":
        levelSelect.style.backgroundColor = "#f13427ff";
        levelSelect.style.color = "black";
        break;
      case "medium":
        levelSelect.style.backgroundColor = "#cfe622ff";
        levelSelect.style.color = "black";
        break;
      case "low":
        levelSelect.style.backgroundColor = "#a6a7ab";
        levelSelect.style.color = "black";
        break;
      default:
        levelSelect.style.backgroundColor = "";
        levelSelect.style.color = "";
  }
}
 