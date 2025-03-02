import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { userController } from './User/user.controller';
import { reactAdminMiddleware } from "@/utils/reactAdmin";

import { userAdminController } from './User/user.admin.controller';
import { roleAdminController } from './Role/role.admin.controller';

import { checkToken } from './Auth/middleware';

import { uploadController } from './Upload/upload.controller';

export const setupApp = () => {
  return new Elysia()
    .use(
      swagger({
        exclude: ["/"],
        documentation: {
          info: {
            title: "Hafezsho documentation",
            version: process.env.npm_package_version!,
          },
        },
      })
    )
    
    .group("/api", (app) =>
      
      app.onAfterHandle(({ response, set }) => {
        return {
          statusCode: set.status,
          data: response,
        };
      })
      
      .use(userController)
     
      .onBeforeHandle(checkToken)
        .use(uploadController)
        
        
        
    )

    .group("/api/admin", {}, (app) =>
      app
        .onAfterHandle(({ response, set, request, path, store }) => {
          const result = response as response;

          const resource = path.split("/")[3];
          if (result && result?.count) {
            console.log(
              request.page,
              request.limit,
              "req===============================================uest",
              path
            );

            let range = `${resource} ${request.page}-${request.limit}/${result.count}`;
            set.headers["Access-Control-Expose-Headers"] = "Content-Range";
            set.headers["Content-Range"] = range;
          }
          console.log('result',path)
          return {
            statusCode: set.status,
            data: result.docs != null ? result.docs : result,
          };
        })
        .onBeforeHandle(checkToken)
        .use(reactAdminMiddleware)
        .use(userAdminController)
        .use(roleAdminController)
        
        
    );
};
type response = {
  docs: any[] | {};
  count: number;
};