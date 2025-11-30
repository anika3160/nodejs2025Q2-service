import { BadRequestException } from '@nestjs/common';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

export const validateUuid = (value: string, fieldName: string) => {
  if (!uuidValidate(value) || uuidVersion(value) !== 4) {
    throw new BadRequestException(`${fieldName} is invalid (not uuid)`);
  }
};
