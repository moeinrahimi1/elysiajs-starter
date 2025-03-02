import { t } from "elysia";

export const paginationDTO = t.Object({
  page: t.String({ default: 1 }),
  limit: t.String({ default: 10 }),
});

export const idParamDTO = t.Object({
  id: t.String({ pattern: "^[0-9a-fA-F]{24}$" }),
});
