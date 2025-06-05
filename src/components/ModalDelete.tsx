import {Button, Col, Modal, Row} from "react-bootstrap";

interface IModalDelete {
  isOpen?:boolean,
  onClose?: () => void,
  handleDelete?: () => void,
  title?: string
  loading?: boolean
}
const ModalDelete = (props: IModalDelete) => {
  return (
    <Modal style={{zIndex: 1055}} centered={true} size={"sm"} show={props.isOpen} onHide={props.onClose}>
      <Modal.Header className="py-2 px-3" closeButton>
        <Modal.Title as="h5">
          {props.title ? props.title : 'Удалить?'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="row-gap-2">
          <Col xs={6}>
            <Button disabled={props.loading} onClick={props.handleDelete} className="btn w-100 btn-sm btn-danger">Удалить</Button>
          </Col>
          <Col xs={6}>
            <Button onClick={props.onClose}  className="btn w-100 btn-sm btn-primary">Отмена</Button>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  )
}

export default ModalDelete