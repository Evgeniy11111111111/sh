import {createEvent, createStore} from "effector";
export interface IGiftRequestStore {
  "sort[by]"?: string | null,
  "sort[dir]"?: string | null
  page?: string | null
  [key: string]: string | null | undefined;
}

export const giftsRequestInitial = createEvent<IGiftRequestStore>()
export const giftsRequestSorting = createEvent<string>()
export const giftsRequestPage = createEvent<string>()
export const giftsRequestSortingReset = createEvent()

export const $giftRequestStore = createStore<IGiftRequestStore | null>(null)
  .on(giftsRequestPage, (state, payload) => {
    return {...state, page: payload}
  })
  .on(giftsRequestSorting, (store, payload) => {

    const sortBy = `sort[by]=${payload}`;
    const sortDirAsc = "sort[dir]=ASC";
    const sortDirDesc = "sort[dir]=DESC";

    if (store?.["sort[by]"] === sortBy) {
      if (store["sort[dir]"] === sortDirAsc) {
        return { ...store, "sort[by]": sortBy, "sort[dir]": sortDirDesc, page: "page=1"};
      } else if (store["sort[dir]"] === sortDirDesc) {
        return { ...store, "sort[by]": null, "sort[dir]": null, page: "page=1"};
      }
    } else {
      return { ...store, "sort[by]": sortBy, "sort[dir]": sortDirAsc, page: "page=1" };
    }

    return store;
  })
  .on(giftsRequestInitial, (_, payload) => payload)
  .reset(giftsRequestSortingReset)