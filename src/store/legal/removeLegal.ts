import {createEffect, createEvent, createStore} from "effector";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {legalGetFx} from "./getLegal.ts";
import {URLShikana} from "../../constants/url.ts";

const api = new ApiCore()

export const legalDeleteReset = createEvent()

export const legalDeleteFx = createEffect(async (id: number) => {
  await api.remove(`${URLShikana}/api/admin/info-docs/${id}`)
})

export const $legalDeleteLoading = createStore<boolean>(false)
  .on(legalDeleteFx.pending, (_, payload) => payload)
  .reset(legalDeleteReset)

export const $legalDeleteError = createStore<string>("")
  .on(legalDeleteFx.failData, (_, payload) => payload.message)
  .reset(legalDeleteReset)

legalDeleteFx.doneData.watch(async () => {
  await legalGetFx()
})