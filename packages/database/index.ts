/**
 * Database configuration and file paths
 * Used by SST to copy database files into Lambda bundles
 */

export const dbConfigs = [
  {
    from: "packages/database/manager",
    to: "database/manager",
  },
  {
    from: "packages/database/events",
    to: "database/events",
  },
  {
    from: "packages/database/event-types",
    to: "database/event-types",
  },
  {
    from: "packages/database/staff",
    to: "database/staff",
  },
  {
    from: "packages/database/note-types",
    to: "database/note-types",
  },
  {
    from: "packages/database/notes",
    to: "database/notes",
  },
  {
    from: "packages/database/performance-metrics",
    to: "database/performance-metrics",
  },
  {
    from: "packages/database/document-types",
    to: "database/document-types",
  },
  {
    from: "packages/database/documents",
    to: "database/documents",
  },
];
