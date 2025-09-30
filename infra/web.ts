import { api } from "./api";
import { bucket, mysql } from "./storage";
import { userPool, identityPool, userPoolClient } from "./auth";

const region = aws.getRegionOutput().name;

export const frontend = new sst.aws.StaticSite("Frontend", {
  path: "packages/frontend",
  build: {
    output: "dist",
    command: "npm run build",
  },
  domain: $app.stage === "production" ? "kpersPOC.patternsatscale.com" : undefined,
  environment: {
    VITE_REGION: region,
    VITE_API_URL: api.url,
    VITE_BUCKET: bucket.name,
    VITE_USER_POOL_ID: userPool.id,
    VITE_IDENTITY_POOL_ID: identityPool.id,
    VITE_USER_POOL_CLIENT_ID: userPoolClient.id,
    VITE_MYSQL_HOST: mysql.host,
    VITE_MYSQL_PORT: mysql.port.toString(),
    VITE_MYSQL_USERNAME: mysql.username,
    VITE_MYSQL_PASSWORD: mysql.password,
    VITE_MYSQL_DATABASE: mysql.database,
  },
});
