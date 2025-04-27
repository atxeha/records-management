export function initAddSchedule() {
    const addScheduleForm = document.getElementById("addScheduleForm");
    const addScheduleModal = new bootstrap.Modal(document.getElementById("addScheduleModal"));


    if (addScheduleForm && window.electronAPI) {
        addScheduleForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const addScheduleDescription = document.getElementById("addScheduleDescription").value.trim();
            const addScheduleVenue = document.getElementById("addScheduleVenue").value.trim();
            const addScheduleDate = document.getElementById("addScheduleDate").value.trim();
            const addScheduleOfficial = document.getElementById("addScheduleOfficial").value.trim();

            const data = {
                description: addScheduleDescription,
                venue: addScheduleVenue,
                date: addScheduleDate,
                official: addScheduleOfficial,
            };

            if (!addScheduleDate || !addScheduleDescription || !addScheduleVenue || !addScheduleOfficial) {
                window.electronAPI.showToast("All fields required.", false); return;
            }

            try {
                const response = await window.electronAPI.createSchedule(data);

                if (response.success) {
                    window.electronAPI.showToast(response.message, response.success);
                    addScheduleModal.hide();

                    const fetchSchedulesModule = await import("./fetchSchedules.js");
                    fetchSchedulesModule.fetchAndRenderSchedules();
                } else {
                    window.electronAPI.showToast(response.message, response.success);
                }
            } catch (err) {
                window.electronAPI.showToast(err.message, false);
            }
        });
    }
}
