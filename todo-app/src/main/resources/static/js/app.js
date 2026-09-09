const taskManager = new TaskManager();
taskManager.load();
taskManager.render();

const lanhuaScheduleForm = document.getElementById('lanhua-schedule-form');
const lanhuaFormAlert = document.getElementById('lanhua-form-alert');

function validFormFieldInput(data) {
  if (!data.discipline || data.discipline === "") return false;
  if (!data.level || data.level === "") return false;
  if (!data.location || data.location === "") return false;
  if (!data.date || data.date === "") return false;
  if (!data.time || data.time === "") return false;
  return true;
}

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
    lanhuaFormAlert.classList.remove('d-none');
    return;
  }

  lanhuaFormAlert.classList.add('d-none');
  taskManager.addTask(
    disciplineText,
    levelText,
    locationText,
    validationData.date,
    validationData.time,
    document.getElementById('lanhua-notes-input').value,
    modalityText
  );
  taskManager.render();
  lanhuaScheduleForm.reset();
});

  