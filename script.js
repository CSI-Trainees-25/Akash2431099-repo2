const addTaskBtn=document.querySelector('.addTaskBtn');
const totalTaskEl=document.querySelector('.totalTasks');
const inProgressTasksEl=document.querySelector('.inProgressTasks');
const doneTasksEl=document.querySelector('.doneTasks');
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

// 🔹 Load state from localStorage on refresh
window.onload = () => {
  const data = JSON.parse(localStorage.getItem("taskData"));
  if(data){
    totalTasks = data.totalTasks;
    totalTasksInDoNow = data.totalTasksInDoNow;
    inProgressTasks = data.inProgressTasks;
    doneTasks = data.doneTasks;

    totalTaskEl.textContent=totalTasks;
    inProgressTasksEl.textContent=inProgressTasks;
    doneTasksEl.textContent=doneTasks;
    totalTasksInDoNowEl.textContent=totalTasksInDoNow;

    // restore tasks
    data.tasks.forEach(t=>{
      addTask(t.name,t.dueDate,t.status,t.level,t.container,false);
    })
  }
}

function saveState(){
  const tasks = [];
  document.querySelectorAll('.task').forEach(task=>{
    tasks.push({
      name: task.querySelector('.taskName').textContent,
      dueDate: task.querySelector('.dueDateInput2') ? task.querySelector('.dueDateInput2').textContent : "",
      status: task.querySelector('.statusSelect') ? task.querySelector('.statusSelect').value : "notStarted",
      level: task.querySelector('.levelSelect') ? task.querySelector('.levelSelect').value : "low",
      container: task.parentElement.classList.contains("do-now-box") ? "doNow" : "main"
    });
  })

  const data = {
    totalTasks,
    totalTasksInDoNow,
    inProgressTasks,
    doneTasks,
    tasks
  }
  localStorage.setItem("taskData",JSON.stringify(data));
}

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
    saveState();
  }
});

function addTask(name,dueDate,status="notStarted",level="low",container="main",save=true){
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
        <option value="status" disabled>Status</option>
        <option value="done">Done</option>
        <option value="inProgress">In Progress</option>
        <option value="notStarted">Not Started</option>
      </select>
    </label>
    <label> 
      <select class="levelSelect">
        <option value="level" disabled>Level</option>
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
    <button class="moveToDoNowBtn glow-on-hover">Move to do Now ➜</button>
  </div>`;

  // set dropdowns
  task.querySelector('.statusSelect').value=status;
  task.querySelector('.levelSelect').value=level;

  if(container==="doNow"){
    doNowTasks.appendChild(task);
    totalTasksInDoNow++;
    inProgressTasks++;
  }else{
    tasksInfo.appendChild(task);
  }

  noTaskMessage();
  
  const levelSelect=task.querySelector('.levelSelect');
  const statusSelect=task.querySelector('.statusSelect');

  updateStatusColor(statusSelect,levelSelect);

  statusSelect.addEventListener("change", ()=>{updateStatusColor(statusSelect,levelSelect); saveState();});
  levelSelect.addEventListener("change", () =>{updateStatusColor(statusSelect, levelSelect); saveState();});
  
  task.querySelector('.moveToDoNowBtn').addEventListener('click',()=>moveToDoNow(task));

  if(save) saveState();
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
  moveBtn.textContent="Start ⏱";

  moveBtn.replaceWith(moveBtn.cloneNode(true));
  const startBtn = task.querySelector('.moveToDoNowBtn');

  startBtn.addEventListener('click',()=>setTimer(task));
  saveState();
};

function setTimer(task){
  const duration=30*60;
  let seconds=duration;

  let timerDisplay = task.querySelector('.timerDisplay');
  if(!timerDisplay){
    timerDisplay = document.createElement('div');
    timerDisplay.classList.add('timerDisplay');
    timerDisplay.style.marginTop = "10px";
    timerDisplay.style.fontWeight = "bold";
    timerDisplay.textContent = `Time Left: 30:00`;
    task.appendChild(timerDisplay);
  }

  const btn = task.querySelector('.moveToDoNowBtn');
  btn.textContent = "Complete ✅";
  btn.disabled = false;

  // Clear any existing interval first
  if(task.interval) clearInterval(task.interval);

  task.interval = setInterval(()=>{
    seconds--;
    const mins=Math.floor(seconds/60);
    const secs = seconds % 60;
    timerDisplay.textContent = `Time Left: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
    if(seconds<=0){
      clearInterval(task.interval);
      timerDisplay.textContent="Times's Up!";
      timerDisplay.style.color="red";
      btn.textContent="Complete ✅";
    }
  },1000);

  btn.onclick = ()=>{
    clearInterval(task.interval); // stop timer immediately
    btn.disabled = true;
    task.style.opacity = "0.6"; // optional visual completion

    // Update stats
    totalTasksInDoNow--;
    doneTasks++;
    inProgressTasks--;

    totalTasksInDoNowEl.textContent = totalTasksInDoNow;
    doneTasksEl.textContent = doneTasks;
    inProgressTasksEl.textContent = inProgressTasks;

    saveState();
  }
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
