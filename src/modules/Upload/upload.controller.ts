import { Elysia, t } from "elysia";

import { setupUpload } from "./upload.module";
import { uploadApi } from "@/utils/upload";

export const uploadController = new Elysia().use(setupUpload).group(
  "/upload",
  {
    detail: {
      tags: ["upload"],
    },
  },
  (app) =>
    app
      .post("/", ({ body, store,query }) => uploadApi(body.file,body.segment), {
        detail: {
          summary: "upload file ",
        },
      })
     
);
