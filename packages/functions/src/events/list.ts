/**
 * GET /events - List all events
 * Creates table and seeds data only if table doesn't exist
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { EventRow } from "../shared/types";
import fs from "node:fs";

async function createTableAndSeed(): Promise<void> {
  console.log("[Events] Table not found. Creating...");
  const schemaSql = fs.readFileSync("database/events/schema.sql", "utf-8");
  await db.execute(schemaSql);
  console.log("[Events] Table created successfully");

  // Seed with default data
  console.log("[Events] Seeding default data...");
  const defaults: EventRow[] = JSON.parse(fs.readFileSync("database/events/data.json", "utf-8"));
  
  if (!Array.isArray(defaults) || defaults.length === 0) {
    console.log("[Events] No default data to seed");
    return;
  }

  // Insert events one at a time
  for (const event of defaults) {
    const sql = `
      INSERT INTO events (id, manager_id, event_type_id, event_date, staff_attending, comments)
      VALUES (:id, :managerId, :eventTypeId, :eventDate, :staffAttending, :comments)
    `;
    
    const params: QueryParameter[] = [
      { name: "id", value: event.id },
      { name: "managerId", value: event.manager_id },
      { name: "eventTypeId", value: event.event_type_id },
      { name: "eventDate", value: event.event_date },
      { name: "staffAttending", value: event.staff_attending },
      { name: "comments", value: event.comments },
    ];
    
    await db.execute(sql, params);
  }
  
  console.log(`[Events] Seeded ${defaults.length} events`);
}

async function selectEvents(): Promise<EventRow[]> {
  const sql = `
    SELECT id, manager_id, event_type_id, event_date, staff_attending, comments, created_at, updated_at
    FROM events 
    ORDER BY event_date DESC, created_at DESC
  `;
  
  const result = await db.query(sql);
  
  if (!result.records || result.records.length === 0) {
    return [];
  }

  // Convert Data API response format to EventRow objects
  const events: EventRow[] = result.records.map((record: any) => ({
    id: record[0].stringValue,
    manager_id: record[1].stringValue,
    event_type_id: record[2].stringValue,
    event_date: record[3].stringValue,
    staff_attending: record[4].isNull ? null : record[4].stringValue,
    comments: record[5].isNull ? null : record[5].stringValue,
    created_at: record[6].stringValue,
    updated_at: record[7].stringValue,
  }));

  return events;
}

export const main = handler(async () => {
  console.log("[Events] List - Starting");

  try {
    // Try to select events directly (normal case - table exists)
    const events = await selectEvents();
    console.log(`[Events] List - Returning ${events.length} events`);
    return JSON.stringify(events);
  } catch (err: any) {
    // Check if table doesn't exist
    if (err?.message?.includes("doesn't exist") || err?.message?.includes("Table") && err?.message?.includes("not found")) {
      // Table doesn't exist - create and seed
      await createTableAndSeed();
      
      // Retry the select
      const events = await selectEvents();
      console.log(`[Events] List - Returning ${events.length} events (after create+seed)`);
      return JSON.stringify(events);
    }
    
    // Other error - rethrow
    throw err;
  }
});

