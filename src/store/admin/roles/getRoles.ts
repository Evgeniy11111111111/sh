import {ApiCore} from "../../../helpers/api/apiCore.ts";
import {createEffect, createStore} from "effector";
import {IPermissions} from "./getPermissions.ts";
import {URLShikana} from "../../../constants/url.ts";

export interface IRolesGet {
  id: number,
  name: string,
  permissions?: IPermissions[]
}

export interface IRolesGetData {
  data: IRolesGet[]
}

const api = new ApiCore()

export const rolesGetFx = createEffect( async () => {
  const res = await api.get(`${URLShikana}/api/admin/roles`)
  return res.data
})

export const $rolesStore = createStore<IRolesGet[]>([])
  .on(rolesGetFx.doneData, (_, payload: IRolesGetData) => payload.data)
export const $rolesError = createStore<string>("")
  .on(rolesGetFx.failData, (_, payload) => payload.message);

export const $rolesLoading = createStore<boolean>(false)
  .on(rolesGetFx.pending, (_, payload) => payload)
