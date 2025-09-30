/**
 * Shared Lambda handler wrapper
 * Provides consistent error handling and response formatting
 * Supports custom status codes for REST API responses
 */

import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export interface HandlerResponse {
  statusCode?: number;
  body: string;
  headers?: Record<string, string | boolean>;
}

export function handler(
  lambda: (evt: APIGatewayProxyEvent, context: Context) => Promise<string | HandlerResponse>
) {
  return async function(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    let body: string;
    let statusCode: number;
    let customHeaders: Record<string, string | boolean> = {};

    try {
      // Run the Lambda
      const result = await lambda(event, context);
      
      // Check if result is a HandlerResponse object or just a string
      if (typeof result === "string") {
        body = result;
        statusCode = 200;
      } else {
        body = result.body;
        statusCode = result.statusCode || 200;
        customHeaders = result.headers || {};
      }
    } catch (error) {
      statusCode = 500;
      body = JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      });
    }

    // Return HTTP response
    return {
      body,
      statusCode,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        ...customHeaders,
      },
    };
  };
}
