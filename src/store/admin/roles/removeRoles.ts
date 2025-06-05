import {createEffect, createEvent, createStore} from "effector";
import {ApiCore} from "../../../helpers/api/apiCore.ts";
import {rolesGetFx} from "./getRoles.ts";
import {URLShikana} from "../../../constants/url.ts";

const api = new ApiCore()

export const rolesDeleteReset = createEvent()

export const rolesDeleteFx = createEffect(async (id: number) => {
  await api.remove(`${URLShikana}/api/admin/roles/${id}`)
})

export const $rolesDeleteLoading = createStore<boolean>(false)
  .on(rolesDeleteFx.pending, (_, payload) => payload)
  .reset(rolesDeleteReset)

export const $rolesDeleteError = createStore<string>("")
  .on(rolesDeleteFx.failData, (_, payload) => payload.message)
  .reset(rolesDeleteReset)

rolesDeleteFx.doneData.watch(async () => {
  await rolesGetFx()
})