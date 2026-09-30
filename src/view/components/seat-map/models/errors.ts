export class UnknownClientError extends Error {
  constructor(clientId: string) {
    super(`Не найден драйвер для клиента: ${clientId}`);
    this.name = 'UnknownClientError';
  }
}

export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidInputError';
  }
}

export class MappingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MappingError';
  }
}

export class UniversalValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UniversalValidationError';
  }
}
