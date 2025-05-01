import { execSync } from "child_process";
import path from "path";
import { app } from "electron";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import internal from "stream";
import { scheduler } from "timers/promises";

// Determine database path
const isDev = !app.isPackaged; // Check if running in development

// Use the `db/` folder in development, but `userData` in production
const dbFileName = "inventory.db";
const dbPath = isDev
  ? path.join(__dirname, "..", "db", dbFileName) // Development: Use `db/`
  : path.join(app.getPath("userData"), dbFileName); // Production: Use `userData/`

  isDev ? console.log("Database Path:", dbPath)
  : console.log("Database Path (Production):", dbPath);
  
process.env.DATABASE_URL = `file:${dbPath}`;

console.log(dbPath)

// Ensure the database file exists in production
if (!isDev && !fs.existsSync(dbPath)) {
  try {
    // Copy the DB from the `app.asar` to `userData`
    const appDbPath = path.join(process.resourcesPath, dbFileName);
    fs.copyFileSync(appDbPath, dbPath);
    console.log("Database copied to:", dbPath);
  } catch (err) {
    console.error("Database copy error:", err);
  }
}

// Prisma Client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}?connection_limit=1`, // Ensure single connection
    },
  },
});

// Debugging output
console.log("Prisma is using database path:", dbPath);
console.log("Prisma Client Path:", path.dirname(require.resolve("@prisma/client")));

export { prisma };

export async function createSchedule(
  description: string,
  venue: string,
  date: string,
  official: string
) {
  try {
    // Append seconds if missing (datetime-local input returns "YYYY-MM-DDTHH:mm")
    let isoDate = date;
    if (date.length === 16) {
      isoDate = date + ":00";
    }

    const newSchedule = await prisma.schedule.create({
      data: {
        description,
        venue,
        date: new Date(isoDate),
        official,
      },
    });

    return newSchedule 
  } catch (err) {
    return (err as Error).message
  }
}

export async function newPurchaseRequest(
  prNumber: number,
  item: string,
  requestedBy: string,
  requestedDate: string,
  purpose: string,
  department: string
) {
  try{
    let isoDate = requestedDate;
    if (requestedDate.length === 16) {
      isoDate = requestedDate + ":00";
    }

    const existingRequest = await prisma.purchaseRequest.findUnique({
      where: {prNumber},
    })

    if(existingRequest){throw new Error(`Request '${prNumber}' already exists.`)}

    const newPurchaseRequest = await prisma.purchaseRequest.create({
      data: {
        prNumber,
        item,
        requestedBy,
        requestDate: new Date(isoDate),
        purpose,
        department,
      },
    })

    return { success: true, data: newPurchaseRequest };
  }catch(err){
    return { success: false, message: (err as Error).message };
  }
}

export async function newPettyCash(
  purpose: string,
  cashAmount: number,
  date: string
) {
  try{
    let isoDate = date;
    if (date.length === 16) {
      isoDate = date + ":00";
    }

    const newPettyCash = await prisma.pettyCash.create({
      data: {
        purpose,
        cashAmount,
        dateIssued: new Date(isoDate),
      },
    })

    return { success: true, data: newPettyCash };
  }catch(err){
    return { success: false, message: (err as Error).message };
  }
}

export async function newRis(
  risNumber: number,
  item: string,
  preparedBy: string,
  purpose: string,
  issuedTo: string,
  preparedDate: string,
) {
  try {
    let isoDate = preparedDate;
    if (preparedDate.length === 16) {
      isoDate = preparedDate + ":00";
    }

    const existingRequest = await prisma.requisitionIssueSlip.findUnique({
      where: { risNumber },
    })

    if (existingRequest) { throw new Error(`Slip '${risNumber}' already exists.`) }

    const newPurchaseRequest = await prisma.requisitionIssueSlip.create({
      data: {
        risNumber,
        item,
        preparedBy,
        purpose,
        issuedTo,
        preparedDate: new Date(isoDate),
      },
    })

    return { success: true, data: newPurchaseRequest };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}
