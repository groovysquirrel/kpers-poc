/**
 * GET /documents - List all documents
 * Creates table and seeds data only if table doesn't exist
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { DocumentRow } from "../shared/types";
import fs from "node:fs";

async function createTableAndSeed(): Promise<void> {
  console.log("[Documents] Table not found. Creating...");
  const schemaSql = fs.readFileSync("database/documents/schema.sql", "utf-8");
  await db.execute(schemaSql);
  console.log("[Documents] Table created successfully");

  // Seed with default data
  console.log("[Documents] Seeding default data...");
  const defaults: DocumentRow[] = JSON.parse(fs.readFileSync("database/documents/data.json", "utf-8"));
  
  if (!Array.isArray(defaults) || defaults.length === 0) {
    console.log("[Documents] No default data to seed");
    return;
  }

  // Insert documents one at a time
  for (const doc of defaults) {
    const sql = `
      INSERT INTO documents (id, event_id, document_type_id, filename, date, url, author, description)
      VALUES (:id, :eventId, :documentTypeId, :filename, :date, :url, :author, :description)
    `;
    
    const params: QueryParameter[] = [
      { name: "id", value: doc.id },
      { name: "eventId", value: doc.event_id || null },
      { name: "documentTypeId", value: doc.document_type_id },
      { name: "filename", value: doc.filename },
      { name: "date", value: doc.date },
      { name: "url", value: doc.url || null },
      { name: "author", value: doc.author || null },
      { name: "description", value: doc.description || null },
    ];
    
    await db.execute(sql, params);
  }
  
  console.log(`[Documents] Seeded ${defaults.length} documents`);
}

async function selectDocuments(): Promise<DocumentRow[]> {
  const sql = `
    SELECT id, event_id, document_type_id, filename, date, url, author, description, created_at, updated_at
    FROM documents 
    ORDER BY date DESC, created_at DESC
  `;
  
  const result = await db.query(sql);
  
  if (!result.records || result.records.length === 0) {
    return [];
  }

  // Convert Data API response format to DocumentRow objects
  const documents: DocumentRow[] = result.records.map((record: any) => ({
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
  }));

  return documents;
}

export const main = handler(async () => {
  console.log("[Documents] List - Starting");

  try {
    // Try to select documents directly (normal case - table exists)
    const documents = await selectDocuments();
    console.log(`[Documents] List - Returning ${documents.length} documents`);
    return JSON.stringify(documents);
  } catch (err: any) {
    // Check if table doesn't exist
    if (err?.message?.includes("doesn't exist") || err?.message?.includes("Table") && err?.message?.includes("not found")) {
      // Table doesn't exist - create and seed
      await createTableAndSeed();
      
      // Retry the select
      const documents = await selectDocuments();
      console.log(`[Documents] List - Returning ${documents.length} documents (after create+seed)`);
      return JSON.stringify(documents);
    }
    
    // Other error - rethrow
    throw err;
  }
});

