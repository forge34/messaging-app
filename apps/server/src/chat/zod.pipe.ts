import {
  PipeTransform,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { EventObject } from '@chat/shared';
import z from 'zod';

export class ChatZodValidationPipe<
  TGroup extends EventObject,
  TKey extends keyof TGroup & string,
> implements PipeTransform {
  constructor(
    private readonly eventGroup: TGroup,
    private readonly eventKey: TKey,
  ) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type != 'body') return value;
    const schema = this.eventGroup[this.eventKey];
    if (!schema) return value;

    const input = Array.isArray(value) ? value : [value];
    const result = schema.input.safeParse(input);

    if (!result.success) {
      throw new BadRequestException(z.flattenError(result.error));
    }

    return result.data;
  }
}
