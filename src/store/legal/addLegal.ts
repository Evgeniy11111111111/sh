import {FileType} from "../../components/FileUploader.tsx";
import {TMethodForMultiple} from "../location/addLocation.ts";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createEvent, createStore} from "effector";
import {legalGetFx} from "./getLegal.ts";
import {URLShikana} from "../../constants/url.ts";

export interface IAddLegal {
  name: string,
  sort?: number,
  document?: FileType | null,
  _method?: TMethodForMultiple
}

const api = new ApiCore()

export const legalPostReset = createEvent();

export const legalPostFx = createEffect(async (data: IAddLegal) => {
  api.contentTypeMultipart()
  await  api.post(`${URLShikana}/api/admin/info-docs`, data)
})

export const $legalPostError = createStore<string>("")
  .on(legalPostFx.failData, (_, payload) => payload.message)
  .reset(legalPostReset)

export const $legalPostLoading = createStore<boolean>(false)
  .on(legalPostFx.pending, (_, payload) => payload)
  .reset(legalPostReset)

legalPostFx.doneData.watch(async () => {
  api.contentTypeJson()
  await legalGetFx()
})

legalPostFx.finally.watch(() => {
  api.contentTypeJson()
})