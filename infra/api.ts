import { mysql } from "./storage";
import { dbConfigs } from "../packages/database";

// Create the API
export const api = new sst.aws.ApiGatewayV2("Api", {
  transform: {
    route: {
      handler: {
        link: [mysql],
        url: true,
        copyFiles: dbConfigs
      },
      args: {
        auth: { iam: true }
      },
    }
  },
  domain: $app.stage === "production" ? "kpersPOC-api.patternsatscale.com" : undefined
});

// Notes routes (legacy)
api.route("GET /notes", "packages/functions/src/list.main");
api.route("POST /notes", "packages/functions/src/create.main");
api.route("GET /notes/{id}", "packages/functions/src/get.main");
api.route("PUT /notes/{id}", "packages/functions/src/update.main");
api.route("DELETE /notes/{id}", "packages/functions/src/delete.main");

// Managers routes
api.route("GET /managers", "packages/functions/src/managers/list.main");
api.route("GET /managers/{id}", "packages/functions/src/managers/get.main");
api.route("POST /managers", "packages/functions/src/managers/create.main");
api.route("PUT /managers/{id}", "packages/functions/src/managers/update.main");
api.route("DELETE /managers/{id}", "packages/functions/src/managers/delete.main");

// Event Types routes
api.route("GET /event-types", "packages/functions/src/event-types/list.main");
api.route("GET /event-types/{id}", "packages/functions/src/event-types/get.main");
api.route("POST /event-types", "packages/functions/src/event-types/create.main");
api.route("PUT /event-types/{id}", "packages/functions/src/event-types/update.main");
api.route("DELETE /event-types/{id}", "packages/functions/src/event-types/delete.main");

// Events routes
api.route("GET /events", "packages/functions/src/events/list.main");
api.route("GET /events/{id}", "packages/functions/src/events/get.main");
api.route("POST /events", "packages/functions/src/events/create.main");
api.route("PUT /events/{id}", "packages/functions/src/events/update.main");
api.route("DELETE /events/{id}", "packages/functions/src/events/delete.main");

// Staff routes
api.route("GET /staff", "packages/functions/src/staff/list.main");
api.route("GET /staff/{id}", "packages/functions/src/staff/get.main");
api.route("POST /staff", "packages/functions/src/staff/create.main");
api.route("PUT /staff/{id}", "packages/functions/src/staff/update.main");
api.route("DELETE /staff/{id}", "packages/functions/src/staff/delete.main");

// Note Types routes
api.route("GET /note-types", "packages/functions/src/note-types/list.main");
api.route("GET /note-types/{id}", "packages/functions/src/note-types/get.main");
api.route("POST /note-types", "packages/functions/src/note-types/create.main");
api.route("PUT /note-types/{id}", "packages/functions/src/note-types/update.main");
api.route("DELETE /note-types/{id}", "packages/functions/src/note-types/delete.main");

// Notes routes (new)
api.route("GET /api/notes", "packages/functions/src/notes/list.main");
api.route("GET /api/notes/{id}", "packages/functions/src/notes/get.main");
api.route("POST /api/notes", "packages/functions/src/notes/create.main");
api.route("PUT /api/notes/{id}", "packages/functions/src/notes/update.main");
api.route("DELETE /api/notes/{id}", "packages/functions/src/notes/delete.main");

// Performance Metrics routes
api.route("GET /performance-metrics", "packages/functions/src/performance-metrics/list.main");
api.route("GET /performance-metrics/{id}", "packages/functions/src/performance-metrics/get.main");
api.route("POST /performance-metrics", "packages/functions/src/performance-metrics/create.main");
api.route("PUT /performance-metrics/{id}", "packages/functions/src/performance-metrics/update.main");
api.route("DELETE /performance-metrics/{id}", "packages/functions/src/performance-metrics/delete.main");

// Document Types routes
api.route("GET /document-types", "packages/functions/src/document-types/list.main");
api.route("GET /document-types/{id}", "packages/functions/src/document-types/get.main");
api.route("POST /document-types", "packages/functions/src/document-types/create.main");
api.route("PUT /document-types/{id}", "packages/functions/src/document-types/update.main");
api.route("DELETE /document-types/{id}", "packages/functions/src/document-types/delete.main");

// Documents routes
api.route("GET /documents", "packages/functions/src/documents/list.main");
api.route("GET /documents/{id}", "packages/functions/src/documents/get.main");
api.route("POST /documents", "packages/functions/src/documents/create.main");
api.route("PUT /documents/{id}", "packages/functions/src/documents/update.main");
api.route("DELETE /documents/{id}", "packages/functions/src/documents/delete.main");
