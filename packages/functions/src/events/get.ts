/**
 * GET /events/:id - Get a single event by ID
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { EventRow } from "../shared/types";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Event ID is required" }),
    };
  }

  console.log("[Events] Get - Starting", { id });

  const sql = `
    SELECT id, manager_id, event_type_id, event_date, staff_attending, comments, created_at, updated_at
    FROM events 
    WHERE id = :id
  `;
  
  const params: QueryParameter[] = [{ name: "id", value: id }];
  const result = await db.query(sql, params);
  
  if (!result.records || result.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Event not found" }),
    };
  }

  const record = result.records[0];
  const eventData: EventRow = {
    id: record[0].stringValue,
    manager_id: record[1].stringValue,
    event_type_id: record[2].stringValue,
    event_date: record[3].stringValue,
    staff_attending: record[4].isNull ? null : record[4].stringValue,
    comments: record[5].isNull ? null : record[5].stringValue,
    created_at: record[6].stringValue,
    updated_at: record[7].stringValue,
  };

  console.log("[Events] Get - Found event", { id });
  return JSON.stringify(eventData);
});

