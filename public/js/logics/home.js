export async function initCount() {
  const tables = [
    { id: "prCount", tableName: "purchaseRequest" },
    { id: "risCount", tableName: "requisitionIssueSlip" },
    { id: "pcCount", tableName: "pettyCash" },
    { id: "vCount", tableName: "voucher" },
    { id: "orCount", tableName: "obligationRequest" },
  ];

  for (const { id, tableName } of tables) {
    try {
      const response = await window.electronAPI.countRecord(tableName);
      if (response && response.success) {
        const countElement = document.getElementById(id);
        if (countElement) {
          countElement.textContent = response.count.toString();
        }
      } else {
        console.error(`Failed to fetch count for ${tableName}:`, response.message);
      }
    } catch (error) {
      console.error(`Error fetching count for ${tableName}:`, error);
    }
  }
}

export async function initFetchFranchise() {
  try {
    const items = await window.electronAPI.fetchRisVoucher("franchise");

    const tableBody = document.getElementById("tableBody");
    const pulledTable = document.getElementById("table");

    tableBody.innerHTML = "";


    if (items.length === 0) {
      pulledTable.classList.remove("table-hover");
      tableBody.innerHTML = `
                <tr>
                <td colspan="9" class="text-center text-muted pt-3"><h6>No Records at this moment</h6></td>
                </tr>
            `;
      return;
    }

    items.forEach((item, index) => {
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
                <td>${item.issuedTo}</td>
                <td>${formattedStartDate}</td>
                <td>${formattedEndDate}</td>
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
