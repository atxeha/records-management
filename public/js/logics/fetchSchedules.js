export async function fetchAndRenderSchedules() {
  try {
    const response = await window.electronAPI.fetchSchedules();
    if (!response.success) {
      console.error("Failed to fetch schedules:", response.message);
      return;
    }
    const schedules = response.data;

    const tbody = document.querySelector(".table-responsive table tbody");
    if (!tbody) {
      console.error("Schedule table tbody not found");
      return;
    }

    // Clear existing rows
    tbody.innerHTML = "";

    schedules.forEach((schedule, index) => {
      const tr = document.createElement("tr");

      // No.
      const tdNo = document.createElement("td");
      tdNo.textContent = (index + 1).toString();
      tr.appendChild(tdNo);

      // Description
      const tdDescription = document.createElement("td");
      tdDescription.textContent = schedule.description;
      tr.appendChild(tdDescription);

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

      // Reschedule icon
      const rescheduleIcon = document.createElement("i");
      rescheduleIcon.className = "icon-sm material-icons icon-btn mt-2 me-1";
      rescheduleIcon.setAttribute("data-bs-toggle", "tooltip");
      rescheduleIcon.setAttribute("data-bs-placement", "top");
      rescheduleIcon.setAttribute("data-bs-custom-class", "custom-tooltip");
      rescheduleIcon.title = "Reschedule";
      rescheduleIcon.textContent = "replay";
      tdActions.appendChild(rescheduleIcon);

      // Cancel icon
      const cancelIcon = document.createElement("i");
      cancelIcon.className = "icon-sm dlt-icon material-icons icon-btn mt-2 me-1";
      cancelIcon.setAttribute("data-bs-toggle", "tooltip");
      cancelIcon.setAttribute("data-bs-placement", "top");
      cancelIcon.setAttribute("data-bs-custom-class", "custom-tooltip");
      cancelIcon.title = "Cancel";
      cancelIcon.textContent = "delete";
      tdActions.appendChild(cancelIcon);

      // Mark as done icon
      const doneIcon = document.createElement("i");
      doneIcon.className = "icon-sm edit-icon material-icons icon-btn mt-2";
      doneIcon.setAttribute("data-bs-toggle", "tooltip");
      doneIcon.setAttribute("data-bs-placement", "top");
      doneIcon.setAttribute("data-bs-custom-class", "custom-tooltip");
      doneIcon.title = "Mark as done";
      doneIcon.textContent = "bookmark";
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
