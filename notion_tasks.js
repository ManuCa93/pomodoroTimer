
// ====== NOTION TASKS LOGIC ======
let currentSortCol = 'priority';
let sortAscending = false;

function initTasks() {
    if (!appData.tasks) {
        appData.tasks = [];
        saveAppData();
    }
}

function renderTasks() {
    initTasks();
    const body = document.getElementById("notion-tasks-body");
    if (!body) return;
    
    // Sort tasks
    let sortedTasks = [...appData.tasks];
    sortedTasks.sort((a, b) => {
        let valA = a[currentSortCol] || '';
        let valB = b[currentSortCol] || '';
        
        if (currentSortCol === 'priority') {
            const levels = { 'High': 3, 'Medium': 2, 'Low': 1, '': 0 };
            valA = levels[valA];
            valB = levels[valB];
        } else if (currentSortCol === 'name') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        
        if (valA < valB) return sortAscending ? -1 : 1;
        if (valA > valB) return sortAscending ? 1 : -1;
        return 0;
    });

    body.innerHTML = "";
    sortedTasks.forEach((task, idx) => {
        const row = document.createElement("div");
        row.className = "notion-row";
        
        // Priority Tag
        let pClass = task.priority ? `notion-tag tag-priority-${task.priority}` : `notion-tag tag-empty`;
        let pText = task.priority || "Empty";
        
        // Subject Tag
        let sClass = task.subject ? `notion-tag tag-subject` : `notion-tag tag-empty`;
        let sText = task.subject || "Empty";
        
        // Macro Tag
        let mClass = task.macroSubject ? `notion-tag tag-macro` : `notion-tag tag-empty`;
        let mText = task.macroSubject || "Empty";
        
        row.innerHTML = `
            <div class="notion-cell notion-col-checkbox">
                <label class="custom-checkbox">
                    <input type="checkbox" onchange="toggleTaskCompletion('${task.id}')" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
            </div>
            <div class="notion-cell notion-col-name">
                <input type="text" class="task-input" style="${task.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}" value="${task.name}" onchange="updateTask('${task.id}', 'name', this.value)">
            </div>
            <div class="notion-cell notion-col-macro">
                <span class="${mClass}" onclick="editTaskTag('${task.id}', 'macroSubject')">${mText}</span>
            </div>
            <div class="notion-cell notion-col-subject">
                <span class="${sClass}" onclick="editTaskTag('${task.id}', 'subject')">${sText}</span>
            </div>
            <div class="notion-cell notion-col-priority">
                <span class="${pClass}" onclick="cyclePriority('${task.id}')">${pText}</span>
            </div>
            <div class="notion-cell notion-col-date">
                <input type="date" class="task-input" style="color: rgba(255,255,255,0.6); padding: 0;" value="${task.startDate || ''}" onchange="updateTask('${task.id}', 'startDate', this.value)">
            </div>
            <div class="notion-cell notion-col-date">
                <input type="date" class="task-input" style="color: rgba(255,255,255,0.6); padding: 0;" value="${task.endDate || ''}" onchange="updateTask('${task.id}', 'endDate', this.value)">
            </div>
        `;
        body.appendChild(row);
    });
}

function addNewTask() {
    initTasks();
    const newTask = {
        id: 'task_' + Date.now(),
        name: '',
        macroSubject: '',
        subject: '',
        priority: 'Low',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        completed: false
    };
    appData.tasks.push(newTask);
    saveAppData();
    renderTasks();
    
    // Focus new input
    setTimeout(() => {
        const inputs = document.querySelectorAll('.notion-col-name input');
        if (inputs.length > 0) inputs[inputs.length - 1].focus();
    }, 50);
}

function updateTask(id, field, value) {
    const task = appData.tasks.find(t => t.id === id);
    if (task) {
        task[field] = value;
        saveAppData();
        if (field === 'completed' || currentSortCol === field) {
            renderTasks();
        }
    }
}

function toggleTaskCompletion(id) {
    const task = appData.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveAppData();
        renderTasks();
    }
}

function cyclePriority(id) {
    const task = appData.tasks.find(t => t.id === id);
    if (task) {
        const levels = ['Low', 'Medium', 'High', ''];
        let idx = levels.indexOf(task.priority);
        task.priority = levels[(idx + 1) % levels.length];
        saveAppData();
        renderTasks();
    }
}

function editTaskTag(id, field) {
    const task = appData.tasks.find(t => t.id === id);
    if (task) {
        let val = prompt(`Enter ${field}:`, task[field] || "");
        if (val !== null) {
            task[field] = val.trim();
            saveAppData();
            renderTasks();
        }
    }
}

function sortTasks(col) {
    if (currentSortCol === col) {
        sortAscending = !sortAscending;
    } else {
        currentSortCol = col;
        sortAscending = true;
    }
    renderTasks();
}

function openFullDatabase() {
    alert("Full Database Modal UI coming soon! For now, scroll horizontally.");
}

document.addEventListener("DOMContentLoaded", () => {
    renderTasks();
});
