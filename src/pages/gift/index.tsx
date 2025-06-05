import HeadPage from "../../components/HeadPage.tsx";
import {useEffect, useState} from "react";
import AddEditGift from "./Modal.tsx";
import {$giftSampleStore, giftSampleGetFx, IGiftSampleGet} from "../../store/gift/sample/getGiftSample.ts";
import AddEditSampleGift from "./ModalSample.tsx";
import {Card, Col, Row} from "react-bootstrap";
import {useUnit} from "effector-react";
import Placeholder from "../../assets/images/bg-material.png";
import {
  $giftSampleDeleteElem,
  $giftSampleIsOpen,
  giftSampleDeleteModalReset
} from "../../store/gift/sample/modalGiftSample.ts";
import ModalDelete from "../../components/ModalDelete.tsx";
import {giftSampleDeleteFx} from "../../store/gift/sample/removeGiftSample.ts";
import {giftGetFx} from "../../store/gift/getGift.ts";
import GiftTable from "./Table.tsx";
import {
  $giftDeleteElem,
  $giftImagePath,
  $giftIsEdit,
  $giftIsOpen,
  giftDeleteModalReset
} from "../../store/gift/modal.ts";
import {giftDeleteFx} from "../../store/gift/removeGift.ts";
import ModalShow from "./ModalShow.tsx";
import {$giftRequestStore, giftsRequestInitial, IGiftRequestStore} from "../../store/gift/giftRequestStore.ts";
import {useLocation, useNavigate} from "react-router-dom";
import {objectToString} from "../../utils";


const Gift = () => {
  const [
    giftsSamples, openDeleteGiftSample, elemDeleteGiftSample, openDelete, elemDelete, edit, image, giftRequest
  ] = useUnit([
    $giftSampleStore, $giftSampleIsOpen, $giftSampleDeleteElem, $giftIsOpen, $giftDeleteElem, $giftIsEdit, $giftImagePath, $giftRequestStore
  ])
  const locations = useLocation()
  const navigate = useNavigate()

  const [showModal, setShowModal] = useState(false)
  const [showSampleModal, setSampleModal] = useState(false)
  const [editSample, setEditSample] = useState<IGiftSampleGet | null>(null)
  const [showModalImage, setShowModalImage] = useState(false)
  const openModal = () => {
    setShowModal(true)
  }

  const openSampleModal = () => {
    setSampleModal(true)
  }

  const openSampleEditModal = (id: number) => {
    const sample = giftsSamples.find(elem => {
      if (elem.id === id) return elem
      return null
    })
    setEditSample(sample ?? null)
    setSampleModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    giftDeleteModalReset()
  }

  const closeSampleModal = () => {
    setSampleModal(false)
    setEditSample(null)
  }

  const closeDelete = () => {
    giftDeleteModalReset()
  }

  const closeDeleteGiftSample = () => {
    giftSampleDeleteModalReset()
  }

  const handleRemove = async () => {
    if (elemDelete) {
      await giftDeleteFx(elemDelete).then(() => {
        if (giftRequest) {
          const str = objectToString(giftRequest, "&")
          navigate(str ? `/gift?${str}` : "/gift")
        }
      })
      if (giftDeleteFx.doneData) {
        closeDelete()
      }
    }
  }

  const handleRemoveGiftSample = async () => {
    if (elemDeleteGiftSample) {
      await giftSampleDeleteFx(elemDeleteGiftSample)
      if (giftSampleDeleteFx.doneData) {
        closeSampleModal()
        giftSampleDeleteModalReset()
      }
    }
  }

  const openModalImage = () => {
    setShowModalImage(true)
  }

  const closeModalImage = () => {
    setShowModalImage(false)
  }

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const initialRequest: IGiftRequestStore = {};
    queryParams.forEach((value, key) => {
      initialRequest[key] = `${key}=${value}`;
    })
    giftsRequestInitial(initialRequest)
    giftSampleGetFx()
    window.scrollTo(0,0)
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    giftGetFx(queryParams.toString())
  }, [locations.search]);

  useEffect(() => {
    if (giftRequest) {
      const str = objectToString(giftRequest, "&")
      navigate(str ? `/gift?${str}` : "/gift")
    }
  }, [giftRequest]);

  return (
    <>
      <HeadPage title="Подарочные сертификаты"
                onClick={openModal}
                textBtn="Добавить подарочный сертификат"
                textBtnSecond="Шаблон"
                onClickSecond={openSampleModal}
      />
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <GiftTable openImageModal={openModalImage} openModal={openModal}/>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="pt-4 mb-2">
        <h4>Шаблоны сертификатов</h4>
      </Row>
      <Row className="row-gap-3">
        {giftsSamples.map((elem, index) => (
          <Col className="d-flex" key={`${elem.id + index}`}  md={6} lg={4}>
            <Card className="w-100" style={{borderRadius: '20px'}} onClick={() => {openSampleEditModal(elem.id)}}>
              <Card.Img style={{objectFit: "contain"}} className="h-100" src={elem.image ? elem.image : Placeholder} />
              <Card.Body className="d-flex justify-content-between  flex-column">
                <Card.Title className="mb-0" as="h5">{elem.name}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {showModal && <AddEditGift isOpen={showModal}
                                 onClose={closeModal}
                                 editable={edit}
                    />
      }
      {showSampleModal && <AddEditSampleGift isOpen={showSampleModal}
                                             onClose={closeSampleModal}
                                             editable={editSample}
                          />
      }
      {
        openDeleteGiftSample && <ModalDelete isOpen={openDeleteGiftSample}
                                             onClose={closeDeleteGiftSample}
                                             handleDelete={handleRemoveGiftSample}
                                             title="Вы уверены, что хотите удалить шаблон?"

        />
      }
      {
        openDelete && <ModalDelete isOpen={openDelete}
                                   onClose={closeDelete}
                                   handleDelete={handleRemove}
                                   title="Вы уверены, что хотите удалить сертификат?"

        />
      }
      {
        showModalImage && <ModalShow isOpen={showModalImage}
                                     onClose={closeModalImage}
                                     editable={image}
                          />
      }

    </>
  )
}

export default Gift;