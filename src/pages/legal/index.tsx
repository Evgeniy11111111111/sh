import {Card, Col, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import AddEditLegal from "./Modal.tsx";
import {useUnit} from "effector-react";
import {$legalStore, ILegalGetData, legalGetFx} from "../../store/legal/getLegal.ts";
import {$legalDeleteElem, $legalIsOpen, legalDeleteModalReset} from "../../store/legal/modalLegal.ts";
import ModalDelete from "../../components/ModalDelete.tsx";
import {legalDeleteFx} from "../../store/legal/removeLegal.ts";
import HeadPage from "../../components/HeadPage.tsx";

const Legal = () => {
  const [legal, deleteOpen, elemDelete] = useUnit([
    $legalStore, $legalIsOpen, $legalDeleteElem
  ])

  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState<ILegalGetData | null>(null)

  useEffect(() => {
    window.scrollTo(0,0)
    legalGetFx()
  }, []);

  const openModal = () => {
    setShowModal(true)
  }

  const openEditModal = (id: number) => {
    const document = legal && legal.find(elem => {
      if (elem.id === id) return elem
      return null
    })
    setEdit(document ? document : null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEdit(null)
  }

  const handleRemove = async () => {
    if (elemDelete) {
      await legalDeleteFx(elemDelete)
      closeModal()
      legalDeleteModalReset()
    }
  }

  const closeDelete = () => {
    legalDeleteModalReset()
  }

  return (
    <>
      <HeadPage title="Правовая информация" textBtn="Добавить информацию" onClick={openModal} />
      <Row>
        {(legal || []).map((elem, index) => (
          <Col key={elem.name + elem.id + index} xl={3} md={6}>
            <Card onClick={() => {openEditModal(elem.id)}} className="border shadow-none">
              <div className="p-2">
                <Row className="align-items-center">
                  <Col className="col-auto pe-0">
                    <div className="avatar-sm">
                      <span className="avatar-title bg-light text-secondary rounded">
                        <i className={elem.document && elem.document.length > 0 ? "mdi mdi-folder font-18" : "mdi mdi-file-hidden font-18"}></i>
                      </span>
                    </div>
                  </Col>
                  <Col>
                    <div className="text-muted fw-bold">
                      {elem.name}
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {showModal && <AddEditLegal isOpen={showModal}
                                  onClose={closeModal}
                                  editable={edit}
                    />
      }
      {deleteOpen && <ModalDelete isOpen={deleteOpen}
                                  onClose={closeDelete}
                                  handleDelete={handleRemove}
                                  title="Вы уверены, что хотите удалить документ?"
                     />
      }
    </>
  )
}

export default Legal;