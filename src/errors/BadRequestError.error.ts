import { CustomError } from "./CustomError.error.js";

export class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(message = "Bad Request") {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
