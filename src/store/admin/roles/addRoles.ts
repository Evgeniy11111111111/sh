import {createEffect, createEvent, createStore} from "effector";
import {ApiCore} from "../../../helpers/api/apiCore.ts";
import {rolesGetFx} from "./getRoles.ts";
import {TMethodForMultiple} from "../../location/addLocation.ts";
import {URLShikana} from "../../../constants/url.ts";

export interface IAddRoles {
  name: string,
  permissions?: number[]
  _method?: TMethodForMultiple
}

const api = new ApiCore()

export const rolesPostReset = createEvent();

export const rolesPostFx = createEffect(async (data: IAddRoles) => {
  await api.post(`${URLShikana}/api/admin/roles`, data)
})

export const $rolesPostError = createStore<string>("")
  .on(rolesPostFx.failData, (_, payload) => payload.message)
  .reset(rolesPostReset)

export const $rolesPostLoading = createStore<boolean>(false)
  .on(rolesPostFx.pending, (_, payload) => payload)
  .reset(rolesPostReset)


rolesPostFx.doneData.watch(async () => {
  await rolesGetFx()
})