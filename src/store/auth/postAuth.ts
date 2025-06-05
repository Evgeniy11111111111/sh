import {createEffect, createEvent, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {changeToken} from "../token.ts";
import {URLShikana} from "../../constants/url.ts";

interface ILoginInputs {
  email: string,
  password: string
}

interface IAuthPostLogin {
  data: {token: string}
}

const api = new ApiCore();
export const authResetLogin = createEvent()
export const fxAuthPost = createEffect( async (data: ILoginInputs) => {
  return await api.create(`${URLShikana}/api/admin/login`, data)
})

export const $authPostError = createStore<string>("")
  .on(fxAuthPost.fail, (_, error) => {
    return error.error.message
  })
  .reset(authResetLogin)

export const $authPostLoading = createStore<boolean>(false)
  .on(fxAuthPost.pending, (_, payload) => payload)
  .reset(authResetLogin)

fxAuthPost.doneData.watch((data: IAuthPostLogin) => {
  if (data !== undefined) {
    const token = data.data.token
    changeToken(token);
  }
})