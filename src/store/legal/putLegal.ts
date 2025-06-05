import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createEvent, createStore} from "effector";
import {legalGetFx} from "./getLegal.ts";
import {IAddLegal} from "./addLegal.ts";
import {URLShikana} from "../../constants/url.ts";


const api = new ApiCore()
export const legalPutReset = createEvent();
export const legalPutFx = createEffect(async ({id, data}:{id: number, data: IAddLegal}) => {
  api.contentTypeMultipart();
  await api.post(`${URLShikana}/api/admin/info-docs/${id}`, data)
})

export const $legalPutError = createStore<string>("")
  .on(legalPutFx.failData, (_, payload) => payload.message)
  .reset(legalPutReset)

export const $legalPutLoading = createStore<boolean>(false)
  .on(legalPutFx.pending, (_, payload) => payload)
  .reset(legalPutReset)

legalPutFx.doneData.watch(async () => {
  api.contentTypeJson()
  await legalGetFx()
})

legalPutFx.finally.watch(() => {
  api.contentTypeJson()
})