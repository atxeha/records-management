export function initNewRis() {
    const newRisForm = document.getElementById("newRisForm");
    const modal = new bootstrap.Modal(document.getElementById("newRisModal"))
    newRisForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const docTitle = document.getElementById("docTitle").value.trim();
      const receivedBy = document.getElementById("receivedBy").value.trim();
      const receivedOn = document.getElementById("receivedOn").value.trim();
      const purpose = document.getElementById("purpose").value.trim();
      const department = document.getElementById("department").value.trim();
      if (!docTitle || !receivedBy || !receivedOn || !purpose || !department) { window.electronAPI.showToast("All fields required.", false); return; }
      const data = {
        docTitle: docTitle,
        receivedBy: receivedBy,
        receivedOn: receivedOn,
        purpose: purpose,
        department: department,
      }
        try{
            const response = await window.electronAPI.newRis(data);
            if (response.success){
              window.electronAPI.showToast(response.message, true)
              modal.hide()
              initFetchRis()
            } else {
              window.electronAPI.showToast(response.message, false);
            }
        }catch(err){
            window.electronAPI.showToast(err.message, false);
        }
    })
}
export async function initFetchRis(searchQuery = "") {
    try {
        const items = await window.electronAPI.fetchRisVoucher("requisitionIssueSlip");
        const tableBody = document.getElementById("risTableBody");
        const pulledTable = document.getElementById("risTable");
        tableBody.innerHTML = "";
        const filteredItems = items.filter((item) => {
            const itemCodeMatch = item.department
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            const itemDate = new Date(item.receivedOn).toLocaleString(undefined, {
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
          const formattedReceivedOn = new Date(item.receivedOn)
            .toLocaleString(undefined, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          const formattedReleasedOn = new Date(item.releasedOn)
            .toLocaleString(undefined, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.docTitle}</td>
                <td>${item.purpose}</td>
                <td>${item.department}</td>
                <td>${item.receivedBy}</td>
                <td>${formattedReceivedOn}</td>
                <td>${item.releasedOn ? formattedReleasedOn : "-- --"}</td>
                <td class="${item.status === "approved" ? "edit-icon" : item.status === "rejected" ? "dlt-icon" : ""}">${item.status === "pending" ? "Unsigned" : item.status === "rejected" ? "Rejected" : "Released"}</td>
                <td class="pb-0">
                    <i data-ris-id="${item.id}" class="rejectRis dlt-icon icon-btn icon-sm material-icons me-1" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Reject" style="margin-left:1px;">close</i>
                  
                    <i data-ris-id="${item.id}" class="approveRis edit-icon icon-btn icon-sm material-icons" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Release">check</i>
                </td>
            `;
            tableBody.appendChild(row);
        });
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
    }
}
export function initDeleteAllRis() {
  const deleteAllForm = document.querySelector("#deleteAllRisModal form");
  if (!deleteAllForm) return;
  deleteAllForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const result = await window.electronAPI.deleteAllRecords("requisitionIssueSlip");
      if (result.success) {
        let deleteAllModal = bootstrap.Modal.getInstance(
          document.getElementById("deleteAllRisModal")
        );
        if (!deleteAllModal) {
          deleteAllModal = new bootstrap.Modal(document.getElementById("deleteAllRisModal"));
        }
        deleteAllModal.hide();
        await initFetchRis();
        window.electronAPI.showToast(result.message, true);
      } else {
        window.electronAPI.showToast(result.message, false);
      }
    } catch (error) {
      window.electronAPI.showToast(error.message, false);
    }
  });
}
export function initUpdateAllRisStatus(modalId, tableName, status, search) {
  const form = document.querySelector(`#${modalId} form`);
  if (!form) return;
  form.removeEventListener("submit", form._submitHandler);
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
        await initFetchRis(search);
        window.electronAPI.showToast(result.message, true);
      } else {
        window.electronAPI.showToast(result.message, false);
      }
    } catch (error) {
      window.electronAPI.showToast(error.message, false);
    }
  };
  form._submitHandler = submitHandler;
  form.addEventListener("submit", submitHandler);
}
export function initApproveRejectRis(search) {
    const tableBody = document.getElementById("risTableBody");
    if (tableBody) {
        tableBody.addEventListener("click", async (event) => {
            const target = event.target;
            if (target.classList.contains("rejectRis")) {
                event.preventDefault();
                const id = target.dataset.risId;
                const res = await window.electronAPI.approveReject(
                    parseInt(id),
                    "rejected",
                    "requisitionIssueSlip"
                );
                if (res.success) {
                    window.electronAPI.showToast(res.message, true);
                    initFetchRis(search);
                    const tooltip = bootstrap.Tooltip.getInstance(target);
                    if (tooltip) {
                    tooltip.hide();
                    }
                } else {
                    window.electronAPI.showToast(res.message, false);
                    return;
                }
            } else if (target.classList.contains("approveRis")) {
                event.preventDefault();
                const id = target.dataset.risId;
                const res = await window.electronAPI.approveReject(
                    parseInt(id),
                    "approved",
                    "requisitionIssueSlip"
                );
                if (res.success) {
                    window.electronAPI.showToast(res.message, true);
                    initFetchRis(search);
                    const tooltip = bootstrap.Tooltip.getInstance(target);
                    if (tooltip) {
                    tooltip.hide();
                    }
                } else {
                    window.electronAPI.showToast(res.message, false);
                    return;
                }
            }
        });
    }
}