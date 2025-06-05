import {IAddEditModal} from "../../interface/modal.ts";
import {Form, FormGroup, FormLabel, Modal} from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import FormInput from "../../components/FormInput.tsx";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {IOption} from "../admin/Modal.tsx";
import {Controller, useForm} from "react-hook-form";
import {useUnit} from "effector-react";
import {$categoryEvents, getPackagesEventsFx} from "../../store/events/getEvents.tsx";
import Select from "react-select";
import {eventsCombinePost, eventsPostFx, IPackageEventsPost} from "../../store/events/addEvenets.tsx";
import {eventsDeleteFx} from "../../store/events/removeEvents.tsx";
import {useEffect, useState} from "react";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from 'html-to-draftjs';
import {ContentState, convertToRaw, EditorState} from "draft-js";
import {Editor} from "react-draft-wysiwyg";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const schema = yupResolver(
  yup.object().shape({
    name: yup.string().required("Введите название"),
    category: yup.object().shape({
      value: yup.number().required(),
      label: yup.string().required(),
    }).required("Выберите категорию"),
    age_from: yup.string()
      .nullable()
      .test(
        "is-less",
        "Минимальный возраст должен быть меньше максимального",
        function (value) {
            const ageTo = this.parent.age_to;
            if (ageTo === undefined || ageTo.length < 1) return true
            if (!value || value.length < 1) return  true
            return Number(value) <= Number(ageTo)
          }
        ),
    age_to: yup.string()
      .nullable()
      .test(
        "is-greater",
        "Максимальный возраст должен быть больше минимального",
        function (value) {
          const ageFrom = this.parent.age_from;
          if (ageFrom === undefined || ageFrom.length < 1) return true
          if (!value || value.length < 1) return  true
          return Number(value) >= Number(ageFrom);
        }
        ),
    people_from: yup.string()
      .nullable()
      .test(
        "is-less-count",
        "Минимальное количество должно быть больше либо равно максимальному",
        function (value) {
          const peopleTo = this.parent.people_to;
          if (peopleTo === undefined || peopleTo.length < 1) return true
          if (!value || value.length < 1) return  true
          return Number(value) <= Number(peopleTo)
        }
      ),
    people_to: yup.string()
      .nullable()
      .test(
        "is-greater-count",
        "Максимальное количество должно быть меньше либо равно минимальному",
        function (value) {
          const peopleFrom = this.parent.people_from;
          if (peopleFrom === undefined || peopleFrom.length < 1) return true
          if (!value || value.length < 1) return  true
          return Number(value) >= Number(peopleFrom)
        }
      ),
    minute_duration_from: yup.string()
      .nullable()
      .test(
        "is-less-minute",
        "Минимальная продолжительность должна быть больше либо равно максимальной",
        function (value) {
          const minuteTo = this.parent.minute_duration_to;
          if (minuteTo === undefined || minuteTo.length < 1) return true
          if (!value || value.length < 1) return  true
          return Number(value) <= Number(minuteTo)
        }
      ),
    minute_duration_to: yup.string()
      .nullable()
      .test(
        "is-greater-minute",
        "Максимальная продолжительность должна быть меньше либо равно минимальной",
        function (value) {
          const minuteFrom = this.parent.minute_duration_from;
          if (minuteFrom === undefined || minuteFrom.length < 1) return true
          if (!value || value.length < 1) return  true
          return Number(value) >= Number(minuteFrom)
        }
      ),
    people_limit: yup.number().nullable(),
    price: yup.number().nullable(),
    price_per_max_people: yup.number().nullable(),
    content: yup.string()
  })
)

interface IFormData {
  name: string
  category: IOption<number> | null,
  age_from: number,
  age_to: number,
  people_from: number,
  people_to: number,
  minute_duration_from: number,
  minute_duration_to: number,
  people_limit: number,
  price: number,
  price_per_max_people: number
  content: string
}

