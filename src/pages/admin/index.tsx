import HeadPage from "../../components/HeadPage.tsx";
import {useEffect, useState} from "react";
import AddEditAdmin from "./Modal.tsx";
import {$rolesStore, rolesGetFx} from "../../store/admin/roles/getRoles.ts";
import {$adminStore, adminGetFx} from "../../store/admin/getAdmin.ts";
import {useUnit} from "effector-react";
import AdminTable from "./Table.tsx";
import {$adminDeleteElem, $adminIsEdit, $adminIsOpen, adminDeleteModalReset} from "../../store/admin/modalDelete.ts";
import ModalDelete from "../../components/ModalDelete.tsx";
import {adminDeleteFx} from "../../store/admin/removeAdmin.ts";
import {permissionsGetFx} from "../../store/admin/roles/getPermissions.ts";
import {Card, Col, Row} from "react-bootstrap";
import {arrayToString} from "../../utils";

const Admin = () => {
  const [admins, deleteOpen, elemDelete, edit, roles] = useUnit([
    $adminStore, $adminIsOpen, $adminDeleteElem, $adminIsEdit, $rolesStore
  ])

  const [showModal, setShowModal] = useState(false)
  // const [showRolesModal, setShowRolesModal] = useState<boolean>(false)
  // const [editRoles, setEditRoles] = useState<IRolesGet | null>(null)


  const openModal = () => {
    setShowModal(true)
  }

  // const openRolesModal = () => {
  //   setShowRolesModal(true)
  // }

  // const openRolesEditModal = (id: number) => {
  //   const role = roles && roles.find(elem => {
  //     if (elem.id === id) return elem
  //     return null
  //   })
  //   setEditRoles(role || null)
  //   setShowRolesModal(true)
  //
  // }

  const closeModal = () => {
    setShowModal(false)
    adminDeleteModalReset()
  }

  // const closeRolesModal = () => {
  //   setShowRolesModal(false)
  //   setEditRoles(null)
  // }

  const closeDelete = () => {
    adminDeleteModalReset()
  }

  const handleRemove = async () => {
    if (elemDelete) {
      await adminDeleteFx(elemDelete)

      if (adminDeleteFx.doneData) {
        closeDelete()
      }
    }
  }

  // const handleRemoveRoles = async () => {
  //   if (elemDeleteRoles) {
  //     await rolesDeleteFx(elemDeleteRoles)
  //     closeRolesModal()
  //     rolesDeleteModalReset()
  //   }
  // }
  //
  // const closeDeleteRoles = () => {
  //   rolesDeleteModalReset()
  // }

  useEffect(() => {
    window.scrollTo(0, 0)
    adminGetFx()
    permissionsGetFx()
    rolesGetFx()
  }, []);

  return (
    <>
      <HeadPage title="Администраторы" onClick={openModal} textBtn="Добавить администратора" />
      <AdminTable admins={admins} openEdit={openModal} />
      <Row className="pt-4 mb-2">
        <h4>Роли администратора</h4>
      </Row>
      <Row>
        {(roles || []).map((elem, index) => (
          <Col key={elem.name + elem.id + index} className="d-flex" xl={4} md={6}>
            <Card className="border shadow-none w-100 justify-content-center">
              <div className="p-2">
                <Row className="align-items-center">
                  <Col className="col-auto pe-0">
                    <div className="avatar-sm">
                      <span className="avatar-title bg-light text-secondary rounded">
                        <i className="mdi mdi-account-edit"></i>
                      </span>
                    </div>
                  </Col>
                  <Col>
                    <p className="mb-0 font-13">{elem.name}</p>
                    <p className="text-muted mb-0 fw-bold">
                      {arrayToString(elem.permissions?.map(el => el.label))}
                    </p>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      {showModal && <AddEditAdmin isOpen={showModal}
                                  onClose={closeModal}
                                  editable={edit}

                    />
      }
      {deleteOpen && <ModalDelete isOpen={deleteOpen}
                                  onClose={closeDelete}
                                  handleDelete={handleRemove}
                                  title="Вы уверены, что хотите удалить администратора?"
                     />
      }
      {/*{showRolesModal && <AddEditRoles isOpen={showRolesModal}*/}
      {/*                                 onClose={closeRolesModal}*/}
      {/*                                 editable={editRoles}*/}
      {/*                   />*/}
      {/*}*/}
      {/*{isDeleteOpenRoles && <ModalDelete isOpen={isDeleteOpenRoles}*/}
      {/*                                   onClose={closeDeleteRoles}*/}
      {/*                                   handleDelete={handleRemoveRoles}*/}
      {/*                                   title="Вы уверены, что хотите удалить роль администратора?"*/}
      {/*/>*/}
      {/*}*/}
    </>
  )
}

export default Admin;