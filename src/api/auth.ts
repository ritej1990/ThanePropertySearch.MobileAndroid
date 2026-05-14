import type { createApiClient } from './client';
import type { AuthResponse, LoginBody, RegisterBody } from './types';

/** Routes: ThanePropertySearch.Api.Controllers.AuthController — [Route("api/[controller]")] */
export function createAuthApi(client: ReturnType<typeof createApiClient>) {
  return {
    login(body: LoginBody) {
      return client.post<AuthResponse>('/api/auth/login', body, { auth: false });
    },

    register(body: RegisterBody) {
      return client.post<{ message: string; verifyUrl?: string }>(
        '/api/auth/register',
        body,
        { auth: false }
      );
    },

    googleLogin(body: {
      idToken: string;
      role: string;
      marketIntent: string | null;
      phoneNumber: string | null;
    }) {
      return client.post<AuthResponse>('/api/auth/google-login', body, { auth: false });
    },

    forgotPassword(email: string) {
      return client.post<{ message: string }>(
        '/api/auth/forgot-password',
        { email },
        { auth: false }
      );
    },

    resendVerification() {
      return client.post<{ message: string; verifyUrl?: string }>(
        '/api/auth/resend-verification',
        {}
      );
    },
  };
}
