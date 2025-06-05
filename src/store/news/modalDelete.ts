import {createEvent, createStore} from "effector";

export const newsDeleteModal = createEvent<boolean>();
export const newsDeleteModalReset = createEvent()
export const $newsIsOpen = createStore<boolean>(false)
  .on(newsDeleteModal, (_, payload) => payload)
  .reset(newsDeleteModalReset)

export const newsDeleteElemEvent = createEvent<number>()
export const $newsDeleteElem = createStore<number | null>(null)
  .on(newsDeleteElemEvent, (_, payload) => payload)
  .reset(newsDeleteModalReset)