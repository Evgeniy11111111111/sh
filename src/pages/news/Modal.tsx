import {Card, Form, FormGroup, FormLabel, Modal} from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from 'yup';
import {useForm} from "react-hook-form";
import FormInput from "../../components/FormInput.tsx";
import FileUploader, {FileType} from "../../components/FileUploader.tsx";
import {useEffect, useState} from "react";
import HyperDatepicker from "../../components/Datepicker.tsx";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import {IAddNews, newsPostFx, newsPostReset} from "../../store/news/addNews.ts";
import {IAddEditModal} from "../../interface/modal.ts";
import {INewsGetData} from "../../store/news/getNews.ts";
import {newsPutFx, newsPutReset} from "../../store/news/putNews.ts";
import {$newsIsOpen, newsDeleteElemEvent, newsDeleteModal} from "../../store/news/modalDelete.ts";
import {useUnit} from "effector-react";
import {ContentState, convertToRaw, EditorState} from "draft-js"
import {Editor} from "react-draft-wysiwyg"
import draftToHtml from "draftjs-to-html";
import htmlToDraft from 'html-to-draftjs';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import classNames from "classnames";

interface IFormData {
  name: string,
  description: string,
  short_description: string
}

const schemaResolver = yupResolver(
  yup.object().shape({
    name: yup.string().required("Введите название новости"),
    short_description: yup.string(),
    description: yup.string().required("Введите основной текст новости")
  })
)

const AddEditNews = (props: IAddEditModal<INewsGetData>) => {
  const [deleteOpen] = useUnit([$newsIsOpen])

  const [selectedFiles, setSelectedFiles] = useState<FileType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(props.editable?.published_at ? new Date(props.editable.published_at) : new Date())
  const [isPublished, setIsPublished] = useState<number>(props.editable ? props.editable.is_published : 0);
  const [editorState, setEditorState] = useState<EditorState>();

  const { control, handleSubmit, formState: { errors }, register, setValue, setError, clearErrors } = useForm<IFormData>({
    resolver: schemaResolver,
  });

  const handleFileUpload = (files: FileType[]) => {
    setSelectedFiles(files[0]);
  };

  const changeIsPublished = () => {
    setIsPublished((prevState) => (prevState === 0 ? 1 : 0))
  }
  const onDateChange = (date: Date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const onSubmit = async (FormData: IFormData) => {
    let hasError = false

    if (!editorState || editorState?.getCurrentContent()?.getPlainText()?.length < 1) {
      setError("description", {
        type: "manual",
        message: "Введите основной текст"
      })
      hasError = true
    }

    if (hasError) {
      return
    }
    const data: IAddNews = {
      name: FormData.name,
      description: FormData.description,
      short_description: FormData.short_description,
      published_at: selectedDate.toLocaleDateString(),
      is_published: isPublished,
      image: selectedFiles
    }

    if (props.editable) {
      data._method = 'put';
      await newsPutFx({id: props.editable.id, data: data})
      if (newsPutFx.doneData) {
        if (props.onClose) props.onClose()
        newsPutReset()
      }
    } else {
      await newsPostFx(data)
      if (newsPostFx.doneData) {
        if (props.onClose) props.onClose()
        newsPostReset()
      }
    }

  }

  const openDelete = () => {
    if (props.editable) {
      newsDeleteElemEvent(props.editable.id)
      newsDeleteModal(true)
    }
  }

  useEffect(() => {
    if (props.isOpen) {
      if (props.editable?.description) {
        const contentBlock = htmlToDraft(props.editable.description)
        const contentState = ContentState.createFromBlockArray(
          contentBlock.contentBlocks
        );
        setValue("description", props.editable.description)
        setEditorState(EditorState.createWithContent(contentState))
      } else {
        setEditorState(EditorState.createEmpty())
      }
    }

  }, [props.isOpen]);

  const onEditorStateChange = (newState: EditorState) => {
    clearErrors("description")
    setEditorState(newState);
    const htmlContent = draftToHtml(convertToRaw(newState.getCurrentContent()))
    setValue('description', htmlContent); // Синхронизация с формой
  };

  return (
    <Modal centered={true}
           style={{zIndex: deleteOpen ? "1000" : ''}}
           size={"xl"}
           show={props.isOpen}
           onHide={props.onClose}
    >
      <HeadModal title={props.editable ? "Изменить новость" : "Добавить новость"} />
      <Modal.Body className="px-4 pb-4 pt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput key="name-news-modal"
                     name="name"
                     control={control}
                     defaultValue={props.editable ? props.editable.name : ""}
                     type="text"
                     placeholder="Введите название новости"
                     errors={errors}
                     label="Название новости"
                     register={register}
                     className="form-control"
                     containerClass={"mb-3"}
          />
          <FormInput
            name="short_description"
            control={control}
            type="textarea"
            rows="3"
            defaultValue={props.editable && props.editable.short_description ? props.editable.short_description : ""}
            placeholder="Введите краткое описание новости"
            errors={errors}
            label="Краткое описание новости"
            register={register}
            className="form-control"
            containerClass={"mb-3"}
          />
          {editorState && (
            <FormGroup className="mb-3">
              <FormLabel>
                Основной текст новости
              </FormLabel>
              <Editor wrapperClassName={classNames("border p-1", {"border-danger": errors.description})}
                      editorStyle={{minHeight: "230px"}}
                      editorClassName="draft-editor"
                      editorState={editorState}
                      onEditorStateChange={onEditorStateChange}
              />
              {errors && errors.description ? (
                <Form.Control.Feedback type="invalid" className="d-block">
                  {errors.description?.message?.toString()}
                </Form.Control.Feedback>
              ) : null}
            </FormGroup>
          )}
          <Card>
            <h5 className="text-uppercase mt-0 mb-3 bg-light p-2">
              Изображение локации
            </h5>
            <FileUploader isImage={true} onFileUpload={handleFileUpload}/>
          </Card>
          <div className="input-group mb-3 input-group-sm ">
            <HyperDatepicker
              value={selectedDate}
              inputClass="border"
              onChange={(date) => {
                onDateChange(date);
              }}
            />
          </div>
          <FormInput name="showMain"
                     checked={isPublished === 1}
                     onChange={changeIsPublished}
                     label="Вы уверены, что хотите опубликовать новость?"
                     type="checkbox"
                     containerClass={"mb-2"}
          />

          <BtnForModalForm editable={!!props.editable} onClickDelete={openDelete}></BtnForModalForm>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default AddEditNews;