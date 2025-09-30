/**
 * PUT /staff/:id - Update an existing staff member
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { StaffUpdateInput, StaffRow } from "../shared/types";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Staff ID is required" }),
    };
  }

  let data: StaffUpdateInput;
  
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  console.log("[Staff] Update - Starting", { id });

  // Check if staff member exists
  const checkSql = "SELECT id FROM staff WHERE id = :id";
  const checkResult = await db.query(checkSql, [{ name: "id", value: id }]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Staff member not found" }),
    };
  }

  // Build dynamic UPDATE query based on provided fields
  const updates: string[] = [];
  const parameters: QueryParameter[] = [{ name: "id", value: id }];

  if (data.firstName !== undefined) {
    updates.push("first_name = :firstName");
    parameters.push({ name: "firstName", value: data.firstName });
  }
  if (data.lastName !== undefined) {
    updates.push("last_name = :lastName");
    parameters.push({ name: "lastName", value: data.lastName });
  }
  if (data.email !== undefined) {
    updates.push("email = :email");
    parameters.push({ name: "email", value: data.email });
  }
  if (data.title !== undefined) {
    updates.push("title = :title");
    parameters.push({ name: "title", value: data.title });
  }
  if (data.isActive !== undefined) {
    updates.push("is_active = :isActive");
    parameters.push({ name: "isActive", value: data.isActive, type: "boolean" });
  }

  if (updates.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No fields to update" }),
    };
  }

  const updateSql = `UPDATE staff SET ${updates.join(", ")} WHERE id = :id`;
  await db.execute(updateSql, parameters);

  // Fetch the updated staff member
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

  console.log("[Staff] Update - Staff member updated", { id });
  return JSON.stringify(staff);
});

