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
];
