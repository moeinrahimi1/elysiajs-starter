import { Elysia } from "elysia";
import { setupApp } from "@/modules/app.module";
import { env } from "./config";
import runDB from "./modules/Database/database.module";
import { cors } from '@elysiajs/cors'

runDB();

const app = new Elysia()

  .use(setupApp)
  // .use(cors())
  .listen(env.PORT)
  .onError(({ code, error,request }) => {
    console.log(code, error,'ERROR',request.method,request.url);
    return new Response(error.toString());
  });

console.log(
  `🦊 ${app.name} Backend is running! Access Swagger UI at http://${app.server?.hostname}:${app.server?.port}/swagger`
);

export type App = typeof app;

