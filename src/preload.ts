import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  navigate: (page: string) => ipcRenderer.send("navigate", page),
  createSchedule: (data: any) => ipcRenderer.invoke("create-schedule", data),
  fetchSchedules: () => ipcRenderer.invoke("fetch-schedules"),
  deleteAllSchedule: (filter: string) => ipcRenderer.invoke("delete-all-schedule", filter),
  cancelSchedule: (id: number) => ipcRenderer.invoke("cancel-schedule", id),
  reschedule: (id: number, newDate: string) => ipcRenderer.invoke("reschedule", id, newDate),
  doneSchedule: (id: number) => ipcRenderer.invoke("done-schedule", id),
  deleteSchedule: (id: number) => ipcRenderer.invoke("delete-schedule", id),
  newPurchaseRequest: (data: any) => ipcRenderer.invoke("new-purchase-request", data),
  fetchPurchaseRequests: () => ipcRenderer.invoke("fetch-purchase-requests"),
  approveRejectPr: (id: number, status: string) => ipcRenderer.invoke("approve-reject-pr", id, status),
  deleteAllPr: () => ipcRenderer.invoke("delete-all-pr"),
  // addItem: (data: any) => ipcRenderer.invoke("add-item", data),
  // getItems: () => ipcRenderer.invoke("get-items"),
  // pullItem: (data: any) => ipcRenderer.invoke("pull-item", data),
  // getPullItems: (data: any) => ipcRenderer.invoke("get-pull-items", data),
  showToast: (message: string, success: boolean) => {
    window.postMessage({ type: "show-toast", message, success });
  },
  // updateItemQuantity: (data: any) =>
  //   ipcRenderer.invoke("update-item-quantity", data),
  // deleteItem: (item: number) => ipcRenderer.invoke("delete-item", item),
  // deleteItemFromTable: (id: string, table: "PulledItem" | "AddedItem") => ipcRenderer.invoke("delete-item-from-table", id, table),
  // editItem: (data: any) => ipcRenderer.invoke("edit-item", data),
  // exportItems: (tableName: string) => ipcRenderer.invoke("export-items", tableName),
  // importItems: () => ipcRenderer.invoke("import-items"),
  // addAddedItem: (data: any) => ipcRenderer.invoke("add-added-item", data),
  // addLog: (data: any) => ipcRenderer.invoke("add-log", data),
  // getLog: () => ipcRenderer.invoke("get-log"),
  // deleteAllLogs: () => ipcRenderer.invoke("delete-all-logs"),
  // getAddedItems: () => ipcRenderer.invoke("get-added-items"),
  // deleteSelectedItems: (tableName: string, selectedIds: (string | number)[]) => 
  //   ipcRenderer.invoke("delete-selected-items", { tableName, selectedIds }),
});

