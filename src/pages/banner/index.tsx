import HeadPage from "../../components/HeadPage.tsx";
import {useEffect, useState} from "react";
import AddEditBanner from "./Modal.tsx";
import {$bannersMetaStore, $bannersStore, bannersGetFx, IBannersGet} from "../../store/banner/getBanner.ts";
import {useUnit} from "effector-react";
import {Card, Col, Row} from "react-bootstrap";
import Placeholder from "../../assets/images/bg-material.png";
import Pagination from "../../components/Pagination.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import {$bannerDeleteElem, $bannerIsOpen, bannerDeleteModalReset} from "../../store/banner/modalDelete.ts";
import {bannerDeleteFx} from "../../store/banner/removeBanner.ts";
import ModalDelete from "../../components/ModalDelete.tsx";

const Banner = () => {
  const [
    banners, meta, deleteOpen, elemDelete
  ] = useUnit([
    $bannersStore, $bannersMetaStore, $bannerIsOpen, $bannerDeleteElem
  ])

  const [showModal, setShowModal] = useState(false)
  const [edit, setIsEdit] = useState<IBannersGet | null>(null)


  const location = useLocation();
  const navigate = useNavigate();

  const openModal = () => {
    setShowModal(true)
  }

  const openEditModal = (id: number) => {
    const banner = banners && banners.find(elem => {
      if (elem.id === id) return elem
      return null
    })
    setIsEdit(banner ? banner : null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setIsEdit(null)
  }

  const handlePageChange = (page) => {
    navigate(`/banners?page=${page}`);
  };

  const handleRemove = async () => {
    if (elemDelete) {
      await bannerDeleteFx(elemDelete)
      if (bannerDeleteFx.doneData) {
        closeModal()
        bannerDeleteModalReset()
      }
    }
  }

  const closeDelete = () => {
    bannerDeleteModalReset()
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const page = queryParams.get('page') || '1';
    bannersGetFx(page)
  }, [location.search]);

  return (
    <>
      <HeadPage title="Баннеры" onClick={openModal} textBtn="Добавить баннер" />
      <Row className="row-gap-3">
        {
          banners && banners.length > 0 && banners.map((banner, index) => (
            <Col className="d-flex" key={`${banner.id}${index}`} md={6} lg={4}>
              <Card className="w-100" onClick={() => {openEditModal(banner.id)}}>
                <Card.Img style={{maxHeight: 250, objectFit: "contain"}}
                          className="h-100"
                          src={banner.image ? banner.image : Placeholder}
                />
                <Card.Body className="d-flex justify-content-between flex-column">
                  <Card.Title className="mb-0" as="h5">{banner.name}</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))
        }
        {meta && meta.last_page && meta.last_page > 1 && (
          <Pagination total={meta.last_page} onPageChange={handlePageChange} pageIndex={meta.current_page ? meta.current_page : 1} />
        )}
      </Row>
      {
        showModal && <AddEditBanner isOpen={showModal}
                                    onClose={closeModal}
                                    editable={edit}
                     />
      }
      {
        deleteOpen && <ModalDelete  isOpen={deleteOpen}
                                    handleDelete={handleRemove}
                                    onClose={closeDelete}
                                    title="Вы уверены, что хотите удалить баннер?"
                      />
      }
    </>
  )
}

export default Banner;