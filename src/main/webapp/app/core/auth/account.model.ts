export class Account {
  constructor(
    public activated: boolean,
    /**
     * Authority names, as plain strings — `["ROLE_USER", "ROLE_ADMIN"]`.
     *
     * This is what `GET /api/account` actually returns: the gateway's `AdminUserDTO` carries a
     * `Set<String>`, and Jackson serialises it as an array of strings. It matches
     * `IUser.authorities`, which was always typed this way.
     *
     * It was briefly declared `IAuthority[]` (objects with a `.name`). Nothing on the wire changed
     * to match, so every `.name` read yielded `undefined` and **every authority check in the app
     * silently returned false** — `AccountService.hasAnyAuthority`, and therefore
     * `*hpdHasAnyAuthority`, `UserRouteAccessService`, and the sidebar's admin group. The symptom
     * is an admin who sees a signed-in shell with nothing in it, which reads as a permissions
     * problem on the server rather than a type error on the client.
     *
     * If you change this, change the wire format too — and note that TypeScript cannot catch the
     * drift, because the payload is cast, not validated.
     */
    public authorities: string[],
    public email: string,
    public firstName: string | null,
    public langKey: string,
    public lastName: string | null,
    public login: string,
    public imageUrl: string | null,
  ) {}
}
