export function initNewPurchaseRequest() {
    const addPurchaseForm = document.getElementById("addPurchaseForm");
    const modal = new bootstrap.Modal(document.getElementById("addPurchaseModal"))

    addPurchaseForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const prNumber = parseInt(document.getElementById("addPurchaseNumber").value.trim());
        const requestedBy = document.getElementById("addPurchaseRequestedBy").value.trim();
        const requestedDate = document.getElementById("addPurchaseRequestedDate").value.trim();
        const purpose = document.getElementById("addPurchasePurpose").value.trim();
        const department =document.getElementById("addPurchaseDepartment").value.trim();

        if(!prNumber || !requestedBy || !requestedDate || !purpose || !department){window.electronAPI.showToast("All fields required.", false); return;}

        const data = {
            prNumber: prNumber,
            requestedBy: requestedBy,
            requestedDate: requestedDate,
            purpose: purpose,
            department: department,
        }

        try{
            const response = await window.electronAPI.newPurchaseRequest(data);

            response.success
              ? window.electronAPI.showToast(response.message, true)
              : window.electronAPI.showToast(response.message, false);

            modal.hide()

            initFetchPurchaseRequest()
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
                <td>${item.requestedBy}</td>
                <td>${item.department}</td>
                <td>${item.purpose}</td>
                <td>${formattedDate}</td>
                <td>${item.isApproved ? 'Approved' : '-- --'}</td>
                <td class="d-flex">
                    <i class="edit-icon icon-btn icon-sm material-icons ms-1" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Edit">edit</i>
                    <i class="edit-icon icon-btn icon-sm material-icons ms-1" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Edit">edit</i>
                    <i class="icon-btn icon-sm material-icons ms-1" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Edit">thumb_up</i>
                </td>
            `;
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error("Error fetching items:", error);
    }
}