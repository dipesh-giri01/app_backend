import { CustomError } from "./CustomError.error";

export class ValidationError extends CustomError {
  statusCode = 400;

  constructor(public details: { message: string; path?: any }[]) {
    super("Invalid request parameters");
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  serializeErrors() {
    return this.details.map((err) => ({
      message: err.message,
      field: Array.isArray(err.path) ? err.path.join(".") : err.path,
    }));
  }
}
