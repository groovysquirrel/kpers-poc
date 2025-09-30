/**
 * POST /documents - Create a new document
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { DocumentCreateInput, DocumentRow } from "../shared/types";
import * as uuid from "uuid";

export const main = handler(async (event) => {
  let data: DocumentCreateInput;
  
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  // Validate required fields
  if (!data.documentTypeId || !data.filename || !data.date) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: "Missing required fields: documentTypeId, filename, date" 
      }),
    };
  }

  const id = uuid.v4();
  console.log("[Documents] Create - Starting", { id });

  const sql = `
    INSERT INTO documents (id, event_id, document_type_id, filename, date, url, author, description)
    VALUES (:id, :eventId, :documentTypeId, :filename, :date, :url, :author, :description)
  `;
  
  const params: QueryParameter[] = [
    { name: "id", value: id },
    { name: "eventId", value: data.eventId || null },
    { name: "documentTypeId", value: data.documentTypeId },
    { name: "filename", value: data.filename },
    { name: "date", value: data.date },
    { name: "url", value: data.url || null },
    { name: "author", value: data.author || null },
    { name: "description", value: data.description || null },
  ];
  
  await db.execute(sql, params);

  // Fetch the created document
  const selectSql = `
    SELECT id, event_id, document_type_id, filename, date, url, author, description, created_at, updated_at
    FROM documents 
    WHERE id = :id
  `;
  
  const result = await db.query(selectSql, [{ name: "id", value: id }]);
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

  console.log("[Documents] Create - Document created", { id });
  return JSON.stringify(document);
});

