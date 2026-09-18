const taskManager = new TaskManager();

let selectedDate = new Date();
let isEditing = false;
let editingTaskId = null;

const taskModalElement = document.getElementById('taskModal');
const taskModal = new bootstrap.Modal(taskModalElement);

const lanhuaScheduleForm = document.getElementById('lanhua-schedule-form');
const lanhuaFormAlert = document.getElementById('lanhua-form-alert');
const lanhuaAlertText = document.getElementById('lanhua-alert-text');
const submitBtn = document.getElementById('lanhua-submit-btn');
const deleteBtn = document.getElementById('btn-delete-task');
const modalTitle = document.getElementById('modalTitle');
const dateSelectorContainer = document.getElementById('date-selector');
const headerFullDate = document.getElementById('header-full-date');
const headerTodayText = document.getElementById('header-today-text');

function formatDateForInput(date) {
  const d = new Date(date);
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
}

function generateDateStrip() {
  dateSelectorContainer.innerHTML = '';
  const today = new Date();

  for (let i = -15; i <= 15; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dateStr = formatDateForInput(d);
    const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
    const dayNumber = d.getDate();
    const monthName = d.toLocaleDateString('es-ES', { month: 'short' });

    const div = document.createElement('div');
    div.className = `date-card ${dateStr === formatDateForInput(selectedDate) ? 'active' : ''}`;
    div.innerHTML = `
            <span class="small">${monthName}</span>
            <span class="fs-4">${dayNumber}</span>
            <span class="small">${dayName}</span>
        `;

    div.addEventListener('click', () => {
      selectedDate = d;
      updateHeaderAndStrip();
      taskManager.render(formatDateForInput(selectedDate));
    });

    dateSelectorContainer.appendChild(div);
  }

  setTimeout(() => {
    const activeCard = dateSelectorContainer.querySelector('.active');
    if (activeCard) {
      activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, 100);
}

function updateHeaderAndStrip() {
  generateDateStrip();
  const dayNameStr = selectedDate.toLocaleDateString('es-ES', { weekday: 'long' });
  const dayNameCap = dayNameStr.charAt(0).toUpperCase() + dayNameStr.slice(1);
  const dayNum = selectedDate.getDate();
  const monthNameStr = selectedDate.toLocaleDateString('es-ES', { month: 'long' });
  headerFullDate.textContent = `${dayNameCap} ${dayNum}, ${monthNameStr}`;

  const today = new Date();
  const isToday = today.toDateString() === selectedDate.toDateString();
  headerTodayText.textContent = isToday ? "Hoy" : "Agenda";
}

document.getElementById('btn-open-new-task').addEventListener('click', () => {
  isEditing = false;
  editingTaskId = null;
  lanhuaScheduleForm.reset();
  document.getElementById('lanhua-date-input').value = formatDateForInput(selectedDate);

  const formFields = ['lanhua-discipline-select', 'lanhua-level-select', 'lanhua-location-select', 'lanhua-date-input', 'lanhua-start-time', 'lanhua-end-time', 'lanhua-notes-input', 'lanhua-remind-select', 'lanhua-type-toggle'];
  formFields.forEach(field => document.getElementById(field).disabled = false);

  modalTitle.textContent = "Nueva Sesión";
  submitBtn.classList.remove('d-none');
  submitBtn.textContent = "Aceptar";
  deleteBtn.classList.add('d-none');
  lanhuaFormAlert.classList.replace('alert-info', 'alert-danger');
  lanhuaFormAlert.classList.add('d-none');

  taskModal.show();
});

window.loadTaskForEdit = function(taskId) {
  const task = taskManager.tasks.find(t => t.id === taskId || t.sessionId === taskId);
  if (!task) return;

  const setSelectByText = (id, text) => {
    const select = document.getElementById(id);
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].text === text || select.options[i].value === text?.toLowerCase()) {
        select.selectedIndex = i; break;
      }
    }
  };

  setSelectByText('lanhua-discipline-select', task.discipline);
  setSelectByText('lanhua-level-select', task.level);
  setSelectByText('lanhua-location-select', task.location);

  document.getElementById('lanhua-date-input').value = task.date;
  document.getElementById('lanhua-start-time').value = task.startTime;
  document.getElementById('lanhua-end-time').value = task.endTime;
  document.getElementById('lanhua-notes-input').value = task.notes;
  document.getElementById('lanhua-remind-select').value = task.remind || "5";
  document.getElementById('lanhua-type-toggle').checked = (task.modality === "Grupal");

  isEditing = true;
  editingTaskId = taskId;

  const isSynced = task.externalScheduleId != null;
  const formFields = ['lanhua-discipline-select', 'lanhua-level-select', 'lanhua-location-select', 'lanhua-date-input', 'lanhua-start-time', 'lanhua-end-time', 'lanhua-notes-input', 'lanhua-remind-select', 'lanhua-type-toggle'];

  formFields.forEach(field => document.getElementById(field).disabled = isSynced);
  submitBtn.classList.toggle('d-none', isSynced);
  deleteBtn.classList.remove('d-none');

  if (isSynced) {
    modalTitle.textContent = "Clase Sincronizada";
    lanhuaAlertText.textContent = "Las clases sincronizadas no se pueden editar, pero sí eliminar de la vista.";
    lanhuaFormAlert.classList.replace('alert-danger', 'alert-info');
    lanhuaFormAlert.classList.remove('d-none');
  } else {
    modalTitle.textContent = "Editar Sesión";
    lanhuaFormAlert.classList.replace('alert-info', 'alert-danger');
    lanhuaFormAlert.classList.add('d-none');
  }

  taskModal.show();
};


