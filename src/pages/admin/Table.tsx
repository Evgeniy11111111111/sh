import Table from "../../components/Table/Table.tsx";
import {$adminStore, IAdminGet} from "../../store/admin/getAdmin.ts";
import {adminDeleteElemEvent, adminDeleteModal, adminEditModal} from "../../store/admin/modalDelete.ts";
import {useUnit} from "effector-react";
import {Card} from "react-bootstrap";

const columns = [
  {
    Header: "ФИО",
    accessor: "fio",
  },
  {
    Header: "Телефон",
    accessor: "phone",
  },
  {
    Header: "Email",
    accessor: "email",
  },
  {
    Header: "Пол",
    accessor: "gender",
  },
  {
    Header: "Роли",
    accessor: "roles",
  },
  {
    Header: "Локации",
    accessor: "locations",
  },
  {
    Header: "",
    accessor: "actions",
  }
]

interface IAdminTd {
  id: number
  fio: string,
  phone: string | null,
  email: string | null,
  gender: string | null,
  roles?: string[],
  locations?: string[]
}

interface IAdminTable {
  admins: IAdminGet[],
  openEdit: () => void
}

const AdminTable = (props: IAdminTable) => {
  const [admins] = useUnit([$adminStore])
  const openDelete = (id: number) => {
    adminDeleteElemEvent(id)
    adminDeleteModal(true)
  }

  const openEdit = (id: number) => {
    const admin = admins?.find(elem => elem.id === id) || null;
    adminEditModal(admin);
    props.openEdit()
  }

  const dataTable: IAdminTd[] = props.admins.map(elem => ({
    id: elem.id,
    fio: elem.fio,
    phone: elem.phone,
    email: elem.email,
    gender: elem.gender && elem.gender === 'male' ? "Мужской" : (elem.gender === 'female' ? "Женский" : null),
    roles: elem.roles.map(el => el.name),
    locations: elem.access_location.map(el => el.name),
    actions: <>
      <button onClick={() => {openEdit(elem.id)}} className="btn action-icon">
        <i className="mdi mdi-square-edit-outline"/>
      </button>
      <button onClick={() => {openDelete(elem.id)}} className="btn action-icon">
        <i className="mdi mdi-delete"/>
      </button>
    </>
  }))

  return (
    <Card>
      <Card.Body>
        <Table columns={columns} data={dataTable}
               tableClass="table-striped dt-responsive nowrap w-100"
        />
      </Card.Body>
    </Card>
  )
}

export default AdminTable;