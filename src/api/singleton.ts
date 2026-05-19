import { createApiClient } from './client';
import { createAuthApi } from './auth';
import { createPaymentsApi } from './payments';
import { createPropertiesApi } from './properties';
import { createSupportApi } from './support';
import { createUsersApi } from './users';
import { expoTokenStorage } from '../storage/tokenStorage';

export const api = createApiClient(expoTokenStorage);
export const authApi = createAuthApi(api);
export const propertiesApi = createPropertiesApi(api);
export const paymentsApi = createPaymentsApi(api);
export const supportApi = createSupportApi(api);
export const usersApi = createUsersApi(api);
