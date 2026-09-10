class TaskManager {
    constructor(currentId = 0) {
        this.tasks = [];
        this.currentId = currentId;
    }

    addTask(discipline, level, location, date, startTime, endTime, notes, modality) {
        const task = {
            id: this.currentId++,
            discipline: discipline,
            level: level,
            location: location,
            date: date,
            startTime: startTime,
            endTime: endTime,
            notes: notes,
            modality: modality,
            status: 'PENDING'
        };

        this.tasks.push(task);
        this.save();
    }

    updateTask(taskId, discipline, level, location, date, startTime, endTime, notes, modality) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.discipline = discipline;
            task.level = level;
            task.location = location;
            task.date = date;
            task.startTime = startTime;
            task.endTime = endTime;
            task.notes = notes;
            task.modality = modality;
            this.save();
        }
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

        this.tasks.forEach(task => task.hasConflict = false);

        for (let i = 0; i < this.tasks.length; i++) {
            for (let j = i + 1; j < this.tasks.length; j++) {
                const t1 = this.tasks[i];
                const t2 = this.tasks[j];
                if (t1.date === t2.date) {
                    if (t1.startTime < t2.endTime && t1.endTime > t2.startTime) {
                        t1.hasConflict = true;
                        t2.hasConflict = true;
                    }
                }
            }
        }

        const getLevelBadgeClass = (level) => {
            const l = level.toLowerCase();
            if (l.includes('principiante') || l.includes('beginner')) return 'bg-white text-dark';
            if (l.includes('intermedio') || l.includes('intermediate')) return 'bg-warning text-dark';
            if (l.includes('avanzado') || l.includes('advanced')) return 'bg-danger text-white';
            return 'bg-secondary';
        };

        this.tasks.forEach(task => {
            const article = document.createElement('article');
            article.className = task.hasConflict
                ? 'lanhua-task-card card shadow-sm rounded-3 conflict-card'
                : 'lanhua-task-card card shadow-sm rounded-3';

            const isChecked = task.status === 'DONE' ? 'checked' : '';
            const titleClass = task.status === 'DONE' ? 'text-decoration-line-through text-secondary' : 'text-white';

            article.innerHTML = `
                <div class="card-body p-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
                  <div class="d-flex align-items-start gap-3 w-100">
                    <input class="form-check-input mt-1 border-secondary" type="checkbox" aria-label="Completar clase" ${isChecked} style="background-color: transparent;">
                    
                    <div class="w-100">
                      <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                        <span class="badge bg-warning text-dark fs-6">
                          <i class="fa-regular fa-clock"></i> ${task.date} | ${task.startTime} - ${task.endTime}
                        </span>
                        <span class="badge ${getLevelBadgeClass(task.level)}">${task.level}</span>
                        <span class="badge border border-secondary text-light"><i class="fa-solid fa-users text-warning"></i> ${task.modality}</span>
                      </div>
                      
                      <h3 class="h5 fw-bold mb-1 ${titleClass}">${task.discipline}</h3>
                      <p class="mb-1 text-muted small">${task.notes || 'Sin observaciones'}</p>
                      <p class="mb-0 text-light opacity-75 small"><i class="fa-solid fa-location-dot text-warning"></i> ${task.location}</p>
                    </div>
                  </div>
        
                  <div class="d-flex flex-row flex-sm-column gap-2 justify-content-start w-100" style="max-width: 130px;">
                    <button class="btn btn-outline-warning btn-sm w-100 lanhua-edit-btn">
                      <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button class="btn btn-outline-danger btn-sm w-100 lanhua-delete-btn border-0">
                      <i class="fa-regular fa-trash-can"></i> Cancelar
                    </button>
                  </div>
                </div>
              `;



            const checkbox = article.querySelector('.form-check-input');
            checkbox.addEventListener('change', (e) => {
                const newStatus = e.target.checked ? 'DONE' : 'PENDING';
                this.updateTaskStatus(task.id, newStatus);
                this.render();
            });

            const editBtn = article.querySelector('.lanhua-edit-btn');
            editBtn.addEventListener('click', () => {
                window.loadTaskForEdit(task.id);
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