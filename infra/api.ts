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
