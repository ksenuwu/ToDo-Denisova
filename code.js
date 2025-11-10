document.addEventListener("DOMContentLoaded", function () {
  const task_input = document.getElementById("task_input");
  const addButton = document.getElementById("addButton");
  const tasksContainer = document.getElementById("tasksContainer");
  const emptyState = document.querySelector(".empty-state");
  const filterButtons = document.querySelectorAll(".filter-btn");

  let taskList = document.getElementById("taskList");
  if (!taskList) {
    taskList = document.createElement("ul");
    taskList.id = "taskList";
    taskList.className = "task-list";
    tasksContainer.appendChild(taskList);
  }

  let currentFilter = "all";

  addButton.addEventListener("click", addTask);

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      currentFilter = this.getAttribute("data-filter");
      applyFilter();
    });
  });

  function addTask() {
    const taskText = task_input.value.trim();

    if (taskText === "") {
      alert("Введите дело!");
      return;
    }

    createTaskElement(taskText);
    task_input.value = "";
    task_input.focus();
    updateEmptyState();
    applyFilter();
  }

  function createTaskElement(text) {
    if (emptyState) {
      emptyState.style.display = "none";
    }
    const taskItem = document.createElement("li");
    taskItem.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = text;

    checkbox.addEventListener("change", function () {
      taskText.classList.toggle("complited", this.checked);
      applyFilter();
    });
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);
    taskList.appendChild(taskItem);
  }

  function applyFilter() {
    const tasks = document.querySelectorAll(".task-item");

    tasks.forEach((task) => {
      const isCompleted = task.querySelector(".task-checkbox").checked;

      switch (currentFilter) {
        case "all":
          task.classList.remove("hidden");
          break;
        case "active":
          if (isCompleted) {
            task.classList.add("hidden");
          } else {
            task.classList.remove("hidden");
          }
          break;
        case "completed":
          if (!isCompleted) {
            task.classList.add("hidden");
          } else {
            task.classList.remove("hidden");
          }
          break;
      }
    });

    updateEmptyState();
  }

  function updateEmptyState() {
    const hasTasks = taskList.children.length > 0;
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
