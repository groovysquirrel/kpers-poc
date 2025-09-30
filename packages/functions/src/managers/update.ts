/**
 * PUT /managers/:id - Update an existing manager
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { ManagerUpdateInput, ManagerRow } from "../shared/types";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Manager ID is required" }),
    };
  }

  let data: ManagerUpdateInput;
  
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  console.log("[Managers] Update - Starting", { id });

  // Check if manager exists
  const checkSql = "SELECT id FROM managers WHERE id = :id";
  const checkResult = await db.query(checkSql, [{ name: "id", value: id }]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Manager not found" }),
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
  if (data.company !== undefined) {
    updates.push("company = :company");
    parameters.push({ name: "company", value: data.company });
  }
  if (data.phone !== undefined) {
    updates.push("phone = :phone");
    parameters.push({ name: "phone", value: data.phone });
  }
  if (data.email !== undefined) {
    updates.push("email = :email");
    parameters.push({ name: "email", value: data.email });
  }
  if (data.status !== undefined) {
    updates.push("status = :status");
    parameters.push({ name: "status", value: data.status });
  }
  if (data.marketValue !== undefined) {
    updates.push("market_value = :marketValue");
    parameters.push({ name: "marketValue", value: data.marketValue, type: "long" });
  }
  if (data.asOfDate !== undefined) {
    updates.push("as_of_date = :asOfDate");
    parameters.push({ name: "asOfDate", value: data.asOfDate });
  }

  if (updates.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No fields to update" }),
    };
  }

  const updateSql = `UPDATE managers SET ${updates.join(", ")} WHERE id = :id`;
  await db.execute(updateSql, parameters);

  // Fetch the updated manager
  const selectSql = `
    SELECT id, first_name, last_name, company, phone, email, status, market_value, as_of_date 
    FROM managers 
    WHERE id = :id
  `;
  
  const result = await db.query(selectSql, [{ name: "id", value: id }]);
  const record = result.records[0];
  
  const manager: ManagerRow = {
    id: record[0].stringValue,
    first_name: record[1].stringValue,
    last_name: record[2].stringValue,
    company: record[3].stringValue,
    phone: record[4].isNull ? null : record[4].stringValue,
    email: record[5].isNull ? null : record[5].stringValue,
    status: record[6].stringValue as "Active" | "Terminated" | "Probation",
    market_value: record[7].longValue,
    as_of_date: record[8].stringValue,
  };

  console.log("[Managers] Update - Manager updated", { id });
  return JSON.stringify(manager);
});
