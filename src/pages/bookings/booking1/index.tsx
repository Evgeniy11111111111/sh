import {useUnit} from "effector-react";
import {$locationsStore} from "../../../store/location/getLocations.ts";
import {useLocation} from "react-router-dom";
import {
  $bookingIsLoadingCombine,
  $bookingsStore, $bookingsVariantsMainStore,
  $bookingsVariantsMainTimeRange, $bookingsVariantsMainWorkRangeStore,
  bookingReset, bookingsGetFx,
  bookingsStructureFx, bookingsVariantsMainFx
} from "../../../store/bookings/getBookings.ts";
import {useEffect, useRef, useState} from "react";
import {Button, Card, Col, Row} from "react-bootstrap";
import AddEditBookingModal from "../Modal2.tsx";
import Calendar from "./Calendar.tsx";
import {IBooking, IBookingVariants} from "../../../store/bookings/interfaceBooking.ts";
import {EventClickArg, EventInput} from "@fullcalendar/core";
import {IUserGet} from "../../../store/users/getUsers.ts";
import FullCalendar from "@fullcalendar/react";
import HyperDatepicker from "../../../components/Datepicker.tsx";
import {formatMinutesToTimeString, stringToTime} from "../../../utils/date.ts";
import {$bookingDeleteElem, $bookingIsOpen, bookingDeleteModalReset} from "../../../store/bookings/modalDelete.ts";
import ModalDelete from "../../../components/ModalDelete.tsx";
import {bookingDeleteFx} from "../../../store/bookings/removeBookings.ts";
import AddEditRopeModalPark from "../RopeParkModal.tsx";
import ChildrenActivitiesModal from "../ChildrenActivitesModal.tsx";
import AddEditQuestModal from "../QuestModal.tsx";
import AddEditRockWall from "../RockWallModal.tsx";
import ModalInfoBooking from "../ModalInfo.tsx";

interface IBookingsToEvent {
  id: string,
  title: string,
  user: IUserGet,
  start: string,
  count_people: number,
  end: string,
  backgroundColor: string,
  className: string
  booking: IBooking
  comment?: string
  peoples?: {
    adult: string,
    children: string
  }
}

const bookingsToEvents = (bookings: IBooking[]): EventInput[] => {
  return bookings.map(booking => {
    const data: IBookingsToEvent = {
      id: String(booking.id),
      title: booking.user?.fio || "",
      user: booking.user,
      start: booking.started_at,
      count_people: booking.count_people,
      comment: booking.comment || '',
      peoples: booking.peoples || undefined,
      end: booking.ended_at,
      backgroundColor: booking.styles?.["background-color"] || "",
      className: "",
      booking: booking
    }
    return data;
  })
}

const bookingsVariantToEvents = (bookingsVariant: IBookingVariants[]): EventInput[] => {
  return bookingsVariant
    .filter(elem => {
      if (elem.is_closed && elem.closed_label === "Забронированно другой локацией") {
        return elem
      }
    })
    .map(elem => {
      const data = {
        title: "Забронировано другой локацией",
        start: elem.started_at,
        end: elem.ended_at,
        className: "bg-dark"
      }
      return data
    });
};

export interface IEventEdit {
  id: number,
  started_at: Date | null,
  ended_at: Date | null,
  user: IUserGet,
  count_people: number,
  type_code?: string,
  quest_code?: string
  tables?: number[],
  children_activity_package?: string
  comment?: string
  peoples?: {
    "adult": string,
    "children": string
  }
}

