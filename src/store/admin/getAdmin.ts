import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createStore} from "effector";
import {ILocationsGetData} from "../location/getLocations.ts";
import {IRolesGet} from "./roles/getRoles.ts";
import {URLShikana} from "../../constants/url.ts";

export interface IAdminGet {
  access_location: ILocationsGetData[],
  birth_date: string | null,
  email: string | null,
  phone: string | null,
  fio: string,
  gender: string | null,
  id: number,
  roles: IRolesGet[]
}

const api = new ApiCore()
export const adminGetFx = createEffect( async () => {
  const res = await api.get(`${URLShikana}/api/admin/administrators`)
  return res.data
})

export const $adminStore = createStore<IAdminGet[]>([])
  .on(adminGetFx.doneData, (_, payload) => payload.data)

export const adminProfileGetFx = createEffect(async () => {
  const res = await api.get(`${URLShikana}/api/admin/administrators/profile`)
  return res.data
})

export const $adminProfileStore = createStore<IAdminGet | null>(null)
  .on(adminProfileGetFx.doneData, (_, payload) => payload.data)