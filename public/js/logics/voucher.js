export function initNewVoucher() {
  const newVoucherForm = document.getElementById("newVoucherForm");
  const modal = new bootstrap.Modal(document.getElementById("newVoucherModal"));
  newVoucherForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payee = document.getElementById("newVoucherPayee").value.trim();
    const vcode = document.getElementById("newVoucherCode").value.trim();
    const amount = parseInt(
      document.getElementById("newVoucherAmount").value.trim()
    );
    const purpose = document.getElementById("newVoucherPurpose").value.trim();
    const receivedBy = document
      .getElementById("newVoucherReceivedBy")
      .value.trim();
    const date = document.getElementById("newVoucherDate").value.trim();
    if (!payee || !vcode || !amount || !purpose || !receivedBy || !date) {
      window.electronAPI.showToast("All fields required.", false);
      return;
    }
    const data = {
      payee: payee,
      code: vcode,
      amount: amount,
      purpose: purpose,
      receivedBy: receivedBy,
      receivedOn: date,
    };
    try {
      const response = await window.electronAPI.newVoucher(data);
      if (response.success) {
        window.electronAPI.showToast(response.message, true);
        modal.hide();
        initFetchVoucher();
      } else {
        window.electronAPI.showToast(response.message, false);
      }
    } catch (err) {
      window.electronAPI.showToast(err.message, false);
    }
  });
}
export async function initFetchVoucher(searchQuery = "") {
  try {
    const items = await window.electronAPI.fetchRisVoucher("voucher");
    const tableBody = document.getElementById("voucherTableBody");
    const pulledTable = document.getElementById("voucherTable");
    tableBody.innerHTML = "";
    const filteredItems = items.filter((item) => {
      const itemCodeMatch = item.payee
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
                <td colspan="10" class="text-center text-muted pt-3"><h6>No Records found</h6></td>
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
                <td>${item.code}</td>
                <td>${item.payee}</td>
                <td>${item.amount}</td>
                <td>${item.purpose}</td>
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
                    <i data-voucher-id="${
                      item.id
                    }" class="rejectVoucher dlt-icon icon-btn icon-sm material-icons me-1" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Reject" style="margin-left:1px;">close</i>
                  
                    <i data-voucher-id="${
                      item.id
                    }" class="approveVoucher edit-icon icon-btn icon-sm material-icons" data-bs-toggle="tooltip"
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
  } catch (error) {}
}
export function initUpdateAllVoucherStatus(modalId, tableName, status, search) {
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
        await initFetchVoucher(search);
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
export function initDeleteAllVoucher() {
  const deleteAllForm = document.querySelector("#deleteAllVoucherModal form");
  if (!deleteAllForm) return;
  deleteAllForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const result = await window.electronAPI.deleteAllRecords("voucher");
      if (result.success) {
        let deleteAllModal = bootstrap.Modal.getInstance(
          document.getElementById("deleteAllVoucherModal")
        );
        if (!deleteAllModal) {
          deleteAllModal = new bootstrap.Modal(
            document.getElementById("deleteAllVoucherModal")
          );
        }
        deleteAllModal.hide();
        await initFetchVoucher();
        window.electronAPI.showToast(result.message, true);
      } else {
        window.electronAPI.showToast(result.message, false);
      }
    } catch (error) {
      window.electronAPI.showToast(error.message, false);
    }
  });
}
export function initApproveRejectVoucher(search) {
  const tableBody = document.getElementById("voucherTableBody");
  if (tableBody) {
    tableBody.addEventListener("click", async (event) => {
      const target = event.target;
      if (target.classList.contains("rejectVoucher")) {
        event.preventDefault();
        const id = target.dataset.voucherId;
        const res = await window.electronAPI.approveReject(
          parseInt(id),
          "rejected",
          "voucher"
        );
        if (res.success) {
          window.electronAPI.showToast(res.message, true);
          initFetchVoucher(search);
          const tooltip = bootstrap.Tooltip.getInstance(target);
          if (tooltip) {
            tooltip.hide();
          }
        } else {
          window.electronAPI.showToast(res.message, false);
          return;
        }
      } else if (target.classList.contains("approveVoucher")) {
        event.preventDefault();
        const id = target.dataset.voucherId;
        const res = await window.electronAPI.approveReject(
          parseInt(id),
          "approved",
          "voucher"
        );
        if (res.success) {
          window.electronAPI.showToast(res.message, true);
          initFetchVoucher(search);
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