import {createEvent, createStore} from "effector";

export interface IUsersRequestStore {
  "sort[by]"?: string | null
  "sort[dir]"?: string | null
  page?: string | null
  [key: string]: string | null | undefined;

}

interface IUsersRequest {
  value: string | null,
  name: string
}
export const usersRequestInitial = createEvent<IUsersRequestStore>()
export const usersRequestSorting = createEvent<string>()
export const usersRequestPage = createEvent<string>()
export const usersRequestFilters = createEvent<IUsersRequest>()
export const usersRequestSortingReset = createEvent()

export const $usersRequestStore = createStore<IUsersRequestStore | null>(null)
  .on(usersRequestSorting, (store, payload) => {

    const sortBy = `sort[by]=${payload}`;
    const sortDirAsc = "sort[dir]=ASC";
    const sortDirDesc = "sort[dir]=DESC";

    if (store?.["sort[by]"] === sortBy) {
      if (store["sort[dir]"] === sortDirAsc) {
        return { ...store, "sort[by]": sortBy, "sort[dir]": sortDirDesc, page: "page=1" };
      } else if (store["sort[dir]"] === sortDirDesc) {
        return { ...store, "sort[by]": null, "sort[dir]": null, page: "page=1" };
      }
    } else {
      return { ...store, "sort[by]": sortBy, "sort[dir]": sortDirAsc, page: "page=1" };
    }

    return store;
  })
  .on(usersRequestPage, (store, payload) => {
    return { ...store, page: payload };
  })
  .on(usersRequestInitial, (_, payload) => payload)
  .on(usersRequestFilters, (state, payload) => {
    const filterKey = `filter[${payload.name}]`;
    const filterValue = payload.value
    let updatedState = { ...state, [filterKey]: filterValue };

    if (payload.name === "has_family_members" && filterValue === "") {
      updatedState = {
        ...updatedState,
        [filterKey]: null,
        with: null,
        page: "page=1",
      };
    } else if (payload.name === "has_family_members" && filterValue === 'filter[has_family_members]=1') {
      updatedState = { ...updatedState, with: `with[]=family`, page: "page=1`" };
    } else if (payload.name === "has_family_members" && filterValue === 'filter[has_family_members]=0') {
      updatedState = {...updatedState, with: null, page: "page=1"}
    }

    return updatedState;
  })
  .on(usersRequestSortingReset, () => {
    return {
      "sort[by]": null,
      "sort[dir]": null,
      page: "page=1",
      with: null,
      "filter[has_family_members]": null,
      "filter[has_email]": null,
      "filter[gender]": null,
      "filter[birth_date_from]": null,
      "filter[birth_date_to]": null,
      "filter[fio]": null
    }
  })

