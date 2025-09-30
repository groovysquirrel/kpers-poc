/**
 * PUT /events/:id - Update an existing event
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { EventUpdateInput, EventRow } from "../shared/types";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Event ID is required" }),
    };
  }

  let data: EventUpdateInput;
  
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  console.log("[Events] Update - Starting", { id });

  // Check if event exists
  const checkSql = "SELECT id FROM events WHERE id = :id";
  const checkResult = await db.query(checkSql, [{ name: "id", value: id }]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Event not found" }),
    };
  }

  // Build dynamic UPDATE query based on provided fields
  const updates: string[] = [];
  const parameters: QueryParameter[] = [{ name: "id", value: id }];

  if (data.eventTypeId !== undefined) {
    updates.push("event_type_id = :eventTypeId");
    parameters.push({ name: "eventTypeId", value: data.eventTypeId });
  }
  if (data.eventDate !== undefined) {
    updates.push("event_date = :eventDate");
    parameters.push({ name: "eventDate", value: data.eventDate });
  }
  if (data.staffAttending !== undefined) {
    const staffAttendingStr = data.staffAttending?.length 
      ? data.staffAttending.join(";") 
      : null;
    updates.push("staff_attending = :staffAttending");
    parameters.push({ name: "staffAttending", value: staffAttendingStr });
  }
  if (data.comments !== undefined) {
    updates.push("comments = :comments");
    parameters.push({ name: "comments", value: data.comments });
  }

  if (updates.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No fields to update" }),
    };
  }

  const updateSql = `UPDATE events SET ${updates.join(", ")} WHERE id = :id`;
  await db.execute(updateSql, parameters);

  // Fetch the updated event
  const selectSql = `
    SELECT id, manager_id, event_type_id, event_date, staff_attending, comments, created_at, updated_at
    FROM events 
    WHERE id = :id
  `;
  
  const result = await db.query(selectSql, [{ name: "id", value: id }]);
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

  console.log("[Events] Update - Event updated", { id });
  return JSON.stringify(eventData);
});

