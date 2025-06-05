import {IAddEditModal} from "../../interface/modal.ts";
import {useState} from "react";
import FileUploader, {FileType} from "../../components/FileUploader.tsx";
import {Modal} from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import {$imagesPostLoading, imagesPostFx} from "../../store/images/postImages.ts";
import {$imagesLoading, imagesGetFx} from "../../store/images/getImages.ts";
import {useUnit} from "effector-react";

const AddEditImages = (props: IAddEditModal<any>) => {
  const [loadingPost, loading] = useUnit([$imagesPostLoading, $imagesLoading])

  const [selectedFiles, setSelectedFiles] = useState<FileType | null>(null);

  const handleFileUpload = (files: FileType[]) => {
    setSelectedFiles(files[0]);
  };

  const onSubmit = async () => {
    if (!selectedFiles) return

    const data = {
      file: selectedFiles
    }

    await imagesPostFx(data)
    if (imagesPostFx.doneData && props.onClose) {
      props.onClose()
      await imagesGetFx()
    }
  }

  return (
    <Modal centered={true}
           show={props.isOpen}
           onHide={props.onClose}
    >
      <HeadModal title="Добавить изображение" />
      <Modal.Body className="px-4 pb-4 pt-0">
        <div className="mb-2">
          <FileUploader isImage={true}
                        onFileUpload={handleFileUpload}
          />

        </div>
        <BtnForModalForm disabled={loading || loadingPost} onCLick={onSubmit}/>
      </Modal.Body>
    </Modal>
  )
}

export default AddEditImages;