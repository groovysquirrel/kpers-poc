/**
 * PUT /documents/:id - Update an existing document
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { DocumentUpdateInput, DocumentRow } from "../shared/types";

export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Document ID is required" }),
    };
  }

  let data: DocumentUpdateInput;
  
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  console.log("[Documents] Update - Starting", { id });

  // Check if document exists
  const checkSql = "SELECT id FROM documents WHERE id = :id";
  const checkResult = await db.query(checkSql, [{ name: "id", value: id }]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Document not found" }),
    };
  }

  // Build dynamic UPDATE query based on provided fields
  const updates: string[] = [];
  const parameters: QueryParameter[] = [{ name: "id", value: id }];

  if (data.eventId !== undefined) {
    updates.push("event_id = :eventId");
    parameters.push({ name: "eventId", value: data.eventId });
  }
  if (data.documentTypeId !== undefined) {
    updates.push("document_type_id = :documentTypeId");
    parameters.push({ name: "documentTypeId", value: data.documentTypeId });
  }
  if (data.filename !== undefined) {
    updates.push("filename = :filename");
    parameters.push({ name: "filename", value: data.filename });
  }
  if (data.date !== undefined) {
    updates.push("date = :date");
    parameters.push({ name: "date", value: data.date });
  }
  if (data.url !== undefined) {
    updates.push("url = :url");
    parameters.push({ name: "url", value: data.url });
  }
  if (data.author !== undefined) {
    updates.push("author = :author");
    parameters.push({ name: "author", value: data.author });
  }
  if (data.description !== undefined) {
    updates.push("description = :description");
    parameters.push({ name: "description", value: data.description });
  }

  if (updates.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No fields to update" }),
    };
  }

  const updateSql = `UPDATE documents SET ${updates.join(", ")} WHERE id = :id`;
  await db.execute(updateSql, parameters);

  // Fetch the updated document
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

  console.log("[Documents] Update - Document updated", { id });
  return JSON.stringify(document);
});

