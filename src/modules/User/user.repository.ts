
import { BaseRepository } from "../Database/repository.abstract";
import {IUser, model as userModel} from './user.entity'

export class UsersRepository extends BaseRepository<IUser> {
  constructor() {
    super(userModel);
  }

 

  async login(email: string, password: string) {
    return this.db.user.findFirst({
      where: { email: email, password: password },
    });
  }
}
