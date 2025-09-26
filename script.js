const addTaskBtn=document.querySelector('.addTaskBtn');
const totalTaskEl=document.querySelector('.totalTasks');
const inProgressTasksEl=document.querySelector('.inProgressTasks');
const doneTasksEl=document.querySelector('.doneTasks')
const tasksInfo=document.querySelector('.tasks-info');
const doNowTasks=document.querySelector('.do-now-tasks');
let tasks=[];
let totalTasks=0;
let inProgressTasks=0;
let doneTasks=0;
function addTask(name,dueDate){
  totalTasks++;
  totalTaskEl.textContent=totalTasks;
  const task=document.createElement('div');
  task.classList.add('task');
  task.innerHTML=
  `<div class="taskName">${name}</div>
  <hr>
  <div class="dropDowns">
  <button class="startBtn">Start</button>
  </div>
  <hr>
  <div class="moveToDoNowBox">
  <span class="date"><pre><img src="./calendar.png" width="12px" height="12px"> Due Date     ${dueDate}</pre></span>
  <button class="moveToDoNowBtn">Move to do Now  ➜</button>
  </div>`;
  tasksInfo.appendChild(task);
  task.querySelector('.startBtn').addEventListener('click',()=>startTask());
  task.querySelector('.doneBtn').addEventListener('click',()=>completeTask(task));
}
function startTask(task){
  inProgressTasks++;
  inProgressTasksEl.textContent=inProgressTasks;
  doNowTasks.innerHTML='';
  doNowTasks.appendChild(task.cloneNode(true));
}
function completeTask(task){
  doneTasks++;
  doneTasksEl.textContent=doneTasks;
  task.remove();
}
addTaskBtn.addEventListener('click',()=>{
  const taskName=prompt("Enter Task Name: ");
  const dueDate=prompt("Enter Due Date: ");
  if(taskName){
    addTask(taskName,dueDate);
  }
  

});
