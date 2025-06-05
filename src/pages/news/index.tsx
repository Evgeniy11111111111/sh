import HeadPage from "../../components/HeadPage.tsx";
import {useEffect, useState} from "react";
import AddEditNews from "./Modal.tsx";
import {Card, Col, Row} from "react-bootstrap";
import Placeholder from "../../assets/images/bg-material.png"
import {useUnit} from "effector-react";
import {$newsMetaStore, $newsStore, INewsGetData, newsGetFx} from "../../store/news/getNews.ts";
import {$newsDeleteElem, $newsIsOpen, newsDeleteModalReset} from "../../store/news/modalDelete.ts";
import ModalDelete from "../../components/ModalDelete.tsx";
import {newsDeleteFx} from "../../store/news/removeNews.ts";
import Pagination from "../../components/Pagination.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import "draft-js/dist/Draft.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";


const News = () => {
  const [news, deleteOpen, elemDelete, meta] = useUnit([$newsStore, $newsIsOpen, $newsDeleteElem, $newsMetaStore])

  const [showModal, setShowModal] = useState(false)
  const [edit, setIsEdit] = useState<INewsGetData | null>(null)

  const location = useLocation();
  const navigate = useNavigate();

  const openModal = () => {
    setShowModal(true)
  }

  const openEditModal = (id: number) => {
    const oneNews = news && news.find(elem => {
      if (elem.id === id) return elem
      return null
    })
    setIsEdit(oneNews ? oneNews : null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setIsEdit(null)
  }

  useEffect(() => {
    window.scrollTo(0,0)
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const page = queryParams.get('page') || '1';
    fetchNews(page);
  }, [location.search]);

  const fetchNews = async (page: number | string) => {
    // Assuming newsGetFx is updated to accept a page parameter
    await newsGetFx( String(page) );
  };

  const handleRemove = async () => {
    if (elemDelete) {
      await newsDeleteFx(elemDelete)

      if (newsDeleteFx.doneData) {
        closeModal()
        newsDeleteModalReset()
        const queryParams = new URLSearchParams(location.search);
        const page = queryParams.get('page') || '1';
        await newsGetFx(page)
      }
    }
  }


  const closeDelete = () => {
    newsDeleteModalReset()
  }

  const handlePageChange = (page) => {
    navigate(`/news?page=${page}`);
  };

  return (
    <>
      <HeadPage title="Новости" onClick={openModal} textBtn="Добавить новость" />
      <Row className="row-gap-3">
        {news && news.length > 0 && (
          news.map((elem, index) => (
            <Col className="d-flex" key={index} md={6} lg={4}>
              <Card onClick={() => {openEditModal(elem.id)}} className="w-100">
                <Card.Img style={{maxHeight: 250, objectFit: "contain"}}
                          className="h-100"
                          src={elem.image ? elem.image : Placeholder}
                />
                <Card.Body className="d-flex justify-content-between flex-column">
                  <Card.Title className="mb-0" as="h5">{elem.name}</Card.Title>
                  {elem.short_description && (
                    <Card.Text className="mt-2 mb-0">{elem.short_description}</Card.Text>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
      {meta && meta.last_page && meta.last_page > 1 && (
        <Pagination total={meta.last_page} onPageChange={(handlePageChange)} pageIndex={meta.current_page ? meta.current_page : 1} />
      )}
      {showModal && <AddEditNews onClose={closeModal}
                                 isOpen={showModal}
                                 editable={edit}

                    />
      }
      {deleteOpen && <ModalDelete isOpen={deleteOpen}
                                  onClose={closeDelete}
                                  handleDelete={handleRemove}
                                  title="Вы уверены, что хотите удалить новость?"
                     />
      }
    </>
  )
}

export default News;