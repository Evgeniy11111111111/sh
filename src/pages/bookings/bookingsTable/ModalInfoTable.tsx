import {TableBookingProps} from "./index.tsx";
import {Modal, ModalBody} from "react-bootstrap";
import HeadModal from "../../../components/HeadModal.tsx";
import {formatDateTime} from "../../../utils/date.ts";

interface IModalInfo {
  isOpen: boolean;
  onClose: () => void;
  variant: TableBookingProps | null;
}

const ModalInfoTable = (props: IModalInfo) => {

  return (
    <Modal centered={true}
           show={props.isOpen}
           onHide={props.onClose}>
      <HeadModal title={`Информация о записи`} />
      <ModalBody className="px-4 pb-4 pt-0">
        {props.variant ? (
          <div>
            <p><strong>ФИО:</strong> {props.variant.user?.fio}</p>
            <p><strong>Количество людей:</strong> {props.variant.count_people}</p>
            <p><strong>Начало:</strong> {formatDateTime(props.variant.started_at)}</p>
            <p><strong>Стол#:</strong> {props.variant.table}</p>
            {props.variant.comment ? (
              <p><strong>Комментарий:</strong> {props.variant.comment}</p>
            ) : null}
          </div>
        ) : (
          <p>Нет данных для отображения</p>
        )}
      </ModalBody>
    </Modal>
  )

}

export default ModalInfoTable;