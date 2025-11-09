document.addEventListener("DOMContentLoaded", function () {
  const task_input = document.getElementById("task_input");
  const addButton = document.getElementById("addButton");
  const taskList = document.getElementById("taskList");
  const emptyState = document.querySelector(".empty-state");

  addButton.addEventListener("click", addTask);

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

    checkbox /
      addEventListener("change", function () {
        taskText.classList.toggle("complited", this.checked);
      });
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);
    taskList.appendChild(taskItem);
  }
  function updateEmptyState() {
    const hasTasks = taskList.children.length > 0;

    if (emptyState) {
      emptyState.style.display = hasTasks ? "none" : "flex";
    }
  }
});
