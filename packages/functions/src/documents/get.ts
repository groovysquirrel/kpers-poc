/**
 * GET /documents/:id - Get a single document by ID
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { DocumentRow } from "../shared/types";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Document ID is required" }),
    };
  }

  console.log("[Documents] Get - Starting", { id });

  const sql = `
    SELECT id, event_id, document_type_id, filename, date, url, author, description, created_at, updated_at
    FROM documents 
    WHERE id = :id
  `;
  
  const params: QueryParameter[] = [{ name: "id", value: id }];
  const result = await db.query(sql, params);
  
  if (!result.records || result.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Document not found" }),
    };
  }

  const record = result.records[0];
  const document: DocumentRow = {
    id: record[0].stringValue,
    event_id: record[1].isNull ? null : record[1].stringValue,
    document_type_id: record[2].stringValue,
    filename: record[3].stringValue,
    date: record[4].stringValue,
    url: record[5].isNull ? null : record[5].stringValue,
    author: record[6].isNull ? null : record[6].stringValue,
    description: record[7].isNull ? null : record[7].stringValue,
    created_at: record[8].stringValue,
    updated_at: record[9].stringValue,
  };

  console.log("[Documents] Get - Found document", { id });
  return JSON.stringify(document);
});

