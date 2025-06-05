import {IAddEditModal} from "../../interface/modal.ts";
import {Card, Form, FormGroup, FormLabel, Modal} from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {useForm} from "react-hook-form";
import FormInput from "../../components/FormInput.tsx";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import {useEffect, useState} from "react";
import FileUploader, {FileType} from "../../components/FileUploader.tsx";
import {IAddQuests, questAddFx, questsCombinePost} from "../../store/quests/postQuests.ts";
import {getQuestFx} from "../../store/quests/getQuest.ts";
import {useUnit} from "effector-react";
import {questsDeleteFx} from "../../store/quests/removeQuests.ts";
import {ContentState, convertToRaw, EditorState} from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from 'html-to-draftjs';
import {Editor} from "react-draft-wysiwyg";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import classNames from "classnames";

const schema = yupResolver(
  yup.object().shape({
    name: yup.string().required("Введите название"),
    description: yup.string().required("Введите описание"),
    minute_duration: yup.number()
      .transform((value, originalValue) => {
        if (originalValue === "") return NaN; // Пустая строка -> NaN
        return isNaN(value) ? 0 : value; // Нечисловое значение -> 0
      })
      .required("Введите продолжительность квеста")
      .typeError("Продолжительность квеста должна быть числом")
      .test("is-non-negative", "Продолжительность квеста не может быть отрицательной", (value) => {
        return value >= 0; // Проверка, что значение больше или равно нулю
      }),
    people_from: yup.number()
      .transform((value, originalValue) => {
        if (originalValue === "") return NaN; // Пустая строка -> NaN
        return isNaN(value) ? 0 : value; // Нечисловое значение -> 0
      })
      .required("Введите минимальное количество человек")
      .typeError("Минимальное количество человек должно быть числом")
      .test("is-non-negative", "Минимальное количество человек не может быть отрицательной", (value) => {
        return value >= 0; // Проверка, что значение больше или равно нулю
      }),
    people_limit: yup.number()
      .transform((value, originalValue) => {
        if (originalValue === "") return NaN; // Пустая строка -> NaN
        return isNaN(value) ? 0 : value; // Нечисловое значение -> 0
      })
      .required("Введите максимальное количество человек")
      .typeError("Максимальное количество человек должно быть числом")
      .test("is-non-negative", "Максимальное количество человек не может быть отрицательной", (value) => {
        return value >= 0; // Проверка, что значение больше или равно нулю
      }),
    without_pay_count: yup.number()
      .transform((value, originalValue) => {
        if (originalValue === "") return NaN; // Пустая строка -> NaN
        return isNaN(value) ? 0 : value; // Нечисловое значение -> 0
      })
      .required("Введите количество людей без дополнительной оплаты")
      .typeError("Количество людей без дополнительной оплаты должно быть числом")
      .test("is-non-negative", "Количество людей без дополнительной оплаты не может быть отрицательной", (value) => {
        return value >= 0; // Проверка, что значение больше или равно нулю
      }),
    weekday_price: yup.number()
      .transform((value, originalValue) => {
        if (originalValue === "") return NaN; // Пустая строка -> NaN
        return isNaN(value) ? 0 : value; // Нечисловое значение -> 0
      })
      .required("Введите цену в будни")
      .typeError("Цена в будни должно быть числом")
      .test("is-non-negative", "Цена в будни не может быть отрицательной", (value) => {
        return value >= 0; // Проверка, что значение больше или равно нулю
      }),
    weekday_per_player: yup.number()
      .transform((value, originalValue) => {
        if (originalValue === "") return NaN; // Пустая строка -> NaN
        return isNaN(value) ? 0 : value; // Нечисловое значение -> 0
      })
      .required("Введите цену за человека если лимит превышен")
      .typeError("Цена за человека если лимит превышен должна быть числом")
      .test("is-non-negative", "Цена за человека если лимит превышен не может быть отрицательной", (value) => {
        return value >= 0; // Проверка, что значение больше или равно нулю
      }),
    weekends_price: yup.number()
      .transform((value, originalValue) => {
        if (originalValue === "") return NaN; // Пустая строка -> NaN
        return isNaN(value) ? 0 : value; // Нечисловое значение -> 0
      })
      .required("Введите цену в выходной")
      .typeError("Цена в выходной должна быть числом")
      .test("is-non-negative", "Цена в выходной не может быть отрицательной", (value) => {
        return value >= 0; // Проверка, что значение больше или равно нулю
      }),
    weekends_per_player: yup.number()
      .transform((value, originalValue) => {
        if (originalValue === "") return NaN; // Пустая строка -> NaN
        return isNaN(value) ? 0 : value; // Нечисловое значение -> 0
      })
      .required("Введите цену за человека если лимит превышен")
      .typeError("Цена за человека если лимит превышен должна быть числом")
      .test("is-non-negative", "Цена за человека если лимит превышен не может быть отрицательной", (value) => {
        return value >= 0; // Проверка, что значение больше или равно нулю
      }),
    holidays_price: yup.number()
      .transform((value, originalValue) => {
        if (originalValue === "") return NaN; // Пустая строка -> NaN
        return isNaN(value) ? 0 : value; // Нечисловое значение -> 0
      })
      .required("Введите цену в праздники")
      .typeError("Цена в праздники должна быть числом")
      .test("is-non-negative", "Цена в праздники не может быть отрицательной", (value) => {
        return value >= 0; // Проверка, что значение больше или равно нулю
      }),
    holidays_per_player: yup.number()
      .transform((value, originalValue) => {
        if (originalValue === "") return NaN; // Пустая строка -> NaN
        return isNaN(value) ? 0 : value; // Нечисловое значение -> 0
      })
      .required("Введите цену за человека если лимит превышен")
      .typeError("Цена за человека если лимит превышен должна быть числом")
      .test("is-non-negative", "Цена за человека если лимит превышен не может быть отрицательной", (value) => {
        return value >= 0; // Проверка, что значение больше или равно нулю
      })
  })
)

