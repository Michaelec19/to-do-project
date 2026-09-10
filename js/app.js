const taskManager = new TaskManager();
taskManager.load();

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

  modalTitle.textContent = "Nueva Sesión";
  submitBtn.textContent = "Crear Sesión";
  deleteBtn.classList.add('d-none');
  lanhuaFormAlert.classList.add('d-none');

  taskModal.show();
});

window.loadTaskForEdit = function(taskId) {
  const task = taskManager.tasks.find(t => t.id === taskId);
  if (!task) return;

  const setSelectByText = (id, text) => {
    const select = document.getElementById(id);
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].text === text) {
        select.selectedIndex = i;
        break;
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

  modalTitle.textContent = "Editar Sesión";
  submitBtn.textContent = "Actualizar";
  deleteBtn.classList.remove('d-none');
  lanhuaFormAlert.classList.add('d-none');

  taskModal.show();
};

deleteBtn.addEventListener('click', () => {
  if (editingTaskId !== null) {
    taskManager.deleteTask(editingTaskId);
    taskManager.render(formatDateForInput(selectedDate));
    taskModal.hide();
  }
});

submitBtn.addEventListener('click', (e) => {
  e.preventDefault();

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

  if (isEditing) {
    taskManager.updateTask(
        editingTaskId, disciplineText, levelText, locationText,
        validationData.date, validationData.startTime, validationData.endTime,
        document.getElementById('lanhua-notes-input').value, modalityText, remindValue
    );
  } else {
    taskManager.addTask(
        disciplineText, levelText, locationText,
        validationData.date, validationData.startTime, validationData.endTime,
        document.getElementById('lanhua-notes-input').value, modalityText, remindValue
    );
  }

  selectedDate = new Date(validationData.date + "T00:00:00");
  updateHeaderAndStrip();
  taskManager.render(formatDateForInput(selectedDate));

  taskModal.hide();
});

updateHeaderAndStrip();
taskManager.render(formatDateForInput(selectedDate));

const session = JSON.parse(localStorage.getItem('lanhua_session'));
if (!session) {
  window.location.href = 'login.html';
} else {
  document.getElementById('user-name-display').textContent = session.nombre;
}

document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('lanhua_session');
  window.location.href = 'login.html';
});

document.getElementById('btn-go-reserve').addEventListener('click', () => {
  alert('Redirigiendo a ReserveOne principal... (Próximamente)');
});

if (localStorage.getItem('lanhua_theme') === 'light') {
  document.body.classList.add('light-mode');
}

document.getElementById('floatingThemeToggle')?.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  localStorage.setItem('lanhua_theme', isLight ? 'light' : 'dark');
});

const profileModalElement = document.getElementById('profileModal');
const profileModal = new bootstrap.Modal(profileModalElement);
const settingsModalElement = document.getElementById('settingsModal');

document.getElementById('btn-edit-profile').addEventListener('click', () => {
  const settingsModalInstance = bootstrap.Modal.getInstance(settingsModalElement) || new bootstrap.Modal(settingsModalElement);
  settingsModalInstance.hide();

  const session = JSON.parse(localStorage.getItem('lanhua_session'));
  const users = JSON.parse(localStorage.getItem('lanhua_users')) || [];
  const currentUser = users.find(u => u.id === session.id) || session;

  document.getElementById('profileNombre').value = currentUser.nombre || '';
  document.getElementById('profileApellido').value = currentUser.apellido || '';
  document.getElementById('profileEmail').value = currentUser.email || '';
  document.getElementById('profileCurrentPassword').value = ''; // Limpiar campo
  document.getElementById('profilePassword').value = ''; // Limpiar campo

  profileModal.show();
});

document.getElementById('profileForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const session = JSON.parse(localStorage.getItem('lanhua_session'));
  let users = JSON.parse(localStorage.getItem('lanhua_users')) || [];

  const profileAlert = document.getElementById('profile-form-alert');
  const profileAlertText = document.getElementById('profile-alert-text');

  const newNombre = document.getElementById('profileNombre').value.trim();
  const newApellido = document.getElementById('profileApellido').value.trim();
  const newEmail = document.getElementById('profileEmail').value.trim().toLowerCase();
  const currentPasswordInput = document.getElementById('profileCurrentPassword').value;
  const newPassword = document.getElementById('profilePassword').value;

  profileAlert.classList.add('d-none');

  if (users.some(u => u.email === newEmail && u.id !== session.id)) {
    profileAlertText.textContent = "Este correo electrónico ya pertenece a otra cuenta.";
    profileAlert.classList.remove('d-none');
    return;
  }

  const userInDb = users.find(u => u.id === session.id);
  let finalPassword = userInDb ? userInDb.password : session.password;

  if (newPassword) {
    if (!currentPasswordInput) {
      profileAlertText.textContent = "Ingresa tu contraseña actual para cambiarla.";
      profileAlert.classList.remove('d-none');
      return;
    }

    if (!userInDb || userInDb.password !== currentPasswordInput) {
      profileAlertText.textContent = "La contraseña actual es incorrecta.";
      profileAlert.classList.remove('d-none');
      return;
    }

    finalPassword = newPassword;
  }

  users = users.map(u => {
    if (u.id === session.id) {
      return { ...u, nombre: newNombre, apellido: newApellido, email: newEmail, password: finalPassword };
    }
    return u;
  });
  localStorage.setItem('lanhua_users', JSON.stringify(users));

  const updatedSession = { ...session, nombre: newNombre, apellido: newApellido, email: newEmail };
  localStorage.setItem('lanhua_session', JSON.stringify(updatedSession));

  document.getElementById('user-name-display').textContent = newNombre;

  profileModal.hide();
  Swal.fire({
    icon: 'success',
    title: '¡Perfil actualizado!',
    text: 'Tus datos se han guardado correctamente.',
    confirmButtonColor: '#ffc107',
    background: '#212529',
    color: '#fff'
  });
});