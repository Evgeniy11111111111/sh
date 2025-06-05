import HeadPage from "../../components/HeadPage.tsx";
import {useEffect, useState} from "react";
import {AddEditRestaurantMenu} from "./Modal.tsx";
import {$restaurantCategory, getRestaurantFx, IRestaurantGet} from "../../store/restaurant/getRestaurant.ts";
import {useUnit} from "effector-react";
import {Card, Col, Row} from "react-bootstrap";

export const RestaurantMenu = () => {
  const [restaurantCategories] = useUnit([$restaurantCategory])

  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState<IRestaurantGet | null>(null)

  const openModal = () => {
    setShowModal(true);
  }

  const openEditModal = (id: number) => {
    const element = restaurantCategories.find(elem => {
      if (elem.id === id) return elem
      return null
    })
    setEdit(element ?? null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false);
    setEdit(null)
  }



  useEffect(() => {
    getRestaurantFx()
  }, []);

  return (
    <>
      <HeadPage title="Меню ресторана" textBtn="Создать категорию" onClick={openModal}/>
      <Row>
        {restaurantCategories.map((elem, index) => (
          <Col className="d-flex" key={elem.title || '' + elem.id + index} lg={4} md={6}>
            <Card onClick={() => openEditModal(elem.id)} className="w-100">
              <Card.Body className="d-flex justify-content-between flex-column">
                <Card.Title className="mb-0" as="h5">{elem.title}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {showModal && (
        <AddEditRestaurantMenu isOpen={showModal}
                               onClose={closeModal}
                               editable={edit}
        />
      )}
    </>
  )
}

export default RestaurantMenu;