
export async function fetchAndRenderSchedules(dateFilter = "all", statusFilter = "all") {
  try {
    const response = await window.electronAPI.fetchSchedules();
    if (!response.success) {
      console.error("Failed to fetch schedules:", response.message);
      return;
    }
    let schedules = response.data;

    if (dateFilter === "today") {
      const today = new Date();
      schedules = schedules.filter((schedule) => {
        const scheduleDate = new Date(schedule.date);
        return (
          scheduleDate.getFullYear() === today.getFullYear() &&
          scheduleDate.getMonth() === today.getMonth() &&
          scheduleDate.getDate() === today.getDate()
        );
      });
    }

    // Filter by status
    if (statusFilter === "canceled") {
      schedules = schedules.filter((schedule) => schedule.isCanceled === true);
    } else if (statusFilter === "done") {
      schedules = schedules.filter((schedule) => schedule.isDone === true);
    }

    const tbody = document.querySelector(".table-responsive table tbody");
    if (!tbody) {
      console.error("Schedule table tbody not found");
      return;
    }

    // Clear existing rows
    tbody.innerHTML = "";

    if (schedules.length === 0) {
      tbody.innerHTML = `<tr>
            <td colspan="9" class="text-center text-muted pt-3"><h6>No schedules yet</h6></td>
            </tr>`;
    }

    schedules.forEach((schedule, index) => {
      const tr = document.createElement("tr");
      tr.dataset.scheduleId = schedule.id; // Add data attribute for schedule id

      // No.
      const tdNo = document.createElement("td");
      tdNo.textContent = (index + 1).toString();
      tr.appendChild(tdNo);

      // Description
      const tdDescription = document.createElement("td");
      tdDescription.textContent = schedule.description;
      tr.appendChild(tdDescription);

      const tdStatus = document.createElement("td");
      // tdStatus.textContent = schedule.isDone && !schedule.isCanceled ? "Done" : "Canceled";
      if (schedule.isDone && !schedule.isCanceled) {
        tdStatus.textContent = "Done"
        tdStatus.classList.add("edit-icon")
      } else if (schedule.isCanceled) {
        tdStatus.textContent = "Canceled"
        tdStatus.classList.add("dlt-icon")
      } else {
        tdStatus.textContent = "Waiting";
      }

      tr.appendChild(tdStatus);

      // Venue
      const tdVenue = document.createElement("td");
      tdVenue.textContent = schedule.venue;
      tr.appendChild(tdVenue);

      // Venue
      const tdPerson = document.createElement("td");
      tdPerson.textContent = schedule.official;
      tr.appendChild(tdPerson);

      // Time - format date string
      const tdTime = document.createElement("td");
      const dateObj = new Date(schedule.date);
      tdTime.textContent = dateObj.toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      tr.appendChild(tdTime);

      // Actions
      const tdActions = document.createElement("td");
      tdActions.classList.add("p-0");

      const cancelIconContainer = document.createElement("span");
      cancelIconContainer.setAttribute("data-bs-toggle", "modal")
      cancelIconContainer.setAttribute("data-bs-target", "#cancelScheduleModal")
      tdActions.appendChild(cancelIconContainer)

      const rescheduleIconContainer = document.createElement("span");
      rescheduleIconContainer.setAttribute("data-bs-toggle", "modal")
      rescheduleIconContainer.setAttribute("data-bs-target", schedule.isDone || schedule.isCanceled ? "#deleteScheduleModal" : "#rescheduleModal")
      tdActions.appendChild(rescheduleIconContainer)

      // Cancel icon
      const cancelIcon = document.createElement("i");
      cancelIcon.className =
        "icon-sm dlt-icon material-icons icon-btn mt-2 me-1";
      cancelIcon.setAttribute("data-bs-toggle", "tooltip");
      cancelIcon.setAttribute("data-bs-placement", "top");
      cancelIcon.setAttribute("data-bs-custom-class", "custom-tooltip");
      cancelIcon.title = "Cancel";
      cancelIcon.textContent = "close";
      cancelIcon.id = "cancelScheduleBtn";
      cancelIcon.dataset.scheduleId = schedule.id; // Add data attribute for schedule id
      cancelIcon.style.display = schedule.isDone || schedule.isCanceled ? "none" : "inline-block"
      cancelIconContainer.appendChild(cancelIcon);

      // Reschedule icon
      const rescheduleIcon = document.createElement("i");
      rescheduleIcon.className = `icon-sm material-icons icon-btn mt-2 me-1 ${schedule.isDone || schedule.isCanceled ? 'ms-4 dlt-icon' : ''}`;
      rescheduleIcon.setAttribute("data-bs-toggle", "tooltip");
      rescheduleIcon.setAttribute("data-bs-placement", "top");
      rescheduleIcon.setAttribute("data-bs-custom-class", "custom-tooltip");
      rescheduleIcon.title = schedule.isDone || schedule.isCanceled ? "Delete" : "Reschedule";
      rescheduleIcon.textContent = schedule.isDone || schedule.isCanceled ? "delete" : "replay";
      rescheduleIcon.id = schedule.isDone || schedule.isCanceled ? "deleteScheduleBtn" : "rescheduleBtn";
      rescheduleIcon.dataset.scheduleId = schedule.id;
      rescheduleIconContainer.appendChild(rescheduleIcon);

      // Mark as done icon
      const doneIcon = document.createElement("i");
      doneIcon.className = "icon-sm edit-icon material-icons icon-btn mt-2";
      doneIcon.setAttribute("data-bs-toggle", "tooltip");
      doneIcon.setAttribute("data-bs-placement", "top");
      doneIcon.setAttribute("data-bs-custom-class", "custom-tooltip");
      doneIcon.title = "Mark as done";
      doneIcon.textContent = "bookmark";
      doneIcon.id = "doneScheduleBtn";
      doneIcon.style.display = schedule.isDone || schedule.isCanceled ? "none" : "inline-block"
      tdActions.appendChild(doneIcon);

      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    });

    // Re-initialize tooltips after adding new elements
    var tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.forEach((el) => {
      const tooltipInstance = bootstrap.Tooltip.getInstance(el);
      if (tooltipInstance) {
        tooltipInstance.dispose();
      }
    });
    tooltipTriggerList.map(
      (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );
  } catch (error) {
    console.error("Error fetching or rendering schedules:", error);
  }
}

// Add this function to initialize the filter select event listener
export function initFilterSchedule() {
  const filterSelect = document.getElementById("filterSchedule");
  if (!filterSelect) return;

  filterSelect.addEventListener("change", async () => {
    const filterValue = filterSelect.value;
    const statusSelect = document.getElementById("filterScheduleStatus");
    const statusValue = statusSelect ? statusSelect.value : "all";
    await fetchAndRenderSchedules(filterValue, statusValue);
  });
}

// Add this function to initialize the status filter select event listener
export function initFilterScheduleStatus() {
  const statusSelect = document.getElementById("filterScheduleStatus");
  if (!statusSelect) return;

  statusSelect.addEventListener("change", async () => {
    const statusValue = statusSelect.value;
    const filterSelect = document.getElementById("filterSchedule");
    const filterValue = filterSelect ? filterSelect.value : "all";
    await fetchAndRenderSchedules(filterValue, statusValue);
  });
}

export function initDeleteAllSchedule() {
  const deleteAllForm = document.querySelector("#deleteAllScheduleModal form");
  if (!deleteAllForm) return;

  deleteAllForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const filterSelect = document.getElementById("filterSchedule");
      const statusSelect = document.getElementById("filterScheduleStatus");
      const currentFilter = filterSelect ? filterSelect.value : "all";
      const currentStatus = statusSelect ? statusSelect.value : "all";

      const result = await window.electronAPI.deleteAllSchedule(currentFilter, currentStatus);

      if (result.success) {
        // Close modal
        const deleteAllModal = bootstrap.Modal.getInstance(
          document.getElementById("deleteAllScheduleModal")
        );
        if (deleteAllModal) {
          deleteAllModal.hide();
        }
        // Refresh schedule list
        await fetchAndRenderSchedules(currentFilter, currentStatus);

        window.electronAPI.showToast(result.message, true);
      } else {
        window.electronAPI.showToast(result.message, false);
      }
    } catch (error) {
      window.electronAPI.showToast(error.message, false);
    }
  });
}

