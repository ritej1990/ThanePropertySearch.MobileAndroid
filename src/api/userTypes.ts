export type UserProfile = {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  marketIntent: string | null;
  role: string;
  authProvider: string;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
};
