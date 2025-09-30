/**
 * GET /document-types - List all document types
 * Creates table and seeds data only if table doesn't exist
 */

import { handler } from "../shared/handler";
import { db, QueryParameter } from "../shared/database";
import { DocumentTypeRow } from "../shared/types";
import fs from "node:fs";

async function createTableAndSeed(): Promise<void> {
  console.log("[DocumentTypes] Table not found. Creating...");
  const schemaSql = fs.readFileSync("database/document-types/schema.sql", "utf-8");
  await db.execute(schemaSql);
  console.log("[DocumentTypes] Table created successfully");

  // Seed with default data
  console.log("[DocumentTypes] Seeding default data...");
  const defaults: DocumentTypeRow[] = JSON.parse(fs.readFileSync("database/document-types/data.json", "utf-8"));
  
  if (!Array.isArray(defaults) || defaults.length === 0) {
    console.log("[DocumentTypes] No default data to seed");
    return;
  }

  // Insert document types one at a time
  for (const docType of defaults) {
    const sql = `
      INSERT INTO document_types (id, name, description, is_active, display_order)
      VALUES (:id, :name, :description, :isActive, :displayOrder)
    `;
    
    const params: QueryParameter[] = [
      { name: "id", value: docType.id },
      { name: "name", value: docType.name },
      { name: "description", value: docType.description || null },
      { name: "isActive", value: docType.is_active, type: "boolean" },
      { name: "displayOrder", value: docType.display_order, type: "long" },
    ];
    
    await db.execute(sql, params);
  }
  
  console.log(`[DocumentTypes] Seeded ${defaults.length} document types`);
}

async function selectDocumentTypes(): Promise<DocumentTypeRow[]> {
  const sql = `
    SELECT id, name, description, is_active, display_order, created_at, updated_at
    FROM document_types 
    ORDER BY display_order, name
  `;
  
  const result = await db.query(sql);
  
  if (!result.records || result.records.length === 0) {
    return [];
  }

  // Convert Data API response format to DocumentTypeRow objects
  const documentTypes: DocumentTypeRow[] = result.records.map((record: any) => ({
    id: record[0].stringValue,
    name: record[1].stringValue,
    description: record[2].isNull ? null : record[2].stringValue,
    is_active: record[3].booleanValue,
    display_order: record[4].isNull ? null : record[4].longValue,
    created_at: record[5].stringValue,
    updated_at: record[6].stringValue,
  }));

  return documentTypes;
}

export const main = handler(async () => {
  console.log("[DocumentTypes] List - Starting");

  try {
    // Try to select document types directly (normal case - table exists)
    const documentTypes = await selectDocumentTypes();
    console.log(`[DocumentTypes] List - Returning ${documentTypes.length} document types`);
    return JSON.stringify(documentTypes);
  } catch (err: any) {
    // Check if table doesn't exist
    if (err?.message?.includes("doesn't exist") || err?.message?.includes("Table") && err?.message?.includes("not found")) {
      // Table doesn't exist - create and seed
      await createTableAndSeed();
      
      // Retry the select
      const documentTypes = await selectDocumentTypes();
      console.log(`[DocumentTypes] List - Returning ${documentTypes.length} document types (after create+seed)`);
      return JSON.stringify(documentTypes);
    }
    
    // Other error - rethrow
    throw err;
  }
});

