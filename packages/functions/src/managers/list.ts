/**
 * GET /managers - List all managers
 * Creates table and seeds data only if table doesn't exist
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { ManagerRow } from "../shared/types";
import fs from "node:fs";

async function createTableAndSeed(): Promise<void> {
  console.log("[Managers] Table not found. Creating...");
  const schemaSql = fs.readFileSync("database/manager/schema.sql", "utf-8");
  await db.execute(schemaSql);
  console.log("[Managers] Table created successfully");

  // Seed with default data
  console.log("[Managers] Seeding default data...");
  const defaults: ManagerRow[] = JSON.parse(fs.readFileSync("database/manager/data.json", "utf-8"));
  
  if (!Array.isArray(defaults) || defaults.length === 0) {
    console.log("[Managers] No default data to seed");
    return;
  }

  // Insert managers one at a time
  for (const manager of defaults) {
    const sql = `
      INSERT INTO managers (id, first_name, last_name, company, phone, email, status, market_value, as_of_date)
      VALUES (:id, :firstName, :lastName, :company, :phone, :email, :status, :marketValue, :asOfDate)
    `;
    
    const params: QueryParameter[] = [
      { name: "id", value: manager.id },
      { name: "firstName", value: manager.first_name },
      { name: "lastName", value: manager.last_name },
      { name: "company", value: manager.company },
      { name: "phone", value: manager.phone },
      { name: "email", value: manager.email },
      { name: "status", value: manager.status },
      { name: "marketValue", value: manager.market_value, type: "long" },
      { name: "asOfDate", value: manager.as_of_date },
    ];
    
    await db.execute(sql, params);
  }
  
  console.log(`[Managers] Seeded ${defaults.length} managers`);
}

async function selectManagers(): Promise<ManagerRow[]> {
  const sql = `
    SELECT id, first_name, last_name, company, phone, email, status, market_value, as_of_date 
    FROM managers 
    ORDER BY last_name, first_name
  `;
  
  const result = await db.query(sql);
  
  if (!result.records || result.records.length === 0) {
    return [];
  }

  // Convert Data API response format to ManagerRow objects
  const managers: ManagerRow[] = result.records.map((record: any) => ({
    id: record[0].stringValue,
    first_name: record[1].stringValue,
    last_name: record[2].stringValue,
    company: record[3].stringValue,
    phone: record[4].isNull ? null : record[4].stringValue,
    email: record[5].isNull ? null : record[5].stringValue,
    status: record[6].stringValue as "Active" | "Terminated" | "Probation",
    market_value: record[7].longValue,
    as_of_date: record[8].stringValue,
  }));

  return managers;
}

export const main = handler(async () => {
  console.log("[Managers] List - Starting");

  try {
    // Try to select managers directly (normal case - table exists)
    const managers = await selectManagers();
    console.log(`[Managers] List - Returning ${managers.length} managers`);
    return JSON.stringify(managers);
  } catch (err: any) {
    // Check if table doesn't exist
    if (err?.message?.includes("doesn't exist") || err?.message?.includes("Table") && err?.message?.includes("not found")) {
      // Table doesn't exist - create and seed
      await createTableAndSeed();
      
      // Retry the select
      const managers = await selectManagers();
      console.log(`[Managers] List - Returning ${managers.length} managers (after create+seed)`);
      return JSON.stringify(managers);
    }
    
    // Other error - rethrow
    throw err;
  }
});
