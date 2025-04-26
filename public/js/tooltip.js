document.addEventListener("DOMContentLoaded", () => {
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

  // Select all sidebar icons
  const sidebarIcons = document.querySelectorAll(".sidebar-icon");

  sidebarIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      // Remove 'active' class from all icons
      sidebarIcons.forEach((i) => i.classList.remove("active"));

      // Add 'active' class to the clicked icon
      icon.classList.add("active");
    });
  });
});