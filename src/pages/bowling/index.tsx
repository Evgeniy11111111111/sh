import {Fragment, useEffect, useMemo, useState} from "react";
import {
  $bookingIsLoadingCombine, $bookingsStore,
  $bookingsVariantsMainStore, $bookingsVariantsMainWorkRangeStore,
  bookingReset, bookingsGetFx,
  bookingsStructureFx,
  bookingsVariantsMainFx
} from "../../store/bookings/getBookings.ts";
import {useUnit} from "effector-react";
import {Button, ButtonGroup, Card, Col, OverlayTrigger, Row, Spinner, Tooltip} from "react-bootstrap";
import HyperDatepicker from "../../components/Datepicker.tsx";
import AddEditBowling from "./Modal.tsx";
import classNames from "classnames";
import {getTimeFormatedDate, splitIntoHourIntervals} from "../../utils/date.ts";
import {IBooking, IBookingVariants} from "../../store/bookings/interfaceBooking.ts";
import ModalInfo from "../karting/ModalInfo.tsx";
import {$bookingDeleteElem, $bookingIsOpen, bookingDeleteModalReset} from "../../store/bookings/modalDelete.ts";
import {bookingDeleteFx} from "../../store/bookings/removeBookings.ts";
import ModalDelete from "../../components/ModalDelete.tsx";
import ModalAddBowling from "./ModalAdd.tsx";

export interface IVariantOpen {
  variant: IBookingVariants;
  track: number
}

