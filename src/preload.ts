import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  navigate: (page: string) => ipcRenderer.send("navigate", page),
  createSchedule: (data: any) => ipcRenderer.invoke("create-schedule", data),
  fetchSchedules: () => ipcRenderer.invoke("fetch-schedules"),
  deleteAllSchedule: (filter: string) => ipcRenderer.invoke("delete-all-schedule", filter),
  cancelSchedule: (id: number) => ipcRenderer.invoke("cancel-schedule", id),
  reschedule: (id: number, newDate: string) => ipcRenderer.invoke("reschedule", id, newDate),
  newPurchaseRequest: (data: any) => ipcRenderer.invoke("new-purchase-request", data),
  fetchPurchaseRequests: () => ipcRenderer.invoke("fetch-purchase-requests"),
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

