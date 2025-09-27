# KPERS POC

A proof of concept application built with SST (Serverless Stack) for knowledge persistence and retrieval.

This is a full-stack serverless app built with SST, featuring:

- React.js frontend
- AWS Lambda functions for the API
- API Gateway for routing
- DynamoDB for data storage
- Cognito for user authentication

## Project Structure

- The `infra/` directory defines our AWS infrastructure
- The `packages/functions` directory contains the Lambda functions that power the CRUD API
- The `packages/frontend` directory contains the React app
- The `packages/core` directory contains shared utilities and types

### Prerequisites

Before you get started:

1. [Configure your AWS credentials](https://docs.sst.dev/advanced/iam-credentials#loading-from-a-file)
2. [Install the SST CLI](https://ion.sst.dev/docs/reference/cli/)

### Usage

Clone this repo.

```bash
git clone https://github.com/groovysquirrel/kpers-poc.git
```

Install dependencies.

```bash
npm install
```


#### Developing Locally

From your project root run:

```bash
npx sst dev
```

This will start your frontend and run your functions [Live](https://ion.sst.dev/docs/live/).

#### Deploying to Prod

Run this in the project root to deploy it to prod.

```bash
npx sst deploy --stage production
```


---

Join the SST community over on [Discord](https://discord.gg/sst) and follow us on [Twitter](https://twitter.com/SST_dev).
