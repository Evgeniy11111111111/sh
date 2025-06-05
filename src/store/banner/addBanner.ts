import {FileType} from "../../components/FileUploader.tsx";
import {TMethodForMultiple} from "../location/addLocation.ts";
import {ApiCore} from "../../helpers/api/apiCore.ts";
import {createEffect, createEvent, createStore} from "effector";
import {bannersGetFx} from "./getBanner.ts";
import {URLShikana} from "../../constants/url.ts";

export interface IAddBanner {
  name: string,
  description: string,
  entity: string,
  entity_id: string | number,
  sort?: number | null,
  active?: number,
  image?: FileType | null,
  _method?: TMethodForMultiple
}

const api = new ApiCore()

export const bannerPostReset = createEvent();

export const bannerPostFx = createEffect(async (data: IAddBanner) => {
  api.contentTypeMultipart()
  await api.post(`${URLShikana}/api/admin/banners`, data)
})

export const $bannerPostError = createStore<string>("")
  .on(bannerPostFx.failData, (_, payload) => payload.message)
  .reset(bannerPostReset)

export const $bannerPostLoading = createStore<boolean>(false)
  .on(bannerPostFx.pending, (_, payload) => payload)
  .reset(bannerPostReset)


bannerPostFx.doneData.watch(async () => {
  api.contentTypeJson()
  const queryParams = new URLSearchParams(location.search);
  const page = queryParams.get('page') || '1';
  await bannersGetFx(page)
})

bannerPostFx.finally.watch(() => {
  api.contentTypeJson()
})