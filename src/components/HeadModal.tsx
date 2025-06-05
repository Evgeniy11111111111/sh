import {Modal} from "react-bootstrap";
interface IHeadModal {
  title: string
}
const HeadModal = ({title}: IHeadModal) => {
  return (
    <Modal.Header className="py-3 px-4 border-bottom-0" closeButton>
      <Modal.Title as="h5">
        {title}
      </Modal.Title>
    </Modal.Header>
  )
}
export default HeadModal;