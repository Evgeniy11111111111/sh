import {IAddEditModal} from "../../interface/modal.ts";
import {Card, Col, Modal, Row} from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from 'yup';
import {useForm} from "react-hook-form";
import FormInput from "../../components/FormInput.tsx";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import {useEffect, useState} from "react";
import FileUploader, {FileType} from "../../components/FileUploader.tsx";
import {IRestaurantAdd, restaurantAddFx, restaurantCombineLoading} from "../../store/restaurant/postRestaurant.ts";
import {getRestaurantFx, IRestaurantGet} from "../../store/restaurant/getRestaurant.ts";
import {restaurantDeleteFx} from "../../store/restaurant/removeRestaurant.ts";
import {Link} from "react-router-dom";
import {useUnit} from "effector-react";


const schemaResolver = yupResolver(
  yup.object().shape({
    title: yup.string().required("Введите название категории")
  })
)

interface IFormData {
  title: string
}

export const AddEditRestaurantMenu = (props: IAddEditModal<IRestaurantGet>) => {
  const [restaurantLoading] = useUnit([restaurantCombineLoading])

  const [selectedFiles, setSelectedFiles] = useState<FileType[]>([])
  const [imagesArray, setImagesArray] = useState<{id: number, url: string}[]>([])
  const [deletableImages, setDeletableImages] = useState<number[]>([])

  const {register, handleSubmit, formState: {errors}} = useForm<IFormData>({
    resolver: schemaResolver,
    defaultValues: {
      title: props.editable?.title || ""
    }
  });

  const handleFileUpload = (files: FileType[]) => {
    setSelectedFiles(files);
  };

  const onSubmit = async (FormData: IFormData) => {
    const data: IRestaurantAdd = {
      title: FormData.title,
      images: selectedFiles
    }

    if (props.editable) {
      data._method = "put"
      data.deletable_images = deletableImages
      await restaurantAddFx({data: data, id: props.editable.id})
      if (restaurantAddFx.doneData) {
        if (props.onClose) props.onClose()
        await getRestaurantFx()
      }
    } else {
      await restaurantAddFx({data: data})
      if (restaurantAddFx.doneData) {
        if (props.onClose) props.onClose()
        await getRestaurantFx()
      }
    }

  }

  const removeCategory = async () => {
    if (props.editable?.id) {
      await restaurantDeleteFx(props.editable.id)
      if (restaurantDeleteFx.doneData) {
        if (props.onClose) props.onClose()
        await getRestaurantFx()
      }
    }
  }

  const removeFile = (id: number) => {
    setImagesArray(prevState => {
      return prevState.filter(item => item.id !== id);
    });
    setDeletableImages(prevState => {
      return [...prevState, id]
    })
  }

  useEffect(() => {
    if (props.isOpen && props.editable) {
      setImagesArray(props.editable.images)
    }
  }, [props.isOpen]);

  return (
    <Modal centered={true} show={props.isOpen} onHide={props.onClose}>
      <HeadModal title={props.editable ? "Изменить категорию меню" : "Создать категорию меню"}/>
      <Modal.Body className="px-4 pb-4 pt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput name="title"
                     register={register}
                     type="text"
                     placeholder="Введите название категории"
                     errors={errors}
                     label="Название категории"
                     className="form-control"
                     containerClass={"mb-3"}
          />
          {imagesArray.length > 0 && props.editable ? (
            <>
            <h5 className="text-uppercase mt-0 mb-3 bg-light p-2">
              Изображения
            </h5>
              <div className="mb-3">
                {imagesArray.map((file, index) => (
                  <Card key={file.id + index + "-file"} className="mt-1 mb-0 shadow-none border">
                    <div className="p-2 position-relative">
                      <Row className="align-items-center">
                        <Col className="col-auto">
                          <img

                            data-dz-thumbnail=""
                            className="rounded bg-light w-100"
                            alt={`${file.id}`}
                            src={file.url}
                          />
                        </Col>
                        <Link
                          to="#"
                          style={{top: "10px", right: "10px"}}
                          className="btn btn-link btn-lg text-muted shadow-none position-absolute w-auto"
                          onClick={() => removeFile(file.id)}
                        >
                          <i className="dripicons-cross"></i>
                        </Link>
                      </Row>
                    </div>
                  </Card>
                ))}
              </div>
            </>

          ) : null}
          <Card>
            <h5 className="text-uppercase mt-0 mb-3 bg-light p-2">
              Добавить изображение
            </h5>
            <FileUploader isMulti={true} isImage={true} onFileUpload={handleFileUpload}/>
          </Card>
          <BtnForModalForm disabled={restaurantLoading} onClickDelete={removeCategory} editable={!!props.editable}/>
        </form>
      </Modal.Body>
    </Modal>
  )
}