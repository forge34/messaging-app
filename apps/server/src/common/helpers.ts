import { Route } from '@chat/shared';
import z from 'zod';

export function toPrismaSelect() {}

export type RequestBody<TRoute extends Route> = z.infer<TRoute['requestBody']>;
export type RequestParams<TRoute extends Route> = z.infer<TRoute['params']>;
export type RequestQueries<TRoute extends Route> = z.infer<TRoute['queries']>;
