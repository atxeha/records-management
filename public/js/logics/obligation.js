export function initNewOr() {
  const newObligationForm = document.getElementById("newObligationForm");
  const modal = new bootstrap.Modal(
    document.getElementById("newObligationModal")
  );
  newObligationForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const receivedBy = document
      .getElementById("newObligationReceivedBy")
      .value.trim();
    const department = document
      .getElementById("newObligationDepartment")
      .value.trim();
    const amount = parseInt(
      document.getElementById("newObligationAmount").value.trim()
    );
    const purpose = document
      .getElementById("newObligationPurpose")
      .value.trim();
    const date = document.getElementById("newObligationDate").value.trim();
    if (!receivedBy || !purpose || !amount || !department || !date) {
      window.electronAPI.showToast("All fields required.", false);
      return;
    }
    const data = {
      purpose: purpose,
      amount: amount,
      department: department,
      receivedBy: receivedBy,
      receivedOn: date,
    };
    try {
      const response = await window.electronAPI.newObligation(data);
      if (response.success) {
        window.electronAPI.showToast(response.message, true);
        modal.hide();
        initFetchOr();
      } else {
        window.electronAPI.showToast(response.message, false);
      }
    } catch (err) {
      window.electronAPI.showToast(err.message, false);
    }
  });
}
export async function initFetchOr(searchQuery = "") {
  try {
    const items = await window.electronAPI.fetchRisVoucher("obligationRequest");
    const tableBody = document.getElementById("obligationTableBody");
    const pulledTable = document.getElementById("obligationTable");
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
                <td>${item.releasedOn ? formattedReleasedOn : "-- --"}</td>
                <td class="${
                  item.status === "approved"
                    ? "edit-icon"
                    : item.status === "rejected"
                    ? "dlt-icon"
                    : ""
                }">${
        item.status === "pending"
          ? "Unsigned"
          : item.status === "rejected"
          ? "Rejected"
          : "Released"
      }</td>
                <td class="pb-0">
                    <i data-obligation-id="${
                      item.id
                    }" class="rejectOr dlt-icon icon-btn icon-sm material-icons me-1" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Reject" style="margin-left:1px;">close</i>
                  
                    <i data-obligation-id="${
                      item.id
                    }" class="approveOr edit-icon icon-btn icon-sm material-icons" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Released">check</i>
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
  } catch (error) {}
}
export function initDeleteAllOr() {
  const deleteAllForm = document.querySelector(
    "#deleteAllObligationModal form"
  );
  if (!deleteAllForm) return;
  deleteAllForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const result = await window.electronAPI.deleteAllRecords(
        "obligationRequest"
      );
      if (result.success) {
        let deleteAllModal = bootstrap.Modal.getInstance(
          document.getElementById("deleteAllObligationModal")
        );
        if (!deleteAllModal) {
          deleteAllModal = new bootstrap.Modal(
            document.getElementById("deleteAllObligationModal")
          );
        }
        deleteAllModal.hide();
        await initFetchOr();
        window.electronAPI.showToast(result.message, true);
      } else {
        window.electronAPI.showToast(result.message, false);
      }
    } catch (error) {
      window.electronAPI.showToast(error.message, false);
    }
  });
}
export function initRejectApproveOr(search) {
  const tableBody = document.getElementById("obligationTableBody");
  if (tableBody) {
    tableBody.addEventListener("click", async (event) => {
      const target = event.target;
      if (target.classList.contains("rejectOr")) {
        event.preventDefault();
        const id = target.dataset.obligationId;
        const res = await window.electronAPI.approveReject(
          parseInt(id),
          "rejected",
          "obligationRequest"
        );
        if (res.success) {
          window.electronAPI.showToast(res.message, true);
          initFetchOr(search);
          const tooltip = bootstrap.Tooltip.getInstance(target);
          if (tooltip) {
            tooltip.hide();
          }
        } else {
          window.electronAPI.showToast(res.message, false);
          return;
        }
      } else if (target.classList.contains("approveOr")) {
        event.preventDefault();
        const id = target.dataset.obligationId;
        const res = await window.electronAPI.approveReject(
          parseInt(id),
          "approved",
          "obligationRequest"
        );
        if (res.success) {
          window.electronAPI.showToast(res.message, true);
          initFetchOr(search);
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
export function initUpdateAllObligationStatus(
  modalId,
  tableName,
  status,
  search
) {
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
        await initFetchOr(search);
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
