class TaskManager {
  constructor(currentId = 0) {
    this.tasks = [];
    this.currentId = currentId;
  }

  addTask(discipline, level, location, date, time, notes, modality) {
    const task = {
      id: this.currentId++,
      discipline: discipline,
      level: level,
      location: location,
      date: date,
      time: time,
      notes: notes,
      modality: modality,
      status: 'PENDING'
    };

    this.tasks.push(task);
    this.save();
  }

  updateTaskStatus(taskId, newStatus) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus;
      this.save();
    }
  }

  deleteTask(taskId) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.save();
  }

  save() {
    const tasksJson = JSON.stringify(this.tasks);
    localStorage.setItem('tasks', tasksJson);
    const currentId = String(this.currentId);
    localStorage.setItem('currentId', currentId);
  }

  load() {
    const tasksJson = localStorage.getItem('tasks');
    if (tasksJson) {
      this.tasks = JSON.parse(tasksJson);
    }

    const currentId = localStorage.getItem('currentId');
    if (currentId) {
      this.currentId = Number(currentId);
    }
  }

  render() {
    const lanhuaClassList = document.getElementById('lanhua-class-list');
    const lanhuaClassCount = document.getElementById('lanhua-class-count');
    
    lanhuaClassList.innerHTML = '';

    this.tasks.forEach(task => {
      const article = document.createElement('article');
      article.className = 'lanhua-task-card card border-0 shadow-sm';
    
      const isChecked = task.status === 'DONE' ? 'checked' : '';
      const titleClass = task.status === 'DONE' ? 'text-decoration-line-through text-muted' : '';

      article.innerHTML = `
        <div class="card-body d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-start gap-3">
            <input class="form-check-input lanhua-checkbox mt-1" type="checkbox" aria-label="Completar clase" ${isChecked}>
            <div class="lanhua-card-info">
              <div class="d-flex align-items-center gap-3 mb-2">
                <span class="badge lanhua-time-badge text-dark fs-6">
                  <i class="fa-regular fa-clock"></i> ${task.date} | ${task.time}
                </span>
                <span class="badge bg-secondary">${task.level}</span>
                <span class="badge bg-warning text-dark"><i class="fa-solid fa-users"></i> ${task.modality}</span>
              </div>
              <h3 class="h5 fw-bold mb-1 ${titleClass}">${task.discipline}</h3>
              <p class="mb-1 text-muted fs-6">${task.notes}</p>
              <p class="mb-0 text-secondary fs-6"><i class="fa-solid fa-location-dot"></i> ${task.location}</p>
            </div>
          </div>
          <div class="lanhua-card-actions d-flex flex-column gap-2 justify-content-start">
            <button class="btn lanhua-btn-primary btn-sm px-3 fw-semibold">
              <i class="fa-solid fa-list-check"></i> Asistencia
            </button>
            <button class="btn btn-outline-dark btn-sm px-3 lanhua-delete-btn">
              <i class="fa-regular fa-circle-xmark"></i> Cancelar
            </button>
          </div>
        </div>
      `;

      const checkbox = article.querySelector('.lanhua-checkbox');
      checkbox.addEventListener('change', (e) => {
        const newStatus = e.target.checked ? 'DONE' : 'PENDING';
        this.updateTaskStatus(task.id, newStatus);
        this.render();
      });

      const deleteBtn = article.querySelector('.lanhua-delete-btn');
      deleteBtn.addEventListener('click', () => {
        this.deleteTask(task.id);
        this.render();
      });

      lanhuaClassList.appendChild(article);
    });

    lanhuaClassCount.textContent = `${this.tasks.length} clases programadas`;
  }
}