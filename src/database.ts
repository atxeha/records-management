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
    console.log((err as Error).message);
    return (err as Error).message
  }
}

// export async function addItem(
//   item_code: string,
//   item_name: string,
//   quantity: number,
//   unit: string,
//   added_by: string,
//   date: Date
// ) {
//   // Check if the item_code already exists
//   const existingItem = await prisma.item.findUnique({
//     where: { item_code },
//   });

//   if (existingItem) {
//     throw new Error(
//       `'${item_code}' already exists. Add quantity for the item instead.`
//     );
//   }

//   // Insert new item
//   const newItem = await prisma.item.create({
//     data: {
//       item_code,
//       item_name,
//       quantity,
//       unit,
//       added_by,
//       date,
//     },
//   });

//   return newItem;
// }

// export async function getItems() {
//   return await prisma.item.findMany({
//     orderBy: {
//       item_name: "asc",
//   },
//   });
// }

// export async function updateItemQuantity(
//   id: number,
//   new_quantity: number,
//   updated_by: string,
//   date: Date
// ) {
//   try {
//     return await prisma.$transaction(async (tx) => {
//       const itemId = Number(id);
//       const newQuantity = Number(new_quantity)
//       // Step 1: Check if the item exists
//       const item = await tx.item.findUnique({
//         where: { id: itemId },
//         // select: { quantity: true },
//       });

//       if (!item) {
//         return { success: false, message: "Item not found." };
//       }

//       // Step 2: Prevent negative stock
//       if (newQuantity < 0) {
//         return { success: false, message: "Quantity cannot be negative." };
//       }

//       // Step 3: Update the quantity and `updated_by`
//       await tx.item.update({
//         where: { id: itemId },
//         data: {
//           quantity: {increment: newQuantity},
//           updated_by,
//           date,
//         },
//       });

//       return { success: true, message: "Quantity updated.", item: item };
//     });
//   } catch (error) {
//     console.error(
//       "Error updating item quantity:",
//       (error as Error)?.message || "Unknown error"
//     );
//     return {
//       success: false,
//       message: (error as Error)?.message || "An unknown error occurred",
//     };
//   }
// }

// export async function deleteItem(id: number) {
//   try {
//     const itemId = Number(id);

//     return await prisma.$transaction(async (tx) => {
//       const item = await tx.item.findUnique({
//         where: { id: itemId },
//       });

//       await tx.item.delete({
//         where: { id: itemId },
//       });

//       return { success: true, message: "Item deleted." };
//     });
//   } catch (error) {
//     console.error(
//       "Error deleting item:",
//       (error as Error)?.message || "Unknown error"
//     );
//     return {
//       success: false,
//       message: (error as Error)?.message || "An unknown error occurred",
//     };
//   }
// }

// export async function editItem(
//   id: number,
//   item_code: string,
//   item_name: string,
//   unit: string
// ) {
//   try {
//     // Convert id to a number and validate it
//     const itemId = Number(id);

//     return await prisma.$transaction(async (tx) => {
//       const item = await tx.item.findUnique({
//         where: { id: itemId },
//       });

//       if (!item) {
//         return { success: false, message: "Item not found." };
//       }

//       if (item.item_code === item_code && item.item_name === item_name && item.unit === unit) {
//         return {success: false, message: "No changes detected."}
//       }

//       await tx.item.update({
//         where: { id: itemId },
//         data: {
//           item_code,
//           item_name,
//           unit,
//         },
//       });

//       return {
//         success: true,
//         message: "Information updated.",
//         item: item,
//       };
//     });
//   } catch (error) {
//     console.error(
//       "Error updating item information:",
//       (error as Error)?.message || "Unknown error"
//     );
//     return {
//       success: false,
//       message: (error as Error)?.message || "An unknown error occurred",
//     };
//   }
// }

