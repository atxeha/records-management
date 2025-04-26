
document.addEventListener("DOMContentLoaded", async () => {
  const scheduleBtn = document.getElementById("scheduleBtn");
  const viewScheduleBtn = document.getElementById("viewScheduleBtn");
  const homeBtn = document.getElementById("homeBtn");

  function initializeTooltips() {
    var tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );

    // Dispose existing tooltips to avoid duplicates
    tooltipTriggerList.forEach((el) => {
      const tooltipInstance = bootstrap.Tooltip.getInstance(el);
      if (tooltipInstance) {
        tooltipInstance.dispose();
      }
    });

    tooltipTriggerList.map(
      (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );
  }

  async function loadPage(page) {
    await fetch(`./${page}`)
      .then((response) => response.text())
      .then(async (data) => {
        document.getElementById("main-content").innerHTML = data;
        initializeTooltips();
        attachDynamicEventListeners();
        localStorage.setItem("currentPage", page);

        if (page === "schedule.html") {
          // Dynamically import addSchedule.js to attach event listeners
          const addScheduleModule = await import("./logics/addSchedule.js");
          addScheduleModule.initAddSchedule();

          // Dynamically import fetchSchedules.js to fetch and render schedules
          const fetchSchedulesModule = await import("./logics/fetchSchedules.js");
          fetchSchedulesModule.fetchAndRenderSchedules();
        }
      })
      .catch((error) => console.error("Error loading page:", error));
  }

  function attachDynamicEventListeners() {
    const viewScheduleBtn = document.getElementById("viewScheduleBtn");
    if (viewScheduleBtn) {
      viewScheduleBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        await loadPage("schedule.html");

        // Update active sidebar icon to scheduleBtn
        const sidebarIcons = document.querySelectorAll(".sidebar-icon");
        sidebarIcons.forEach((i) => i.classList.remove("active"));

        const scheduleBtn = document.getElementById("scheduleBtn");
        
        if (scheduleBtn) {
          scheduleBtn.classList.add("active");
          localStorage.setItem("activeIconId", "scheduleBtn");
        }
      });
    }
  }

  if (scheduleBtn) {
    scheduleBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadPage("schedule.html");
    });
  }

  if (viewScheduleBtn) {
    viewScheduleBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadPage("schedule.html");
    });
  }
  
  if (homeBtn) {
    homeBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadPage("home.html");
    });
  }

  const currentPage = localStorage.getItem("currentPage");
  if (currentPage) {
    await loadPage(currentPage);
  } else {
    await loadPage("home.html");
  }

  // Select all sidebar icons
  const sidebarIcons = document.querySelectorAll(".sidebar-icon");

  sidebarIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      // Remove 'active' class from all icons
      sidebarIcons.forEach((i) => i.classList.remove("active"));

      // Add 'active' class to the clicked icon
      icon.classList.add("active");

      // Store active icon id in localStorage
      localStorage.setItem("activeIconId", icon.id);
    });
  });

  // On page load, set active icon from localStorage
  const activeIconId = localStorage.getItem("activeIconId");
  if (activeIconId) {
    const activeIcon = document.getElementById(activeIconId);
    if (activeIcon) {
      sidebarIcons.forEach((i) => i.classList.remove("active"));
      activeIcon.classList.add("active");
    }
  } else {
    // Optionally set default active icon, e.g., homeBtn
    if (homeBtn) {
      sidebarIcons.forEach((i) => i.classList.remove("active"));
      homeBtn.classList.add("active");
    }
  }
})
