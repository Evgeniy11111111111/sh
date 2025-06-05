import {createEvent, createStore} from "effector";

export const rolesDeleteModal = createEvent<boolean>();
export const rolesDeleteModalReset = createEvent()
export const $rolesIsOpen = createStore<boolean>(false)
  .on(rolesDeleteModal, (_, payload) => payload)
  .reset(rolesDeleteModalReset)

export const rolesDeleteElemEvent = createEvent<number>()
export const $rolesDeleteElem = createStore<number | null>(null)
  .on(rolesDeleteElemEvent, (_, payload) => payload)
  .reset(rolesDeleteModalReset)