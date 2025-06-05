import {Button, Col, Row} from "react-bootstrap";

interface IHeadPage {
  title: string,
  onClick?: () => void,
  textBtn?: string,
  onClickSecond?: () => void,
  textBtnSecond?: string
}

const HeadPage = ({title, onClick, textBtn = "Добавить", textBtnSecond = "Добавить", onClickSecond}: IHeadPage) => {
  return (
    <>
      <Row>
        <Col>
          <div className="page-title-box">
            <h4 className="page-title">{title}</h4>
          </div>
        </Col>
      </Row>
      {(onClick || onClickSecond) && (
        <Row className="mb-3">
          {onClick && (
            <Col sm={6} md={4}>
              <Button className="btn btn-lg font-16 btn-primary w-100"
                      onClick={onClick}
              >
                <i className="mdi mdi-plus-circle-outline"></i>{textBtn}
              </Button>
            </Col>
          )}
          {onClickSecond && (
            <Col sm={4} md={3}>
              <Button className="btn btn-lg font-16 btn-success w-100"
                      onClick={onClickSecond}
              >
                <i className="mdi mdi-plus-circle-outline"></i>{textBtnSecond}
              </Button>
            </Col>
          )}
        </Row>
      )}
    </>
  )
}

export default HeadPage;