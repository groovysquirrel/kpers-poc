/**
 * GET /event-types - List all event types
 * Creates table and seeds data only if table doesn't exist
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { EventTypeRow } from "../shared/types";
import fs from "node:fs";

async function createTableAndSeed(): Promise<void> {
  console.log("[EventTypes] Table not found. Creating...");
  const schemaSql = fs.readFileSync("database/event-types/schema.sql", "utf-8");
  await db.execute(schemaSql);
  console.log("[EventTypes] Table created successfully");

  // Seed with default data
  console.log("[EventTypes] Seeding default data...");
  const defaults: EventTypeRow[] = JSON.parse(fs.readFileSync("database/event-types/data.json", "utf-8"));
  
  if (!Array.isArray(defaults) || defaults.length === 0) {
    console.log("[EventTypes] No default data to seed");
    return;
  }

  // Insert event types one at a time
  for (const eventType of defaults) {
    const sql = `
      INSERT INTO event_types (id, name, description, is_active, display_order)
      VALUES (:id, :name, :description, :isActive, :displayOrder)
    `;
    
    const params: QueryParameter[] = [
      { name: "id", value: eventType.id },
      { name: "name", value: eventType.name },
      { name: "description", value: eventType.description },
      { name: "isActive", value: eventType.is_active, type: "boolean" },
      { name: "displayOrder", value: eventType.display_order, type: "long" },
    ];
    
    await db.execute(sql, params);
  }
  
  console.log(`[EventTypes] Seeded ${defaults.length} event types`);
}

async function selectEventTypes(): Promise<EventTypeRow[]> {
  const sql = `
    SELECT id, name, description, is_active, display_order, created_at, updated_at
    FROM event_types 
    ORDER BY display_order, name
  `;
  
  const result = await db.query(sql);
  
  if (!result.records || result.records.length === 0) {
    return [];
  }

  // Convert Data API response format to EventTypeRow objects
  const eventTypes: EventTypeRow[] = result.records.map((record: any) => ({
    id: record[0].stringValue,
    name: record[1].stringValue,
    description: record[2].isNull ? null : record[2].stringValue,
    is_active: record[3].booleanValue,
    display_order: record[4].isNull ? null : record[4].longValue,
    created_at: record[5].stringValue,
    updated_at: record[6].stringValue,
  }));

  return eventTypes;
}

export const main = handler(async () => {
  console.log("[EventTypes] List - Starting");

  try {
    // Try to select event types directly (normal case - table exists)
    const eventTypes = await selectEventTypes();
    console.log(`[EventTypes] List - Returning ${eventTypes.length} event types`);
    return JSON.stringify(eventTypes);
  } catch (err: any) {
    // Check if table doesn't exist
    if (err?.message?.includes("doesn't exist") || err?.message?.includes("Table") && err?.message?.includes("not found")) {
      // Table doesn't exist - create and seed
      await createTableAndSeed();
      
      // Retry the select
      const eventTypes = await selectEventTypes();
      console.log(`[EventTypes] List - Returning ${eventTypes.length} event types (after create+seed)`);
      return JSON.stringify(eventTypes);
    }
    
    // Other error - rethrow
    throw err;
  }
});
