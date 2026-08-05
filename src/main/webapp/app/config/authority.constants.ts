export enum Authority {
  ADMIN = 'ROLE_ADMIN',
  // Read-only access to the admin surface. Seeded by the gateway alongside ADMIN and USER, and now
  // enforced by the api's filter chain — see its SecurityConfiguration.
  OPERATOR = 'ROLE_OPERATOR',
  USER = 'ROLE_USER',
}
