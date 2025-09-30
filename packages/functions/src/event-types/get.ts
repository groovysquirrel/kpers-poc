/**
 * GET /event-types/:id - Get a single event type by ID
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { EventTypeRow } from "../shared/types";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Event Type ID is required" }),
    };
  }

  console.log("[EventTypes] Get - Starting", { id });

  const sql = `
    SELECT id, name, description, is_active, display_order, created_at, updated_at
    FROM event_types 
    WHERE id = :id
  `;
  
  const params: QueryParameter[] = [{ name: "id", value: id }];
  const result = await db.query(sql, params);
  
  if (!result.records || result.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Event Type not found" }),
    };
  }

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

  console.log("[EventTypes] Get - Found event type", { id });
  return JSON.stringify(eventType);
});
