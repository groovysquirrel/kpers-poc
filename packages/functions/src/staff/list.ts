/**
 * GET /staff - List all staff members
 * Creates table and seeds data only if table doesn't exist
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { StaffRow } from "../shared/types";
import fs from "node:fs";

async function createTableAndSeed(): Promise<void> {
  console.log("[Staff] Table not found. Creating...");
  const schemaSql = fs.readFileSync("database/staff/schema.sql", "utf-8");
  await db.execute(schemaSql);
  console.log("[Staff] Table created successfully");

  // Seed with default data
  console.log("[Staff] Seeding default data...");
  const defaults: StaffRow[] = JSON.parse(fs.readFileSync("database/staff/data.json", "utf-8"));
  
  if (!Array.isArray(defaults) || defaults.length === 0) {
    console.log("[Staff] No default data to seed");
    return;
  }

  // Insert staff one at a time
  for (const staff of defaults) {
    const sql = `
      INSERT INTO staff (id, first_name, last_name, email, title, is_active)
      VALUES (:id, :firstName, :lastName, :email, :title, :isActive)
    `;
    
    const params: QueryParameter[] = [
      { name: "id", value: staff.id },
      { name: "firstName", value: staff.first_name },
      { name: "lastName", value: staff.last_name },
      { name: "email", value: staff.email || null },
      { name: "title", value: staff.title || null },
      { name: "isActive", value: staff.is_active, type: "boolean" },
    ];
    
    await db.execute(sql, params);
  }
  
  console.log(`[Staff] Seeded ${defaults.length} staff members`);
}

async function selectStaff(): Promise<StaffRow[]> {
  const sql = `
    SELECT id, first_name, last_name, email, title, is_active, created_at, updated_at
    FROM staff 
    ORDER BY last_name, first_name
  `;
  
  const result = await db.query(sql);
  
  if (!result.records || result.records.length === 0) {
    return [];
  }

  // Convert Data API response format to StaffRow objects
  const staff: StaffRow[] = result.records.map((record: any) => ({
    id: record[0].stringValue,
    first_name: record[1].stringValue,
    last_name: record[2].stringValue,
    email: record[3].isNull ? null : record[3].stringValue,
    title: record[4].isNull ? null : record[4].stringValue,
    is_active: record[5].booleanValue,
    created_at: record[6].stringValue,
    updated_at: record[7].stringValue,
  }));

  return staff;
}

export const main = handler(async () => {
  console.log("[Staff] List - Starting");

  try {
    // Try to select staff directly (normal case - table exists)
    const staff = await selectStaff();
    console.log(`[Staff] List - Returning ${staff.length} staff members`);
    return JSON.stringify(staff);
  } catch (err: any) {
    // Check if table doesn't exist
    if (err?.message?.includes("doesn't exist") || err?.message?.includes("Table") && err?.message?.includes("not found")) {
      // Table doesn't exist - create and seed
      await createTableAndSeed();
      
      // Retry the select
      const staff = await selectStaff();
      console.log(`[Staff] List - Returning ${staff.length} staff members (after create+seed)`);
      return JSON.stringify(staff);
    }
    
    // Other error - rethrow
    throw err;
  }
});

