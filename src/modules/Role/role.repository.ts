import { BaseRepository } from "../Database/repository.abstract";

import { IRole, model as roleModel } from "./role.entity";

export class RoleRepository extends BaseRepository<IRole> {
  constructor() {
    super(roleModel);
  }

}
