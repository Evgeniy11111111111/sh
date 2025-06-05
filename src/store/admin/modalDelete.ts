import {createEvent, createStore} from "effector";
import {IAdminGet} from "./getAdmin.ts";

export const adminDeleteModal = createEvent<boolean>();
export const adminDeleteModalReset = createEvent()
export const $adminIsOpen = createStore<boolean>(false)
  .on(adminDeleteModal, (_, payload) => payload)
  .reset(adminDeleteModalReset)

export const adminDeleteElemEvent = createEvent<number>()
export const $adminDeleteElem = createStore<number | null>(null)
  .on(adminDeleteElemEvent, (_, payload) => payload)
  .reset(adminDeleteModalReset)

export const adminEditModal = createEvent<IAdminGet | null>()
export const $adminIsEdit = createStore<IAdminGet | null>(null)
  .on(adminEditModal, (_, payload) => payload)
  .reset(adminDeleteModalReset)