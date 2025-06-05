import {createEvent, createStore} from "effector";

export const bookingDeleteModal = createEvent<boolean>();
export const bookingDeleteModalReset = createEvent()
export const $bookingIsOpen = createStore<boolean>(false)
  .on(bookingDeleteModal, (_, payload) => payload)
  .reset(bookingDeleteModalReset)

export const bookingDeleteElemEvent = createEvent<number>()
export const $bookingDeleteElem = createStore<number | null>(null)
  .on(bookingDeleteElemEvent, (_, payload) => payload)
  .reset(bookingDeleteModalReset)