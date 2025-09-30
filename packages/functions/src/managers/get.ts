/**
 * GET /managers/:id - Get a single manager by ID
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { ManagerRow } from "../shared/types";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Manager ID is required" }),
    };
  }

  console.log("[Managers] Get - Starting", { id });

  const sql = `
    SELECT id, first_name, last_name, company, phone, email, status, market_value, as_of_date 
    FROM managers 
    WHERE id = :id
  `;
  
  const params: QueryParameter[] = [{ name: "id", value: id }];
  const result = await db.query(sql, params);
  
  if (!result.records || result.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Manager not found" }),
    };
  }

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

  console.log("[Managers] Get - Found manager", { id });
  return JSON.stringify(manager);
});
