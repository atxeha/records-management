
import { app, BrowserWindow, ipcMain, Menu, shell, dialog } from "electron";
import fs from "fs";
import path from "path";
import {
  createSchedule,
  newPurchaseRequest,
  newPettyCash,
  prisma,
  newRis,
  newVoucher,
  newFranchise,
  newObligationRequest
} from "./database";

let mainWindow: BrowserWindow | null;
app.whenReady().then(async() => {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    icon: path.join(__dirname, "../assets/icons/logo.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  await mainWindow.loadFile(path.join(app.getAppPath(), "public", "main.html"));
  mainWindow.maximize();

  Menu.setApplicationMenu(menu);
});

const menu = Menu.buildFromTemplate([
  {
    label: "About",
    submenu: [
      {
        label: "Developer",
        click: () => {
          shell.openExternal("https://www.facebook.com/a1yag/");
        },
      },
    ],
  },
]);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("create-schedule", async (event, data) => {
  try {
    await createSchedule(data.description, data.venue, data.date, data.official)

    return {success: true, message: "Schedule set successfully."}
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
})

ipcMain.handle("fetch-schedules", async () => {
  try {
    const schedules = await prisma.schedule.findMany({
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, message: "Schedule fetched successfully.", data: schedules };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
})

ipcMain.handle("fetch-todays-schedules", async () => {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const schedules = await prisma.schedule.findMany({
      where: {
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
        isDone: false,
        isCanceled: false,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, message: "Today's schedules fetched successfully.", data: schedules };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
})

ipcMain.handle("delete-all-schedule", async (event, filter) => {
  try {
    if (filter === "today") {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      );

      const count = await prisma.schedule.count({
        where: {
          date: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      if (count === 0) {
        return { success: false, message: "No schedules to delete for today." };
      }

      await prisma.schedule.deleteMany({
        where: {
          date: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });
      return { success: true, message: `All today's schedules deleted.` };
    } else {
      const count = await prisma.schedule.count();

      if (count === 0) {
        return { success: false, message: "No schedules to delete." };
      }

      await prisma.schedule.deleteMany({});
      return { success: true, message: "All schedules deleted." };
    }
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});

ipcMain.handle("cancel-schedule", async (event, id) => {
  try {
    await prisma.schedule.update({
      where: { id },
      data: {
        isCanceled: true,
      },
    })

    return { success: true, message: "Schedule canceled." }
  } catch (err) {
    return { success: false, message: (err as Error).message}
  }
})

ipcMain.handle("reschedule", async (event, id, newDate) => {
  try {
    let isoDate = newDate;
    if (newDate.length === 16) {
      isoDate = newDate + ":00";
    }

    await prisma.schedule.update({
      where: {id},
      data: {
        date: new Date(isoDate),
      },
    })

    return {success: true, message: "Rescheduled successfully."}
  } catch (err) {
    return {success: false, message: (err as Error).message}
  }
})

ipcMain.handle("done-schedule", async (event, id) => {
  try {
    await prisma.schedule.update({
      where: {id},
      data: {
        isDone: true,
      },
    })

    return { success: true, message: "Marked as done." };
  } catch (err) {
    return {success: false, message: (err as Error).message}
  }
})

ipcMain.handle("delete-schedule", async (event, id) => {
  try {
    await prisma.schedule.delete({
      where: {id},
    })

    return {success: true, message: "Schedule deleted."}
  } catch (err: any) {
    return {success: false, message: err.message}
  }
})

ipcMain.handle("new-purchase-request", async (event, data) => {
  try{
    const result = await newPurchaseRequest(
      data.receivedBy,
      data.receivedOn,
      data.purpose,
      data.department
    )
    if (result.success === false) {
      return { success: false, message: result.message };
    }
    return { success: true, message: "Purchase Request added.", data: result.data };
  }catch(err){
    return {success: false, message: (err as Error).message}
  }
})

ipcMain.handle("fetch-purchase-requests", async () => {
  try{
    const requests = await prisma.purchaseRequest.findMany({
      orderBy: {
        receivedOn: "asc",
      },
    })

    return requests;
  }catch(err){
    return (err as Error).message
  }
})

ipcMain.handle("approve-reject-pr", async (e, id, status) => {
  try {
    const statusObj = await prisma.purchaseRequest.findUnique({
      where: {id},
      select: {
        status: true,
      },
    })

    if(statusObj?.status === status) {
      return { success: false, message: `Request already ${status}.` }
    }

    const result = await prisma.purchaseRequest.update({
      where: {id},
      data: {
        status: status,
        releasedOn: new Date(),
      },
    })

    console.log(result);

    return {success: true, message: `Request ${status}. ${result}`}
  }catch (err: any) {
    return{success: false, message: err.message}
  }
})

ipcMain.handle("new-petty-cash", async (event, data) => {
  try{
    const result = await newPettyCash(
      data.purpose,
      data.cashAmount,
      data.dateIssued
    )
    if (result.success === false) {
      return { success: false, message: result.message };
    }
    return { success: true, message: "Petty Cash added.", data: result.data };
  }catch(err){
    return {success: false, message: (err as Error).message}
  }
})

ipcMain.handle("fetch-petty-cash", async () => {
  try {
    const pettyCash = await prisma.pettyCash.findMany({
      orderBy: {
        dateIssued: "desc",
      },
    })

    return pettyCash;
  } catch (err) {
    return (err as Error).message
  }
})

ipcMain.handle("release-all-pc", async () => {
  try {
    const notReleasedCount = await prisma.pettyCash.count({
      where: {
        status: {
          not: "released",
        },
      },
    });

    if (notReleasedCount === 0) {
      return { success: false, message: "All cash already released." };
    }

    await prisma.pettyCash.updateMany({
      data: {
        status: "released",
      },
    });

    return { success: true, message: "All cash have been released." };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});

ipcMain.handle("release-pc", async (e, id, status) => {
  try {
    const statusObj = await prisma.pettyCash.findUnique({
      where: { id },
      select: {
        status: true,
      },
    })

    if (statusObj?.status === status) {
      return { success: false, message: `Cash already ${status}.` }
    }

    await prisma.pettyCash.update({
      where: { id },
      data: {
        status: status,
      },
    })

    return { success: true, message: `Cash ${status}.` }
  } catch (err: any) {
    return { success: false, message: err.message }
  }
})

ipcMain.handle("delete-pc", async (event, id) => {
  try {
    await prisma.pettyCash.delete({
      where: { id },
    })

    return { success: true, message: "Petty cash deleted." }
  } catch (err: any) {
    return { success: false, message: err.message }
  }
})

ipcMain.handle("new-ris", async (event, data) => {
  try {
    const result = await newRis(
      data.risNumber,
      data.item,
      data.preparedBy,
      data.purpose,
      data.issuedTo,
      data.preparedDate
    )
    if (result.success === false) {
      return { success: false, message: result.message };
    }
    return { success: true, message: "Issue slip added.", data: result.data };
  } catch (err) {
    return { success: false, message: (err as Error).message }
  }
})

ipcMain.handle("fetch-ris-voucher", async (event, tableName) => {
    try {
        if (tableName === "requisitionIssueSlip") {
            const risData = await prisma.requisitionIssueSlip.findMany({
                orderBy: {
                    preparedDate: "desc",
                },
            });

            return risData;

        } else if (tableName === "voucher") {
            const voucherData = await prisma.voucher.findMany({
                orderBy: {
                    datePrepared: "desc",
                },
            });

            return voucherData;

        } else if (tableName === "franchise") {
            const franchiseData = await prisma.franchise.findMany({
                orderBy: {
                    startDate: "desc",
                },
            });

            return franchiseData;

        } else if (tableName === "obligationRequest") {
            const orData = await prisma.obligationRequest.findMany({
                orderBy: {
                    preparedDate: "desc",
                },
            });

            return orData;

        } else {
            return { success: false, message: "Invalid table name." };
        }
    } catch (err) {
        return (err as Error).message;
    }
})

ipcMain.handle("delete-all-records", async (event, tableName) => {
  try {
    const validTables = ["requisitionIssueSlip", "purchaseRequest", "voucher", "pettyCash", "schedule", "franchise", "obligationRequest"];

    if (!validTables.includes(tableName)) {
      return { success: false, message: "Invalid table name." };
    }

    const model = (prisma as any)[tableName];

    if (!model) {
      return { success: false, message: "Invalid table name." };
    }

    const count = await model.count();

    if (count === 0) {
      return { success: false, message: "No records to delete." };
    }

    await model.deleteMany();

    return { success: true, message: "All records deleted." };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
})

ipcMain.handle("update-all-status", async (event, tableName, status) => {
  try {
    const validTables = ["requisitionIssueSlip", "purchaseRequest", "voucher", "pettyCash", "schedule", "franchise", "obligationRequest"];

    if (!validTables.includes(tableName)) {
      return { success: false, message: "Invalid table name." };
    }

    const model = (prisma as any)[tableName];

    if (!model) {
      return { success: false, message: "Invalid table name." };
    }

    const notCount = await model.count({
      where: {
        status: {
          not: status,
        },
      },
    });

    if (notCount === 0) {
      return { success: false, message: `All ${tableName} already ${status}.` };
    }

    if (status === "rejected") {
      await model.updateMany({
      where: {
        status: {
          not: status,
        },
      },
      data: {
        status: status,
      },
    });
    } else {
      await model.updateMany({
        where: {
          status: {
            not: status,
          },
        },
        data: {
          status: status,
          releasedOn: new Date(),
        },
      });
    }
    

    return { success: true, message: `${notCount} ${tableName} records ${status}.` };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});

ipcMain.handle("approve-reject", async (e, id, status, tableName) => {
  try {
    const validTables = ["requisitionIssueSlip", "purchaseRequest", "voucher", "obligationRequest"];

    if (!validTables.includes(tableName)) {
      return { success: false, message: "Invalid table name." };
    }

    const model = (prisma as any)[tableName];

    if (!model) {
      return { success: false, message: "Invalid table name." };
    }

    const statusObj = await model.findUnique({
      where: { id },
      select: {
        status: true,
      },
    });

    if (statusObj?.status === status) {
      return { success: false, message: `Request already ${status}.` };
    }

    if (status === "rejected") {
      await model.update({
        where: { id },
        data: {
          status: status,
        },
      });
    } else {
      await model.update({
        where: { id },
        data: {
          status: status,
          releasedOn: new Date(),
        },
      });
    }

    return { success: true, message: `Request ${status}.` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
});

ipcMain.handle("new-voucher", async (event, data) => {
  try {
    const result = await newVoucher(
      data.voucherNumber,
      data.payee,
      data.amount,
      data.purpose,
      data.accountTitle,
      data.datePrepared
    );
    if (result.success === false) {
      return { success: false, message: result.message };
    }
    return { success: true, message: "New Voucher added.", data: result.data };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});

ipcMain.handle("new-franchise", async (event, data) => {
  try {
    const result = await newFranchise(
      data.franchiseCode,
      data.franchiseName,
      data.issuedBy,
      data.issuedTo,
      data.startDate,
      data.endDate
    );
    if (result.success === false) {
      return { success: false, message: result.message };
    }
    return { success: true, message: "New Franchise added.", data: result.data };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});

ipcMain.handle("delete-franchise", async (event, id) => {
  try {
    await prisma.franchise.delete({
      where: { id },
    });

    return { success: true, message: "Franchise deleted." };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
});

ipcMain.handle("edit-franchise", async (_event, data) => {
  const {
    id,
    franchiseCode,
    franchiseName,
    issuedBy,
    issuedTo,
    startDate,
    endDate,
  } = data;

  try {
    const updatedFranchise = await prisma.franchise.update({
      where: { id: Number(id) },
      data: {
        franchiseCode: BigInt(franchiseCode),
        franchiseName,
        issuedBy,
        issuedTo,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return { success: true, message: "Franchise updated successfully.", data: updatedFranchise };
  } catch (err) {
    console.error("Edit franchise error:", err);
    return { success: false, message: "Failed to update franchise." };
  }
});

ipcMain.handle("new-obligation", async (event, data) => {
  try {
    const result = await newObligationRequest(
      data.title,
      data.purpose,
      data.amount,
      data.fundSource,
      data.department,
      data.preparedDate,
      data.status
    )
    if (result.success === false) {
      return { success: false, message: result.message };
    }
    return { success: true, message: "Obligation Request added.", data: result.data };
  } catch (err) {
    return { success: false, message: (err as Error).message }
  }
})

ipcMain.handle("fetch-qoute", async () => {
  try {
    const result = await prisma.qoute.findMany()

    return result;
  } catch (err) {
    return { success: false, message: (err as Error).message }
  }
})

ipcMain.handle("count-record", async (event, tableName) => {
    try {
        if (tableName === "purchaseRequest") {
            const count = await prisma.purchaseRequest.count({
                where: {
                    status: "pending",
                },
            });
            return { success: true, count };

        } else if (tableName === "obligationRequest") {
            const count = await prisma.obligationRequest.count({
                where: {
                    status: "pending",
                },
            });
            return { success: true, count };

        } else if (tableName === "requisitionIssueSlip") {
            const count = await prisma.requisitionIssueSlip.count({
                where: {
                    status: "pending",
                },
            });
            return { success: true, count };
        } else if (tableName === "pettyCash") {
            const count = await prisma.pettyCash.count({
                where: {
                    status: "pending",
                },
            });
            return { success: true, count };

        } else if (tableName === "voucher") {
            const count = await prisma.voucher.count({
                where: {
                    status: "pending",
                },
            });
            return { success: true, count };
        }

    } catch (err) {
        return { success: false, message: (err as Error).message };
    }
});
