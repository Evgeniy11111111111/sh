import {ApiCore} from "./apiCore.ts";
import {URLShikana} from "../../constants/url.ts";
import {IUserGet} from "../../store/users/getUsers.ts";
import {INewsGetData} from "../../store/news/getNews.ts";

const api = new ApiCore()

type TSearchUrl = "users" | "news"

export const loadFunctionOption = async (string: string, type: TSearchUrl) => {
  const res = await api.get(`${URLShikana}/api/admin/${type}?filter[${type === "users" ? "fio" : "name"}]=${string}`)
  return res.data
}

export const loadOptions = async (string: string) => {
  const res = await loadFunctionOption(string, "users")
  return res.data.map((elem: IUserGet )=> ({value: elem.id, label: elem.fio || ""}))
}

export const loadOptionsNews = async (string: string) => {
  const res = await loadFunctionOption(string, "news")
  return res.data.map((elem: INewsGetData )=> ({value: elem.id, label: elem.name}))
}