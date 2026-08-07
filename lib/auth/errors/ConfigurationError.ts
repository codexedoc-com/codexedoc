import { BaseAuthError } from "./BaseAuthError";

/**
 * Thrown when environment setup or provider configuration is invalid or missing required secrets.
 */
export class ConfigurationError extends BaseAuthError {
  public readonly statusCode = 500;

  constructor(message = "Configuration error: Invalid authentication setup") {
    super(message);
    this.name = "ConfigurationError";
  }
}