deleteBtn.addEventListener('click', () => {
  document.activeElement.blur();

  if (editingTaskId !== null) {
    taskManager.deleteTask(editingTaskId, () => {
      taskManager.render(formatDateForInput(selectedDate));
      taskModal.hide();
    });
  }
});

submitBtn.addEventListener('click', (e) => {
  e.preventDefault();
  document.activeElement.blur();

  const disciplineSelect = document.getElementById('lanhua-discipline-select');
  const levelSelect = document.getElementById('lanhua-level-select');
  const locationSelect = document.getElementById('lanhua-location-select');

  const disciplineText = disciplineSelect.options[disciplineSelect.selectedIndex]?.text || '';
  const levelText = levelSelect.options[levelSelect.selectedIndex]?.text || '';
  const locationText = locationSelect.options[locationSelect.selectedIndex]?.text || '';
  const modalityText = document.getElementById('lanhua-type-toggle').checked ? "Grupal" : "Personalizada";
  const remindValue = document.getElementById('lanhua-remind-select').value;

  const validationData = {
    discipline: disciplineSelect.value,
    level: levelSelect.value,
    location: locationSelect.value,
    date: document.getElementById('lanhua-date-input').value,
    startTime: document.getElementById('lanhua-start-time').value,
    endTime: document.getElementById('lanhua-end-time').value
  };

  if (!validationData.discipline || !validationData.level || !validationData.location || !validationData.date || !validationData.startTime || !validationData.endTime) {
    lanhuaAlertText.textContent = "Por favor completa todos los campos requeridos.";
    lanhuaFormAlert.classList.remove('d-none');
    return;
  }

  if (validationData.endTime <= validationData.startTime) {
    lanhuaAlertText.textContent = "La hora de fin debe ser mayor a la hora de inicio.";
    lanhuaFormAlert.classList.remove('d-none');
    return;
  }

  lanhuaFormAlert.classList.add('d-none');

  selectedDate = new Date(validationData.date + "T00:00:00");
  updateHeaderAndStrip();

  if (isEditing) {
    taskManager.updateTask(
        editingTaskId, disciplineText, levelText, locationText,
        validationData.date, validationData.startTime, validationData.endTime,
        document.getElementById('lanhua-notes-input').value, modalityText, remindValue,
        () => {
          taskManager.render(formatDateForInput(selectedDate));
          taskModal.hide();
        }
    );
  } else {
    taskManager.addTask(
        disciplineText, levelText, locationText,
        validationData.date, validationData.startTime, validationData.endTime,
        document.getElementById('lanhua-notes-input').value, modalityText, remindValue,
        () => {
          taskManager.render(formatDateForInput(selectedDate));
          taskModal.hide();
        }
    );
  }
});

document.getElementById('btn-sync').addEventListener('click', async () => {
  const btnSync = document.getElementById('btn-sync');
  const originalText = btnSync.innerHTML;

  btnSync.innerHTML = '<i class="fa-solid fa-rotate fa-spin"></i> Sincronizando...';
  btnSync.disabled = true;

  try {
    const session = JSON.parse(localStorage.getItem('lanhua_session'));
    const profesorId = session.id || 1; // Toma el ID real del profe logueado

    const response = await fetch(`http://localhost:8080/api/sessions/sync/${profesorId}`, {
      method: 'GET',
      headers: taskManager.getHeaders()
    });

    if (!response.ok) throw new Error('Error al sincronizar con ReserveOne');
    
    const allClasses = await response.json();
    taskManager.tasks = allClasses;

    taskManager.render(formatDateForInput(selectedDate));

    Swal.fire({
      icon: 'success',
      title: 'Sincronización Completa',
      text: 'Se han importado tus clases con sus respectivos asistentes.',
      confirmButtonColor: '#ffc107',
      background: '#212529',
      color: '#fff',
      timer: 2500,
      showConfirmButton: false
    });

  } catch (error) {
    console.error(error);
    Swal.fire({ icon: 'error', title: 'Error de Sincronización', text: 'No se pudo conectar con la base de datos.', background: '#212529', color: '#fff' });
  } finally {
    btnSync.innerHTML = originalText;
    btnSync.disabled = false;
  }
});

const session = JSON.parse(localStorage.getItem('lanhua_session'));
if (!session) {
  window.location.href = 'login.html';
} else {
  document.getElementById('user-name-display').textContent = `${session.nombre} ${session.apellido}`;
  taskManager.load().then(() => {
    updateHeaderAndStrip();
    taskManager.render(formatDateForInput(selectedDate));
  });
}

document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('lanhua_session');
  localStorage.removeItem('lanhua_token');
  window.location.href = 'login.html';
});

if (localStorage.getItem('lanhua_theme') === 'light') {
  document.body.classList.add('light-mode');
}

document.getElementById('floatingThemeToggle')?.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  localStorage.setItem('lanhua_theme', isLight ? 'light' : 'dark');
});