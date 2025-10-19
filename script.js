document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskForm = document.getElementById('addTaskForm');
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const datePicker = document.getElementById('datePicker');
    const taskStats = document.getElementById('taskStats');
    const progressBarFill = document.getElementById('progressBarFill');

    // Event Listeners
    taskForm.addEventListener('submit', addTask);
    taskList.addEventListener('click', handleTaskClick);
    datePicker.addEventListener('change', renderTasks);

    // --- Core Functions ---

    /**
     * Renders tasks and updates progress for the selected date
     */
    function renderTasks() {
        taskList.innerHTML = '';
        
        const selectedDate = getSelectedDate();
        const tasks = getTasksForDate(selectedDate);

        // Update UI based on tasks
        if (tasks.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                taskList.appendChild(taskElement);
            });
        }
        
        updateProgress(); // New function call
    }

    /**
     * Creates an HTML list item for a given task
     */
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.taskId = task.id;
        if (task.completed) {
            li.classList.add('completed');
        }
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <button class="delete-btn" aria-label="Delete Task">&times;</button>
        `;
        return li;
    }

    function addTask(event) {
        event.preventDefault();
        const taskText = taskInput.value.trim();
        const selectedDate = getSelectedDate();
        if (taskText) {
            const newTask = { id: Date.now(), text: taskText, completed: false };
            const tasks = getTasksForDate(selectedDate);
            tasks.push(newTask);
            saveTasksForDate(selectedDate, tasks);
            taskInput.value = '';
            renderTasks();
        }
    }
    
    function handleTaskClick(event) {
        const target = event.target;
        const taskItem = target.closest('.task-item');
        if (!taskItem) return;

        const taskId = parseInt(taskItem.dataset.taskId);
        const selectedDate = getSelectedDate();
        
        if (target.matches('.task-checkbox')) {
            toggleTaskCompletion(taskId, selectedDate);
        } else if (target.matches('.delete-btn')) {
            deleteTask(taskId, selectedDate);
        }
    }

    function toggleTaskCompletion(taskId, date) {
        const tasks = getTasksForDate(date);
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            saveTasksForDate(date, tasks);
            renderTasks();
        }
    }
    
    function deleteTask(taskId, date) {
        let tasks = getTasksForDate(date);
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasksForDate(date, tasks);
        renderTasks();
    }

    /**
     * New Feature: Updates the progress bar and stats
     */
    function updateProgress() {
        const tasks = getTasksForDate(getSelectedDate());
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        
        if (totalTasks === 0) {
            taskStats.textContent = '0 / 0';
            progressBarFill.style.width = '0%';
        } else {
            taskStats.textContent = `${completedTasks} / ${totalTasks}`;
            const percentage = (completedTasks / totalTasks) * 100;
            progressBarFill.style.width = `${percentage}%`;
        }
    }

    // --- Date & Storage Helpers ---
    function initializeDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        datePicker.value = `${year}-${month}-${day}`;
    }

    function getSelectedDate() {
        return new Date(`${datePicker.value}T00:00:00`);
    }
    
    function getDateKey(date) {
        return date.toISOString().split('T')[0];
    }
    
    function getTasksForDate(date) {
        return JSON.parse(localStorage.getItem(getDateKey(date))) || [];
    }
    
    function saveTasksForDate(date, tasks) {
        localStorage.setItem(getDateKey(date), JSON.stringify(tasks));
    }

    // --- Initial Setup ---
    initializeDate();
    renderTasks();
});