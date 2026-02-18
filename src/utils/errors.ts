export class TostError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TostError';
    Object.setPrototypeOf(this, TostError.prototype);
  }
}

export function exitWithError(message: string, code = 1): never {
  console.error(`tost: ${message}`);
  process.exit(code);
}
