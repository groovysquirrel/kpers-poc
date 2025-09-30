/**
 * POST /event-types - Create a new event type
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { EventTypeCreateInput, EventTypeRow } from "../shared/types";
import * as uuid from "uuid";

export const main = handler(async (event) => {
  let data: EventTypeCreateInput;
  
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  // Validate required fields
  if (!data.name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: "Missing required field: name" 
      }),
    };
  }

  const id = uuid.v4();
  console.log("[EventTypes] Create - Starting", { id });

  const sql = `
    INSERT INTO event_types (id, name, description, is_active, display_order)
    VALUES (:id, :name, :description, :isActive, :displayOrder)
  `;
  
  const params: QueryParameter[] = [
    { name: "id", value: id },
    { name: "name", value: data.name },
    { name: "description", value: data.description || null },
    { name: "isActive", value: data.isActive !== undefined ? data.isActive : true, type: "boolean" },
    { name: "displayOrder", value: data.displayOrder || null, type: "long" },
  ];
  
  await db.execute(sql, params);

  // Fetch the created event type
  const selectSql = `
    SELECT id, name, description, is_active, display_order, created_at, updated_at
    FROM event_types 
    WHERE id = :id
  `;
  
  const result = await db.query(selectSql, [{ name: "id", value: id }]);
  const record = result.records[0];
  
  const eventType: EventTypeRow = {
    id: record[0].stringValue,
    name: record[1].stringValue,
    description: record[2].isNull ? null : record[2].stringValue,
    is_active: record[3].booleanValue,
    display_order: record[4].isNull ? null : record[4].longValue,
    created_at: record[5].stringValue,
    updated_at: record[6].stringValue,
  };

  console.log("[EventTypes] Create - Event type created", { id });
  return JSON.stringify(eventType);
});
