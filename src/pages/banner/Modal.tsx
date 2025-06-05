import {Card, Form, Modal} from "react-bootstrap";
import {IAddEditModal} from "../../interface/modal.ts";
import HeadModal from "../../components/HeadModal.tsx";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {Controller, useForm} from "react-hook-form";
import FormInput from "../../components/FormInput.tsx";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import FileUploader, {FileType} from "../../components/FileUploader.tsx";
import {useEffect, useState} from "react";
import Select from "react-select";
import {IOption} from "../admin/Modal.tsx";
import AsyncSelect from "react-select/async";
import {bannerPostFx, bannerPostReset, IAddBanner} from "../../store/banner/addBanner.ts";
import {IBannersGet} from "../../store/banner/getBanner.ts";
import {bannerPutFx, bannerPutReset} from "../../store/banner/putBanner.ts";
import {useUnit} from "effector-react";
import {$bannerIsOpen, bannerDeleteElemEvent, bannerDeleteModal} from "../../store/banner/modalDelete.ts";
import {loadOptionsNews} from "../../helpers/api/loadFunctionOption.ts";
import {IndicatorsContainer} from "../../components/ComponentsWithoutLogic.tsx";
import {$locationsStore} from "../../store/location/getLocations.ts";

interface IFormData {
  name: string
  description: string
  entity?: IOption<string> | null,
  entity_id?: IOption<string> | null
  location_id?: IOption<string> | null
  active: IOption<number> | null
  sort: string
}

const schema = yupResolver(
  yup.object().shape({
    name: yup.string().required("Введите название"),
    description: yup.string().required("Введите описание"),
    entity: yup.object().shape({
      value: yup.string(),
      label: yup.string()
    }).nullable(),
    entity_id: yup.lazy((_, context) => {
      const entity = context.parent.entity;
      if (entity?.value === 'news') {
        return yup.object().shape({
          value: yup.string().required("Выберите новость"),
          label: yup.string().required("Выберите новость"),
        }).nullable().required("Выберите новость");
      }
      return yup.object().shape({
        value: yup.string().notRequired(),
        label: yup.string().notRequired(),
      }).nullable();
    }),
    location_id: yup.lazy((_, context) => {
      const entity = context.parent.entity;
      if (entity?.value === 'location') {
        return yup.object().shape({
          value: yup.string().required("Выберите локацию"),
          label: yup.string().required("Выберите локацию"),
        }).nullable().required("Выберите локацию");
      }
      return yup.object().shape({
        value: yup.string().notRequired(),
        label: yup.string().notRequired(),
      }).nullable();
    }),
    active: yup.object().shape({
      value: yup.string(),
      label: yup.string()
    }),
    sort: yup.string()
  })
)

const options = [
  {
    label: "Новости",
    value: "news"
  },
  {
    label: "Локации",
    value: "location"
  }
]

const optionsActive = [
  {
    label: "Активный",
    value: 1,
  },
  {
    label: "Не активный",
    value: 0,
  }
]


