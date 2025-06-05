import {createEffect, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {GetData, IMeta} from "../../interface/meta.ts";
import {URLShikana} from "../../constants/url.ts";

export interface IUserGet {
  id: number,
  last_name: string | null,
  name: string | null,
  patronymic: string | null,
  fio: string | null,
  gender: string | null,
  birth_date: string | null,
  phone: string | null,
  email: string | null,
  family?: IFamily[]
}

interface IFamily {
  id: number,
  last_name: string | null,
  name: string | null,
  patronymic: string | null,
  fio: string,
  birth_date: string | null,
  user_id: number
}

const api = new ApiCore();
export const usersGetFx = createEffect(async (page: string) => {
  const res = await api.get(`${URLShikana}/api/admin/users?page=${page}`)
  return res.data
})

export const userSortGetFx = createEffect(async (string: string)=> {
  const res = await api.get(`${URLShikana}/api/admin/users?${string}`)
  return res.data
})

export const $usersStore = createStore<IUserGet[]>([])
  .on(usersGetFx.doneData, (_, payload: GetData<IUserGet[]>) => payload.data)
  .on(userSortGetFx.doneData, (_, payload: GetData<IUserGet[]>) => payload.data)

export const $usersError = createStore<string>("")
  .on(usersGetFx.failData, (_, payload) => payload.message)
  .on(userSortGetFx.failData, (_, payload) => payload.message)

export const $usersLoading = createStore<boolean>(false)
  .on(usersGetFx.pending, (_, payload) => payload)
  .on(userSortGetFx.pending, (_, payload) => payload)

export const $usersMetaStore = createStore<IMeta>({})
  .on(usersGetFx.doneData, (_, payload: GetData<IUserGet[]>) => payload.meta)
  .on(userSortGetFx.doneData, (_, payload: GetData<IUserGet[]>) => payload.meta)
