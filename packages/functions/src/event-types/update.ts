/**
 * PUT /event-types/:id - Update an existing event type
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { EventTypeUpdateInput, EventTypeRow } from "../shared/types";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Event Type ID is required" }),
    };
  }

  let data: EventTypeUpdateInput;
  
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  console.log("[EventTypes] Update - Starting", { id });

  // Check if event type exists
  const checkSql = "SELECT id FROM event_types WHERE id = :id";
  const checkResult = await db.query(checkSql, [{ name: "id", value: id }]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Event Type not found" }),
    };
  }

  // Build dynamic UPDATE query based on provided fields
  const updates: string[] = [];
  const parameters: QueryParameter[] = [{ name: "id", value: id }];

  if (data.name !== undefined) {
    updates.push("name = :name");
    parameters.push({ name: "name", value: data.name });
  }
  if (data.description !== undefined) {
    updates.push("description = :description");
    parameters.push({ name: "description", value: data.description });
  }
  if (data.isActive !== undefined) {
    updates.push("is_active = :isActive");
    parameters.push({ name: "isActive", value: data.isActive, type: "boolean" });
  }
  if (data.displayOrder !== undefined) {
    updates.push("display_order = :displayOrder");
    parameters.push({ name: "displayOrder", value: data.displayOrder, type: "long" });
  }

  if (updates.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No fields to update" }),
    };
  }

  const updateSql = `UPDATE event_types SET ${updates.join(", ")} WHERE id = :id`;
  await db.execute(updateSql, parameters);

  // Fetch the updated event type
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

  console.log("[EventTypes] Update - Event type updated", { id });
  return JSON.stringify(eventType);
});
