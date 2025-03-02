import { RoleRepository } from "./role.repository";


export class RoleService{
  constructor(private repository:RoleRepository) {

  }

  create(body) {
    return this.repository.create(body);
  }
  async find(page: number, limit: number, filter, sort) {
    console.log(filter,'role baby')
    const count = await this.repository.where(filter).count();
    const docs = await  this.repository
      .where(filter)
      .sort(sort)
      .skip(page)
      .limit(limit)
      .findAll();
    return {
      count,
      docs,
    };
  }

  findById(id: string) {
    return this.repository.findById(id);
  }
  update(id: string, body) {
    return this.repository.where({ _id: id }).update(body);
  }
  deleteMany(filter) {
    console.log(filter,'=============dddddddddddddddddddddddddddddddddddddddddddddddddd');
    return this.repository.where(filter).deleteMany();
  }

}
