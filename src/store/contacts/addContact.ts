import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createEvent, createStore} from "effector";
import {contactsGetFx} from "./getContacts.ts";
import {TMethodForMultiple} from "../location/addLocation.ts";
import {URLShikana} from "../../constants/url.ts";


export interface IAddContact {
  slug?: string,
  label?: string,
  value: string
  _method?: TMethodForMultiple
}

const api = new ApiCore()

export const contactsPostReset = createEvent();

export const contactsPostFx = createEffect(async (data: IAddContact) => {
  await  api.post(`${URLShikana}/api/admin/contacts`, data)
})

export const $contactsPostError = createStore<string>("")
  .on(contactsPostFx.failData, (_, payload) => payload.message)
  .reset(contactsPostReset)

export const $contactsPostLoading = createStore<boolean>(false)
  .on(contactsPostFx.pending, (_, payload) => payload)
  .reset(contactsPostReset)

contactsPostFx.doneData.watch(async () => {
  await contactsGetFx()
})