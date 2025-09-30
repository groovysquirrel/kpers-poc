/**
 * POST /staff - Create a new staff member
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { StaffCreateInput, StaffRow } from "../shared/types";
import * as uuid from "uuid";

export const main = handler(async (event) => {
  let data: StaffCreateInput;
  
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  // Validate required fields
  if (!data.firstName || !data.lastName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: "Missing required fields: firstName, lastName" 
      }),
    };
  }

  const id = uuid.v4();
  console.log("[Staff] Create - Starting", { id });

  const sql = `
    INSERT INTO staff (id, first_name, last_name, email, title, is_active)
    VALUES (:id, :firstName, :lastName, :email, :title, :isActive)
  `;
  
  const params: QueryParameter[] = [
    { name: "id", value: id },
    { name: "firstName", value: data.firstName },
    { name: "lastName", value: data.lastName },
    { name: "email", value: data.email || null },
    { name: "title", value: data.title || null },
    { name: "isActive", value: data.isActive !== undefined ? data.isActive : true, type: "boolean" },
  ];
  
  await db.execute(sql, params);

  // Fetch the created staff member
  const selectSql = `
    SELECT id, first_name, last_name, email, title, is_active, created_at, updated_at
    FROM staff 
    WHERE id = :id
  `;
  
  const result = await db.query(selectSql, [{ name: "id", value: id }]);
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

  console.log("[Staff] Create - Staff member created", { id });
  return JSON.stringify(staff);
});

