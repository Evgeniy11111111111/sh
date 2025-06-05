import {IAddEditModal} from "../../interface/modal.ts";
import {Card, Modal} from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {useForm} from "react-hook-form";
import FormInput from "../../components/FormInput.tsx";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import FileUploader, {FileType} from "../../components/FileUploader.tsx";
import {useState} from "react";
import {giftSamplePostFx, giftSamplePostReset, IAddGiftSample} from "../../store/gift/sample/addGiftSample.ts";
import {IGiftSampleGet} from "../../store/gift/sample/getGiftSample.ts";
import {giftSamplePutFx, giftSamplePutReset} from "../../store/gift/sample/putGiftSample.ts";
import {
  $giftSampleIsOpen,
  giftSampleDeleteElemEvent,
  giftSampleDeleteModal
} from "../../store/gift/sample/modalGiftSample.ts";
import {useUnit} from "effector-react";

interface IFormData {
  name: string
}

const schema = yupResolver(
  yup.object().shape({
    name: yup.string().required("Введите название шаблона")
  })
)

const AddEditSampleGift = (props: IAddEditModal<IGiftSampleGet>) => {
  const [isOpenDelete] = useUnit([$giftSampleIsOpen])

  const [selectedFiles, setSelectedFiles] = useState<FileType | null>(null);
  const {control, handleSubmit, formState: {errors}, register} = useForm<IFormData>({
    resolver: schema,
    defaultValues: {
      name: props.editable?.name || ""
    }
  })

  const handleFileUpload = (files: FileType[]) => {
    setSelectedFiles(files[0]);
  };

  const onSubmit = async (FormData: IFormData) => {
    const data: IAddGiftSample = {
      name: FormData.name,
      image: selectedFiles
    }

    if (props.editable) {
      data._method = 'put';
      await giftSamplePutFx({id: props.editable.id, data: data})
      if (giftSamplePutFx.doneData) {
        if (props.onClose) props.onClose()
        giftSamplePutReset()
      }
    } else {
      await giftSamplePostFx(data)
      if (giftSamplePostFx.doneData) {
        if (props.onClose) props.onClose();
        giftSamplePostReset()
      }
    }


  }

  const openDelete = () => {
    if (props.editable) {
      giftSampleDeleteElemEvent(props.editable.id)
      giftSampleDeleteModal(true)
    }
  }

  return (
    <Modal centered={true}
           style={{zIndex: isOpenDelete ? "1000": ""}}
           show={props.isOpen}
           onHide={props.onClose}
    >
      <HeadModal title={props.editable ? "Изменить шаблон" : "Добавить шаблон"}/>
      <Modal.Body className="px-4 pb-4 pt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput name="name"
                     control={control}
                     type="text"
                     errors={errors}
                     placeholder="Введите название шаблона"
                     label="Название шаблона"
                     register={register}
                     className="form-control"
                     containerClass="mb-3"
          />
          <Card>
            <h5 className="text-uppercase mt-0 mb-3 bg-light p-2">
              Изображение шаблона
            </h5>
            <FileUploader isImage={true} onFileUpload={handleFileUpload}/>
          </Card>
          <BtnForModalForm editable={!!props.editable}
                           onClickDelete={openDelete}
          />
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default AddEditSampleGift;