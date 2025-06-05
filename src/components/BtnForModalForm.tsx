import {Button, Col, Row} from "react-bootstrap";

interface IBtnForModalForm {
  editable?: boolean,
  onClickDelete?: () => void,
  disabled?: boolean,
  onCLick?: () => void
  isButton?: boolean
}

const BtnForModalForm = ({editable, onClickDelete, disabled, onCLick, isButton}: IBtnForModalForm) => {
  return (
    <Row className="row-gap-2">
      <Col sm={6}>
        <Button onClick={onCLick} disabled={disabled} type={isButton ? "button" : "submit"} className="btn w-100 btn-lg btn-primary">
          {editable ? 'Изменить' : "Добавить"}
        </Button>
      </Col>
      {editable && onClickDelete && (
        <Col sm={6}>
          <Button disabled={disabled} onClick={onClickDelete} type="button"
                  className="btn w-100 btn-lg btn-danger">Удалить</Button>
        </Col>
      )}
    </Row>
  )
}

export default BtnForModalForm;