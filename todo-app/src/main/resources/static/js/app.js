const taskManager = new TaskManager();
taskManager.load();
taskManager.render();

const lanhuaScheduleForm = document.getElementById('lanhua-schedule-form');
const lanhuaFormAlert = document.getElementById('lanhua-form-alert');
const lanhuaAlertText = document.getElementById('lanhua-alert-text');
const submitBtn = document.getElementById('lanhua-submit-btn');

let isEditing = false;
let editingTaskId = null;

function validFormFieldInput(data) {
  if (!data.discipline || data.discipline === "") return false;
  if (!data.level || data.level === "") return false;
  if (!data.location || data.location === "") return false;
  if (!data.date || data.date === "") return false;
  if (!data.time || data.time === "") return false;
  return true;
}

function validateDate(dateStr, timeStr) {
  const selectedDateTime = new Date(`${dateStr}T${timeStr}`);
  const now = new Date();
  return selectedDateTime >= now;
}

window.loadTaskForEdit = function(taskId) {
  const task = taskManager.tasks.find(t => t.id === taskId);
  if (!task) return;

  const disciplineSelect = document.getElementById('lanhua-discipline-select');
  for (let i = 0; i < disciplineSelect.options.length; i++) {
    if (disciplineSelect.options[i].text === task.discipline) {
      disciplineSelect.selectedIndex = i;
      break;
    }
  }
  const levelSelect = document.getElementById('lanhua-level-select');
  for (let i = 0; i < levelSelect.options.length; i++) {
    if (levelSelect.options[i].text === task.level) {
      levelSelect.selectedIndex = i;
      break;
    }
  }
  const locationSelect = document.getElementById('lanhua-location-select');
  for (let i = 0; i < locationSelect.options.length; i++) {
    if (locationSelect.options[i].text === task.location) {
      locationSelect.selectedIndex = i;
      break;
    }
  }
  document.getElementById('lanhua-date-input').value = task.date;
  document.getElementById('lanhua-time-input').value = task.time;
  document.getElementById('lanhua-notes-input').value = task.notes;

  const toggle = document.getElementById('lanhua-type-toggle');
  toggle.checked = task.modality === "Grupal";

  isEditing = true;
  editingTaskId = taskId;
  submitBtn.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Actualizar Sesión`;
};

lanhuaScheduleForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const disciplineSelect = document.getElementById('lanhua-discipline-select');
  const disciplineText = disciplineSelect.options[disciplineSelect.selectedIndex].text;
  
  const levelSelect = document.getElementById('lanhua-level-select');
  const levelText = levelSelect.options[levelSelect.selectedIndex].text;

  const locationSelect = document.getElementById('lanhua-location-select');
  const locationText = locationSelect.options[locationSelect.selectedIndex].text;

  const isCustomOrGroup = document.getElementById('lanhua-type-toggle').checked;
  const modalityText = isCustomOrGroup ? "Grupal" : "Personalizada" ;

  const validationData = {
    discipline: disciplineSelect.value,
    level: levelSelect.value,
    location: locationSelect.value,
    date: document.getElementById('lanhua-date-input').value,
    time: document.getElementById('lanhua-time-input').value
  };
  

  if (!validFormFieldInput(validationData)) {
    lanhuaAlertText.textContent = "Por favor completa todos los campos requeridos.";
    lanhuaFormAlert.classList.remove('d-none');
    return;
  }

  if (!validateDate(validationData.date, validationData.time)) {
    lanhuaAlertText.textContent = "No se puede programar una clase en una fecha u hora pasada.";
    lanhuaFormAlert.classList.remove('d-none');
    return;
  }

  lanhuaFormAlert.classList.add('d-none');

  if (isEditing) {
    taskManager.updateTask(
      editingTaskId,
      disciplineText,
      levelText,
      locationText,
      validationData.date,
      validationData.time,
      document.getElementById('lanhua-notes-input').value,
      modalityText
    );
    isEditing = false;
    editingTaskId = null;
    submitBtn.innerHTML = `<i class="fa-solid fa-calendar-plus"></i> Agendar Sesión`;
  } else {
    taskManager.addTask(
      disciplineText,
      levelText,
      locationText,
      validationData.date,
      validationData.time,
      document.getElementById('lanhua-notes-input').value,
      modalityText
    );
  }

  taskManager.render();
  lanhuaScheduleForm.reset();
});

  