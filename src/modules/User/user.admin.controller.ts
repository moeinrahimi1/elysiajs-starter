import { Elysia, t } from "elysia";

import { setupUsers } from "./user.module";
import { UserDTO } from "./user.dto";
import { idParamDTO } from "@/utils/general.dto";

export const userAdminController = new Elysia().use(setupUsers).group(
  "/user",
  {
    detail: {
      tags: ["user admin"],
    },
  },
  (app) =>
    app
      .post("/", ({ body, store }) => store.usersService.create(body), {
        // body: UserDTO123,
        detail: {
          summary: "create user",
        },
      })
      .get(
        "/",
        ({ store, page, limit, sort, filter }) => {
          return store.usersService.find(page, limit, filter, sort);
        },
        {
          detail: {
            summary: "list user",
          },
        }
      )
      .get(
        "/:id",
        ({ params, store }) => {
          return store.usersService.findById(params.id);
        },
        {
          params: idParamDTO,
          detail: {
            summary: "get by id ",
          },
        }
      )
      .put(
        "/:id",
        ({ params, body, store }) => {
          return store.usersService.update(params.id, body);
        },
        {
          params: idParamDTO,
          detail: {
            summary: "update user",
          },
        }
      )
  //   .delete(
  //     "/",
  //     ({ params, body, store,filter }) => {
  //       return store.usersService.deleteMany(filter);
  //     },
  //     {

  //       detail: {
  //         summary: "delete user",
  //       },
  //     }
  //   )
);
