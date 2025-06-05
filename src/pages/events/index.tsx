import HeadPage from "../../components/HeadPage.tsx";
import {useEffect, useState} from "react";
import {
  $categoryEvents,
  $packagesEvents,
  getCategoryEventsFx,
  getPackagesEventsFx, ICategoriesEvents,
  IPackageEvents
} from "../../store/events/getEvents.tsx";
import AddEditEvents from "./Modal.tsx";
import {useUnit} from "effector-react";
import {Card, Col, Row} from "react-bootstrap";
import AddEditCategoryEvents from "./ModalCategory.tsx";

const EventsPage = () => {
  const [packages, category] = useUnit([$packagesEvents, $categoryEvents])
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState<IPackageEvents | null>(null)
  const [showModalCategory, setShowModalCategory] = useState(false);
  const [editCategory, setEditCategory] = useState<ICategoriesEvents | null>(null)

  const openModal = () => {
    setShowModal(true);
  }

  const openModalCategory = () => {
    setShowModalCategory(true)
  }

  const openEditModal = (id: number) => {
    const categoryElem = packages.find(elem => {
      if (elem.id === id) return elem
      return null
    })
    setEdit(categoryElem ? categoryElem : null)
    setShowModal(true)
  }

  const openEditCategory = (id: number) => {
    const categoryElem = category.find(elem => {
      if (elem.id === id) return elem
      return null
    })
    setEditCategory(categoryElem ?? null)
    setShowModalCategory(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEdit(null)
  }

  const closeModalCategory = () => {
    setShowModalCategory(false)
    setEditCategory(null)
  }

  useEffect(() => {
    getCategoryEventsFx()
    getPackagesEventsFx()
  }, []);

  return (
    <>
      <HeadPage title="Детские мероприятия"
                textBtn="Создать мероприятие"
                onClick={openModal}
                textBtnSecond="Создать категорию"
                onClickSecond={openModalCategory}
      />
      <div className="mb-4">
        <h5 className="mb-2">Мероприятия</h5>
        <Row>
          {(packages || []).map((elem, index) => (
            <Col className="d-flex" key={elem.name || '' + elem.id + index} lg={4} md={6}>
              <Card onClick={() => openEditModal(elem.id)} className="w-100">
                <Card.Body className="d-flex justify-content-between flex-column">
                  <Card.Title className="mb-0" as="h5">{elem.name}</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      <div>
        <h5 className="mb-2">Категории</h5>
        <Row>
          {(category || []).map((elem, index) => (
            <Col className="d-flex" key={elem.name || '' + elem.id + index} lg={4} md={6}>
              <Card onClick={() => openEditCategory(elem.id)} className="w-100">
                <Card.Body className="d-flex justify-content-between flex-column">
                  <Card.Title className="mb-0" as="h5">{elem.name}</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      {
        showModal && (
          <AddEditEvents isOpen={showModal}
                         onClose={closeModal}
                         editable={edit}
          />
        )
      }
      {
        showModalCategory && (
          <AddEditCategoryEvents isOpen={showModalCategory}
                                 onClose={closeModalCategory}
                                 editable={editCategory}
          />
        )
      }
    </>
  )
}

export default EventsPage