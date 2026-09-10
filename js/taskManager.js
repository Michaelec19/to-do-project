class TaskManager {
    constructor(currentId = 0) {
        this.tasks = [];
        this.currentId = currentId;
    }

    addTask(discipline, level, location, date, startTime, endTime, notes, modality, remind) {
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
            remind: remind,
            status: 'PENDING'
        };
        this.tasks.push(task);
        this.save();
    }

    updateTask(taskId, discipline, level, location, date, startTime, endTime, notes, modality, remind) {
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
            task.remind = remind;
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

    render(selectedDateString) {
        const lanhuaClassList = document.getElementById('lanhua-class-list');
        lanhuaClassList.innerHTML = '';

        this.tasks.forEach(task => task.hasConflict = false);

        const dailyTasks = this.tasks.filter(t => t.date === selectedDateString);

        for (let i = 0; i < dailyTasks.length; i++) {
            for (let j = i + 1; j < dailyTasks.length; j++) {
                const t1 = dailyTasks[i];
                const t2 = dailyTasks[j];
                if (t1.startTime < t2.endTime && t1.endTime > t2.startTime) {
                    t1.hasConflict = true;
                    t2.hasConflict = true;
                }
            }
        }

        if (dailyTasks.length === 0) {
            lanhuaClassList.innerHTML = `<p class="text-center text-muted mt-5">No hay clases para este día.</p>`;
            return;
        }

        dailyTasks.forEach(task => {
            const article = document.createElement('article');
            article.className = task.hasConflict
                ? 'lanhua-task-card p-3 mb-3 conflict-card'
                : 'lanhua-task-card p-3 mb-3';

            const isChecked = task.status === 'DONE' ? 'checked' : '';
            const titleClass = task.status === 'DONE' ? 'text-done-light' : 'text-white';

            article.innerHTML = `
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h3 class="h5 fw-bold mb-0 ${titleClass}">${task.discipline}</h3>
                    <input class="form-check-input mt-0 border-secondary lanhua-checkbox" type="checkbox" ${isChecked}>
                </div>
                <div class="text-warning small fw-bold mb-1">
                    <i class="fa-regular fa-clock me-1"></i> ${task.startTime} - ${task.endTime}
                </div>
                <p class="text-light opacity-75 small mb-2 ${titleClass}"><i class="fa-solid fa-location-dot text-warning me-1"></i> Sede: ${task.location}</p>
                <p class="small mb-0 text-truncate ${titleClass}">${task.notes || 'Sin observaciones'}</p>
            `;

            article.addEventListener('click', (e) => {
                if(e.target.classList.contains('lanhua-checkbox')) return;
                window.loadTaskForEdit(task.id);
            });

            const checkbox = article.querySelector('.lanhua-checkbox');
            checkbox.addEventListener('change', (e) => {
                const newStatus = e.target.checked ? 'DONE' : 'PENDING';
                this.updateTaskStatus(task.id, newStatus);
                this.render(selectedDateString);
            });

            lanhuaClassList.appendChild(article);
        });
    }
}