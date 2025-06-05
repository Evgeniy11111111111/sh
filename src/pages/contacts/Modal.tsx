import {Form, Modal} from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import Select, {SingleValue} from "react-select";
import {ChangeEvent, useState} from "react";
import FormInput from "../../components/FormInput.tsx";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from 'yup';
import {Controller, ControllerRenderProps, useForm} from "react-hook-form";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import {formatPhoneNumber, regPhone} from "../../utils/phoneINputFunc.ts";
import {contactsPostFx, contactsPostReset, IAddContact} from "../../store/contacts/addContact.ts";
import {contactsPutFx, contactsPutReset} from "../../store/contacts/putContact.ts";
import {IContactsGetData} from "../../store/contacts/getContacts.ts";
import {$contactsIsOpen, contactsDeleteElemEvent, contactsDeleteModal} from "../../store/contacts/modalContacts.ts";
import {useUnit} from "effector-react";
import {IAddEditModal} from "../../interface/modal.ts";

interface IOptionsType {
  label: string,
  value: string,
  type: TInputType
}

type TInputType = 'text' | 'email' | "phone"

const optionsType: IOptionsType[] = [
  {
    label: "Телефон",
    value: "phone",
    type: "phone"
  },
  {
    label: 'Почта',
    value: 'email',
    type: "email"
  },
  {
    label: "Адрес",
    value: 'address',
    type: "text"
  },
  {
    label: "Telegram",
    value: 'tg',
    type: "text"
  },
  {
    label: "VK",
    value: 'vk',
    type: "text"
  },
  {
    label: "WhatsApp",
    value: 'whatsapp',
    type: "text"
  },
  {
    label: "Viber",
    value: 'viber',
    type: "text"
  },
  {
    label: "Instagram",
    value: 'instagram',
    type: "text"
  },
  {
    label: "YouTube",
    value: 'youtube',
    type: "text"
  },
]

interface IFormData {
  contacts: string
}

function checkSelected (slug: string) {
  return  optionsType.find(elem => elem.value === slug)
}

const AddEditContacts = (props: IAddEditModal<IContactsGetData>) => {
  const [deleteOpen] = useUnit([$contactsIsOpen])
  const [selected, setSelected] = useState<IOptionsType | null>(props.editable && props.editable.slug ? checkSelected(props.editable?.slug) || null : null)
  const changeSelect = (select: SingleValue<IOptionsType>) => {
    setSelected(select)
  }

  const schema = yupResolver(
    yup.object().shape({
      contacts: selected?.type === "text" ? yup.string().required(`Введите ${selected.label}`) :
        selected?.type === "email" ? yup.string().email('Введите корректный email').required(`Введите ${selected.label}`) :
          selected?.type === "phone" ? yup.string().matches(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, 'Введите корректный номер телефона').required(`Введите ${selected.label}`) :
            yup.string().required('Это поле обязательно')
    })
  )

  const { control, handleSubmit, formState: { errors }, register } = useForm<IFormData>({
    resolver: schema,
  });

  const onSubmit = async (FormData: IFormData) => {
    const data: IAddContact = {
      slug: selected?.value,
      label: selected?.label,
      value: FormData.contacts
    }
    if (props.editable) {
      data._method = "put"
      await contactsPutFx({id: props.editable.id, data: data})
      if (props.onClose) props.onClose()
      contactsPutReset()
    } else {
      await contactsPostFx(data)
      if (contactsPostFx.doneData) {
        if (props.onClose) props.onClose()
        contactsPostReset()
      }
    }
  }

  const handleCustomChange = (event: ChangeEvent<HTMLInputElement>, field: ControllerRenderProps<IFormData, "contacts">) => {

    field.onChange(formatPhoneNumber(regPhone(event.target.value))); // Call the default onChange method to keep the form state updated
  };

  const openDelete = () => {
    if (props.editable) {
      contactsDeleteElemEvent(props.editable.id)
      contactsDeleteModal(true)
    }
  }

  return (
    <Modal centered={true} style={{zIndex: deleteOpen ? "1000" : ""}} show={props.isOpen} onHide={props.onClose}>
      <HeadModal title={props.editable ? "Изменить контакт" : "Добавить контакт"} />
      <Modal.Body className="px-4 pb-4 pt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>Выберите тип контакта</Form.Label>
            <Select  defaultValue={selected}
                    className="react-select react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Выбрать тип контакта"
                    options={optionsType}
                    name="type-contacts"
                    onChange={(selectOption) => {changeSelect(selectOption)}}
            />
          </Form.Group>
          {
            selected && <>
            {selected.type === "phone" ? (
              <div className="mb-3">
                <label className="form-label">{selected.label}</label>
                <Controller
                  name="contacts"
                  control={control}
                  defaultValue={props.editable?.value}
                  render={({ field }) => (
                    <input className={`form-control ${errors.contacts ? 'is-invalid' : ''}`} {...field} onChange={(e) => handleCustomChange(e, field)}/>
                  )}
                />
                {errors.contacts && (
                  <Form.Control.Feedback className="d-block">
                    {errors.contacts.message}
                  </Form.Control.Feedback>
                )}
              </div>
              ) : (
              <FormInput name="contacts"
                         key="contactsInput"
                         control={control}
                         type={selected.type}
                         placeholder={`Введите ${selected.label}`}
                         errors={errors}
                         defaultValue={props.editable?.value}
                         label={selected.label}
                         register={register}
                         className="form-control"
                         containerClass={"mb-3"}
              />
            )}

              <BtnForModalForm editable={!!props.editable} onClickDelete={openDelete}/>
            </>
          }
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default AddEditContacts;