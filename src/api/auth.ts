import type { createApiClient } from './client';
import type {
  AuthResponse,
  EmailCheckResponse,
  LoginBody,
  LoginOtpSendBody,
  LoginOtpSendResponse,
  LoginOtpVerifyBody,
  RegisterBody,
  UsernameCheckResponse,
} from './types';

/** Routes: ThanePropertySearch.Api.Controllers.AuthController — [Route("api/[controller]")] */
export function createAuthApi(client: ReturnType<typeof createApiClient>) {
  return {
    login(body: LoginBody) {
      return client.post<AuthResponse>('/api/auth/login', body, { auth: false });
    },

    sendLoginOtp(body: LoginOtpSendBody) {
      return client.post<LoginOtpSendResponse>('/api/auth/login-otp/send', body, {
        auth: false,
      });
    },

    verifyLoginOtp(body: LoginOtpVerifyBody) {
      return client.post<AuthResponse>('/api/auth/login-otp/verify', body, { auth: false });
    },

    register(body: RegisterBody) {
      return client.post<{ message: string; verifyUrl?: string }>(
        '/api/auth/register',
        body,
        { auth: false }
      );
    },

    checkUsername(username: string) {
      const q = encodeURIComponent(username.trim());
      return client.get<UsernameCheckResponse>(
        `/api/auth/check-username?username=${q}`,
        { auth: false }
      );
    },

    checkEmail(email: string) {
      const q = encodeURIComponent(email.trim());
      return client.get<EmailCheckResponse>(
        `/api/auth/check-email?email=${q}`,
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
