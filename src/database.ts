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
  
process.env.DATABASE_URL = `file:${dbPath}`;

// Ensure the database file exists in production
if (!isDev && !fs.existsSync(dbPath)) {
  try {
    // Copy the DB from the `app.asar` to `userData`
    const appDbPath = path.join(process.resourcesPath, dbFileName);
    fs.copyFileSync(appDbPath, dbPath);
  } catch (err) {
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

export { prisma };

function isoDate(date: string) {
  let newIsoDate = ""
  if (date.length === 16) {
    newIsoDate = date + ":00";
  }
  return new Date(newIsoDate);
}

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
  receivedBy: string,
  receivedOn: string,
  purpose: string,
  department: string
) {
  try{
    const receivedOnIso = isoDate(receivedOn)

    const newPurchaseRequest = await prisma.purchaseRequest.create({
      data: {
        receivedBy,
        receivedOn: new Date(receivedOnIso),
        purpose,
        department,
      },
    });

    return { success: true, data: newPurchaseRequest };
  }catch(err){
    return { success: false, message: `${(err as Error).message}` };
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

export async function newVoucher(
  voucherNumber: number,
  payee: string,
  amount: number,
  purpose: string,
  accountTitle: string,
  datePrepared: string,
) {
  try {
    let isoDate = datePrepared;
    if (datePrepared.length === 16) {
      isoDate = datePrepared + ":00";
    }

    const existingRequest = await prisma.voucher.findUnique({
      where: { voucherNumber },
    })

    if (existingRequest) { throw new Error(`Voucher '${voucherNumber}' already exists.`) }

    const newVoucher = await prisma.voucher.create({
      data: {
        voucherNumber,
        payee,
        amount,
        purpose,
        accountTitle,
        datePrepared: new Date(isoDate),
      },
    })

    return { success: true, data: newVoucher };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function newFranchise(
  franchiseCode: number,
  franchiseName: string,
  issuedTo: string,
  issuedBy: string,
  startDate: string,
  endDate: string,
) {
  try {
    let newStartDate = startDate;
    let newEndDate = endDate;

    if (startDate.length === 16 && endDate.length === 16) {
      newStartDate = startDate + ":00";
      newEndDate = endDate + ":00";
    }

    const existingRequest = await prisma.franchise.findUnique({
      where: { franchiseCode },
    })

    if (existingRequest) { throw new Error(`Franchise '${franchiseCode}' already exists.`) }

    const newVoucher = await prisma.franchise.create({
      data: {
        franchiseCode,
        franchiseName,
        issuedTo,
        issuedBy,
        startDate: new Date(newStartDate),
        endDate: new Date(newEndDate),
      },
    });

    return { success: true, data: newVoucher };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function newObligationRequest(
  title: string,
  purpose: string,
  amount: number,
  fundSource: string,
  department: string,
  preparedDate: string,
  status: string
) {
  try {
    let isoDate = preparedDate;
    if (preparedDate.length === 16) {
      isoDate = preparedDate + ":00";
    }

    const newPurchaseRequest = await prisma.obligationRequest.create({
      data: {
        title,
        purpose,
        amount,
        fundSource,
        department,
        preparedDate: new Date(isoDate),
        status,
      },
    })

    return { success: true, data: newPurchaseRequest };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}
