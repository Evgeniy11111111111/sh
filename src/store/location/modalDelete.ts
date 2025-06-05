import {createEvent, createStore} from "effector";

export const locationDeleteModal = createEvent<boolean>();
export const locationDeleteModalReset = createEvent()
export const $locationIsOpen = createStore<boolean>(false)
  .on(locationDeleteModal, (_, payload) => payload)
  .reset(locationDeleteModalReset)

export const locationDeleteElemEvent = createEvent<string>()
export const $locationDeleteElem = createStore<string>("")
  .on(locationDeleteElemEvent, (_, payload) => payload)
  .reset(locationDeleteModalReset)