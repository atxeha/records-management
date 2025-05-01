export function initNewRis() {
    const newRisForm = document.getElementById("newRisForm");
    const modal = new bootstrap.Modal(document.getElementById("newRisModal"))

    newRisForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const risNumber = parseInt(document.getElementById("newRisNumber").value.trim());
        const item = document.getElementById("newRisItem").value.trim();
        const issuedFrom = document.getElementById("newRisBy").value.trim();
        const purpose = document.getElementById("newRisPurpose").value.trim();
        const issuedTo = document.getElementById("newRisTo").value.trim();
        const date = document.getElementById("newRisDate").value.trim();

        if(!risNumber || !item || !issuedFrom || !purpose || !issuedTo || !date){window.electronAPI.showToast("All fields required.", false); return;}
          
        const data = {
            risNumber: risNumber,
            item: item,
            preparedBy: issuedFrom,
            purpose: purpose,
            issuedTo: issuedTo,
            preparedDate: date,
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
        const items = await window.electronAPI.fetchRis();

        const tableBody = document.getElementById("risTableBody");
        const pulledTable = document.getElementById("risTable");

        tableBody.innerHTML = "";

        const filteredItems = items.filter((item) => {
            const itemCodeMatch = item.issuedTo
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            const itemDate = new Date(item.preparedDate).toLocaleString(undefined, {
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

            const formattedDate = new Date(item.preparedDate)
                .toLocaleString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                })

            row.innerHTML = `
                <td>${item.risNumber}</td>
                <td>${item.item}</td>
                <td>${item.preparedBy}</td>
                <td>${item.issuedTo}</td>
                <td>${item.purpose}</td>
                <td>${formattedDate}</td>
                <td class="${item.status === "approved" ? "edit-icon" : item.status === "rejected" ? "dlt-icon" : ""}">${item.status === "pending" ? "Pending" : item.status === "rejected" ? "Rejected" : "Approved"}</td>
                <td class="pb-0">
                    <i data-ris-id="${item.id}" class="rejectRis dlt-icon icon-btn icon-sm material-icons me-1" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Reject" style="margin-left:1px;">close</i>
                  
                    <i data-ris-id="${item.id}" class="approveRis edit-icon icon-btn icon-sm material-icons" data-bs-toggle="tooltip"
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

export function initDeleteAllRis() {
  const deleteAllForm = document.querySelector("#deleteAllRisModal form");
  if (!deleteAllForm) return;

  deleteAllForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const result = await window.electronAPI.deleteAllRis();

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

export function initRejectAllRis() {
  const deleteAllForm = document.querySelector("#rejectAllRisModal form");
  if (!deleteAllForm) return;

  deleteAllForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const result = await window.electronAPI.rejectAllRis();

      if (result.success) {
        let deleteAllModal = bootstrap.Modal.getInstance(
          document.getElementById("rejectAllRisModal")
        );

        if (!deleteAllModal) {
          deleteAllModal = new bootstrap.Modal(
            document.getElementById("rejectAllRisModal")
          );
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

export function initApproveAllRis() {
  const deleteAllForm = document.querySelector("#approveAllRisModal form");
  if (!deleteAllForm) return;

  deleteAllForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const result = await window.electronAPI.approveAllRis();

      if (result.success) {
        let deleteAllModal = bootstrap.Modal.getInstance(
          document.getElementById("approveAllRisModal")
        );

        if (!deleteAllModal) {
          deleteAllModal = new bootstrap.Modal(
            document.getElementById("approveAllRisModal")
          );
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

export function initApproveRejectRis(search) {
    const tableBody = document.getElementById("risTableBody");

    if (tableBody) {
        tableBody.addEventListener("click", async (event) => {
            const target = event.target;
            if (target.classList.contains("rejectRis")) {
                event.preventDefault();
                const id = target.dataset.risId;

                const res = await window.electronAPI.approveRejectRis(
                    parseInt(id),
                    "rejected"
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

                const res = await window.electronAPI.approveRejectRis(
                    parseInt(id),
                    "approved"
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
    } else {
    console.log("risTableBody not found");
    }
}