import {Card, Col, Row} from "react-bootstrap";
import {useState} from "react";
import AddEditLocation from "./Modal.tsx";
import {useUnit} from "effector-react";
import {$locationsStore, ILocationsGetData} from "../../store/location/getLocations.ts";
import {Link} from "react-router-dom";
import Placeholder from "../../assets/images/bg-material.png"
import {$locationDeleteElem, $locationIsOpen, locationDeleteModalReset} from "../../store/location/modalDelete.ts";
import {locationDeleteFx} from "../../store/location/removeLocation.ts";
import ModalDelete from "../../components/ModalDelete.tsx";
import HeadPage from "../../components/HeadPage.tsx";
import {$adminProfileStore} from "../../store/admin/getAdmin.ts";


const Location = () => {
  const [deleteOpen, elemDelete, admin] = useUnit([$locationIsOpen, $locationDeleteElem, $adminProfileStore])
  const [locations] = useUnit([$locationsStore])
  const [showModal, setShowModal] = useState(false)
  const [isEdit, setIsEdit] = useState<ILocationsGetData | null>(null);
  const openModal = () => {
    if (admin?.roles[0].name === "Менеджер") return false
    setShowModal(true)
  }

  const openEditModal = (string: string) => {
    if (admin?.roles[0].name === "Менеджер") return false
    const location = locations && locations.find(elem => {
      if (elem.code === string) return elem
      return null
    })
    setIsEdit(location ? location : null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setIsEdit(null)
  }

  const handleRemove = async () => {
    if (elemDelete.length > 0) {
      await locationDeleteFx(elemDelete)
      closeModal()
      locationDeleteModalReset()
    }
  }

  const closeDelete = () => {
    locationDeleteModalReset()
  }

  const renderBlock = (locationsArray: ILocationsGetData[]) => {
    return locationsArray.map((elem, index) => (
      <Col className="d-flex" key={elem.code + index}  md={6} lg={4}>
        <Card className="w-100" onClick={() => {openEditModal(elem.code)}}>
          <Card.Img style={{maxHeight: 250}} className="h-100" src={elem.image ? elem.image : Placeholder} />
          <Card.Body className="d-flex justify-content-between  flex-column">
            <Card.Title as="h5">{elem.name}</Card.Title>
            <Link to={`/location/${elem.code}`} className="btn btn-primary waves-effect waves-light">
              Перейти на локацию
            </Link>
          </Card.Body>
        </Card>
      </Col>
    ))
  }


  return (
    <>
      <HeadPage title="Локации" onClick={openModal} textBtn="Добавить локацию" />

      <Row className="row-gap-3">
        {
          admin?.roles && admin.roles[0].name === "Менеджер" && admin.access_location.length > 0 ? (
            renderBlock(admin.access_location)
          ) : locations && locations.length > 0 ? (
            renderBlock(locations)
          ) : null
        }
      </Row>

      {showModal && <AddEditLocation editable={isEdit} isOpen={showModal} onClose={closeModal}/>}
      {deleteOpen && <ModalDelete isOpen={deleteOpen}
                                  handleDelete={handleRemove}
                                  onClose={closeDelete}
                                  title="Вы уверены, что хотите удалить локацию?"
                     />
      }
    </>
  )
}

export default Location;