const themeSelect = document.getElementById("themeSelect");
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const addBtn = document.getElementById("addBtn");
const clearBtn = document.getElementById("clearCompletedBtn");

const taskSections = document.getElementById("taskSections");
const pendingTasksBox = document.getElementById("pendingTasks");
const completedTasksBox = document.getElementById("completedTasks");
const progressBox = document.getElementById("progressBox");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// THEME
themeSelect.addEventListener("change", function () {
    const selected = themeSelect.value;

    if (selected === "default") {
        document.body.style.backgroundColor = "#232526";
        document.body.style.backgroundImage = "none";
        localStorage.setItem("selectedTheme", "default");
        return;
    }

    document.body.style.backgroundImage = "url('images/" + selected + ".jpg')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";

    localStorage.setItem("selectedTheme", selected);
});

function loadTheme() {
    const savedTheme = localStorage.getItem("selectedTheme") || "default";
    themeSelect.value = savedTheme;
    themeSelect.dispatchEvent(new Event("change"));
}

// SAVE
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// DATE HELPERS
function getTodayDate() {
    return new Date().toISOString().split("T")[0];
}

function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN");
}

// SUMMARY
function updateSummary() {
    pendingTasksBox.innerHTML = "";
    completedTasksBox.innerHTML = "";

    tasks.forEach(task => {
        const p = document.createElement("p");
        p.textContent = `${task.text} (${formatDate(task.date)})`;

        if (task.completed) {
            completedTasksBox.appendChild(p);
        } else {
            pendingTasksBox.appendChild(p);
        }
    });
}

// RENDER TASKS
function renderTasks() {
    taskSections.innerHTML = "";

    const grouped = {};

    tasks.forEach(task => {
        if (!grouped[task.date]) grouped[task.date] = [];
        grouped[task.date].push(task);
    });

    Object.keys(grouped).sort().reverse().forEach(date => {

        const section = document.createElement("div");
        section.classList.add("date-section");

        const title = document.createElement("div");
        title.classList.add("date-title");
        title.textContent = formatDate(date);

        section.appendChild(title);

        grouped[date].forEach(task => {

            const item = document.createElement("div");
            item.classList.add("task-item");

            const text = document.createElement("span");
            text.textContent = task.completed ? `✅ ${task.text}` : `⬜ ${task.text}`;

            text.onclick = () => {
                task.completed = !task.completed;
                saveTasks();
                renderTasks();
                updateSummary();
                renderGraph();
            };

            const editBtn = document.createElement("button");
            editBtn.textContent = "✏️";

            editBtn.onclick = () => {
                const newText = prompt("Edit task:", task.text);
                if (newText) {
                    task.text = newText;
                    saveTasks();
                    renderTasks();
                    updateSummary();
                }
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "🗑️";

            deleteBtn.onclick = () => {
                tasks = tasks.filter(t => t !== task);
                saveTasks();
                renderTasks();
                updateSummary();
                renderGraph();
            };

            item.appendChild(text);
            item.appendChild(editBtn);
            item.appendChild(deleteBtn);

            section.appendChild(item);
        });

        taskSections.appendChild(section);
    });
}

// CLEAR COMPLETED
clearBtn.onclick = () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    updateSummary();
    renderGraph();
};

// GRAPH
function renderGraph() {
    progressBox.innerHTML = "📊 Weekly Completed Tasks<br>";

    const counts = {};

    tasks.forEach(task => {
        if (task.completed) {
            counts[task.date] = (counts[task.date] || 0) + 1;
        }
    });

    Object.keys(counts).slice(-7).forEach(date => {
        const bar = document.createElement("div");
        bar.textContent = `${formatDate(date)} : ${counts[date]} done`;
        progressBox.appendChild(bar);
    });
}

// ADD TASK
function addTask() {
    const text = taskInput.value.trim();
    const date = taskDate.value || getTodayDate();

    if (!text) return alert("Enter task");

    tasks.push({ text, completed: false, date });

    saveTasks();
    renderTasks();
    updateSummary();
    renderGraph();

    taskInput.value = "";
}

addBtn.onclick = addTask;
taskInput.onkeydown = e => { if (e.key === "Enter") addTask(); };

taskDate.value = getTodayDate();

// INIT
loadTheme();
renderTasks();
updateSummary();
renderGraph();