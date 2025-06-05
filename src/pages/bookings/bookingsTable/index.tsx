import {useUnit} from "effector-react";
import {$locationsStore} from "../../../store/location/getLocations.ts";
import {useLocation} from "react-router-dom";
import {Button, ButtonGroup, Card, Col, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import HyperDatepicker from "../../../components/Datepicker.tsx";
import AddEditBookingModalTime from "../Modal.tsx";
import {
  $bookingsLoading,
  $bookingsStore, $bookingsStructureStore,
  bookingReset,
  bookingsGetFx,
  bookingsStructureFx,
  bookingsVariantsMainFx
} from "../../../store/bookings/getBookings.ts";
import {IBooking} from "../../../store/bookings/interfaceBooking.ts";
import classNames from "classnames";
import {getTimeFormatedDate} from "../../../utils/date.ts";
import {$bookingDeleteElem, $bookingIsOpen, bookingDeleteModalReset} from "../../../store/bookings/modalDelete.ts";
import ModalDelete from "../../../components/ModalDelete.tsx";
import {bookingDeleteFx} from "../../../store/bookings/removeBookings.ts";
import ModalAddTable from "./ModalAdd.tsx";
import ModalInfoTable from "./ModalInfoTable.tsx";

export interface TableBookingProps extends IBooking{
  table: number
}

const BookingsTable = () => {
  const [
    locations,
    bookings,
    loadingBookings,
    structure,
    openDelete,
    elemDelete,
  ] = useUnit([
    $locationsStore,
    $bookingsStore,
    $bookingsLoading,
    $bookingsStructureStore,
    $bookingIsOpen,
    $bookingDeleteElem,
  ])

  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tablesObjects, setTablesObjects] = useState<{[key: number]:TableBookingProps}>({})
  const [edit, setEdit] = useState<TableBookingProps | null>(null)
  const [tableAdd, setTableAdd] = useState<number | null>(null)
  const [isShowInfo, setShowInfo] = useState<boolean>(false);

  const locationHook = useLocation();
  const pathname = locationHook.pathname
  const segment = pathname.split('/').slice(-1)[0]

  const currentLocation = locations.find(elem => elem.code === segment)

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEdit(null)
  }

  const closeDelete = () => {
    bookingDeleteModalReset()
  }

  const openModalAdd = (table: number) => {
    const time = new Date()
    const selectedDataTime = new Date(selectedDate).setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds())
    if (selectedDataTime < time.getTime()) return
    setTableAdd(table)
  }

  const closeModalAdd = () => {
    setTableAdd(null)
  }

  const handleDateChange = (date: Date) => {
    if (date) setSelectedDate(date)
  }

  const prev = () => {
    setSelectedDate(prevState => {
      const prevDate = new Date(prevState);
      prevDate.setDate(prevDate.getDate() - 1);
      return prevDate;
    });
  }

  const next = () => {
    setSelectedDate(prevState => {
      const prevDate = new Date(prevState);
      prevDate.setDate(prevDate.getDate() + 1);
      return prevDate;
    });
  }

  const today = () => {
    setSelectedDate(new Date());
  }

  const onEditClick = (elem: TableBookingProps) => {
    setEdit(elem)
    if (new Date() > new Date(elem.started_at)) {
      setShowInfo(true)
    } else {
      setShowModal(true)
    }
  }

  const handleRemove = async () => {
    if (elemDelete) {
      await bookingDeleteFx(elemDelete).then(async () => {
        await bookingsVariantsMainFx({
          booking: segment,
          date: String(selectedDate.toLocaleDateString())
        })
      }).then(async () => {
        await bookingsGetFx({
          booking: segment,
          date: String(selectedDate.toLocaleDateString())
        })
      })

      if (bookingDeleteFx.doneData) {
        closeModal()
        closeDelete()
      }
    }
  }

  const closeInfo = () => {
    setShowInfo(false)
    setEdit(null)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    bookingReset()
    bookingsStructureFx(segment)
  }, [pathname]);

  useEffect(() => {
    bookingsVariantsMainFx({booking: segment, date: String(selectedDate.toLocaleDateString())})
      .then(async () => {
        await bookingsGetFx({booking: segment, date: String(selectedDate.toLocaleDateString())})
      })
  }, [selectedDate, pathname]);

  useEffect(() => {
    const tableUsage: {[key: number]:TableBookingProps}  = {}

    bookings.forEach(booking => {
      booking.tables?.forEach(elem => {
        tableUsage[elem] = {
          ...booking,
          table: elem
        }
      })
    })

    setTablesObjects(tableUsage)

  }, [bookings]);

  return (
    <>
      <Row>
        <Col>
          <div className="page-title-box">
            <h4 className="page-title">{currentLocation?.name}</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="align-items-center mb-3 row-gap-2">
                <Col lg={3}>
                  <Button className="btn btn-lg font-16 btn-primary w-100"
                          onClick={openModal}
                  >
                    <i className="mdi mdi-plus-circle-outline"></i>Создать новую запись
                  </Button>
                </Col>
                <Col lg={9}>
                  <Row className="justify-content-between align-items-center row-gap-1">
                    <ButtonGroup className="col-auto">
                      <Button disabled={loadingBookings} onClick={prev} size="sm">
                        Предыдущий
                      </Button>
                      <Button disabled={loadingBookings} onClick={next} size="sm">
                        Следующий
                      </Button>
                    </ButtonGroup>
                    <div className="d-inline-block col-auto input-group-sm ">
                      <HyperDatepicker
                        value={selectedDate}
                        inputClass="border"
                        onChange={(date) => {
                          handleDateChange(date);
                        }}
                      />
                    </div>
                    <div className="col-auto">
                      <Button disabled={loadingBookings} onClick={today} className="col-auto" size="sm">
                        Сегодня
                      </Button>
                    </div>
                  </Row>
                </Col>

              </Row>
              <div style={{minHeight: '150px'}} className="position-relative">
                <Row className="row-gap-2">
                  {(structure && structure.tables && Array.isArray(structure.tables.values) ? structure.tables.values : []).map((item, index) => {

                    const activeELem = tablesObjects[item.code]

                    return (
                      <Col className="d-flex flex-column justify-content-between h-auto" key={"table" + segment + index + item.code} xs={6} lg={4} xl={3}>
                        <Row onClick={activeELem !== undefined ?() => {onEditClick(activeELem)} : () => {openModalAdd(Number(item.code))}} className="mx-0 flex-grow-1 flex-column justify-content-between h-100 bg-light">
                          <Col className={classNames("d-flex flex-column", {'bg-warning': activeELem})}>
                            <p className="text mb-1">
                              {item.name}
                            </p>
                            {activeELem && activeELem.started_at ? (
                              <div>{getTimeFormatedDate(activeELem.started_at)}</div>
                            ) : null}
                            {activeELem && activeELem.user && activeELem.user.fio ? (
                              <div>{activeELem.user.fio}</div>
                            ) : null}
                            {
                              activeELem && activeELem.count_people ? (
                                <div>Количество человек: {activeELem.count_people}</div>
                              ) : null
                            }
                          </Col>
                        </Row>
                      </Col>
                    )
                  })}
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {showModal ? (
        <AddEditBookingModalTime location={segment}
                                 selectedDate={selectedDate.toLocaleDateString()}
                                 isOpen={showModal}
                                 onClose={closeModal}
                                 editable={edit}
        />
      ) : null}
      {openDelete && <ModalDelete isOpen={openDelete}
                                  onClose={closeDelete}
                                  handleDelete={handleRemove}
      />}
      {tableAdd && tableAdd > 0 ? (
        <ModalAddTable selectedDate={selectedDate.toLocaleDateString()}
                       isOpen={tableAdd > 0}
                       onClose={closeModalAdd}
                       table={tableAdd}
                       location={segment}
        />
      ) : null}
      {isShowInfo && (
        <ModalInfoTable isOpen={isShowInfo} onClose={closeInfo} variant={edit} />
      )}
    </>
  )
}

export default BookingsTable;