/**
 * Base abstract error class for all authentication domain errors.
 *
 * @see ADR-002 — Authentication Architecture
 */
export abstract class BaseAuthError extends Error {
  public abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
