const lanhuaScheduleForm = document.getElementById('lanhua-schedule-form');
const lanhuaClassList = document.getElementById('lanhua-class-list');
const lanhuaClassCount = document.getElementById('lanhua-class-count');
let currentClassCount = 0;

lanhuaScheduleForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const disciplineSelect = document.getElementById('lanhua-discipline-select');
  const disciplineText = disciplineSelect.options[disciplineSelect.selectedIndex].text;
  
  const levelSelect = document.getElementById('lanhua-level-select');
  const levelText = levelSelect.options[levelSelect.selectedIndex].text;

  const locationSelect = document.getElementById('lanhua-location-select');
  const locationText = locationSelect.options[locationSelect.selectedIndex].text;

  const dateVal = document.getElementById('lanhua-date-input').value;
  const timeVal = document.getElementById('lanhua-time-input').value;
  const notesVal = document.getElementById('lanhua-notes-input').value;

  const article = document.createElement('article');
  article.className = 'lanhua-task-card card border-0 shadow-sm';
  
  article.innerHTML = `
    <div class="card-body d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-start gap-3">
        <input class="form-check-input lanhua-checkbox mt-1" type="checkbox" aria-label="Completar clase">
        <div class="lanhua-card-info">
          <div class="d-flex align-items-center gap-3 mb-2">
            <span class="badge lanhua-time-badge text-dark fs-6">
              <i class="fa-regular fa-clock"></i> ${dateVal} | ${timeVal}
            </span>
            <span class="badge bg-secondary">${levelText}</span>
          </div>
          <h3 class="h5 fw-bold mb-1">${disciplineText}</h3>
          <p class="mb-1 text-muted fs-6">${notesVal}</p>
          <p class="mb-0 text-secondary fs-6"><i class="fa-solid fa-location-dot"></i> ${locationText}</p>
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

  const deleteBtn = article.querySelector('.lanhua-delete-btn');
  deleteBtn.addEventListener('click', () => {
    article.remove();
    updateClassCount(-1);
  });

  lanhuaClassList.appendChild(article);
  updateClassCount(1);
  lanhuaScheduleForm.reset();
});

function updateClassCount(change) {
  currentClassCount += change;
  lanhuaClassCount.textContent = `${currentClassCount} clases programadas`;
}