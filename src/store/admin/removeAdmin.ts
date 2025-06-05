import {createEffect, createEvent, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {adminGetFx} from "./getAdmin.ts";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export const adminDeleteReset = createEvent()

export const adminDeleteFx = createEffect(async (id: number) => {
  await api.remove(`${URLShikana}/api/admin/administrators/${id}`)
})

export const $adminDeleteLoading = createStore<boolean>(false)
  .on(adminDeleteFx.pending, (_, payload) => payload)
  .reset(adminDeleteReset)

export const $adminDeleteError = createStore<string>("")
  .on(adminDeleteFx.failData, (_, payload) => payload.message)
  .reset(adminDeleteReset)

adminDeleteFx.doneData.watch(async () => {
  await adminGetFx()
})