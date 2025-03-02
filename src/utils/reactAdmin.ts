import Elysia, { Context } from "elysia";
export const reactAdminMiddleware = new Elysia().derive(
  { as: "global" },
  ({ request, query, headers }) => {
    let filter, sort = undefined
    const a=new URLSearchParams(query)
    if (a.get("filter")) filter = filterReactAdmin(a.get("filter"));
    if (a.get("sort")) sort = buildSortReactAdmin(a.get("sort"));
    let { page, limit } = paginatorReactAdmin(a.get("range"));

    request.page = page;
    request.limit = limit;
    return { filter, sort, page, limit };
  }
);

const mongoose = require("mongoose");

const paginatorReactAdmin = (range) => {
  let page = 0;
  let limit = 10;
  if(!range) return { page, limit };
  range = JSON.parse(range);
  page = parseInt(range[0]);
  limit = parseInt(range[1]) - parseInt(range[0]) + 1;
  return { page, limit };
};

const filterReactAdmin = (filter, where = {}) => {

  if (typeof filter == "string") filter = JSON.parse(filter);
  console.log(filter,'filter')
  Object.keys(filter).forEach((key) => {
    if (where[key]) return true;
    where[key] = filter[key];
    if(where['verse']) where['verse'] = new RegExp(where['verse'], 'i');
    if (key == "id" || key == "ids") {
      console.log(key)
      where._id = filter.ids || filter.id;
      if (Array.isArray(filter.ids))
        where._id = {
          $in: filter.ids.map((id) => new mongoose.Types.ObjectId(id)),
        };
      delete where.id;
      delete where.ids;
    }
  });
  console.log(where,'where')
  // where.deleted = false;
  return where;
};

const buildSortReactAdmin = (sort) => {
  let result = {};
  if (!sort) return { _id: -1 };
  sort = JSON.parse(sort);
  if (sort[0] == "id") sort[0] = "_id";
  sort[0] = sort[0].replace(".length", "");

  result[sort[0]] = sort[1] == "DESC" ? -1 : 1;

  if (!result._id) {
    result._id = result[sort[0]]; // sort needs unique field to be consistent
  }
  return result;
};