interface IFormData {
  name: string,
  description: string,
  minute_duration: number,
  people_from: number,
  people_limit: number,
  without_pay_count: number,
  weekday_price: number,
  weekday_per_player: number,
  weekends_price: number,
  weekends_per_player: number,
  holidays_price: number,
  holidays_per_player: number
}

const AddEditQuest = (props: IAddEditModal<any>) => {
  const [loading] = useUnit([questsCombinePost])

  const [selectedFiles, setSelectedFiles] = useState<FileType | null>(null)
  const [editorState, setEditorState] = useState<EditorState>();

  const {handleSubmit, formState: {errors}, register, setValue, setError, clearErrors} = useForm<IFormData>({
    resolver: schema,
    defaultValues: {
      name: props.editable?.name || "",
      minute_duration: props.editable?.minute_duration || 0,
      people_from: props.editable?.people_from || 0,
      people_limit: props.editable?.people_limit || 0,
      without_pay_count: props.editable?.without_pay_count || 0,
      weekday_price: props.editable?.prices.weekday.price || 0,
      weekday_per_player: props.editable?.prices.weekday.per_player || 0,
      weekends_price: props.editable?.prices.weekends.price || 0,
      weekends_per_player: props.editable?.prices.weekends.per_player || 0,
      holidays_price: props.editable?.prices.holidays.price || 0,
      holidays_per_player: props.editable?.prices.holidays.per_player || 0,
    }
  })

  const handleFileUpload = (files: FileType[]) => {
    setSelectedFiles(files[0]);
  };

  const onSubmit = async (formData: IFormData) => {
    let hasError = false

    if (!editorState || editorState?.getCurrentContent()?.getPlainText()?.length < 1) {
      setError("description", {
        type: "manual",
        message: "Введите основной текст"
      })

      hasError = true;
    }

    if (hasError) {
      return
    }

    const data: IAddQuests = {
      name: formData.name,
      description: formData.description,
      image: selectedFiles,
      minute_duration: formData.minute_duration,
      people_from: formData.people_from,
      people_limit: formData.people_limit,
      without_pay_count: formData.without_pay_count,
      prices: {
        weekday: {
          price: formData.weekday_price,
          per_player: formData.weekday_per_player,
        },
        weekends: {
          price: formData.weekends_price,
          per_player: formData.weekends_per_player,
        },
        holidays: {
          price: formData.holidays_price,
          per_player: formData.holidays_per_player,
        }
      }
    }


    if (props.editable) {
      data._method = 'put'

      await questAddFx({data: data, code: props.editable.code})
      if (questAddFx.doneData) {
        if (props.onClose) props.onClose()
        await getQuestFx()
      }
    } else {
      await questAddFx({data: data})
      if (questAddFx.doneData) {
        if (props.onClose) props.onClose()
        await getQuestFx()
      }
    }

  }

  const removeQuest = async () => {
    if (props.editable.code) {
      await questsDeleteFx(props.editable.code)
      if (questsDeleteFx.doneData) {
        if (props.onClose) props.onClose()
        await getQuestFx()
      }
    }
  }

  const onEditorStateChange = (newState: EditorState) => {
    clearErrors("description")
    setEditorState(newState);
    const htmlContent = draftToHtml(convertToRaw(newState.getCurrentContent()))
    setValue('description', htmlContent); // Синхронизация с формой
  };

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

  return (
    <Modal centered={true} show={props.isOpen} onHide={props.onClose}>
      <HeadModal title={props.editable ? "Изменить квест" : "Создать квест"} />
      <Modal.Body className="px-4 pb-4 pt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput name="name"
                     key="events-name-key"
                     type="text"
                     errors={errors}
                     placeholder="Введите название квеста"
                     label="Название квеста"
                     className="form-control"
                     register={register}
                     containerClass="mb-3"
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
              Изображение квеста
            </h5>
            <FileUploader isImage={true} onFileUpload={handleFileUpload}/>
          </Card>

          <FormInput name="minute_duration"
                     type="number"
                     errors={errors}
                     label="Продолжительность квеста"
                     className="form-control"
                     register={register}
                     containerClass="mb-3"
          />
          <FormInput name="people_from"
                     type="number"
                     errors={errors}
                     label="Минимальное количество человек"
                     className="form-control"
                     register={register}
                     containerClass="mb-3"
          />
          <FormInput name="people_limit"
                     type="number"
                     errors={errors}
                     label="Максимальное количество человек"
                     className="form-control"
                     register={register}
                     containerClass="mb-3"
          />
          <FormInput name="without_pay_count"
                     type="number"
                     errors={errors}
                     label="Количество людей без дополнительной оплаты"
                     className="form-control"
                     register={register}
                     containerClass="mb-3"
          />
          <FormInput name="weekday_price"
                     type="number"
                     errors={errors}
                     label="Цена в будни"
                     className="form-control"
                     register={register}
                     containerClass="mb-3"
          />
          <FormInput name="weekday_per_player"
                     type="number"
                     errors={errors}
                     label="Цена за человека в будни если лемит привышен "
                     className="form-control"
                     register={register}
                     containerClass="mb-3"
          />
          <FormInput name="weekends_price"
                     type="number"
                     errors={errors}
                     label="Цена в выходные"
                     className="form-control"
                     register={register}
                     containerClass="mb-3"
          />
          <FormInput name="weekends_per_player"
                     type="number"
                     errors={errors}
                     label="Цена за человека в выходные если лемит привышен "
                     className="form-control"
                     register={register}
                     containerClass="mb-3"
          />
          <FormInput name="holidays_price"
                     type="number"
                     errors={errors}
                     label="Цена в праздники"
                     className="form-control"
                     register={register}
                     containerClass="mb-3"
          />
          <FormInput name="holidays_per_player"
                     type="number"
                     errors={errors}
                     label="Цена за человека в праздники если лемит привышен "
                     className="form-control"
                     register={register}
                     containerClass="mb-3"
          />
          <BtnForModalForm onClickDelete={removeQuest} disabled={loading} editable={!!props.editable}/>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default AddEditQuest;