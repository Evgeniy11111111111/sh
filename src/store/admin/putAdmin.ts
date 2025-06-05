import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createEvent, createStore} from "effector";
import {adminGetFx} from "./getAdmin.ts";
import {IAddAdmin} from "./addAdmin.ts";
import {URLShikana} from "../../constants/url.ts";
const api = new ApiCore()
export const adminPutReset = createEvent();
export const adminPutFx = createEffect(async ({id, data}:{id: number, data: IAddAdmin}) => {
  await api.post(`${URLShikana}/api/admin/administrators/${id}`, data)
})

export const $adminPutError = createStore<string>("")
  .on(adminPutFx.failData, (_, payload) => payload.message)
  .reset(adminPutReset)

export const $adminPutLoading = createStore<boolean>(false)
  .on(adminPutFx.pending, (_, payload) => payload)
  .reset(adminPutReset)

adminPutFx.doneData.watch(async () => {
  await adminGetFx()
})