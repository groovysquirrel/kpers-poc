/**
 * GET /staff/:id - Get a single staff member by ID
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { StaffRow } from "../shared/types";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Staff ID is required" }),
    };
  }

  console.log("[Staff] Get - Starting", { id });

  const sql = `
    SELECT id, first_name, last_name, email, title, is_active, created_at, updated_at
    FROM staff 
    WHERE id = :id
  `;
  
  const params: QueryParameter[] = [{ name: "id", value: id }];
  const result = await db.query(sql, params);
  
  if (!result.records || result.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Staff member not found" }),
    };
  }

  const record = result.records[0];
  const staff: StaffRow = {
    id: record[0].stringValue,
    first_name: record[1].stringValue,
    last_name: record[2].stringValue,
    email: record[3].isNull ? null : record[3].stringValue,
    title: record[4].isNull ? null : record[4].stringValue,
    is_active: record[5].booleanValue,
    created_at: record[6].stringValue,
    updated_at: record[7].stringValue,
  };

  console.log("[Staff] Get - Found staff member", { id });
  return JSON.stringify(staff);
});

