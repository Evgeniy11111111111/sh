import {createEffect, createEvent, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {contactsGetFx} from "./getContacts.ts";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export const contactsDeleteReset = createEvent()

export const contactsDeleteFx = createEffect(async (id: number) => {
  await api.remove(`${URLShikana}/api/admin/contacts/${id}`)
})

export const $contactsDeleteLoading = createStore<boolean>(false)
  .on(contactsDeleteFx.pending, (_, payload) => payload)
  .reset(contactsDeleteReset)

export const $contactsDeleteError = createStore<string>("")
  .on(contactsDeleteFx.failData, (_, payload) => payload.message)
  .reset(contactsDeleteReset)

contactsDeleteFx.doneData.watch(async () => {
  await contactsGetFx()
})