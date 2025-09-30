/**
 * HTTP Client
 * 
 * Purpose: Base HTTP client for making IAM-authenticated API requests
 * - Uses AWS Amplify API module for automatic request signing
 * - Handles IAM authentication via Cognito Identity Pool
 * - Centralizes error handling
 * - Provides consistent request/response formatting
 * - Supports all HTTP methods (GET, POST, PUT, DELETE)
 * 
 * Note: This client uses AWS Amplify's API module which automatically signs
 * requests with AWS Signature Version 4 using the user's IAM credentials
 * from the Cognito Identity Pool. This is required when API Gateway routes
 * are configured with IAM authentication.
 * 
 * Usage: import { httpClient } from './http'
 */

import { API } from 'aws-amplify';

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
}

class HttpClient {
  private readonly apiName = 'api'; // Must match the name in Amplify.configure()

  /**
   * Handle API errors and format them consistently
   */
  private handleError(error: any): never {
    // Amplify API errors have a response property
    if (error.response) {
      const status = error.response.status || 500;
      const data = error.response.data || {};
      
      throw {
        status,
        code: `HTTP_${status}`,
        message: data.message || data.error || error.message || `Request failed with status ${status}`,
        details: data
      } as ApiError;
    }

    // Network or other errors
    throw {
      status: 500,
      code: 'NETWORK_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error
    } as ApiError;
  }

  /**
   * Build query string from params object
   */
  private buildQueryString(params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return '';
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Make a GET request
   * 
   * Uses AWS Amplify API.get() which automatically signs the request
   * with the user's IAM credentials from Cognito Identity Pool.
   */
  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    try {
      const queryString = this.buildQueryString(params);
      const fullPath = `${path}${queryString}`;

      const response = await API.get(this.apiName, fullPath, {
        headers: {},
      });

      return response;
    } catch (error: any) {
      this.handleError(error);
      return {} as T; // Never reached
    }
  }

  /**
   * Make a POST request
   * 
   * Uses AWS Amplify API.post() which automatically signs the request
   * with the user's IAM credentials from Cognito Identity Pool.
   */
  async post<T>(path: string, body?: any): Promise<T> {
    try {
      const response = await API.post(this.apiName, path, {
        body: body || {},
        headers: {},
      });

      return response;
    } catch (error: any) {
      this.handleError(error);
      return {} as T; // Never reached
    }
  }

  /**
   * Make a PUT request
   * 
   * Uses AWS Amplify API.put() which automatically signs the request
   * with the user's IAM credentials from Cognito Identity Pool.
   */
  async put<T>(path: string, body?: any): Promise<T> {
    try {
      const response = await API.put(this.apiName, path, {
        body: body || {},
        headers: {},
      });

      return response;
    } catch (error: any) {
      this.handleError(error);
      return {} as T; // Never reached
    }
  }

  /**
   * Make a DELETE request
   * 
   * Uses AWS Amplify API.del() which automatically signs the request
   * with the user's IAM credentials from Cognito Identity Pool.
   */
  async delete<T>(path: string): Promise<T> {
    try {
      const response = await API.del(this.apiName, path, {
        headers: {},
      });

      return response;
    } catch (error: any) {
      this.handleError(error);
      return {} as T; // Never reached
    }
  }
}

// Export singleton instance
export const httpClient = new HttpClient();

