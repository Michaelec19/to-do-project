class TaskManager {
    constructor() {
        this.tasks = [];
        this.API_URL = 'http://localhost:8080/api/sessions';
    }

    getHeaders() {
        const token = localStorage.getItem('lanhua_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async load() {
        try {
            const response = await fetch(this.API_URL, {
                method: 'GET',
                headers: this.getHeaders()
            });
            if (response.ok) {
                this.tasks = await response.json();
            } else {
                console.error("Error al cargar las sesiones");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        }
    }

    async addTask(discipline, level, location, date, startTime, endTime, notes, modality, remind, callbackRender) {
        const newTask = { discipline, level, location, date, startTime, endTime, notes, modality, remind, status: 'PENDING' };
        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(newTask)
            });
            if (response.ok) {
                const savedTask = await response.json();
                this.tasks.push(savedTask);
                callbackRender();
            }
        } catch (error) {
            console.error("Error al guardar la sesión:", error);
        }
    }

    async updateTask(taskId, discipline, level, location, date, startTime, endTime, notes, modality, remind, callbackRender) {
        const updatedTask = { discipline, level, location, date, startTime, endTime, notes, modality, remind };
        try {
            const response = await fetch(`${this.API_URL}/${taskId}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(updatedTask)
            });
            if (response.ok) {
                const index = this.tasks.findIndex(t => (t.id || t.sessionId) === taskId);
                if (index !== -1) {
                    this.tasks[index] = { ...this.tasks[index], ...updatedTask };
                    callbackRender();
                }
            }
        } catch (error) {
            console.error("Error al actualizar la sesión:", error);
        }
    }

    async updateTaskStatus(taskId, newStatus, callbackRender) {
        try {
            const response = await fetch(`${this.API_URL}/${taskId}/status`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                const task = this.tasks.find(t => (t.id || t.sessionId) === taskId);
                if (task) {
                    task.status = newStatus;
                    callbackRender();
                }
            }
        } catch (error) {
            console.error("Error al actualizar estado:", error);
        }
    }

    async deleteTask(taskId, callbackRender) {
        try {
            const response = await fetch(`${this.API_URL}/${taskId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            if (response.ok) {
                this.tasks = this.tasks.filter(t => (t.id || t.sessionId) !== taskId);
                callbackRender();
            }
        } catch (error) {
            console.error("Error al eliminar la sesión:", error);
        }
    }

    render(selectedDateString) {
        const lanhuaClassList = document.getElementById('lanhua-class-list');
        if (!lanhuaClassList) return;

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
            article.className = task.hasConflict ? 'lanhua-task-card p-3 mb-3 conflict-card' : 'lanhua-task-card p-3 mb-3';

            const isChecked = task.status === 'DONE' ? 'checked' : '';
            const titleClass = task.status === 'DONE' ? 'text-done-light' : 'text-white';
            const syncBadge = task.externalScheduleId ? '<span class="badge bg-info text-dark ms-2 border border-info" style="font-size: 0.55em; vertical-align: middle;"><i class="fa-solid fa-rotate"></i> Sync</span>' : '';
            const formatTime = (timeStr) => timeStr ? timeStr.substring(0, 5) : '';

            article.innerHTML = `
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h3 class="h5 fw-bold mb-0 ${titleClass}">${task.discipline} ${syncBadge}</h3>
                    <input class="form-check-input mt-0 border-secondary lanhua-checkbox" type="checkbox" ${isChecked}>
                </div>
                <div class="text-warning small fw-bold mb-1">
                    <i class="fa-regular fa-clock me-1"></i> ${formatTime(task.startTime)} - ${formatTime(task.endTime)}
                </div>
                <div class="d-flex flex-wrap gap-3 text-light opacity-75 small mb-2 ${titleClass}">
                    <span><i class="fa-solid fa-location-dot text-warning me-1"></i> ${task.location}</span>
                    <span><i class="fa-solid fa-user-ninja text-warning me-1"></i> ${task.modality || 'N/A'}</span>
                    ${task.quotas ? `<span><i class="fa-solid fa-users text-warning me-1"></i> ${task.quotas} cupos</span>` : ''}
                </div>
                <p class="small mb-0 text-truncate ${titleClass}">${task.notes || 'Sin observaciones'}</p>
            `;

            article.addEventListener('click', (e) => {
                if(e.target.classList.contains('lanhua-checkbox')) return;
                window.loadTaskForEdit(task.sessionId || task.id);
            });

            const checkbox = article.querySelector('.lanhua-checkbox');
            checkbox.addEventListener('change', (e) => {
                const newStatus = e.target.checked ? 'DONE' : 'PENDING';
                this.updateTaskStatus(task.sessionId || task.id, newStatus, () => this.render(selectedDateString));
            });

            lanhuaClassList.appendChild(article);
        });
    }
}