import Table, {ITableColumns} from "../../components/Table/Table.tsx";
import {useUnit} from "effector-react";
import {$usersLoading, $usersMetaStore, $usersStore} from "../../store/users/getUsers.ts";
import {format, parseISO} from "date-fns";
import {usersRequestPage, usersRequestSorting} from "../../store/users/userRequestStore.ts";

interface IUsersTd {
  fio: string | null,
  birth: string | null,
  phone: string | null,
  gender: string | null,
  family?: string[]
}

const UsersTable = () => {
  const [users, meta, isLoading] = useUnit([$usersStore, $usersMetaStore, $usersLoading])

  const dataTable: IUsersTd[] = users.map(elem => ({
    fio: elem.fio,
    birth: elem.birth_date ? format(parseISO(elem.birth_date), 'dd.MM.yyyy') : null,
    phone: elem.phone,
    gender: elem.gender && elem.gender === 'male' ? "Мужской" : (elem.gender === 'female' ? "Женский" : null),
    family: elem.family ? elem.family.map(el => el.fio) : undefined
  }))

  const handlePageChange = (page: string) => {
    usersRequestPage(`page=${page}`)
  }
  const columns: ITableColumns[] = [
    {
      Header: "ФИО",
      accessor: "fio",
    },
    {
      Header: "Дата рождения",
      accessor: "birth",
      sort: () => {
        usersRequestSorting("birth_date");
      }
    },
    {
      Header: "Телефон",
      accessor: "phone",
    },
    {
      Header: "Пол",
      accessor: "gender",
    },
    {
      Header: "Семья",
      accessor: "family",
    },
  ]

  return (
    <Table columns={columns}
           data={dataTable}
           pagination={meta.last_page}
           pageChange={handlePageChange}
           currentPage={meta.current_page}
           loading={isLoading}
    />
  )
}

export default UsersTable;