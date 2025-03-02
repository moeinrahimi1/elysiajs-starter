import { Elysia, t } from "elysia";
import { setupUsers } from "./user.module";
import {
  findById,
  googleDTO,
  googleLink,
  guestDTO,
  login,
  otp,
  updateUserDTO,
} from "./user.dto";
import { checkToken, isLoggedIn } from "../Auth/middleware";

export const userController = new Elysia().use(setupUsers).group(
  "/users",
  {
    detail: {
      tags: ["Auth"],
    },
  },
  (app) =>
    app
      .post(
        "/",
        ({ body, store }) =>
          store.usersService.otp(body.phoneNumber, body.market),
        {
          body: otp,
          // response: typeof db.user,
          detail: {
            summary: "otp",
          },
        }
      )
      .post(
        "/google",
        ({ body, store, headers }) =>
          store.usersService.google(
            body.accessToken,
            body.market,
            headers["user-agent"],
            body.appVersion
          ),
        {
          body: googleDTO,
          // response: typeof db.user,
          detail: {
            summary: "google login",
          },
        }
      )
      .post(
        "/google/link",
        ({ body, store, request }) =>
          store.usersService.linkGoogle(request.user.userId, body.accessToken),
        {
          body: googleLink,
          beforeHandle: checkToken,

          detail: {
            summary: "google link",
          },
        }
      )
      .post(
        "/guest",
        ({ body, store, headers }) =>
          store.usersService.guest(
            body.market,
            headers["user-agent"],
            body.appVersion
          ),
        {
          body: guestDTO,
          detail: {
            summary: "create guest user",
          },
        }
      )
      .post(
        "/login",
        ({ body, store }) =>
          store.usersService.login(body.email, body.password),
        {
          body: login,
          // response: ReturnedUserSchema,
          detail: {
            summary: "Login",
          },
        }
      )

      .put(
        "/",

        async ({ body, store, request: { user } }) => {
          console.log(user, "user");
          const existingUser = await store.usersService.findById(user.userId);
          if (!existingUser) throw new NotFoundError("User not found");

          if (body.username && body.username !== existingUser.username) {
            const usernameExists = await store.usersService.findByUsername(
              body.username
            );
            if (usernameExists) throw new Error("Username already exists");
          }

          const updateData = { ...body };
          delete updateData.email;
          delete updateData.phoneNumber;

          return store.usersService.update(user.userId, updateData);
        },
        {
          beforeHandle: checkToken,

          body: updateUserDTO,
          detail: {
            summary: "Update User",
          },
        }
      )
      .get(
        "/",
        ({ store, request: { user }, set }) =>
          store.usersService.get(user.userId),
        {
          beforeHandle: checkToken,
          // body: otp,
          // response: typeof db.user,
          detail: {
            summary: "get user",
          },
        }
      )
      .post("/refresh", ({ headers, body, request, store }) => {
        return store.usersService.refreshToken(
          headers["authorization"],
          body.refresh_token
        );
      })
  // .use(isLoggedIn)
);
