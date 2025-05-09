export function initNewPettyCash() {
    const form = document.getElementById("newPettyForm");
    const modal = new bootstrap.Modal(document.getElementById("newPettyCashModal"))

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const receivedBy = document.getElementById("receivedBy").value.trim();
        const purpose = document.getElementById("newPettyPurpose").value.trim();
        const department = document.getElementById("newPettyDepartment").value.trim();
        const amount = parseInt(document.getElementById("newPettyAmount").value.trim());
        const receivedOn = document.getElementById("receivedOn").value.trim();

        if(!amount || !receivedOn || !purpose || !receivedBy || !department){window.electronAPI.showToast("All fields required.", false); return;}

        const data = {
          receivedBy: receivedBy,
          purpose: purpose,
          department: department,
            amount: amount,
            receivedOn:receivedOn,
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

            const itemDate = new Date(item.receivedOn).toLocaleString(undefined, {
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
                <td>${item.purpose}</td>
                <td>${item.department}</td>
                <td>${item.amount}</td>
                <td>${item.receivedBy}</td>
                <td>${formattedReceivedOn}</td>
                <td>${item.releasedOn ? formattedReleasedOn : "-- --"}</td>
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
      const result = await window.electronAPI.deleteAllRecords("pettyCash");

      if (result.success) {
        let deleteAllModal = bootstrap.Modal.getInstance(
          document.getElementById("deleteAllPcModal")
        );

        if (!deleteAllModal) {
          deleteAllModal = new bootstrap.Modal(document.getElementById("deleteAllPcModal"));
        }

        deleteAllModal.hide();
        
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

export function initReleasePc(search) {
  const tableBody = document.getElementById("pcTableBody");

  if (tableBody) {
    tableBody.addEventListener("click", async (event) => {
      const target = event.target;
      if (target.classList.contains("releasePc")) {
        event.preventDefault();
        const id = target.dataset.pettyId;

        const res = await window.electronAPI.releasePc(parseInt(id), "released")

        if(res.success){
          window.electronAPI.showToast(res.message, true)
          initFetchPettyCash(search)

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

export function initDeletePc(search) {
    const tableBody = document.getElementById("pcTableBody");

    if (tableBody) {
        tableBody.addEventListener("click", async (event) => {
            const target = event.target;
            if (target.classList.contains("deletePc")) {
                event.preventDefault();
                const id = target.dataset.pettyId;

                const res = await window.electronAPI.deletePc(parseInt(id))

                if (res.success) {
                    window.electronAPI.showToast(res.message, true)
                    initFetchPettyCash(search)

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