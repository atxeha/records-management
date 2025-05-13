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
      }
    } catch (error) {
    }
  }
}