import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createEvent, createStore} from "effector";
import {contactsGetFx} from "./getContacts.ts";
import {IAddContact} from "./addContact.ts";
import {URLShikana} from "../../constants/url.ts";



const api = new ApiCore()
export const contactsPutReset = createEvent();
export const contactsPutFx = createEffect(async ({id, data}:{id: number, data: IAddContact}) => {
  await api.post(`${URLShikana}/api/admin/contacts/${id}`, data)
})

export const $contactsPutError = createStore<string>("")
  .on(contactsPutFx.failData, (_, payload) => payload.message)
  .reset(contactsPutReset)

export const $contactsPutLoading = createStore<boolean>(false)
  .on(contactsPutFx.pending, (_, payload) => payload)
  .reset(contactsPutReset)

contactsPutFx.doneData.watch(async () => {
  await contactsGetFx()
})