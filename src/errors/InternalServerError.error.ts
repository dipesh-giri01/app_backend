import { CustomError } from "./CustomError.error.js";

export class InternalServerError extends CustomError {
  statusCode: number;

  constructor() {
    super("Internal Server Error");
    this.statusCode = 500;

    // Fix prototype chain
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }

  serializeErrors() {
    return [{ message: "Internal Server Error" }];
  }
}
