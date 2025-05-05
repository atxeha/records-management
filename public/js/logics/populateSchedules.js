/**
 * Populates the schedule list container with schedule data.
 * @param {Array} schedules - Array of schedule objects with properties: description, venue, date.
 * @param {string} containerSelector - CSS selector for the container element to populate.
 */
export function populateScheduleList(schedules, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("Container element not found:", containerSelector);
    return;
  }

  // Clear existing content
  container.innerHTML = "";

  // Create header row
  const header = document.createElement("div");
  header.className = "list-group-item sticky-header d-flex fw-bold bg-light justify-content-between";
  header.innerHTML = `
    <div class="col-5">Description</div>
    <div class="col-3">Venue</div>
    <div class="col-3">Time</div>
  `;
  container.appendChild(header);

  // Create rows for each schedule
  schedules.forEach(schedule => {
    const row = document.createElement("div");
    row.className = "list-group-item d-flex justify-content-between";

    const descriptionDiv = document.createElement("div");
    descriptionDiv.className = "col-5";
    descriptionDiv.textContent = schedule.description;

    const venueDiv = document.createElement("div");
    venueDiv.className = "col-3";
    venueDiv.textContent = schedule.venue;

    const timeDiv = document.createElement("div");
    timeDiv.className = "col-3";
    const dateObj = new Date(schedule.date);
    timeDiv.textContent = dateObj.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    row.appendChild(descriptionDiv);
    row.appendChild(venueDiv);
    row.appendChild(timeDiv);

    container.appendChild(row);
  });
}

/**
 * Sample usage of populateScheduleList function.
 * Fetches today's schedules and populates the container with id "scheduleListContainer".
 */
export async function sampleUsage() {
  try {
    const response = await window.electronAPI.fetchTodaysSchedules();
    if (response.success) {
      populateScheduleList(response.data, "#scheduleListContainer");
    } else {
      console.error("Failed to fetch today's schedules:", response.message);
    }
  } catch (error) {
    console.error("Error fetching today's schedules:", error);
  }
}
