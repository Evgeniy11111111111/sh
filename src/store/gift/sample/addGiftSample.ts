import {FileType} from "../../../components/FileUploader.tsx";
import {ApiCore} from "../../../helpers/api/apiCore.ts";
import {createEffect, createEvent, createStore} from "effector";
import {giftSampleGetFx} from "./getGiftSample.ts";
import {TMethodForMultiple} from "../../location/addLocation.ts";
import {URLShikana} from "../../../constants/url.ts";

export interface IAddGiftSample {
  name: string,
  image?: FileType | null
  _method?: TMethodForMultiple
}

const api = new ApiCore()

export const giftSamplePostReset = createEvent()
export const giftSamplePostFx = createEffect(async (data: IAddGiftSample) => {
  api.contentTypeMultipart()
  await api.post(`${URLShikana}/api/admin/gift-certificate-templates`, data)
})

export const $giftSamplePostError = createStore<string>("")
  .on(giftSamplePostFx.failData, (_, payload) => payload.message)
  .reset(giftSamplePostReset)

export const $giftSamplePostLoading = createStore<boolean>(false)
  .on(giftSamplePostFx.pending, (_, payload) => payload)
  .reset(giftSamplePostReset)


giftSamplePostFx.doneData.watch(async () => {
  api.contentTypeJson()
  await giftSampleGetFx()
})

giftSamplePostFx.finally.watch(() => {
  api.contentTypeJson()
})