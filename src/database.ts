import path from "path";
import { app } from "electron";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';

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
  if (date.length === 16) {
    return new Date(date + ":00");
  }
  return new Date(date);
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
  try {
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
  } catch (err) {
    return { success: false, message: `${(err as Error).message}` };
  }
}

export async function newPettyCash(
  receivedBy: string,
  purpose: string,
  department: string,
  amount: number,
  receivedOn: string
) {
  try {
    const iso = isoDate(receivedOn)

    const newPettyCash = await prisma.pettyCash.create({
      data: {
        receivedBy,
        purpose,
        department,
        amount,
        receivedOn: new Date(iso),
      },
    })

    return { success: true, data: newPettyCash };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function newRis(
  receivedBy: string,
  receivedOn: string,
  purpose: string,
  department: string,
) {
  try {
    const receivedOnIso = isoDate(receivedOn)

    const newPurchaseRequest = await prisma.requisitionIssueSlip.create({
      data: {
        receivedBy,
        receivedOn: new Date(receivedOnIso),
        purpose,
        department,
      },
    })

    return { success: true, data: newPurchaseRequest };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function newVoucher(
  payee: string,
  code: string,
  amount: number,
  purpose: string,
  receivedBy: string,
  receivedOn: string
) {
  try {
    const iso = isoDate(receivedOn)

    const codeExist = await prisma.voucher.findUnique({
      where: {code},
    })

    if (codeExist) {return { success: false, message: "Voucher code already exists."}}

    const newVoucher = await prisma.voucher.create({
      data: {
        payee,
        code,
        amount,
        purpose,
        receivedBy,
        receivedOn: new Date(iso),
      },
    })

    return { success: true, data: newVoucher };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function newFranchise(
  purpose: string,
  department: string,
  amount: number,
  receivedBy: string,
  receivedOn: string
) {
  try {
    const isoReceivedOn = isoDate(receivedOn)

    const newVoucher = await prisma.franchise.create({
      data: {
        purpose,
        department,
        amount,
        receivedBy,
        receivedOn: new Date(isoReceivedOn),
      },
    });

    return { success: true, data: newVoucher };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function newObligationRequest(
  receivedBy: string,
  purpose: string,
  amount: number,
  department: string,
  receivedOn: string
) {
  try {
    const iso = isoDate(receivedOn)

    const newPurchaseRequest = await prisma.obligationRequest.create({
      data: {
        receivedBy,
        purpose,
        amount,
        department,
        receivedOn: new Date(iso),
      },
    })

    return { success: true, data: newPurchaseRequest };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
}

export async function autoAccountCreate() {
  const username = "admin";
  const name = "admin";
  const password = "admin";
  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          username,
          name,
          password: hashedPassword,
        },
      });
    } else {
      return;
    }
    return;
  } catch (error) {
    throw error;
  }
}

export async function checkLogin(username: string, password: string) {
  try {
    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    // If user not found
    if (!user) {
      return { success: false, message: 'Invalid username or password.' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return { success: false, message: 'Invalid username or password.' };
    }

    // Replace encrypted password with plain password in user object
    const userWithPlainPassword = { ...user, password: password };

    return { success: true, message: 'Login successful', user: userWithPlainPassword };
  } catch (error) {
    return { success: false, message: 'Internal server error' };
  }
}
