import {useUnit} from "effector-react";
import {$giftLoading, $giftMetaStore, $giftStore} from "../../store/gift/getGift.ts";
import Table from "../../components/Table/Table.tsx";
import {format, parseISO} from "date-fns";
import classNames from "classnames";
import {giftDeleteElemEvent, giftDeleteModal, giftEditModal, giftImageModal} from "../../store/gift/modal.ts";
import {giftsRequestPage, giftsRequestSorting} from "../../store/gift/giftRequestStore.ts";

interface IGiftTd {
  certificate: number,
  sum: string,
  ended_at: string,
}

const columns = [
  {
    Header: "Номер",
    accessor: "certificate",
  },
  {
    Header: "ФИО Владельца",
    accessor: "owner",
  },
  {
    Header: "Сумма",
    accessor: "sum",
  },
  {
    Header: "Дата окончания",
    accessor: "ended_at",
  },
  {
    Header: "Статус",
    accessor: "status",
    sort: () => {
      giftsRequestSorting("status");
    }
  },
  {
    Header: "",
    accessor: "actions"
  }
]

interface IGiftTable {
  openModal: () => void
  openImageModal: () => void
}
const GiftTable = (props: IGiftTable) => {
  const [gifts, meta, isLoading] = useUnit([$giftStore, $giftMetaStore, $giftLoading])

  const openDelete = (id: number) => {
    giftDeleteElemEvent(id)
    giftDeleteModal(true)
  }

  const openEdit = (id: number) => {
    const gift = gifts?.find(elem => elem.id === id) || null
    giftEditModal(gift)
    props.openModal()
  }

  const openImageModal = (id: number) => {
    const gift = gifts?.find(elem => elem.id === id) || null
    giftImageModal(gift?.template.image || null)
    props.openImageModal()
  }

  const handlePageChange = (page: string) => {
    giftsRequestPage(`page=${page}`)
  }

  const dataTable: IGiftTd[] = gifts.map(elem => ({
    certificate: elem.id,
    owner: elem.owner.fio,
    sum: elem.sum > 0 ? elem.sum + ' ₽' : '',
    ended_at: format(parseISO(elem.ended_at), 'dd.MM.yyyy'),
    status: <>
      <span
        className={classNames("badge", {
          "badge-soft-success": elem.status.code === "active",
          "badge-soft-danger": elem.status.code === "cancelled",
        })}
      >
        {elem.status.name}
      </span>
    </>,
    actions: <div className="float-end">
      <button onClick={() => {openImageModal(elem.id)}} className="btn action-icon">
        <i className="mdi mdi-eye"></i>
      </button>
      <button onClick={() => {openEdit(elem.id)}} className="btn action-icon">
        <i className="mdi mdi-square-edit-outline"/>
      </button>
      <button onClick={() => {openDelete(elem.id)}} className="btn action-icon">
        <i className="mdi mdi-delete"/>
      </button>
    </div>
  }))

  return (
    <Table columns={columns}
           data={dataTable}
           tableClass="table-striped dt-responsive nowrap w-100"
           pageChange={handlePageChange}
           pagination={meta.last_page}
           currentPage={meta.current_page}
           loading={isLoading}
    />
  )
}

export default GiftTable;