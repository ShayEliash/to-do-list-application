"use strict";

const LS_KEY = "tasks_v1";

/**
 * @typedef {{ id: string, text: string, dueDate: string, completed: boolean, createdAt: number }} Task
 */

let tasks = [];                  // in-memory state
let currentFilter = "all";       // 'all' | 'active' | 'completed'

// Elements
const taskListEl = document.getElementById("task-list");
const statusEl = document.getElementById("status");
const formEl = document.getElementById("add-form");
const textEl = document.getElementById("task-text");
const dateEl = document.getElementById("task-date");
const sortBtn = document.getElementById("sort-btn");
const filterBtns = document.querySelectorAll(".chip[data-filter]");

// Init
document.addEventListener("DOMContentLoaded", async () => {
    tasks = getTasks();

    if (tasks.length === 0) {
        await fetchInitialTasks();
    } else {
        statusEl.textContent = "";
        renderTasks();
    }
});


function getTasks() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveTasks(next) {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
}

/*  API import */
async function fetchInitialTasks() {
    statusEl.textContent = "Loading tasks from API…";
    try {
        const res = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=5");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const today = new Date();
        tasks = data.map((t, i) => {
            // due: today + 1..3 days
            const offset = 1 + (i % 3);
            const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
            const iso = dateToISO(d);

            return {
                id: String(t.id),
                text: String(t.title || "Untitled"),
                dueDate: iso,
                completed: Boolean(t.completed),
                createdAt: Date.now() + i
            };
        });

        saveTasks(tasks);
        statusEl.textContent = "";
        renderTasks();
    } catch (e) {
        console.error(e);
        statusEl.textContent = "API error or offline. Showing local data if available.";
        renderTasks();
    }
}

/* Rendering */
function renderTasks() {
    const filtered = filterTasks(tasks, currentFilter);
    taskListEl.innerHTML = "";

    if (filtered.length === 0) {
        statusEl.textContent = "Nothing to show.";
        return;
    }
    statusEl.textContent = "";

    for (const t of filtered) {
        taskListEl.appendChild(renderItem(t));
    }
}

function renderItem(t) {
    const li = document.createElement("li");
    li.className = "task-item" + (t.completed ? " completed" : "");
    li.dataset.id = t.id;

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = t.completed;
    cb.setAttribute("aria-label", "Mark task completed");

    const main = document.createElement("div");
    main.className = "task-main";

    const title = document.createElement("div");
    title.className = "task-text";
    title.textContent = t.text;

    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.textContent = `Due: ${t.dueDate}`;

    main.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "Edit";

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.textContent = "Delete";

    actions.append(editBtn, delBtn);

    li.append(cb, main, actions);

    // events
    cb.addEventListener("change", () => toggleComplete(t.id));
    delBtn.addEventListener("click", () => deleteTask(t.id));
    editBtn.addEventListener("click", () => startInlineEdit(li, t.id));

    return li;
}

/* Add / Edit / Delete / Toggle */
formEl.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = sanitize(textEl.value.trim());
    const due = dateEl.value;

    if (!text) {
        alert("Please enter a task.");
        textEl.focus();
        return;
    }
    if (!due) {
        alert("Please select a due date.");
        dateEl.focus();
        return;
    }
    if (isPastDate(due)) {
        alert("Due date cannot be in the past.");
        dateEl.focus();
        return;
    }

    const newTask = {
        id: String(Date.now() + Math.random()),
        text,
        dueDate: due,
        completed: false,
        createdAt: Date.now()
    };

    tasks.unshift(newTask);
    saveTasks(tasks);
    formEl.reset();
    renderTasks();
});

function startInlineEdit(li, id) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    const task = tasks[idx];

    const main = li.querySelector(".task-main");
    if (!main) return;

    // editor UI
    const wrap = document.createElement("div");
    wrap.className = "task-main";

    const txt = document.createElement("input");
    txt.type = "text";
    txt.value = task.text;
    txt.maxLength = 120;

    const dt = document.createElement("input");
    dt.type = "date";
    dt.value = task.dueDate;

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.textContent = "Save";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancel";

    wrap.append(txt, dt, saveBtn, cancelBtn);
    main.replaceWith(wrap);
    txt.focus();

    const finish = (apply) => {
        if (apply) {
            const v = sanitize(txt.value.trim());
            const d = dt.value;
            if (!v) { alert("Task cannot be empty."); return; }
            if (!d) { alert("Please select a due date."); return; }
            if (isPastDate(d)) { alert("Due date cannot be in the past."); return; }

            task.text = v;
            task.dueDate = d;
            saveTasks(tasks);
        }
        renderTasks();
    };

    saveBtn.addEventListener("click", () => finish(true));
    cancelBtn.addEventListener("click", () => finish(false));
    txt.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") finish(true);
        if (ev.key === "Escape") finish(false);
    });
}

function deleteTask(id) {
    if (!confirm("Delete this task?")) return;
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
    renderTasks();
}

function toggleComplete(id) {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    t.completed = !t.completed;
    saveTasks(tasks);
    renderTasks();
}

/* Filter & Sort */
for (const btn of filterBtns) {
    btn.addEventListener("click", () => {
        for (const b of filterBtns) b.setAttribute("aria-pressed", "false");
        btn.setAttribute("aria-pressed", "true");
        currentFilter = btn.dataset.filter || "all";
        renderTasks();
    });
}

sortBtn.addEventListener("click", () => {
    // Sort by dueDate 
    tasks.sort((a, b) => {
        if (a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return a.createdAt - b.createdAt;
    });
    saveTasks(tasks);
    renderTasks();
});

function filterTasks(list, filter) {
    if (filter === "active") return list.filter(t => !t.completed);
    if (filter === "completed") return list.filter(t => t.completed);
    return list.slice();
}

/* ---------- Utils ---------- */
function sanitize(s) {
    return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[c]));
}
function isPastDate(iso) {
    // compare date only
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const d = new Date(iso);
    return d < todayOnly;
}
function dateToISO(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
