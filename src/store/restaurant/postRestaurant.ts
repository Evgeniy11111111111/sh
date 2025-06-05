import {ApiCore} from "../../helpers/api/apiCore.ts";
import {combine, createEffect, createStore} from "effector";
import {FileType} from "../../components/FileUploader.tsx";
import {TMethodForMultiple} from "../location/addLocation.ts";
import {URLShikana} from "../../constants/url.ts";
import {$restaurantCategoryLoading} from "./getRestaurant.ts";
import {$restaurantDeleteLoading} from "./removeRestaurant.ts";

const api = new ApiCore()

export interface IRestaurantAdd {
  title: string
  images?: FileType[],
  deletable_images?: number[]
  _method?: TMethodForMultiple
}

export const restaurantAddFx = createEffect(async ({data, id}: {data: IRestaurantAdd, id?: number}) => {
  api.contentTypeMultipart()
  await api.post(`${URLShikana}/api/admin/cafe-menu${id ? '/'+id : ''}`, data)
})

export const $restaurantAddLoading = createStore<boolean>(false)
  .on(restaurantAddFx.pending, (_, payload) => payload)

export const restaurantCombineLoading = combine(
  $restaurantCategoryLoading,
  $restaurantAddLoading,
  $restaurantDeleteLoading,
  (loading, addLoading, deleteLoading) => loading || addLoading || deleteLoading
)

restaurantAddFx.finally.watch(() => {
  api.contentTypeJson()
})