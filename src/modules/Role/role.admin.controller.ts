import { Elysia, t } from "elysia";

import { setupRole } from "./role.module";

import { idParamDTO, paginationDTO } from "@/utils/general.dto";

export const roleAdminController = new Elysia().use(setupRole).group(
  "/role",
  {
    detail: {
      tags: ["role admin"],
    },
  },
  (app) =>
    app
      .post("/", ({ body, store }) => store.roleService.create(body), {
        detail: {
          summary: "create role",
        },
      })
      .get(
        "/",
        ({ store, page, limit, sort, filter }) => {
          return store.roleService.find(page, limit, filter, sort);
        },
        {
          detail: {
            summary: "list role",
          },
        }
      )
      .get(
        "/:id",
        ({ params, store }) => {
          return store.roleService.findById(params.id);
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
          return store.roleService.update(params.id, body);
        },
        {
          params: idParamDTO,
          detail: {
            summary: "update role",
          },
        }
      )
    //   .delete(
    //     "/",
    //     ({ params, body, store,filter }) => {
    //       return store.roleService.deleteMany(filter);
    //     },
    //     {
          
    //       detail: {
    //         summary: "delete role",
    //       },
    //     }
    //   )
);
