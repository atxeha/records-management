export function initNewFranchise() {
  const newFranchiseForm = document.getElementById("newFranchiseForm");
  const modal = new bootstrap.Modal(document.getElementById("newFranchiseModal"));

  newFranchiseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const franchiseCode = parseInt(
      document.getElementById("newFranchiseCode").value.trim()
    );
    const franchiseName = document.getElementById("newFranchiseName").value.trim();
    const issuedBy = document.getElementById("newFranchiseIssuedBy").value.trim();
    const issuedTo = document.getElementById("newFranchiseIssuedTo").value.trim();
    const startDate = document.getElementById("newFranchiseStartDate").value.trim();
    const endDate = document.getElementById("newFranchiseEndDate").value.trim();

    if (
      !franchiseCode ||
      !franchiseName ||
      !issuedBy ||
      !issuedTo ||
      !startDate ||
      !endDate
    ) {
      window.electronAPI.showToast("All fields required.", false);
      return;
    }

    const data = {
      franchiseCode: franchiseCode,
      franchiseName: franchiseName,
      issuedBy: issuedBy,
      issuedTo: issuedTo,
      startDate: startDate,
      endDate: endDate,
    };

    try {
      const response = await window.electronAPI.newFranchise(data);

      if (response.success) {
        window.electronAPI.showToast(response.message, true);
        modal.hide();

        initFetchFranchise();
      } else {
        window.electronAPI.showToast(response.message, false);
      }
    } catch (err) {
      window.electronAPI.showToast(err.message, false);
    }
  });
}

let items = [];

export async function initPopulateFranchise() {
  document.body.addEventListener("click", (event) => {
    if (event.target.classList.contains("edit-franchise")) {
      const itemId = event.target.id.replace("edit-", "");
      const selectedItem = items.find((item) => item.id == itemId);

      if (selectedItem) {
        const startDate = new Date(selectedItem.startDate);
        const endDate = new Date(selectedItem.endDate);

        function toDateTimeLocal(date) {
          const pad = (n) => n.toString().padStart(2, "0");
          const year = date.getFullYear();
          const month = pad(date.getMonth() + 1);
          const day = pad(date.getDate());
          const hours = pad(date.getHours());
          const minutes = pad(date.getMinutes());

          return `${year}-${month}-${day}T${hours}:${minutes}`;
        }

        document.getElementById("editFranchiseId").value = selectedItem.id;
        document.getElementById("editFranchiseCode").value = selectedItem.franchiseCode;
        document.getElementById("editFranchiseName").value = selectedItem.franchiseName;
        document.getElementById("editFranchiseIssuedBy").value = selectedItem.issuedBy;
        document.getElementById("editFranchiseIssuedTo").value = selectedItem.issuedTo;
        document.getElementById("editFranchiseStartDate").value = toDateTimeLocal(startDate);
        document.getElementById("editFranchiseEndDate").value = toDateTimeLocal(endDate);
      }
    }
  });
};

