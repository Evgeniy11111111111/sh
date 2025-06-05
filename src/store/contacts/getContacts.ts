import {createEffect, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {URLShikana} from "../../constants/url.ts";

export interface IContactsGetData {
  id: number,
  slug: string,
  label: string,
  value: string
}

export interface IContactsGet {
  data?: IContactsGetData[]
}

const api = new ApiCore();
export const contactsGetFx = createEffect(async () => {
  const res = await api.get(`${URLShikana}/api/admin/contacts`)
  return res.data
})

export const $contactsStore = createStore<IContactsGetData[]>([])
  .on(contactsGetFx.doneData, (_, payload: IContactsGet) => payload.data)
