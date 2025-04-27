document.addEventListener("DOMContentLoaded", () => {
     window.addEventListener("message", (event) => {
       if (event.data.type === "show-toast") {
         Toastify({
           text: event.data.message,
           duration: 3500,
           close: true,
           gravity: "top",
           position: "right",
           stopOnFocus: true,
           style: {
             background: event.data.success
               ? "linear-gradient(to right, #28a745, #218838)"
               : "linear-gradient(to right, #dc3545, #c82333)",
             borderRadius: "7px",
             padding: "8px 12px",
             fontSize: "0.85rem",
           },
         }).showToast();
       }
     });
     
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
});