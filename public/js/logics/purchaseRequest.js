export function initNewPurchaseRequest() {
    const addPurchaseForm = document.getElementById("addPurchaseForm");
    const modal = new bootstrap.Modal(document.getElementById("addPurchaseModal"))

    addPurchaseForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const prNumber = parseInt(document.getElementById("addPurchaseNumber").value.trim());
        const item = document.getElementById("addPurchaseItem").value.trim();
        const requestedBy = document.getElementById("addPurchaseRequestedBy").value.trim();
        const requestedDate = document.getElementById("addPurchaseRequestedDate").value.trim();
        const purpose = document.getElementById("addPurchasePurpose").value.trim();
        const department =document.getElementById("addPurchaseDepartment").value.trim();

        if(!item || !prNumber || !requestedBy || !requestedDate || !purpose || !department){window.electronAPI.showToast("All fields required.", false); return;}

        const data = {
            prNumber: prNumber,
            item: item,
            requestedBy: requestedBy,
            requestedDate: requestedDate,
            purpose: purpose,
            department: department,
        }

        try{
            const response = await window.electronAPI.newPurchaseRequest(data);

            if (response.success){
              window.electronAPI.showToast(response.message, true)
              modal.hide()

              initFetchPurchaseRequest()
            } else {
              window.electronAPI.showToast(response.message, false);
            }

        }catch(err){
            window.electronAPI.showToast(err.message, false);
        }
    })
}

export async function initFetchPurchaseRequest(searchQuery = "") {
    try {
      const items = await window.electronAPI.fetchPurchaseRequests();

      const tableBody = document.getElementById("prTableBody");
      const pulledTable = document.getElementById("prTable");

      tableBody.innerHTML = "";

      const filteredItems = items.filter((item) => {
        const itemCodeMatch = item.requestedBy
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        const itemDate = new Date(item.requestDate).toLocaleString(undefined, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        const dateMatch = itemDate.includes(searchQuery);
        return itemCodeMatch || dateMatch;
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

        const formattedDate = new Date(item.requestDate)
          .toLocaleString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })

        row.innerHTML = `
                <td>${item.prNumber}</td>
                <td>${item.item}</td>
                <td>${item.requestedBy}</td>
                <td>${item.department}</td>
                <td>${item.purpose}</td>
                <td>${formattedDate}</td>
                <td class="${item.status === "approved" ? "edit-icon" : item.status === "rejected" ? "dlt-icon" : ""}">${item.status === 'approved' ? 'Approved' : item.status === "rejected" ? 'Rejected' : 'Pending'}</td>
                <td class="pb-0">
                    <i data-purchase-id="${item.id}" class="rejectPr dlt-icon icon-btn icon-sm material-icons me-1" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Reject" style="margin-left:2px;">close</i>
                  
                    <i data-purchase-id="${item.id}" class="approvePr edit-icon icon-btn icon-sm material-icons" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Approve">check</i>
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

export function initCancelPr(search) {
  const tableBody = document.getElementById("prTableBody");

  if (tableBody) {
    tableBody.addEventListener("click", async (event) => {
      const target = event.target;
      if (target.classList.contains("rejectPr")) {
        event.preventDefault();
        const id = target.dataset.purchaseId;

        const res = await window.electronAPI.approveRejectPr(parseInt(id), "rejected")

        if(res.success){
          window.electronAPI.showToast(res.message, true)
          initFetchPurchaseRequest(search)

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
    console.log("prTableBody not found");
  }
}

export function initApprovePr(search) {
  const tableBody = document.getElementById("prTableBody");

  if (tableBody) {
    tableBody.addEventListener("click", async (event) => {
      const target = event.target;
      if (target.classList.contains("approvePr")) {
        event.preventDefault();
        const id = target.dataset.purchaseId;

        const res = await window.electronAPI.approveRejectPr(parseInt(id), "approved")

        if(res.success){
          window.electronAPI.showToast(res.message, true)
          initFetchPurchaseRequest(search)

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
    console.log("prTableBody not found");
  }
}

export function initDeleteAllPr(search) {
  const deleteAllForm = document.querySelector("#deleteAllPurchaseModal form");
  if (!deleteAllForm) return;

  deleteAllForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {

      const result = await window.electronAPI.deleteAllPr();

      if (result.success) {
        // Close modal
        let deleteAllModal = bootstrap.Modal.getInstance(
          document.getElementById("deleteAllPurchaseModal")
        );
        if (!deleteAllModal) {
          deleteAllModal = new bootstrap.Modal(document.getElementById("deleteAllPurchaseModal"));
        }
        deleteAllModal.hide();
        // Refresh Purchase list
        await initFetchPurchaseRequest(search);

        window.electronAPI.showToast(result.message, true);
      } else {
        window.electronAPI.showToast(result.message, false);
      }
    } catch (error) {
      window.electronAPI.showToast(error.message, false);
    }
  });
}

export function initUpdateAllPurchaseStatus(modalId, tableName, status, search) {
  const form = document.querySelector(`#${modalId} form`);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const result = await window.electronAPI.updateAllStatus(tableName, status);

      if (result.success) {
        let modal = bootstrap.Modal.getInstance(
          document.getElementById(`${modalId}`)
        );

        if (!modal) {
          modal = new bootstrap.Modal(
            document.getElementById(`${modalId}`)
          );
        }

        modal.hide();

        await initFetchPurchaseRequest(search);

        window.electronAPI.showToast(result.message, true);
      } else {
        window.electronAPI.showToast(result.message, false);
      }
    } catch (error) {
      window.electronAPI.showToast(error.message, false);
    }
  });
}
