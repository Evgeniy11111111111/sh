import {ApiCore} from "../../../helpers/api/apiCore.ts";
import {createEffect, createEvent, createStore} from "effector";
import {rolesGetFx} from "./getRoles.ts";
import {IAddRoles} from "./addRoles.ts";
import {URLShikana} from "../../../constants/url.ts";



const api = new ApiCore()
export const rolesPutReset = createEvent();
export const rolesPutFx = createEffect(async ({id, data}:{id: number, data: IAddRoles}) => {
  await api.post(`${URLShikana}/api/admin/roles/${id}`, data)
})

export const $rolesPutError = createStore<string>("")
  .on(rolesPutFx.failData, (_, payload) => payload.message)
  .reset(rolesPutReset)

export const $rolesPutLoading = createStore<boolean>(false)
  .on(rolesPutFx.pending, (_, payload) => payload)
  .reset(rolesPutReset)

rolesPutFx.doneData.watch(async () => {
  await rolesGetFx()
})