const AddEditBanner = (props: IAddEditModal<IBannersGet>) => {
  const [deleteOpen, locations] = useUnit([$bannerIsOpen, $locationsStore])
  const [selectedFiles, setSelectedFiles] = useState<FileType | null>(null);

  const defaultEntity = props.editable?.entity ? options.find(item => item.value === props.editable?.entity) : null;
  const defaultEntityId = props.editable?.entity === "news"
  &&  props.editable?.resource
  && Object.keys(props.editable.resource).length > 0
  && 'id' in props.editable.resource ? {
    value: `${props.editable.resource.id}`,
    label: props.editable.resource.name
  } : null
  //
  const defaultLocationId =  props.editable?.entity === "location"
  && props.editable?.resource
  && Object.keys(props.editable.resource).length > 0
  && 'code' in props.editable.resource ? {
    value: props.editable.resource.code,
    label: props.editable.resource.name
  } : null

  const defaultActive = props.editable?.active === 1 ? optionsActive[0] : props.editable?.active === 0
    ? optionsActive[1] : null

  const {control, handleSubmit, formState: {errors}, register, watch, setValue} = useForm<IFormData>({
    resolver: schema,
    defaultValues: {
      name: props.editable?.name || "",
      description: props.editable?.description || "",
      entity: defaultEntity,
      entity_id: defaultEntityId,
      location_id: defaultLocationId,
      active: defaultActive,
      sort: `${props.editable?.sort}` || "",
    }
  })

  const handleFileUpload = (files: FileType[]) => {
    setSelectedFiles(files[0]);
  };

  const onSubmit = async (FormData: IFormData) => {

    const data: IAddBanner = {
      name: FormData.name,
      entity: FormData.entity?.value || '',
      entity_id: FormData.entity?.value === "news" ? FormData.entity_id?.value || '' : FormData.entity?.value === "location" ? FormData.location_id?.value || "" : '',
      description: FormData.description,
      active: Number(FormData.active?.value),
      sort: isNaN(Number(FormData.sort)) ? null : Number(FormData.sort),
      image: selectedFiles
    }


    console.log(data)
    if (props.editable) {
      data._method = 'put'
      await bannerPutFx({id: props.editable.id, data: data})
      if (bannerPutFx.doneData) {
        if (props.onClose) props.onClose()
        bannerPutReset()
      }
    } else {
      await bannerPostFx(data)
      if (bannerPostFx.doneData) {
        if (props.onClose) props.onClose()
        bannerPostReset()
      }
    }
  }

  const openDelete = () => {
    if (props.editable) {
      bannerDeleteElemEvent(props.editable.id)
      bannerDeleteModal(true)
    }
  }

  const entityValue = watch("entity")

  const locationsOptions = locations.map(item => ({
    label: item.name,
    value: item.code
  }))

  useEffect(() => {
    if (entityValue?.value === "location") {
      setValue('entity_id', null)
    } else if (entityValue?.value === "news") {
      setValue('location_id', null)
    } else if (!entityValue) {
      setValue("location_id", null)
      setValue('entity_id', null)
    }
  }, [entityValue]);

  return (
    <Modal centered={true}
           style={{zIndex: deleteOpen ? "1000" : ''}}
           show={props.isOpen}
           onHide={props.onClose}
    >
      <HeadModal title={props.editable ? "Изменить баннер" : "Добавить баннер"} />
      <Modal.Body className="px-4 pb-4 pt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput name="name"
                     control={control}
                     type="text"
                     errors={errors}
                     placeholder="Введите название"
                     label="Название"
                     register={register}
                     className="form-control"
                     containerClass="mb-3"
          />
          <FormInput
            name="description"
            control={control}
            type="textarea"
            placeholder="Описание"
            errors={errors}
            label="Описание"
            register={register}
            className="form-control"
            containerClass={"mb-3"}
            rows="4"
          />
          <Form.Group className="mb-3">
            <Form.Label>Раздел</Form.Label>
            <Controller name="entity" control={control} render={
              ({field}) => (
                <Select className="react-select react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Выбрать раздел"
                        options={options}
                        {...field}
                />
              )
            }
            />
            {errors.entity && (
              <div className="invalid-feedback text-danger d-block">
                {errors.entity.message}
              </div>
            )}
          </Form.Group>
          {entityValue?.value === "news" && (
            <Form.Group className="mb-3">
              <Form.Label>Новость к которой относится баннер</Form.Label>
              <Controller name="entity_id" control={control} render={
                ({field}) => (
                  <AsyncSelect className="react-select react-select-container"
                               classNamePrefix="react-select"
                               placeholder="Новость"
                               loadOptions={loadOptionsNews}
                               components={{IndicatorsContainer}}
                               defaultOptions={[]}
                               {...field}
                  />
                )
              }
              />
              {errors.entity_id && (
                <div className="invalid-feedback text-danger d-block">
                  {errors.entity_id.message}
                </div>
              )}
            </Form.Group>
          )}
          {entityValue?.value === "location" && (
            <Form.Group className="mb-3">
              <Form.Label>Локация к которой относится баннер</Form.Label>
              <Controller name="location_id" control={control} render={
                ({field}) => (
                  <Select className="react-select react-select-container"
                          classNamePrefix="react-select"
                          placeholder="Локация"
                          options={locationsOptions}
                          components={{IndicatorsContainer}}
                          {...field}
                  />
                )
              }
              />
              {errors.location_id && (
                <div className="invalid-feedback text-danger d-block">
                  {errors.location_id.message}
                </div>
              )}
            </Form.Group>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Активность баннера</Form.Label>
            <Controller name="active" control={control} render={
              ({field}) => (
                <Select className="react-select react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Активность баннера"
                        options={optionsActive}
                        {...field}
                />
              )
            }
            />
          </Form.Group>
          <FormInput name="sort"
                     control={control}
                     type="number"
                     placeholder="Сортировка"
                     label="Сортировка"
                     register={register}
                     className="form-control"
                     containerClass="mb-3"
          />
          <Card>
            <h5 className="text-uppercase mt-0 mb-3 bg-light p-2">
              Изображение баннера
            </h5>
            <FileUploader isImage={true} onFileUpload={handleFileUpload}/>
          </Card>
          <BtnForModalForm editable={!!props.editable} onClickDelete={openDelete}/>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default AddEditBanner;