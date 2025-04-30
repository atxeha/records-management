import { app, BrowserWindow, ipcMain, Menu, shell, dialog } from "electron";
import fs from "fs";
import path from "path";
import {
  createSchedule,
  newPurchaseRequest,
  newPettyCash,
  prisma
} from "./database";
import { execSync } from "child_process";

const isDev = !app.isPackaged;

if (!isDev) {
  try {
    console.log("Running Prisma Migration...");
    const output = execSync("npx prisma migrate deploy", {
      stdio: "pipe",
      encoding: "utf-8",
    });
    console.log("Migration Output:\n", output);
  } catch (error: any) {
    console.error("Migration Error:\n", error.message);
  }
}

function capitalizeWords(str: string) {
  return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
}

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
    label: "File",
    submenu: [
      {
        label: "Exit",
        role: "quit",
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { label: "Undo", role: "undo" },
      { label: "Redo", role: "redo" },
      { type: "separator" },
      { label: "Cut", role: "cut" },
      { label: "Copy", role: "copy" },
      { label: "Paste", role: "paste" },
    ],
  },
  {
    label: "View",
    submenu: [
      {
        label: "Reload",
        role: "reload",
      },
      {
        label: "Toggle DevTools",
        role: "toggleDevTools",
      },
    ],
  },
  {
    label: "Help",
    submenu: [
      {
        label: "Developer",
        click: () => {
          shell.openExternal("https://www.facebook.com/a1yag/");
        },
      },
      {
        label: "About",
        click: () => {
          console.log("About clicked!");
        },
      },
    ],
  },
]);

ipcMain.on("navigate", (event, page) => {
  const filePath = path.join(app.getAppPath(), "public", page);
  console.log("Loading file:", filePath);

  if (!fs.existsSync(filePath)) {
    console.error("File does not exist:", filePath);
    return;
  }

  if (mainWindow) {
    mainWindow.loadFile(filePath);
  }
});

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

    console.log(schedules)

    return { success: true, message: "Schedule fetched successfully.", data: schedules };
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
      data.prNumber,
      data.requestedBy,
      data.requestedDate,
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
        requestDate: "desc",
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

    await prisma.purchaseRequest.update({
      where: {id},
      data: {
        status: status,
      },
    })

    return {success: true, message: `Request ${status}.`}
  }catch (err: any) {
    return{success: false, message: err.message}
  }
})

ipcMain.handle("delete-all-pr", async(e)=>{
  try{
    const count = await prisma.purchaseRequest.count();
    if (count === 0) {
      return { success: false, message: "No purchase requests to delete." };
    }

    await prisma.purchaseRequest.deleteMany();

    return{success:true, message: "PRs deleted."}
  }catch(e: any){
    return{success: false, message: e.message}
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

ipcMain.handle("delete-all-petty-cash", async () => {
  try {
    const count = await prisma.pettyCash.count();
    if (count === 0) {
      return { success: false, message: "No petty cash records to delete." };
    }

    await prisma.pettyCash.deleteMany();

    return { success: true, message: "All petty cash records deleted." };
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