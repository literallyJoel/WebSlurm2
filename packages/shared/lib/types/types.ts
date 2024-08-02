import { type Static } from 'elysia';
import { CreateUserSchema, ModelNameSchema, OperationNameSchema } from './schemas';

export type ModelName = Static<typeof ModelNameSchema>;
export type OperationName = Static<typeof OperationNameSchema>;
export type CreateUserObject = Static<typeof CreateUserSchema>;
export type TransactionOperation = {
  order: number;
  model: ModelName;
  operation: OperationName;
  params: object | { $ref: string; field: string };
  resultKey?: string;
  return?: string[];
};

export type OAuthProvider = {
  name: string;
  requiredFields: string[];
  optionalFields?: string[];
};

export type UnparsedProvider = {
  name: string;
  requiredFields: string;
  optionalFields?: string;
};

export type ConfigItem = {
  key: string;
  value: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: 'admin' | 'user';
};

export type WhitelistUser = {
  email: string;
  role: 'admin' | 'user';
  organisationId: string;
  organisationRole: 'admin' | 'moderator' | 'user';
};

