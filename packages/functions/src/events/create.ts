/**
 * POST /events - Create a new event
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { EventCreateInput, EventRow } from "../shared/types";
import * as uuid from "uuid";

export const main = handler(async (event) => {
  let data: EventCreateInput;
  
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  // Validate required fields
  if (!data.managerId || !data.eventTypeId || !data.eventDate) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: "Missing required fields: managerId, eventTypeId, eventDate" 
      }),
    };
  }

  const id = uuid.v4();
  console.log("[Events] Create - Starting", { id });

  // Convert staffAttending array to semicolon-separated string
  const staffAttendingStr = data.staffAttending?.length 
    ? data.staffAttending.join(";") 
    : null;

  const sql = `
    INSERT INTO events (id, manager_id, event_type_id, event_date, staff_attending, comments)
    VALUES (:id, :managerId, :eventTypeId, :eventDate, :staffAttending, :comments)
  `;
  
  const params: QueryParameter[] = [
    { name: "id", value: id },
    { name: "managerId", value: data.managerId },
    { name: "eventTypeId", value: data.eventTypeId },
    { name: "eventDate", value: data.eventDate },
    { name: "staffAttending", value: staffAttendingStr },
    { name: "comments", value: data.comments || null },
  ];
  
  await db.execute(sql, params);

  // Fetch the created event
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

  console.log("[Events] Create - Event created", { id });
  return JSON.stringify(eventData);
});

