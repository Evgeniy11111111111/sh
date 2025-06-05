import { IBooking } from "../../store/bookings/interfaceBooking.ts";
import {Button, Col, Modal, ModalBody, Row} from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import {switchType} from "../../utils/switch.ts";
import {formatDateTime} from "../../utils/date.ts";
import {$bookingIsOpen, bookingDeleteElemEvent, bookingDeleteModal} from "../../store/bookings/modalDelete.ts";
import {useUnit} from "effector-react";


interface IModalInfo {
  isOpen: boolean;
  onClose: () => void;
  variant: IBooking | null;
  type: TModalInfo
}

type TModalInfo = "karting" | "bowling"

const arrayToString = (arr: Array<string | number>) => {
  return arr.join(", ")
}

const ModalInfo = (props: IModalInfo) => {
  const isOpen = useUnit($bookingIsOpen)

  const openDelete = () => {
    if (props.variant) {
      bookingDeleteElemEvent(props.variant.id)
      bookingDeleteModal(true)
    }
  }

  return (
    <Modal centered={true}
           style={{zIndex: isOpen ? "1000" : ''}}
           show={props.isOpen}
           onHide={props.onClose}>
      <HeadModal title={`Информация о записи`} />
      <ModalBody className="px-4 pb-4 pt-0">
        {props.variant ? (
          <div>
            <p><strong>ФИО:</strong> {props.variant.user?.fio}</p>
            <p><strong>Количество людей:</strong> {props.variant.count_people}</p>
            {props.type === 'karting' && (
              <p><strong>Тип:</strong> {props.variant.type_code ? switchType(props.variant.type_code) : ""}</p>
            )}
            {props.type === 'bowling' && props.variant.tracks && (
              <p><strong>{props.variant.tracks.length > 1 ? "Дорожки:" : "Дорожка:" }</strong> {arrayToString(props.variant.tracks)}</p>
            )}
            <p><strong>Начало:</strong> {formatDateTime(props.variant.started_at)}</p>
            <p><strong>Конец:</strong> {formatDateTime(props.variant.ended_at)}</p>
            {props.variant.comment ? (
              <p><strong>Комментарий:</strong> {props.variant.comment}</p>
            ) : null}
          </div>
        ) : (
          <p>Нет данных для отображения</p>
        )}

        {props.variant?.started_at && new Date() < new Date(props.variant?.started_at) ? (
          <Row className="row-gap-2 justify-content-end">
            <Col sm={6}>
              <Button type="button"
                      onClick={openDelete}
                      className="btn w-100 btn-lg btn-danger"
              >Удалить</Button>
            </Col>
          </Row>
        ) : null}

      </ModalBody>
    </Modal>
  );
};

export default ModalInfo;
