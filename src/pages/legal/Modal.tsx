import {Card, Modal} from "react-bootstrap";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {useForm} from "react-hook-form";
import FormInput from "../../components/FormInput.tsx";
import FileUploader, {FileType} from "../../components/FileUploader.tsx";
import {useState} from "react";
import {IAddLegal, legalPostFx, legalPostReset} from "../../store/legal/addLegal.ts";
import {ILegalGetData} from "../../store/legal/getLegal.ts";
import {legalPutFx, legalPutReset} from "../../store/legal/putLegal.ts";
import {$legalIsOpen, legalDeleteElemEvent, legalDeleteModal} from "../../store/legal/modalLegal.ts";
import {useUnit} from "effector-react";
import HeadModal from "../../components/HeadModal.tsx";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import {IAddEditModal} from "../../interface/modal.ts";

interface IFormData {
  name: string,
  sort: number
}

const schema = yupResolver(
  yup.object().shape({
    name: yup.string().required("Введите название информации"),
    sort: yup.number().min(0, "Порядковое число не должно быть меньше 0").transform((value, originalValue) => {
      if (originalValue === "") return 10
      return Math.floor(value);
    })
  })
)
const AddEditLegal = (props: IAddEditModal<ILegalGetData>) => {
  const [deleteOpen] = useUnit([$legalIsOpen])
  const [selectedFiles, setSelectedFiles] = useState<FileType | null>(null);

  const { control, handleSubmit, formState: { errors }, register } = useForm<IFormData>({
    resolver: schema
  });

  const handleFileUpload = (files: FileType[]) => {
    setSelectedFiles(files[0]);
  };

  const onSubmit = async (FormData: IFormData) => {
    const data: IAddLegal = {
      name: FormData.name,
      sort: FormData.sort,
      document: selectedFiles
    }

    if (props.editable) {
      data._method = 'put'
      await legalPutFx({id: props.editable.id, data: data})
      if (legalPutFx.doneData) {
        if (props.onClose) props.onClose()
        legalPutReset()
      }
    } else {
      await legalPostFx(data)
      if (legalPostFx.doneData) {
        if (props.onClose) props.onClose()
        legalPostReset()
      }
    }

  }

  const openDelete = () => {
    if (props.editable) {
      legalDeleteElemEvent(props.editable.id)
      legalDeleteModal(true)
    }
  }

  return (
    <Modal centered={true} style={{zIndex: deleteOpen ? "1000" : ''}} show={props.isOpen} onHide={props.onClose}>
      <HeadModal title={props.editable ? "Изменить информацию" : "Добавить информацию"} />
      <Modal.Body className="px-4 pb-4 pt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput name="name"
                     key="legal-key"
                     control={control}
                     defaultValue={props.editable ? props.editable.name : ''}
                     type="text"
                     placeholder="Введите название документа"
                     errors={errors}
                     label="Название документа"
                     register={register}
                     className="form-control"
                     containerClass="mb-3"
          />
          <FormInput name="sort"
                     key="legal-sort"
                     control={control}
                     defaultValue={props.editable ? props.editable.sort : ''}
                     type="number"
                     placeholder="Введите порядковое место"
                     errors={errors}
                     label="Порядковое место документа в списке"
                     register={register}
                     className="form-control"
                     containerClass="mb-3"
          />
          <Card>
            <h5 className="text-uppercase mt-0 mb-3 bg-light p-2">
              Загрузить документ
            </h5>
            <FileUploader onFileUpload={handleFileUpload}/>
          </Card>
          <BtnForModalForm editable={!!props.editable} onClickDelete={openDelete} />
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default AddEditLegal;