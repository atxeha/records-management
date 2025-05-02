import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  navigate: (page: string) => ipcRenderer.send("navigate", page),
  showToast: (message: string, success: boolean) => {
    window.postMessage({ type: "show-toast", message, success });
  },
  createSchedule: (data: any) => ipcRenderer.invoke("create-schedule", data),
  fetchSchedules: () => ipcRenderer.invoke("fetch-schedules"),
  deleteAllSchedule: (filter: string) => ipcRenderer.invoke("delete-all-schedule", filter),
  cancelSchedule: (id: number) => ipcRenderer.invoke("cancel-schedule", id),
  reschedule: (id: number, newDate: string) => ipcRenderer.invoke("reschedule", id, newDate),
  doneSchedule: (id: number) => ipcRenderer.invoke("done-schedule", id),
  deleteSchedule: (id: number) => ipcRenderer.invoke("delete-schedule", id),
  newPurchaseRequest: (data: any) => ipcRenderer.invoke("new-purchase-request", data),
  fetchPurchaseRequests: () => ipcRenderer.invoke("fetch-purchase-requests"),
  // approveRejectPr: (id: number, status: string) => ipcRenderer.invoke("approve-reject-pr", id, status),
  newPettyCash: (data: any) => ipcRenderer.invoke("new-petty-cash", data),
  fetchPettyCash: () => ipcRenderer.invoke("fetch-petty-cash"),
  releaseAllPc: () => ipcRenderer.invoke("release-all-pc"),
  releasePc: (id: number, status: string) => ipcRenderer.invoke("release-pc", id, status),
  deletePc: (id: number) => ipcRenderer.invoke("delete-pc", id),
  newRis: (data: any) => ipcRenderer.invoke("new-ris", data),
  fetchRisVoucher: (tableName: string) => ipcRenderer.invoke("fetch-ris-voucher", tableName),
  updateAllStatus: (tableName: string, status: string) => ipcRenderer.invoke("update-all-status", tableName, status),
  approveReject: (id: number, status: string, tableName: string) => ipcRenderer.invoke("approve-reject", id, status, tableName),
  newVoucher: (data: any) => ipcRenderer.invoke("new-voucher", data),
  deleteAllRecords: (tableName: string) => ipcRenderer.invoke("delete-all-records", tableName),
});

