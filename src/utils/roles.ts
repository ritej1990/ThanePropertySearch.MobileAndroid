/** Matches API / web roles (Owner, User, Builder, etc.) */
export function isOwnerRole(role: string | null | undefined): boolean {
  return role?.trim().toLowerCase() === 'owner';
}

export function isUserRole(role: string | null | undefined): boolean {
  return role?.trim().toLowerCase() === 'user';
}

export function isBuilderRole(role: string | null | undefined): boolean {
  return role?.trim().toLowerCase() === 'builder';
}