// export async function addLog(
//     itemId: number,
//     user: string,
//     log: string
// ) {
//     try {
//         const id = Number(itemId)
//         await prisma.log.create({
//             data: {
//                 itemId: id,
//                 user,
//                 log
//             },
//         })
//         console.log("Log saved.")
//         return { success: true, message: "Log created." }
//     } catch (error) {
//         console.log(`Error saving log: ${error}`)
//         return { success: false, message: (error as Error).message }
//     }
// }

// export async function getLog() {
//     return await prisma.log.findMany({
//         include: {
//             item: true,
//         },
//         orderBy: {
//           createdAt: "desc",
//       },
//     });
// }

// export async function deleteAllLogs() {
//   try {
//     const deletedLogs = await prisma.log.deleteMany();

//     if (deletedLogs.count === 0) {
//       return { success: false, message: "No logs to delete." };
//     }
//     console.log("All logs deleted.");
//     return { success: true, message: "All logs deleted."}
//   } catch (error) {
//     console.error("Error deleting logs:", error);
//     return { success: false, message: `An error occurs ${(error as Error).message}`}
//   }
// }

// export async function addAddedItem(
//     itemCode: string,
//     itemName: string,
//     addedQuantity: number,
//     unit: string,
//     addedBy: string
// ) {
//     try {
//         const quantity = Number(addedQuantity)
//         await prisma.addedItem.create({
//             data: {
//                 itemCode,
//                 itemName,
//                 addedQuantity: quantity,
//                 unit,
//                 addedBy,
//             },
//         })
//         console.log("Added item recorded.")
//         return {success:true, message: "Item recorded."}
//     } catch (error) {
//         console.log(`Error saving item: ${error}`)
//         return { success: false, message: (error as Error).message}
//     }
// }

// export async function getAddedItems() {
//     try {
//         return await prisma.addedItem.findMany({
//           orderBy: {
//             addedDate: "desc",
//         },
//         });
//     } catch (error) {
//         console.log(error)
//     }
// }


// export async function pullItem(
//     itemCode: string,
//     itemName: string,
//     releasedQuantity: number,
//     unit: string,
//     releasedBy: string,
//     receivedBy: string
// ): Promise<{ success: boolean; message: string; item?: object }> {
//     try {
//         return await prisma.$transaction(async (tx) => {

//             const item = await tx.item.findUnique({
//                 where: { item_code: itemCode },
//             });

//             if (!item) {
//                 throw new Error("Item not found.");
//             }
//             if (item.quantity < releasedQuantity) {
//                 throw new Error("Not enough stock available.");
//             }

//             await tx.pulledItem.create({
//                 data: {
//                     itemCode,
//                     itemName,
//                     releasedQuantity,
//                     unit,
//                     releasedBy,
//                     receivedBy,
//                 },
//             });

//             await tx.item.update({
//                 where: { item_code: itemCode },
//                 data: {
//                     quantity: { decrement: releasedQuantity },
//                 },
//             });

//             return {
//                 success: true,
//                 message: "Item successfully pulled.",
//                 item: item,
//             };
//         });
//     } catch (error) {
//         return {
//             success: false,
//             message: (error as Error).message,
//         };
//     }
// }


// export async function getPullItems() {
//   try {
//     return await prisma.pulledItem.findMany({
//       orderBy: {
//         releasedDate: "desc",
//     },
//     });
//   } catch (error) {
//     console.log(error)
//   }
// }

// export async function deleteItemFromTable(id: string, table: "PulledItem" | "AddedItem") {
//     try {
//         return await prisma.$transaction(async (tx) => {
//             if (table === "PulledItem") {
//                 await tx.pulledItem.delete({ where: { id } });
//             } else {
//                 await tx.addedItem.delete({ where: { id } });
//             }
//             console.log(`${table} item with ID ${id} deleted.`);
//             return { success: true, message: `${table} deleted.` };
//         });
//     } catch (error) {
//         console.error(`Error deleting item from ${table}:`, (error as Error)?.message || "Unknown error");
//         return {
//             success: false,
//             message: (error as Error)?.message || "An unknown error occurred",
//         };
//     }
// }

