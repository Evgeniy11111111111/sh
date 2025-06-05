export interface IAddEditModal<T> {
  isOpen?: boolean,
  onClose?: () => void,
  editable?: T | null
}