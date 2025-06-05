import {ApiCore} from "../../../helpers/api/apiCore.ts";
import {createEffect, createStore} from "effector";
import {URLShikana} from "../../../constants/url.ts";


export interface IPermissions {
  id: number,
  label: string
}

export interface IPermissionsGetData {
  data: IPermissions[]
}

const api = new ApiCore()

export const permissionsGetFx = createEffect( async () => {
  const res = await api.get(`${URLShikana}/api/admin/permissions`)
  return res.data
})

export const $permissionsStore = createStore<IPermissions[]>([])
  .on(permissionsGetFx.doneData, (_, payload: IPermissionsGetData) => payload.data)
export const $permissionsError = createStore<string>("")
  .on(permissionsGetFx.failData, (_, payload) => payload.message);

export const $permissionsLoading = createStore<boolean>(false)
  .on(permissionsGetFx.pending, (_, payload) => payload)
