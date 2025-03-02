import Elysia from "elysia";
import { RoleRepository } from "./role.repository";
import { RoleService } from "./role.service";


export const roleRepository = new RoleRepository();
export const setupRole = () => {
  const roleService = new RoleService(roleRepository);
  return new Elysia().state(() => ({ roleService }));
};
