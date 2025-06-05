import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createEvent, createStore} from "effector";
import {adminGetFx} from "./getAdmin.ts";
import {TMethodForMultiple} from "../location/addLocation.ts";
import {URLShikana} from "../../constants/url.ts";


export interface IAddAdmin {
  fio: string,
  phone?: string,
  email?: string,
  gender?: string | null,
  birth_date?: string,
  roles: number[],
  access_location?: string[]
  _method?: TMethodForMultiple
}

const api = new ApiCore()

export const adminPostReset = createEvent();

export const adminPostFx = createEffect(async (data: IAddAdmin) => {
  await api.post(`${URLShikana}/api/admin/administrators`, data)
})

export const $adminPostError = createStore<string>("")
  .on(adminPostFx.failData, (_, payload) => payload.message)
  .reset(adminPostReset)

export const $adminPostLoading = createStore<boolean>(false)
  .on(adminPostFx.pending, (_, payload) => payload)
  .reset(adminPostReset)


adminPostFx.doneData.watch(async () => {
  await adminGetFx()
})
