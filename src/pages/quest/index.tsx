import HeadPage from "../../components/HeadPage.tsx";
import {useEffect, useState} from "react";
import {Card, Col, Row} from "react-bootstrap";
import {$questsStore, getQuestFx, IQuestsGet} from "../../store/quests/getQuest.ts";
import {useUnit} from "effector-react";
import AddEditQuest from "./modal.tsx";
import Placeholder from "../../assets/images/bg-material.png";

const QuestPage = () => {
  const [quests] = useUnit([$questsStore])

  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState<IQuestsGet| null>(null)

  const openModal = () => {
    setShowModal(true)
  }

  const openEditModal = (id: string) => {
    const questElem = quests.find(quest => {
      if (quest.code === id) return quest
      return null
    })
    setEdit(questElem ? questElem : null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEdit(null)
  }

  console.log(quests)

  useEffect(() => {
    getQuestFx()
  }, []);

  return (
    <>
      <HeadPage title="Квесты" textBtn="Создать квест" onClick={openModal} />
      <Row>
        {quests.map((quest, index) => (
          <Col className="d-flex" key={quest.name + quest.code + index} lg={4} md={6}>
            <Card onClick={() => openEditModal(quest.code)} className="w-100">
              <Card.Img style={{maxHeight: 250, objectFit: "contain"}}
                        className="h-100"
                        src={quest.image ? quest.image : Placeholder}
              />
              <Card.Body className="d-flex justify-content-between flex-column">
                <Card.Title className="mb-0" as="h5">{quest.name}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {
        showModal && (
          <AddEditQuest isOpen={showModal}
                        onClose={closeModal}
                        editable={edit}
          />
        )
      }
    </>
  )
}

export default QuestPage;