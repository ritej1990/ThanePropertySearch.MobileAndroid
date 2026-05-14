import { createApiClient } from './client';
import { createAuthApi } from './auth';
import { createPropertiesApi } from './properties';
import { expoTokenStorage } from '../storage/tokenStorage';

export const api = createApiClient(expoTokenStorage);
export const authApi = createAuthApi(api);
export const propertiesApi = createPropertiesApi(api);