export async function initFetchFranchise(searchQuery = "") {
  try {
    items = await window.electronAPI.fetchRisVoucher("franchise");

    const tableBody = document.getElementById("franchiseTableBody");
    const pulledTable = document.getElementById("franchiseTable");

    tableBody.innerHTML = "";

    const filteredItems = items.filter((item) => {
      const itemCodeMatch = item.franchiseName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
        
      return itemCodeMatch;
    });

    if (filteredItems.length === 0) {
      pulledTable.classList.remove("table-hover");
      tableBody.innerHTML = `
                <tr>
                <td colspan="9" class="text-center text-muted pt-3"><h6>No Records found</h6></td>
                </tr>
            `;
      return;
    }

    filteredItems.forEach((item, index) => {
      const row = document.createElement("tr");

      const formattedEndDate = new Date(item.endDate).toLocaleString(
        undefined,
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }
      );
      const formattedStartDate = new Date(item.startDate).toLocaleString(
        undefined,
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }
      );

      row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.franchiseCode}</td>
                <td>${item.franchiseName}</td>
                <td>${item.issuedBy}</td>
                <td>${item.issuedTo}</td>
                <td>${formattedStartDate}</td>
                <td>${formattedEndDate}</td>
                <td class="pb-0">
                    <i data-franchise-id="${
                      item.id
                    }" class="deleteFranchise dlt-icon icon-btn icon-sm material-icons" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Delete" style="margin-left:2px;">delete</i>
                  
                    <span data-bs-toggle="modal" data-bs-target="#editFranchiseModal">
                    <i id="edit-${item.id}" data-franchise-id="${item.id}" class="editFranchise edit-icon icon-btn icon-sm material-icons edit-franchise" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Edit">edit</i>
                </td>
            `;
      tableBody.appendChild(row);
    });
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
  } catch (error) {
    console.error("Error fetching items:", error);
  }
}

export function initDeleteAllFranchise() {
  const deleteAllForm = document.querySelector("#deleteAllFranchiseModal form");
  if (!deleteAllForm) return;

  deleteAllForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const result = await window.electronAPI.deleteAllRecords("franchise");

      if (result.success) {
        let deleteAllModal = bootstrap.Modal.getInstance(
          document.getElementById("deleteAllFranchiseModal")
        );

        if (!deleteAllModal) {
          deleteAllModal = new bootstrap.Modal(document.getElementById("deleteAllFranchiseModal"));
        }

        deleteAllModal.hide();
        
        await initFetchFranchise();

        window.electronAPI.showToast(result.message, true);
      } else {
        window.electronAPI.showToast(result.message, false);
      }
    } catch (error) {
      window.electronAPI.showToast(error.message, false);
    }
  });
}

export function initDeleteFranchise(search) {
    const tableBody = document.getElementById("franchiseTableBody");

    if (tableBody) {
        tableBody.addEventListener("click", async (event) => {
            const target = event.target;
            if (target.classList.contains("deleteFranchise")) {
                event.preventDefault();
                const id = target.dataset.franchiseId;

                const res = await window.electronAPI.deleteFranchise(parseInt(id))

                if (res.success) {
                    window.electronAPI.showToast(res.message, true)
                    initFetchFranchise(search)

                    const tooltip = bootstrap.Tooltip.getInstance(target);
                    if (tooltip) {
                        tooltip.hide();
                    }
                } else {
                    window.electronAPI.showToast(res.message, false)
                    return;
                }
            }
        });
    } else {
        console.log("TableBody not found");
    }
}

export function initEditFranchise() {
  const editFranchiseForm = document.getElementById("editFranchiseForm");
  const modal = new bootstrap.Modal(
    document.getElementById("editFranchiseModal")
  );

  editFranchiseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = parseInt(document.getElementById("editFranchiseId").value.trim());
    const franchiseCode = parseInt(document.getElementById("editFranchiseCode").value.trim());
    const franchiseName = document.getElementById("editFranchiseName").value.trim();
    const issuedBy = document.getElementById("editFranchiseIssuedBy").value.trim();
    const issuedTo = document.getElementById("editFranchiseIssuedTo").value.trim();
    const startDate = document.getElementById("editFranchiseStartDate").value.trim();
    const endDate = document.getElementById("editFranchiseEndDate").value.trim();

    if (
      !franchiseCode ||
      !franchiseName ||
      !issuedBy ||
      !issuedTo ||
      !startDate ||
      !endDate
    ) {
      window.electronAPI.showToast("All fields required.", false);
      return;
    }

    const data = {
        id,
      franchiseCode,
      franchiseName,
      issuedBy,
      issuedTo,
      startDate,
      endDate,
    };

    try {
      const response = await window.electronAPI.editFranchise(data);

      if (response.success) {
        window.electronAPI.showToast(response.message, true);
        modal.hide();

        initFetchFranchise();
      } else {
        window.electronAPI.showToast(response.message, false);
      }
    } catch (err) {
      window.electronAPI.showToast(err.message, false);
    }
  });
}