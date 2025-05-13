export function initNewFranchise() {
  const newFranchiseForm = document.getElementById("newFranchiseForm");
  const modal = new bootstrap.Modal(document.getElementById("newFranchiseModal"));

  newFranchiseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const purpose = document.getElementById("purpose").value.trim();
    const department = document.getElementById("department").value.trim();
    const amount = parseFloat(document.getElementById("amount").value.trim());
    const receivedBy = document.getElementById("receivedBy").value.trim();
    const startDate = document.getElementById("startDate").value.trim();
    const endDate = document.getElementById("endDate").value.trim();
    const receivedOn = document.getElementById("receivedOn").value.trim();

    if (
      !purpose ||
      !department ||
      !amount ||
      !receivedBy ||
      !startDate ||
      !endDate ||
      !receivedOn
    ) {
      window.electronAPI.showToast("All fields required.", false);
      return;
    }

    const data = {
      purpose: purpose,
      department: department,
      amount: amount,
      receivedBy: receivedBy,
      startDate: startDate,
      endDate: endDate,
      receivedOn: receivedOn,
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
      const itemCodeMatch = item.department
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
        
      return itemCodeMatch;
    });

    if (filteredItems.length === 0) {
      pulledTable.classList.remove("table-hover");
      tableBody.innerHTML = `
                <tr>
                <td colspan="10" class="text-center text-muted pt-3"><h6>No Records found</h6></td>
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
        }
      );
      const formattedStartDate = new Date(item.startDate).toLocaleString(
        undefined,
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      );
      const formattedReceivedOn = new Date(item.receivedOn).toLocaleString(
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
      const formattedReleasedOn = new Date(item.releasedOn).toLocaleString(
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
                <td>${item.purpose}</td>
                <td>${item.department}</td>
                <td>${item.amount}</td>
                <td>${item.receivedBy}</td>
                <td>${formattedReceivedOn}</td>
                <td>${formattedStartDate} - ${formattedEndDate}</td>
                <td>${item.releasedOn ? formattedReleasedOn : "-- --"}</td>
                <td class="${item.status === "released" ? "edit-icon" : "dlt-icon"}">${item.status === 'released' ? 'Released' : 'Pending'}</td>
                <td class="pb-0">
                    <i data-franchise-id="${
                      item.id
                    }" class="deleteFranchise dlt-icon icon-btn icon-sm material-icons" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Delete" style="margin-left:2px;">delete</i>
            
                    <i id="edit-${item.id}" data-franchise-id="${item.id}" class="approve edit-icon icon-btn icon-sm material-icons edit-franchise" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Release">check</i>
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
    }
}

export function initUpdateAllFranchiseStatus(modalId, tableName, status, search) {
  const form = document.querySelector(`#${modalId} form`);
    if (!form) return;
  
    // Remove existing submit listeners to prevent duplicates
    form.removeEventListener("submit", form._submitHandler);
  
    // Define the submit handler
    const submitHandler = async (e) => {
      e.preventDefault();
  
      try {
        const result = await window.electronAPI.updateAllStatus(
          tableName,
          status
        );
  
        if (result.success) {
          let modal = bootstrap.Modal.getInstance(
            document.getElementById(`${modalId}`)
          );
  
          if (!modal) {
            modal = new bootstrap.Modal(document.getElementById(`${modalId}`));
          }
  
          modal.hide();
  
          await initFetchFranchise(search);
  
          window.electronAPI.showToast(result.message, true);
        } else {
          window.electronAPI.showToast(result.message, false);
        }
      } catch (error) {
        window.electronAPI.showToast(error.message, false);
      }
    };
  
    // Store the handler on the form element for future removal
    form._submitHandler = submitHandler;
  
    // Add the submit event listener
    form.addEventListener("submit", submitHandler);
}

export function initRejectApprove(search) {
  const tableBody = document.getElementById("franchiseTableBody");

  if (tableBody) {
    tableBody.addEventListener("click", async (event) => {
      const target = event.target;
      if (target.classList.contains("approve")) {
        event.preventDefault();
        const id = target.dataset.franchiseId;

        const res = await window.electronAPI.approveReject(parseInt(id), "released", "franchise")

        if(res.success){
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
  }
}