export function initCancelSchedule() {
  const cancelScheduleModal = document.getElementById("cancelScheduleModal");
  const modal = new bootstrap.Modal(cancelScheduleModal);
  
  if (!cancelScheduleModal) return;

  let selectedScheduleId = null;

  // Delegate click event to cancel icons
  document.querySelector(".table-responsive table tbody").addEventListener("click", (event) => {
    if (event.target && event.target.id === "cancelScheduleBtn") {
      const tr = event.target.closest("tr");
      if (tr && tr.dataset.scheduleId) {
        selectedScheduleId = tr.dataset.scheduleId

        modal.show();
      }
    }
  });

  const cancelForm = cancelScheduleModal.querySelector("form");
  if (!cancelForm) return;

  cancelForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!selectedScheduleId) {
      console.error("No schedule selected for cancellation");
      return;
    }

    try {
      const filterSelect = document.getElementById("filterSchedule");
      const statusSelect = document.getElementById("filterScheduleStatus");
      const currentFilter = filterSelect ? filterSelect.value : "all";
      const currentStatus = statusSelect ? statusSelect.value : "all";

      // Call electronAPI to cancel schedule by id
      const result = await window.electronAPI.cancelSchedule(parseInt(selectedScheduleId));

      if (result.success) {
        
        modal.hide();
        await fetchAndRenderSchedules(currentFilter, currentStatus);
        window.electronAPI.showToast(result.message, true);

      } else {
        window.electronAPI.showToast(result.message, false);
      }
    } catch (error) {
      window.electronAPI.showToast(error.message, false);
    }
  });
}

export function initreschedule() {
  const rescheduleModal = document.getElementById("rescheduleModal");
  const modal = new bootstrap.Modal(rescheduleModal);
  
  if (!rescheduleModal) return;

  let selectedScheduleId = null;

  // Delegate click event to cancel icons
  document.querySelector(".table-responsive table tbody").addEventListener("click", (event) => {
    if (event.target && event.target.id === "rescheduleBtn") {
      const tr = event.target.closest("tr");
      if (tr && tr.dataset.scheduleId) {
        selectedScheduleId = tr.dataset.scheduleId

        console.log(selectedScheduleId)

        modal.show();
      }
    }
  });

  const rescheduleForm = rescheduleModal.querySelector("form");
  if (!rescheduleForm) return;

  rescheduleForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const filterSelect = document.getElementById("filterSchedule");
      const statusSelect = document.getElementById("filterScheduleStatus");
      const currentFilter = filterSelect ? filterSelect.value : "all";
      const currentStatus = statusSelect ? statusSelect.value : "all";

      const newDate = document.getElementById("rescheduleDate").value.trim();

      if (!newDate){window.electronAPI.showToast("New date required.", false); return;}

      const result = await window.electronAPI.reschedule(parseInt(selectedScheduleId), newDate);

      if (result.success) {

        modal.hide();
        await fetchAndRenderSchedules(currentFilter, currentStatus);
        window.electronAPI.showToast(result.message, true);

      } else {
        window.electronAPI.showToast(result.message, false);
      }
    } catch (error) {
      window.electronAPI.showToast(error.message, false);
    }
  });
}
