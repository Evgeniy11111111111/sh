import HeadPage from "../../components/HeadPage.tsx";
import {useEffect, useState} from "react";
import AddEditImages from "./Modal.tsx";
import {$imagesLoading, $imagesStore, imagesGetFx} from "../../store/images/getImages.ts";
import {Button, Card, Col, Row} from "react-bootstrap";
import {useUnit} from "effector-react";
import Placeholder from "../../assets/images/bg-material.png";
import ModalDelete from "../../components/ModalDelete.tsx";
import {$imagesDeleteLoading, imageDeleteFx} from "../../store/images/removeImages.ts";

const ImagesPage = () => {
  const [images, loading, loadingRemove] = useUnit([$imagesStore, $imagesLoading, $imagesDeleteLoading])

  const [showModal, setShowModal] = useState(false);
  const [elemDelete, setElemDelete] = useState<number | null>(null)

  const openModal = () => {
    setShowModal(true);
  }

  const openDelete = (id: number) => {
    setElemDelete(id)
  }

  const closeModal = () => {
    setShowModal(false);
  }

  const closeDelete = () => {
    setElemDelete(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleRemove = async () => {
    if (elemDelete) {
      await imageDeleteFx(elemDelete)

      if (imageDeleteFx.doneData) {
        await imagesGetFx()
        closeDelete()
      }
    }
  }

  useEffect(() => {
    imagesGetFx()
  }, []);

  return (
    <>
      <HeadPage title="Изображения" onClick={openModal} textBtn="Добавить изображение"/>
      <Row className="row-gap-3">

        {(images || []).map((item, index) => (
          <Col className="d-flex" key={index + item.id} md={6} lg={4}>
            <Card className="w-100">
              <Card.Img style={{maxHeight: 250, objectFit: "contain"}}
                        className="h-100"
                        src={item.url ? item.url : Placeholder}
              />
              <Card.Body className="d-flex justify-content-between flex-column">
                <Card.Title onClick={() => copyToClipboard(item.url)} style={{cursor: "pointer"}} className="mb-2" as="h5">{item.url}</Card.Title>
                <Button onClick={() => openDelete(item.id)} className="btn-danger">Удалить</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {showModal && (
        <AddEditImages isOpen={showModal}
                       onClose={closeModal}
        />
      )}
      {elemDelete && (
        <ModalDelete isOpen={!!elemDelete}
                     onClose={closeDelete}
                     title="Вы уверены, что хотите удалить изображение?"
                     handleDelete={handleRemove}
                     loading={loadingRemove || loading}
        />
      )}
    </>
  )
}

export default ImagesPage;