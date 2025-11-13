import type { User } from '@/types';

/**
 * Normalize raw API user objects into the shape the frontend expects.
 */
export function normalizeUser(rawUser: any): User {
  if (!rawUser) {
    throw new Error('Missing user data');
  }

  const firstName = rawUser.firstName ?? rawUser.name?.split(' ')?.[0] ?? '';
  const lastName =
    rawUser.lastName ??
    (rawUser.name ? rawUser.name.split(' ').slice(1).join(' ') : '') ??
    '';

  const displayName =
    rawUser.name ||
    [firstName, lastName].filter(Boolean).join(' ').trim() ||
    rawUser.email;

  return {
    id: rawUser.id,
    email: rawUser.email,
    firstName,
    lastName,
    name: displayName,
    uploads_used: rawUser.uploads_used ?? 0,
    batches_created: rawUser.batches_created ?? 0,
    totalHeadshots: rawUser.totalHeadshots ?? rawUser.headshotCount,
    profileImageUrl: rawUser.profileImageUrl ?? rawUser.avatarUrl ?? null,
    isFreeUser:
      typeof rawUser.isFreeUser === 'boolean'
        ? rawUser.isFreeUser
        : !!rawUser.isFreeUser,
    createdAt: rawUser.createdAt ?? new Date().toISOString(),
    updatedAt: rawUser.updatedAt,
  };
}
