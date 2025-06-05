import {IEventEdit} from "./booking1";
import HeadModal from "../../components/HeadModal.tsx";
import {Modal, ModalBody} from "react-bootstrap";

interface IModalInfo {
  isOpen: boolean;
  onClose: () => void;
  variant: IEventEdit | null;
  segment?: string
}

const ModalInfoBooking = (props: IModalInfo) => {

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
            {props.variant.started_at && (
              <p><strong>Начало:</strong> {props.variant.started_at.toLocaleTimeString("ru-Ru")}</p>
            )}
            {props.variant.ended_at && (
              <p><strong>Конец:</strong> {props.variant.ended_at.toLocaleTimeString("ru-Ru")}</p>
            )}
            {props.variant.comment ? (
              <p><strong>Комментарий:</strong> {props.variant.comment}</p>
            ) : null}
            {props.segment && props.variant.type_code ? (
              <p><strong>Уровень:</strong> {props.variant.type_code === "lower_level" ? "Нижний уровень" : props.variant.type_code === "upper_level" ? "Верхний уровень" : "2 любых уровня"}</p>
            ) : null}
          </div>
        ) : (
          <p>Нет данных для отображения</p>
        )}
      </ModalBody>
    </Modal>
  )

}

export default ModalInfoBooking;