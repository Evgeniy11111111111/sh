import {IAddEditModal} from "../../interface/modal.ts";
import {Col, Form, Modal, Row} from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup"
import {Controller, useForm} from "react-hook-form";
import FormInput from "../../components/FormInput.tsx";
import {useState} from "react";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import HyperDatepicker from "../../components/Datepicker.tsx";
import {useUnit} from "effector-react";
import {$rolesStore} from "../../store/admin/roles/getRoles.ts";
import Select, {GroupBase, OptionsOrGroups, StylesConfig} from "react-select";
import {$locationsStore} from "../../store/location/getLocations.ts";
import {adminPostFx, IAddAdmin} from "../../store/admin/addAdmin.ts";
import {IAdminGet} from "../../store/admin/getAdmin.ts";
import {adminPutFx} from "../../store/admin/putAdmin.ts";
import {adminDeleteModalReset} from "../../store/admin/modalDelete.ts";
import {useHookFormMask} from "use-mask-input";

interface IFormData {
  fio: string,
  phone: string,
  email: string,
  gender?: string | null
  roles: IOption<number> | null,
  locations: IOption<string>[]
}

export interface IOption <T> {
  value: T,
  label: string
}

const schema = yupResolver(
  yup.object().shape({
    fio: yup.string()
      .required("Введите ФИО")
      .matches(/^\s*[A-Za-zА-Яа-яЁё]+(?:\s+[A-Za-zА-Яа-яЁё]+)*\s*$/u, "Поле может содержать только буквы"),
    phone: yup.string(),
    email: yup.string().email(),
    roles: yup.object().shape({
      value: yup.number().required(),
      label: yup.string().required()
    }).required("Выберите роль"),
    gender: yup.string().nullable(),
    locations: yup.array().of(
      yup.object().shape({
        value: yup.string(),
        label: yup.string()
      })
    )
  })
)

const AddEditAdmin = (props: IAddEditModal<IAdminGet>) => {
  const [roles, locations] = useUnit([$rolesStore, $locationsStore])
  const [selectedDate, setSelectedDate] = useState<Date>(props.editable?.birth_date ? new Date(props.editable.birth_date) : new Date())

  const defaultRoles = {
    value: props.editable?.roles[0].id,
    label: props.editable?.roles[0].name,
  }

  const defaultLocations = props.editable?.access_location.map(location => ({
    value: location.code,
    label: location.name
  }))

  const {
    control,
    handleSubmit,
    formState: {errors},
    register,
    watch,
  } = useForm<IFormData>({
    resolver: schema,
    defaultValues: {
      fio: props.editable?.fio || "",
      phone: props.editable?.phone || "",
      email: props.editable?.email || "",
      gender: props.editable?.gender || "",
      roles: defaultRoles || null,
      locations: defaultLocations || []
    }
  })

  const watchedRole = watch("roles");

  const optionsRoles: OptionsOrGroups<IOption<number>, GroupBase<IOption<number>>> = roles.map((role) => ({
    value: role.id,
    label: role.name,
  }));

  const optionsLocations: OptionsOrGroups<IOption<string>, GroupBase<IOption<string>>> = locations.map(location => ({
    value: location.code,
    label: location.name
  }))

  const onDateChange = (date: Date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const onSubmit = async (FormData: IFormData) => {
    const selectLocations = FormData.locations.map(elem => elem.value)
    const data: IAddAdmin = {
      fio: FormData.fio,
      phone: FormData.phone,
      email: FormData.email,
      gender: FormData.gender,
      birth_date: selectedDate.toLocaleDateString(),
      roles: [FormData.roles?.value || -1] ,
      access_location: watchedRole?.label === "Менеджер" ? selectLocations : []
    }


    if (props.editable) {
      data._method = "put";
      await adminPutFx({id: props.editable.id, data: data})
      if (adminPutFx.doneData) {
        if (props.onClose) props.onClose()
        adminDeleteModalReset()
      }
    } else {
      await adminPostFx(data)
      if (props.onClose) props.onClose()
    }
  }

  const customStyles: StylesConfig = {
    control: (base) => ({
      ...base,
      borderColor: errors.roles ? 'red' : base.borderColor,
      '&:hover': {
        borderColor: errors.roles ? 'red' : base.borderColor,
      }
    })
  };

  const registerWithMask = useHookFormMask(register)

  return (
    <Modal centered={true}
           show={props.isOpen}
           onHide={props.onClose}
    >
      <HeadModal title={props.editable ? "Изменить администратора" : "Добавить администратора"} />
      <Modal.Body className="px-4 pb-4 pt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput name="fio"
                     control={control}
                     type="text"
                     errors={errors}
                     placeholder="Введите ФИО"
                     label="ФИО"
                     register={register}
                     className="form-control"
                     containerClass={"mb-3"}
          />
          <div className="mb-3">
            <label className="form-label">Телефон</label>
            <input className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                   {...registerWithMask("phone", "+9 (999) 999-99-99")}
            />
            {errors.phone && (
              <Form.Control.Feedback className="d-block">
                {errors.phone.message}
              </Form.Control.Feedback>
            )}
          </div>
          <FormInput name="email"
                     control={control}
                     type="email"
                     errors={errors}
                     placeholder="Введите email"
                     label="Email"
                     register={register}
                     className="form-control"
                     containerClass={"mb-3"}
          />
          <Row className="mb-3">
            <Col>
              <FormInput name="gender"
                         id="male"
                         type="radio"
                         value="male"
                         control={control}
                         register={register}
                         label="Мужской"
              />
            </Col>
            <Col>
              <FormInput name="gender"
                         id="female"
                         type="radio"
                         control={control}
                         register={register}
                         value="female"
                         label="Женский"
              />
            </Col>
          </Row>
          <div className="input-group mb-3 input-group-sm ">
            <HyperDatepicker
              value={selectedDate}
              maxDate={new Date()}
              showMonthDropdown={true}
              showYearDropdown={true}
              yearDropdownItemNumber={60}
              scrollableYearDropdown={true}
              inputClass="border"
              onChange={(date) => {
                onDateChange(date);
              }}
            />
          </div>
          {roles.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label>Роли администратора</Form.Label>
              <Controller name="roles"
                          control={control}
                          render={({field}) => (
                            <Select className="react-select react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Выбрать роль"
                                    options={optionsRoles}
                                    value={field.value}
                                    styles={customStyles}
                                    onChange={(selectOption) => {
                                      field.onChange(selectOption)
                                    }}
                            />
                          )}
              />
              {errors.roles && (
                <Form.Control.Feedback type="invalid" className="d-block">
                  {errors.roles.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          )}
          {locations.length > 0 && watchedRole?.label === 'Менеджер' && (
            <Form.Group className="mb-3">
              <Form.Label>Доступ к локации</Form.Label>
              <Controller name="locations"
                          control={control}
                          render={({field}) => (
                            <Select isMulti={true}
                                    className="react-select react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Выбрать локацию"
                                    options={optionsLocations}
                                    value={field.value}
                                    onChange={(selectOption) => {
                                      field.onChange(selectOption)
                                    }}
                            />
                          )}
              />
            </Form.Group>
          )}
          <BtnForModalForm editable={!!props.editable} />
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default AddEditAdmin;