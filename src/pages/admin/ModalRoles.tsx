import {IAddEditModal} from "../../interface/modal.ts";
import {Form, Modal} from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {Controller, useForm} from "react-hook-form";
import {IOption} from "../admin/Modal.tsx";
import FormInput from "../../components/FormInput.tsx";
import Select, {GroupBase, OptionsOrGroups} from "react-select";
import {useUnit} from "effector-react";
import {$permissionsStore} from "../../store/admin/roles/getPermissions.ts";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import {IAddRoles, rolesPostFx, rolesPostReset} from "../../store/admin/roles/addRoles.ts";
import {IRolesGet} from "../../store/admin/roles/getRoles.ts";
import {rolesPutFx, rolesPutReset} from "../../store/admin/roles/putRoles.ts";
import {$rolesIsOpen, rolesDeleteElemEvent, rolesDeleteModal} from "../../store/admin/roles/modalRoles.ts";

interface IFormData {
  name: string,
  permissions: IOption<number>[]
}

const schema = yupResolver(
  yup.object().shape({
    name: yup.string().required("Введите название роли"),
    permissions: yup.array().of(
      yup.object().shape({
        value: yup.number(),
        label: yup.string()
      })
    )
  })
)

const AddEditRoles = (props: IAddEditModal<IRolesGet>) => {
  const [permissions, isOpenDelete] = useUnit([$permissionsStore, $rolesIsOpen])

  const defaultsPermissions = props.editable?.permissions?.map(elem => ({
    value: elem.id,
    label: elem.label
  }))

  const {control,  handleSubmit, formState: {errors}, register} = useForm<IFormData>({
    resolver: schema,
    defaultValues: {
      name: props.editable?.name || "",
      permissions: defaultsPermissions || []
    }
  })

  const optionPermissions: OptionsOrGroups<IOption<number>, GroupBase<IOption<number>>>  = permissions.map((permission) => ({
    value: permission.id,
    label: permission.label
  }))

  const onSubmit = async (FormData: IFormData) => {
    const selectedPermissions = FormData.permissions.map(elem => elem.value)
    const data: IAddRoles = {
      name: FormData.name,
      permissions: selectedPermissions
    }

    if (props.editable) {
      data._method = "put"
      await rolesPutFx({id: props.editable.id, data: data})
      if (rolesPutFx.doneData) {
        if (props.onClose) props.onClose()
        rolesPutReset()
      }
    } else {
      await rolesPostFx(data)
      if (rolesPostFx.doneData) {
        if (props.onClose) props.onClose()
        rolesPostReset()
      }

    }
  }

  const openDelete = () => {
    if (props.editable) {
      rolesDeleteElemEvent(props.editable.id)
      rolesDeleteModal(true)
    }
  }

  return (
    <Modal style={{zIndex: isOpenDelete ? "1000": ""}} centered={true} show={props.isOpen} onHide={props.onClose}>
      <HeadModal title={props.editable ? "Изменить роль" : "Добавить роль"} />
      <Modal.Body className="px-4 pb-4 pt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput name="name"
                     control={control}
                     type="text"
                     errors={errors}
                     placeholder="Введите название роли администратора"
                     label="Название роли администратора"
                     register={register}
                     className="form-control"
                     containerClass="mb-3"
          />
          {permissions.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label>Список прав</Form.Label>
              <Controller name="permissions"
                          control={control}
                          render={({field}) => (
                            <Select isMulti={true}
                                    className="react-select react-select-container"
                                    classNamePrefix="react-select"
                                    options={optionPermissions}
                                    placeholder="Выбрать права"
                                    value={field.value}
                                    onChange={(selectOption) => {
                                      field.onChange(selectOption)
                                    }}
                            />
                          )}
              />
              {errors.permissions && (
                <Form.Control.Feedback type="invalid" className="d-block">
                  {errors.permissions.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          )}
          <BtnForModalForm editable={!!props.editable} onClickDelete={openDelete} />
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default AddEditRoles;