const Bowling = () => {
  const [
    variants, bookings, loadingBookings ,deleteOpen, elemDelete, workRange
  ] = useUnit([
    $bookingsVariantsMainStore, $bookingsStore, $bookingIsLoadingCombine, $bookingIsOpen, $bookingDeleteElem, $bookingsVariantsMainWorkRangeStore
  ])

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showModalInfo, setShowModalInfo] = useState<boolean>(false);
  const [bookingOpen, setBookingOpen] = useState<IBooking | null>(null);
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [variantOpen, setVariantOpen] = useState<IVariantOpen | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const openModal = () => {
    setShowModal(true);
  }

  const closeModal = () => {
    setShowModal(false);
  }

  const openModalInfo = (booking: IBooking) => {
    setBookingOpen(booking);
    setShowModalInfo(true)
  }

  const closeModalInfo = () => {
    setBookingOpen(null);
    setShowModalInfo(false)
  }

  const openModalAdd = (variant: IBookingVariants, track: number) => {
    if (variant.is_closed) return
    setVariantOpen({variant: variant, track: track})
    setShowModalAdd(true)
  }

  const closeModalAdd = () => {
    setVariantOpen(null)
    setShowModalAdd(false)
  }

  const closeDelete = () => {
    bookingDeleteModalReset()
  }

  const handleRemove = async () => {
    if (elemDelete) {
      await bookingDeleteFx(elemDelete).then(async () => {
        await bookingsVariantsMainFx({
          booking: "bowling",
          date: String(selectedDate.toLocaleDateString())
        })
      }).then(async () => {
        await bookingsGetFx({
          booking: "bowling",
          date: String(selectedDate.toLocaleDateString())
        })
      })

      if (bookingDeleteFx.doneData) {
        closeModalInfo()
        closeDelete()
      }
    }
  }

  const onDateChange = (date: Date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

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

  useEffect(() => {
    bookingReset()
    bookingsStructureFx("bowling")
    window.scrollTo(0, 0)
  }, [location]);

  useEffect(() => {
    bookingsVariantsMainFx({booking: "bowling", date: String(selectedDate.toLocaleDateString())})
      .then(async () => {
      await bookingsGetFx({booking: "bowling", date: String(selectedDate.toLocaleDateString())})
    })
  }, [selectedDate]);


  const processedData = useMemo(() => {
    if (!workRange) return [];

    const intervals = splitIntoHourIntervals(workRange);

    return intervals.map(variant => {
      const bookingArray = bookings.filter(booking =>
        new Date(booking.started_at).getTime() <= new Date(variant.started_at).getTime() &&
        new Date(booking.ended_at).getTime() >= new Date(variant.ended_at).getTime()
      );

      const freeVariant = variants.find(elem =>
        new Date(elem.started_at).getTime() === new Date(variant.started_at).getTime()
      );

      return { variant, bookingArray, freeVariant };
    });
  }, [workRange, bookings, variants]);

  return (
    <>
      <Row>
        <Col>
          <div className="page-title-box">
            <h4 className="page-title">Боулинг</h4>
          </div>
        </Col>
      </Row>

      <Row className="bowling-block">
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
                          onDateChange(date);
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
                <div>
                  {Array.from({length: 6}).map((_, i) => (
                    <Col key={"track-" + i}>
                      <Row className="mx-0">
                        <p className="bg-secondary-subtle p-1 mb-0">Дорожка №{i + 1}</p>
                      </Row>
                      <div className="bowling-row row-gap-1 overflow-auto d-flex mx-0">
                        {processedData.map(({variant, bookingArray, freeVariant}, idx) => {
                          const trackActive = bookingArray.some(booking =>
                            booking.tracks && booking.tracks.includes(i + 1)
                          );

                          const bookingElem = bookingArray.find(booking => booking.tracks && booking.tracks.includes(i + 1))

                          return (
                            <Fragment key={variant.started_at + i}>
                              {trackActive && bookingElem ? (
                                <OverlayTrigger container={document.getElementById("tooltip-root")} overlay={
                                  <Tooltip>
                                    {bookingElem.user?.fio}
                                     <br/>
                                    {bookingElem.count_people} чел.
                                  </Tooltip>
                                }>
                                  <Col
                                    onClick={() => {
                                          openModalInfo(bookingElem)
                                        }}
                                    style={{backgroundColor: bookingElem.styles?.["background-color"] || ""}}
                                    className={classNames(
                                      "d-flex justify-content-center align-items-center border-top border-light border-end border-bottom",
                                      {
                                        "border-start": idx === 0
                                      }
                                    )}
                                  >
                                    {getTimeFormatedDate(variant.started_at)}
                                  </Col>

                                </OverlayTrigger>
                              ) : (
                                <Col onClick={freeVariant ? () => openModalAdd(freeVariant, i + 1) : () => {}}
                                     className={classNames(
                                       "d-flex justify-content-center py-2 px-1 align-items-center border-top border-light border-end border-bottom",
                                       {
                                         "border-start": idx === 0
                                       }
                                     )}
                                >
                                  {getTimeFormatedDate(variant.started_at)}
                                </Col>
                              )}
                            </Fragment>
                          );
                        })}
                      </div>
                    </Col>
                  ))}
                </div>
                {loadingBookings && (
                  <div
                    className={`position-absolute w-100 h top-0 bg-white d-flex justify-content-center bottom-0`}>
                    <Spinner animation="grow" variant="primary" style={{width: "100px", height: "100px"}}/>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {showModal &&
        <AddEditBowling selectedDate={selectedDate.toLocaleDateString()} isOpen={showModal} onClose={closeModal}/>}
      {showModalInfo &&
        <ModalInfo isOpen={showModalInfo} onClose={closeModalInfo} variant={bookingOpen} type="bowling"/>}
      {deleteOpen && <ModalDelete isOpen={deleteOpen}
                                  handleDelete={handleRemove}
                                  onClose={closeDelete}
                                  title="Вы уверены, что хотите удалить запись?"
      />}
      {showModalAdd && variantOpen && <ModalAddBowling selectedDate={selectedDate.toLocaleDateString()}
                                                       isOpen={showModalAdd}
                                                       onClose={closeModalAdd}
                                                       variant={variantOpen}
      />}
    </>
  )
}

export default Bowling;