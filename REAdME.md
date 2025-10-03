Task Manager

A simple web-based Task Manager app built with HTML, CSS, and JavaScript.
It allows you to create, view, complete, delete, filter, and sort tasks, with optional import of starter tasks from a public API. All tasks are saved locally in your browser using localStorage.

Features

Add tasks with text and due date

Mark tasks as completed (checkbox or button)

Delete tasks permanently

Edit tasks inline (change text and due date)

Filter tasks: All / Active / Completed

Sort tasks by due date (earliest first, active before completed)

Persistent storage: tasks are saved in localStorage

Initial tasks import from JSONPlaceholder
 (/todos)

Responsive design for desktop and mobile

Accessible UI basics: semantic HTML5, ARIA attributes, keyboard friendly

Tech Stack

HTML5 — semantic structure (header, main, footer)

CSS3 — clean, responsive, minimal styling with Flexbox/Grid

JavaScript (Vanilla, ES6) — event listeners, DOM manipulation, fetch API, localStorage

Project Structure
project/
│
├── index.html     # Main page
├── style.css      # Styling
└── script.js      # Logic and functionality

How It Works

On page load:

The app loads tasks from localStorage.

If none exist, it fetches 5 sample tasks from the JSONPlaceholder API.

You can:

Add new tasks (text + due date).

Toggle completion with a checkbox.

Edit a task inline and save changes.

Delete tasks.

Filter the list (All / Active / Completed).

Sort tasks by due date.

All changes are saved automatically in localStorage.

Getting Started

Clone or download the project.

Open index.html in a modern web browser (Chrome, Firefox, Edge, Safari).

Start adding and managing tasks!

No build process or server is required — this is a static web app.

Requirements

Modern browser supporting:

fetch API

ES6 (let, const, arrow functions, template literals)

localStorage

Known Limitations

No backend storage (tasks are only in your browser).

Due dates are simple strings (no timezone handling).

No undo after delete.

API import is only for demonstration (JSONPlaceholder).

Possible Improvements

Add search bar for tasks.

Add “Clear completed” button.

Add drag-and-drop reordering.

Turn into a Progressive Web App (PWA) for offline install.

Add tests (unit tests for filter/sort functions).

License

This project is free to use for learning and practice.