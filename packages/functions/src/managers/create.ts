/**
 * POST /managers - Create a new manager
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { ManagerCreateInput, ManagerRow } from "../shared/types";
import * as uuid from "uuid";

export const main = handler(async (event) => {
  let data: ManagerCreateInput;
  
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  // Validate required fields
  if (!data.firstName || !data.lastName || !data.company || !data.status || data.marketValue === undefined || !data.asOfDate) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: "Missing required fields: firstName, lastName, company, status, marketValue, asOfDate" 
      }),
    };
  }

  const id = uuid.v4();
  console.log("[Managers] Create - Starting", { id });

  const sql = `
    INSERT INTO managers (id, first_name, last_name, company, phone, email, status, market_value, as_of_date)
    VALUES (:id, :firstName, :lastName, :company, :phone, :email, :status, :marketValue, :asOfDate)
  `;
  
  const params: QueryParameter[] = [
    { name: "id", value: id },
    { name: "firstName", value: data.firstName },
    { name: "lastName", value: data.lastName },
    { name: "company", value: data.company },
    { name: "phone", value: data.phone || null },
    { name: "email", value: data.email || null },
    { name: "status", value: data.status },
    { name: "marketValue", value: data.marketValue, type: "long" },
    { name: "asOfDate", value: data.asOfDate },
  ];
  
  await db.execute(sql, params);

  // Fetch the created manager
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

  console.log("[Managers] Create - Manager created", { id });
  return JSON.stringify(manager);
});
