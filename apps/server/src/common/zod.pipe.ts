import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { Route } from '@chat/shared';
import z from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private route: Route) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    const schemaMap = {
      body: this.route.requestBody,
      param: this.route.params,
      query: this.route.queries,
    } satisfies Partial<Record<ArgumentMetadata['type'], z.ZodType>>;

    const schema = schemaMap[metadata.type as keyof typeof schemaMap];
    if (!schema) return value;

    const result = schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException(z.flattenError(result.error));
    }

    return result.data;
  }
}
