export function initNewPettyCash() {
    const form = document.getElementById("newPettyForm");
    const modal = new bootstrap.Modal(document.getElementById("newPettyCashModal"))

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const purpose = document.getElementById("newPettyPurpose").value.trim();
        const cashAmount = parseInt(document.getElementById("newPettyAmount").value.trim());
        const dateIssued = document.getElementById("newPettyDate").value.trim();

        if(!cashAmount || !dateIssued || !purpose){window.electronAPI.showToast("All fields required.", false); return;}

        const data = {
            purpose: purpose,
            cashAmount: cashAmount,
            dateIssued:dateIssued,
        }

        try{
            const response = await window.electronAPI.newPettyCash(data);

            if (response.success){
              window.electronAPI.showToast(response.message, true)
              modal.hide()

              initFetchPettyCash()
            } else {
              window.electronAPI.showToast(response.message, false);
            }

        }catch(err){
            window.electronAPI.showToast(err.message, false);
        }
    })
}

export async function initFetchPettyCash(searchQuery = "") {
    try {
        const items = await window.electronAPI.fetchPettyCash();

        const tableBody = document.getElementById("pcTableBody");
        const pulledTable = document.getElementById("pcTable");

        tableBody.innerHTML = "";

        const filteredItems = items.filter((item) => {

            const itemDate = new Date(item.dateIssued).toLocaleString(undefined, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });

            const dateMatch = itemDate.includes(searchQuery);
            return dateMatch;
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

            const formattedDate = new Date(item.dateIssued)
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
                <td>${item.purpose}</td>
                <td>${item.cashAmount}</td>
                <td>${formattedDate}</td>
                <td class="${item.status === "released" ? "edit-icon" : "dlt-icon"}">${item.status === 'released' ? 'Released' : 'Pending'}</td>
                <td class="pb-0">
                    <i data-petty-id="${item.id}" class="deletePc dlt-icon icon-btn icon-sm material-icons " data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Delete" style="margin-left:3px;">delete</i>
                  
                    <i data-petty-id="${item.id}" class="releasePc edit-icon icon-btn icon-sm material-icons" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Release">file_upload</i>
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
export function initReleaseAllPc(search) {
  const releaseForm = document.querySelector("#releaseAllPettyModal form");
  if (!releaseForm) return;

  releaseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const result = await window.electronAPI.releaseAllPc();

      if (result.success) {
        let releaseAllModal = bootstrap.Modal.getInstance(
          document.getElementById("releaseAllPettyModal")
        );

        if (!releaseAllModal) {
          releaseAllModal = new bootstrap.Modal(document.getElementById("releaseAllPettyModal"));
        }

        releaseAllModal.hide();
        
        await initFetchPettyCash(search);

        window.electronAPI.showToast(result.message, true);
      } else {
        window.electronAPI.showToast(result.message, false);
      }
    } catch (error) {
      window.electronAPI.showToast(error.message, false);
    }
  });
}

export function initDeleteAllPc() {
  const deleteAllForm = document.querySelector("#deleteAllPcModal form");
  if (!deleteAllForm) return;

  deleteAllForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {

      const result = await window.electronAPI.deleteAllPettyCash();

      if (result.success) {
        // Close modal
        let deleteAllModal = bootstrap.Modal.getInstance(
          document.getElementById("deleteAllPcModal")
        );
        if (!deleteAllModal) {
          deleteAllModal = new bootstrap.Modal(document.getElementById("deleteAllPcModal"));
        }
        deleteAllModal.hide();
        // Refresh Purchase list
        await initFetchPettyCash();

        window.electronAPI.showToast(result.message, true);
      } else {
        window.electronAPI.showToast(result.message, false);
      }
    } catch (error) {
      window.electronAPI.showToast(error.message, false);
    }
  });
}