const Booking1 = () => {
  const [
    locations,
    bookings,
    workRange,
    timeRange,
    openDelete,
    elemDelete,
    loadingBookings,
    bookingsVariant
  ] = useUnit([
    $locationsStore,
    $bookingsStore,
    $bookingsVariantsMainWorkRangeStore,
    $bookingsVariantsMainTimeRange,
    $bookingIsOpen,
    $bookingDeleteElem,
    $bookingIsLoadingCombine,
    $bookingsVariantsMainStore
  ])

  const [showModal, setShowModal] = useState<boolean>(false);
  const [events, setEvents] = useState<EventInput[]>([...bookingsToEvents(bookings), ...bookingsVariantToEvents(bookingsVariant)])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editBooking, setEditBooking] = useState<IEventEdit | null>(null);
  const [isShowInfo, setShowInfo] = useState<boolean>(false);

  const calendarRef = useRef<FullCalendar>(null);

  const locationHook = useLocation()
  const pathname = locationHook.pathname
  const segment = pathname.split("/").slice(-1)[0]

  const currentLocation = locations.find(elem => elem.code === segment)

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditBooking(null)
  }

  const onEventClick = (arg: EventClickArg) => {
    // if (arg.event.start && new Date() > arg.event.start) return false
    if (arg.event.title === "Забронировано другой локацией") return false
    const event: IEventEdit = {
      id: Number(arg.event.id),
      started_at: arg.event.start,
      ended_at: arg.event.end,
      user: arg.event.extendedProps.user,
      count_people: arg.event.extendedProps.count_people,
      comment: arg.event.extendedProps.comment,
      peoples: arg.event.extendedProps.peoples
    }

    if (arg.event.extendedProps.booking.children_activity_package) {
      event.children_activity_package = arg.event.extendedProps.booking.children_activity_package
    }

    if (arg.event.extendedProps.booking.quest_code) {
      event.quest_code = arg.event.extendedProps.booking.quest_code
    }

    if (arg.event.extendedProps.booking.type_code) {
      event.type_code = arg.event.extendedProps.booking.type_code
    }


    setEditBooking(event)
    if (arg.event.start && new Date() > arg.event.start) {
      setShowInfo(true)
    } else {
      setShowModal(true)
    }
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    if (calendarRef.current) {
      calendarRef.current.getApi().gotoDate(date)
    }
  }

  const handleDatesSet = (arg: any) => {
    setSelectedDate(arg.start);
  }

  const closeDelete = () => {
    bookingDeleteModalReset()
  }

  const prev = () => {
    if (loadingBookings) return false;
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setSelectedDate(prevDate);
    if (calendarRef.current) {
      calendarRef.current.getApi().gotoDate(prevDate)
    }
  }

  const next = () => {
    if (loadingBookings) return false;
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() + 1);
    setSelectedDate(prevDate);
    if (calendarRef.current) {
      calendarRef.current.getApi().gotoDate(prevDate)
    }
  }


  const today = () => {
    if (loadingBookings) return false;
    setSelectedDate(new Date());
    if (calendarRef.current) {
      calendarRef.current.getApi().gotoDate(new Date())
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

  const closeShowModal = () => {
    setShowInfo(false)
    setEditBooking(null)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    bookingReset();
    (async () => {
      await bookingsStructureFx(segment)
    })()

  }, [pathname]);

  useEffect(() => {
    const fetchData = async () => {
      await bookingsVariantsMainFx({booking: segment, date: String(selectedDate.toLocaleDateString())})
      await bookingsGetFx({booking: segment, date: String(selectedDate.toLocaleDateString())})
    }
    fetchData()

  }, [selectedDate]);

  useEffect(() => {
    setEvents([...bookingsToEvents(bookings), ...bookingsVariantToEvents(bookingsVariant)]);
  }, [bookings, bookingsVariant]);

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
              <Row className="mb-3">
                <Col lg={3} md={6}>
                  <Button className="btn btn-lg font-16 btn-primary w-100"
                          onClick={openModal}
                  >
                    <i className="mdi mdi-plus-circle-outline"></i>Создать новую запись
                  </Button>
                </Col>
                <div className="d-inline-block z-3 col-auto input-group-sm ">
                  <HyperDatepicker
                    value={selectedDate}
                    inputClass="border"
                    onChange={(date) => {
                      handleDateChange(date);
                    }}
                  />
                </div>
              </Row>
              <Row>
                <Calendar events={events || []}
                          onEventClick={onEventClick}
                          ref={calendarRef}
                          onDatesSet={handleDatesSet}
                          slotDuration={timeRange ? formatMinutesToTimeString(timeRange) : undefined}
                          slotMinTime={workRange ? stringToTime(workRange?.started_at) : undefined}
                          slotMaxTime={workRange ? stringToTime(workRange?.ended_at) : undefined}
                          todayFunction={today}
                          nextFunction={next}
                          prevFunction={prev}
                />
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {showModal && segment === "quest" ? (
        <AddEditQuestModal selectedDate={selectedDate.toLocaleDateString()}
                           location={segment}
                           isOpen={showModal}
                           onClose={closeModal}
                           editable={editBooking}
        />
      ) : showModal && segment === "rope_park" ? (
        <AddEditRopeModalPark selectedDate={selectedDate.toLocaleDateString()}
                              location={segment}
                              isOpen={showModal}
                              onClose={closeModal}
                              editable={editBooking}
        />
      ) : showModal && segment === "children_activities" ? (
        <ChildrenActivitiesModal location={segment}
                                 isOpen={showModal}
                                 onClose={closeModal}
                                 selectedDate={selectedDate.toLocaleDateString()}
                                 editable={editBooking}
        />
      ) : showModal && segment === "rock_wall" ? (
        <AddEditRockWall location={segment}
                         selectedDate={selectedDate.toLocaleDateString()}
                         editable={editBooking}
                         isOpen={showModal}
                         onClose={closeModal}
        />
      ) : showModal ? (
        <AddEditBookingModal selectedDate={selectedDate.toLocaleDateString()}
                             location={segment}
                             isOpen={showModal}
                             onClose={closeModal}
                             editable={editBooking}
        />
      ) : null}
      {openDelete && <ModalDelete isOpen={openDelete}
                                  onClose={closeDelete}
                                  handleDelete={handleRemove}
      />}

      {isShowInfo && <ModalInfoBooking isOpen={isShowInfo} segment={segment} onClose={closeShowModal} variant={editBooking} />}
    </>
  )
}
export default Booking1;