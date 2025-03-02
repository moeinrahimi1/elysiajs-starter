
import { BaseRepository } from "../Database/repository.abstract";
import { ISession, model as sessionModel } from "./session.entity";

export class SessionRepository extends BaseRepository<ISession> {
  constructor() {
    super(sessionModel);
  }
}
