import {IAddEditModal} from "../../interface/modal.ts";
import {Modal} from "react-bootstrap";

const ShowCertificate = (props: IAddEditModal<string>) => {
  return (
    <Modal centered={true}
           show={props.isOpen}
           onHide={props.onClose}
           contentClassName='bg-transparent border-0'
    >
      <Modal.Body className="p-0 ">
        <img  style={{maxHeight: "100%", maxWidth: "100%"}} src={props.editable || ''}/>
      </Modal.Body>
    </Modal>
  )
}

export default ShowCertificate;