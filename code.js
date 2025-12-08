document.addEventListener("DOMContentLoaded", function () {
  const task_input = document.getElementById("task_input");
  const addButton = document.getElementById("addButton");
  const emptyState = document.querySelector(".empty-state");
  const filterButtons = document.querySelectorAll(".filter-btn");

  const universityTasks = document.getElementById("university-tasks");
  const homeTasks = document.getElementById("home-tasks");
  const workTasks = document.getElementById("work-tasks");

  let tasks = [];
  let currentFilter = "all";

  if (localStorage.tasks) {
    tasks = JSON.parse(localStorage.getItem("tasks"));
  }

  const updateStorage = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  loadTasks();

  addButton.addEventListener("click", addTask);

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      currentFilter = this.getAttribute("data-filter");
      applyFilter();
    });
  });

  function enableTaskEditing(taskItem, taskId, taskTextElement) {
    const currentText = taskTextElement.textContent;

    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.className = "task-edit-input";

    taskTextElement.style.display = "none";
    taskTextElement.parentNode.insertBefore(input, taskTextElement);
    input.focus();
    input.select();

    const saveEdit = function () {
      const newText = input.value.trim();

      if (newText && newText !== currentText) {
        taskTextElement.textContent = newText;

        const taskIndex = tasks.findIndex((t) => t.id === taskId);
        if (taskIndex !== -1) {
          tasks[taskIndex].text = newText;
          updateStorage();
        }
      }

      taskTextElement.style.display = "";
      input.remove();
    };

    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        saveEdit();
      }
    });

    input.addEventListener("blur", saveEdit);
  }

  function addTask() {
    const inputText = task_input.value.trim();

    if (inputText === "") {
      alert("Введите дело!");
      return;
    }

    const parts = inputText.split(",");
    let taskText = parts[0].trim();
    let tag = "дом";

    if (parts.length > 1) {
      const possibleTag = parts[1].trim().toLowerCase();
      if (["университет", "дом", "работа"].includes(possibleTag)) {
        tag = possibleTag;
      }
    }

    const newTask = {
      id: Date.now(),
      text: taskText,
      tag: tag,
      completed: false,
    };

    tasks.push(newTask);
    createTaskElement(newTask);

    task_input.value = "";
    task_input.focus();
    updateEmptyState();
    applyFilter();
    updateStorage();
  }

  function createTaskElement(task) {
    if (emptyState) {
      emptyState.style.display = "none";
    }

    const taskItem = document.createElement("div");
    taskItem.className = "task-item";
    taskItem.dataset.id = task.id;
    taskItem.dataset.tag = task.tag;
    taskItem.draggable = true;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;

    const taskContent = document.createElement("div");
    taskContent.className = "task-content";

    const taskText = document.createElement("div");
    taskText.className = "task-text";
    taskText.textContent = task.text;
    if (task.completed) {
      taskText.classList.add("completed");
    }

    const taskTag = document.createElement("div");
    taskTag.className = "task-tag";
    taskTag.textContent = task.tag;

    taskContent.appendChild(taskText);
    taskContent.appendChild(taskTag);
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskContent);

    const targetColumn = getColumnByTag(task.tag);
    if (targetColumn) {
      targetColumn.appendChild(taskItem);
    }

    addTaskHandlers(taskItem, task.id);
  }

  function addTaskHandlers(taskItem, taskId) {
    const checkbox = taskItem.querySelector(".task-checkbox");
    const taskText = taskItem.querySelector(".task-text");

    checkbox.addEventListener("change", function () {
      const isCompleted = this.checked;
      taskText.classList.toggle("completed", isCompleted);

      const taskIndex = tasks.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex].completed = isCompleted;
      }

      applyFilter();
      updateStorage();
    });

    taskText.addEventListener("dblclick", function () {
      enableTaskEditing(taskItem, taskId, taskText);
    });

    taskItem.addEventListener("dragstart", function (e) {
      e.dataTransfer.setData("text/plain", taskItem.dataset.id);
      taskItem.classList.add("dragging");
    });

    taskItem.addEventListener("dragend", function () {
      taskItem.classList.remove("dragging");
    });
  }

  const columns = document.querySelectorAll(".task-column");
  columns.forEach((column) => {
    column.addEventListener("dragover", function (e) {
      e.preventDefault();
    });

    column.addEventListener("drop", function (e) {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("text/plain");
      const taskItem = document.querySelector(`[data-id="${taskId}"]`);
      const newTag = this.parentElement.dataset.tag;

      if (taskItem && this !== taskItem.parentElement) {
        const taskIndex = tasks.findIndex((t) => t.id == taskId);
        if (taskIndex !== -1) {
          tasks[taskIndex].tag = newTag;
          taskItem.dataset.tag = newTag;
          taskItem.querySelector(".task-tag").textContent = newTag;
          updateStorage();
        }

        this.appendChild(taskItem);
      }
    });
  });

  function getColumnByTag(tag) {
    switch (tag) {
      case "университет":
        return universityTasks;
      case "дом":
        return homeTasks;
      case "работа":
        return workTasks;
      default:
        return homeTasks;
    }
  }

  function loadTasks() {
    universityTasks.innerHTML = "";
    homeTasks.innerHTML = "";
    workTasks.innerHTML = "";

    tasks.forEach((task) => {
      createTaskElement(task);
    });

    updateEmptyState();
    applyFilter();
  }

  function applyFilter() {
    const taskItems = document.querySelectorAll(".task-item");

    taskItems.forEach((item) => {
      const isCompleted = item.querySelector(".task-checkbox").checked;
      let shouldShow = true;

      switch (currentFilter) {
        case "all":
          shouldShow = true;
          break;
        case "active":
          shouldShow = !isCompleted;
          break;
        case "completed":
          shouldShow = isCompleted;
          break;
      }

      if (shouldShow) {
        item.classList.remove("hidden");
      } else {
        item.classList.add("hidden");
      }
    });

    updateEmptyState();
  }

  function updateEmptyState() {
    const hasTasks = tasks.length > 0;
    const visibleTasks = document.querySelectorAll(
      ".task-item:not(.hidden)"
    ).length;
    const hasVisibleTasks = visibleTasks > 0;

    if (emptyState) {
      if (hasTasks && !hasVisibleTasks) {
        emptyState.textContent = getEmptyStateMessage();
        emptyState.style.display = "flex";
      } else {
        emptyState.style.display = hasTasks ? "none" : "flex";
      }
    }
  }

  function getEmptyStateMessage() {
    switch (currentFilter) {
      case "active":
        return "Нет активных задач. Все задачи выполнены!";
      case "completed":
        return "Нет выполненных задач.";
      default:
        return "Список дел пуст. Добавьте первую задачу!";
    }
  }
});
