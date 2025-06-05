import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {IOption} from "../admin/Modal.tsx";
import {IAddEditModal} from "../../interface/modal.ts";
import {
  $categoryEvents,
  $categoryEventsLoading,
  getCategoryEventsFx,
  ICategoriesEvents
} from "../../store/events/getEvents.tsx";
import {useUnit} from "effector-react";
import {Controller, useForm} from "react-hook-form";
import {Form, Modal} from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import FormInput from "../../components/FormInput.tsx";
import Select from "react-select";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import {$categoriesDeleteLoading, categoriesDeleteFx} from "../../store/events/removeEvents.tsx";
import {$categoriesPostLoading, categoriesPostFx, ICategoriesEventsPost} from "../../store/events/addEvenets.tsx";

const schema = yupResolver(
  yup.object().shape({
    name: yup.string().required("Введите название"),
    category: yup.object().shape({
      value: yup.number(),
      label: yup.string(),
    }).nullable()
  })
)

interface IFormData {
  name: string
  category?: IOption<number> | null,
}

const AddEditCategoryEvents = (props: IAddEditModal<ICategoriesEvents>) => {
  const [category, loading, loadingPost, loadingRemove] = useUnit([$categoryEvents, $categoryEventsLoading, $categoriesPostLoading, $categoriesDeleteLoading] )

  const optionCategory = category.map(item => ({
    label: item.name || "",
    value: item.id,
  }))


  const defaultCategory = () => {
    const categoryElem = category.find(item => item.id === props.editable?.parent_id)
    if (!categoryElem) {
      return null
    } else {
      return {
        value: categoryElem.id || -1,
        label: categoryElem.name || "",
      }

    }

  }

  const {control, handleSubmit, formState: {errors}, register} = useForm<IFormData>({
    resolver: schema,
    defaultValues: {
      name: props.editable?.name || "",
      category: defaultCategory() || null
    }
  })

  const onSubmit = async (FormData: IFormData) => {
    const data: ICategoriesEventsPost = {
      name: FormData.name,
      parent_id: FormData.category?.value ?? null
    }

    console.log(data)

    if (props.editable) {
      data._method = "put"

      await categoriesPostFx({data, id: props.editable.id})
      if (categoriesPostFx.doneData) {
        if (props.onClose) props.onClose()
        await getCategoryEventsFx()
      }
    } else {
      await categoriesPostFx({data})
      if (categoriesPostFx.doneData) {
        if (props.onClose) props.onClose()
        await getCategoryEventsFx()
      }
    }
  }

  const onRemove = async () => {
    if (props.editable?.id) {
      await categoriesDeleteFx(props.editable.id)
      if (categoriesDeleteFx.doneData) {
        if (props.onClose) props.onClose()
        await getCategoryEventsFx()
      }
    }
  }

  return (
    <Modal centered={true} show={props.isOpen} onHide={props.onClose}>
      <HeadModal title={props.editable ? "Изменить категорию" : "Создать категорию"} />
      <Modal.Body className="px-4 pb-4 pt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput name="name"
                     type="text"
                     errors={errors}
                     placeholder="Введите название категории"
                     label="Название категории"
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
          </Form.Group>
          <BtnForModalForm onClickDelete={onRemove} disabled={loading || loadingRemove || loadingPost} editable={!!props.editable}/>
        </form>
      </Modal.Body>
    </Modal>
  )

}

export default AddEditCategoryEvents;