const storageKey = 'little-list-tasks-v1';
const starterTasks = [
  { id: 1, text: 'Take a proper lunch break', done: false },
  { id: 2, text: "Reply to the one email I've been avoiding", done: false },
  { id: 3, text: 'Step outside for ten minutes', done: false },
];

const taskList = document.querySelector('#task-list');
const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskSummary = document.querySelector('#task-summary');
const remainingCount = document.querySelector('#remaining-count');
const progressRing = document.querySelector('#progress-ring');
const progressValue = document.querySelector('#progress-value');
let tasks = readTasks();

function readTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(storageKey));
    return Array.isArray(savedTasks) ? savedTasks : starterTasks;
  } catch {
    return starterTasks;
  }
}

function saveTasks() {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function renderTasks() {
  const completed = tasks.filter((task) => task.done).length;
  const remaining = tasks.length - completed;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  taskList.replaceChildren();
  if (tasks.length === 0) {
    const emptyState = document.createElement('li');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'Your list is clear. Enjoy the breathing room.';
    taskList.append(emptyState);
  }

  for (const task of tasks) {
    const item = document.createElement('li');
    item.className = `task-item${task.done ? ' is-done' : ''}`;

    const toggle = document.createElement('button');
    toggle.className = 'task-toggle';
    toggle.type = 'button';
    toggle.setAttribute('role', 'checkbox');
    toggle.setAttribute('aria-checked', String(task.done));
    toggle.setAttribute('aria-label', `${task.done ? 'Mark incomplete' : 'Complete'}: ${task.text}`);
    toggle.addEventListener('click', () => {
      task.done = !task.done;
      saveTasks();
      renderTasks();
    });

    const label = document.createElement('span');
    label.className = 'task-text';
    label.textContent = task.text;

    const remove = document.createElement('button');
    remove.className = 'remove-button';
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove task: ${task.text}`);
    remove.addEventListener('click', () => {
      tasks = tasks.filter((entry) => entry.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(toggle, label, remove);
    taskList.append(item);
  }

  taskSummary.textContent = tasks.length ? `${completed} of ${tasks.length} done` : 'A fresh page';
  remainingCount.textContent = remaining === 1 ? '1 thing left' : `${remaining} things left`;
  progressValue.textContent = `${percent}%`;
  progressRing.setAttribute('aria-label', `${percent} percent complete`);
  document.querySelector('#done-today').textContent = `${completed} ${completed === 1 ? 'thing' : 'things'} done today`;
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({ id: Date.now(), text, done: false });
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
});

document.querySelector('#clear-completed').addEventListener('click', () => {
  tasks = tasks.filter((task) => !task.done);
  saveTasks();
  renderTasks();
});

document.querySelector('#today-date').textContent = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
}).format(new Date());

renderTasks();