const AddEditEvents = (props: IAddEditModal<any>) => {
  const [category, loading] = useUnit([$categoryEvents, eventsCombinePost])
  const [editorState, setEditorState] = useState<EditorState>();

  const optionCategory = category.map(item => ({
    label: item.name || "",
    value: item.id,
  }))

  const defaultCategory = () => {
    const categoryElem = category.find(item => item.id === props.editable?.category_id)
    if (!categoryElem) return null

    return {
      value: categoryElem.id || -1,
      label: categoryElem.name || "",
    }
  }

  const {control, handleSubmit, formState: {errors}, register, setValue} = useForm<IFormData>({
    resolver: schema,
    defaultValues: {
      name: props.editable?.name || "",
      category: defaultCategory() || null,
      age_from: props.editable?.age_from || 0,
      age_to: props.editable?.age_to || 0,
      people_from: props.editable?.people_from || 0,
      people_to: props.editable?.people_to || 0,
      minute_duration_to: props.editable?.minute_duration_to || 0,
      minute_duration_from: props.editable?.minute_duration_from || 0,
      people_limit: props.editable?.people_limit || 0,
      price: props.editable?.price || 0,
      price_per_max_people: props.editable?.price_per_max_people || 0,
      content: props.editable?.content || ""
    }
  })

  const onSubmit = async (formData: IFormData) => {
    const data: IPackageEventsPost = {
      name: formData.name,
      category_id: formData.category?.value || -1,
      original_price: formData.price || formData.price > 0 ? formData.price : null,
      price_per_max_people: formData.price_per_max_people || formData.price_per_max_people > 0 ? formData.price_per_max_people : null,
      people_from: formData.people_from || Number(formData.people_from) > 0 ? Number(formData.people_from) : null,
      people_to: formData.people_to || Number(formData.people_to) > 0 ? Number(formData.people_to) : null,
      people_limit: formData.people_limit || formData.people_limit > 0 ? formData.people_limit : null,
      age_from: formData.age_from || Number(formData.age_from) > 0 ? Number(formData.age_from) : null,
      age_to: formData.age_to || Number(formData.age_to) > 0 ? Number(formData.age_to) : null,
      minute_duration_from: formData.minute_duration_from || Number(formData.minute_duration_from) > 0 ? Number(formData.minute_duration_from) : null,
      minute_duration_to: formData.minute_duration_to || Number(formData.minute_duration_to) > 0 ? Number(formData.minute_duration_to) : null,
      content: formData.content || ""
    }
    console.log(data)

    if (props.editable) {
      data._method = "put"
      await eventsPostFx({data: data, id: props.editable.id})
      if (eventsPostFx.doneData) {
        if (props.onClose) props.onClose()
        await getPackagesEventsFx()
      }
    } else {
      await eventsPostFx({data: data})

      if (eventsPostFx.doneData) {
        if (props.onClose) props.onClose()
        await getPackagesEventsFx()
      }
    }
  }

  const removeEvent = async () => {
    if (props.editable.id) {
      await eventsDeleteFx(props.editable.id)
      if (eventsDeleteFx.doneData) {
        if (props.onClose) props.onClose()
        await getPackagesEventsFx()
      }
    }
  }

  const onEditorStateChange = (newState: EditorState) => {
    setEditorState(newState);
    const htmlContent = draftToHtml(convertToRaw(newState.getCurrentContent()))
    setValue('content', htmlContent); // Синхронизация с формой
  };

  useEffect(() => {
    if (props.isOpen) {
      if (props.editable?.content) {
        const contentBlock = htmlToDraft(props.editable.content)
        const contentState = ContentState.createFromBlockArray(
          contentBlock.contentBlocks
        );
        setValue("content", props.editable.content)
        setEditorState(EditorState.createWithContent(contentState))
      } else {
        setEditorState(EditorState.createEmpty())
      }
    }

  }, [props.isOpen]);

  return (
    <Modal centered={true} show={props.isOpen} onHide={props.onClose}>
      <HeadModal title={props.editable ? "Изменить мероприятие" : "Создать мероприятие"} />
      <Modal.Body className="px-4 pb-4 pt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput name="name"
                     key="events-name-key"
                     type="text"
                     errors={errors}
                     placeholder="Введите название мероприятия"
                     label="Название мероприятия"
                     className="form-control"
                     register={register}
                     containerClass="mb-3"
          />
          <Form.Group className="mb-3">
            <Form.Label>Категория</Form.Label>
            <Controller name="category" control={control} render={
              ({field}) => (
                <Select className="react-select react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Выбрать категорию"
                        options={optionCategory}
                        {...field}
                />
              )
            }/>
            {errors.category && (
              <div className="invalid-feedback text-danger d-block">
                {errors.category.message}
              </div>
            )}
          </Form.Group>
          <div className="mb-3 flex-column d-flex gap-3 gap-sm-1 flex-sm-row">
            <FormInput name="age_from"
                       register={register}
                       errors={errors}
                       className="form-control"
                       containerClass="w-100"
                       label="Минимальный возраст"
            />
            <FormInput name="age_to"
                       register={register}
                       errors={errors}
                       className="form-control"
                       containerClass="w-100"
                       label="Максимальный возраст"
            />
          </div>
          <div className="mb-3 flex-column d-flex gap-3 gap-sm-1 flex-sm-row">
            <FormInput name="people_from"
                       register={register}
                       errors={errors}
                       className="form-control"
                       containerClass="w-100"
                       label="Минимальное количество"
            />
            <FormInput name="people_to"
                       register={register}
                       errors={errors}
                       className="form-control"
                       containerClass="w-100"
                       label="Максимальное количество"
            />
          </div>
          <div className="mb-3 flex-column d-flex gap-3 gap-sm-1 flex-sm-row">
            <FormInput name="minute_duration_from"
                       register={register}
                       errors={errors}
                       className="form-control"
                       containerClass="w-100"
                       label="Минимальное время"
            />
            <FormInput name="minute_duration_to"
                       register={register}
                       errors={errors}
                       className="form-control"
                       containerClass="w-100"
                       label="Максимальное время"
            />
          </div>
          <FormInput name="people_limit"
                     type="number"
                     errors={errors}
                     label="Лимит людей"
                     className="form-control"
                     register={register}
                     containerClass="mb-3"
          />
          <FormInput name="price"
                     type="number"
                     errors={errors}
                     label="Цена"
                     className="form-control"
                     register={register}
                     containerClass="mb-3"
          />
          <FormInput name="price_per_max_people"
                     type="number"
                     errors={errors}
                     label="Цена за одного человека при привышении лимита"
                     className="form-control"
                     register={register}
                     containerClass="mb-3"
          />
          {editorState && (
            <FormGroup className="mb-3">
              <FormLabel>
                Основной текст новости
              </FormLabel>
              <Editor wrapperClassName="border p-1"
                      editorStyle={{minHeight: "230px"}}
                      editorClassName="draft-editor"
                      editorState={editorState}
                      onEditorStateChange={onEditorStateChange}
              />
            </FormGroup>
          )}
          <BtnForModalForm onClickDelete={removeEvent} disabled={loading} editable={!!props.editable}/>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default AddEditEvents;