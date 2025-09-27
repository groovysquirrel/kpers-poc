/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "notes",
      removal: "remove",
      home: "aws",
    };
  },
  async run() {
    await import("./infra/api");
    const web = await import("./infra/web");
    await import("./infra/storage");
    const auth = await import("./infra/auth");

    return {
      frontend: web.frontend.url,
      UserPool: auth.userPool.id,
      Region: aws.getRegionOutput().name,
      IdentityPool: auth.identityPool.id,
      UserPoolClient: auth.userPoolClient.id,
    };
  },
});
