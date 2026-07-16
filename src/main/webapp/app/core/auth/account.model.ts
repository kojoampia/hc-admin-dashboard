import { IAuthority } from "app/admin/user-management/user-management.model";

export class Account {
  constructor(
    public activated: boolean,
    public authorities: IAuthority[],
    public email: string,
    public firstName: string | null,
    public langKey: string,
    public lastName: string | null,
    public login: string,
    public imageUrl: string | null,
  ) {}
}
