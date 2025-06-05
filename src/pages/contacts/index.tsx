import HeadPage from "../../components/HeadPage.tsx";
import {useEffect, useState} from "react";
import AddEditContacts from "./Modal.tsx";
import {$contactsStore, contactsGetFx, IContactsGetData} from "../../store/contacts/getContacts.ts";
import {useUnit} from "effector-react";
import {Card, Col, Row} from "react-bootstrap";
import {$contactsDeleteElem, $contactsIsOpen, contactsDeleteModalReset} from "../../store/contacts/modalContacts.ts";
import ModalDelete from "../../components/ModalDelete.tsx";
import {contactsDeleteFx} from "../../store/contacts/removeContacts.ts";

function checkIcons (elem: string) {
  switch (elem) {
    case "address":
      return "mdi mdi-home-variant font-18"
    case "phone":
      return "mdi mdi-phone font-18";
    case "email":
      return "mdi mdi-email font-18"
    case "instagram":
      return "fab fa-instagram font-18";
    case "tg":
      return "fab fa-telegram-plane font-18";
    case "whatsapp":
      return "fab fa-whatsapp font-18";
    case "viber":
      return "fab fa-whatsapp font-18";
    case 'vk':
      return "fab fa-vk font-18";
    case 'youtube':
      return "fab fa-youtube font-18";
    default: return "fas fa-ad font-18";
  }
}

const Contacts = () => {
  const [contacts, deleteOpen, elemDelete] = useUnit([
    $contactsStore, $contactsIsOpen, $contactsDeleteElem
  ])
  const [showModal, setShowModal] = useState<boolean>(false)
  const [edit, setEdit] = useState<IContactsGetData | null>(null)

  useEffect( () => {
    window.scrollTo(0, 0)
    contactsGetFx()
  }, []);

  const openModal = () => {
    setShowModal(true)
  }

  const openEditModal = (id: number) => {
    const document = contacts && contacts.find(elem => {
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
      await contactsDeleteFx(elemDelete)
      closeModal()
      contactsDeleteModalReset()
    }
  }

  const closeDelete = () => {
    contactsDeleteModalReset()
  }
  return (
    <>
      <HeadPage title="Контакты" textBtn="Добавить контакты" onClick={openModal} />
      <Row>
        {(contacts || []).map((elem, index) => (
          <Col key={elem.label + elem.id + index} xl={4} md={6}>
            <Card onClick={() => {openEditModal(elem.id)}} className="border shadow-none">
              <div className="p-2">
                <Row className="align-items-center">
                  <Col className="col-auto pe-0">
                    <div className="avatar-sm">
                      <span className="avatar-title bg-light text-secondary rounded">
                        <i className={checkIcons(elem.slug)}></i>
                      </span>
                    </div>
                  </Col>
                  <Col>
                    <p className="mb-0 font-13">{elem.label}</p>
                    <p className="text-muted mb-0 fw-bold">
                      {elem.value}
                    </p>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      {showModal && <AddEditContacts isOpen={showModal}
                                     onClose={closeModal}
                                     editable={edit}
                    />
      }
      {deleteOpen && <ModalDelete isOpen={deleteOpen}
                                  onClose={closeDelete}
                                  handleDelete={handleRemove}
                                  title="Вы уверены, что хотите удалить контакт?"
                     />

      }
    </>
  )
}

export default Contacts;