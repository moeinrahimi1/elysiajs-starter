import { t } from "elysia"
import { Static, Type } from '@sinclair/typebox'

import { marketEnum, marketObject } from "./user.entity"


export const findById=t.Object({
  id: t.String(),
})
export const login=t.Object({
  email: t.String(),
  password: t.String(),
})

const market = t.Enum(marketObject,{default:"play"})
export const otp = t.Object({
  phoneNumber: t.String({default:"09367422092"}),
  market: market,
});
export const googleDTO=t.Required(t.Object({
  accessToken: t.String({minLength:10}),
  market: market,
  appVersion: t.String({minLength:1}),
}))
export const googleLink=t.Required(t.Object({
  accessToken: t.String({minLength:10}),

}))
export const guestDTO = t.Required(
  t.Object({
    market: market,
    appVersion: t.String({ minLength: 1 }),
  })
);








const marketEnum = Type.Union([
  Type.Literal('play'),
  Type.Literal('bazaar'),
  Type.Literal('myket'),
  Type.Literal('pwa'),
  Type.Literal('ios'),
  Type.Literal('panel'),
  Type.Literal('sam')
])

const sexEnum = Type.Union([
  Type.Literal('female'),
  Type.Literal('male')
])

export const UserSchema = Type.Object({
  name: Type.String(),
  username: Type.String(),
  phoneNumber: Type.String(),
  email: Type.String(),
  phoneNumberPassword: Type.String(),
  phoneNumberExpire: Type.Number(),
  sex: sexEnum,
  birthDate: Type.Number(),
  // market: market,
  // roles: Type.Array(Type.String()),
  // notes: Type.Array(Type.String()),
  referralCode: Type.String(),
  version: Type.String(),
  lastAppOpened: Type.Date(),
  is_guest: Type.Boolean(),
  level: Type.String(),
  score: Type.Number(),
  coin: Type.Number(),
  avatar: Type.String(),

})

export type UserDTO123 = Static<typeof UserSchema>

export const updateUserDTO = t.Object({
  username: t.Optional(t.String()),
  name: t.Optional(t.String()),
  avatar: t.Optional(t.String()),
  // ...other fields that can be updated...
});