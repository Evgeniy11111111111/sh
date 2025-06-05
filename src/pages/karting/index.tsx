import {Button, ButtonGroup, Card, Col, OverlayTrigger, Row, Spinner, Tooltip} from "react-bootstrap";
import { useUnit } from "effector-react";
import {
  $bookingIsLoadingCombine,
  $bookingsStore, $bookingsVariantsMainConfig, $bookingsVariantsMainStore, bookingReset,
  bookingsGetFx,
  bookingsStructureFx, bookingsVariantsMainFx
} from "../../store/bookings/getBookings.ts";
import { useEffect, useState } from "react";
import AddEditKarting from "./Modal.tsx";
import HyperDatepicker from "../../components/Datepicker.tsx";
import styles from "./karting.module.scss";
import classNames from "classnames";
import { formatDateTime } from "../../utils/date.ts";
import { IBooking, IBookingVariants } from "../../store/bookings/interfaceBooking.ts";
import ModalAddKarting from "./ModalAdd.tsx";
import ModalInfo from "./ModalInfo.tsx";
import {switchList, switchType} from "../../utils/switch.ts";
import {$bookingDeleteElem, $bookingIsOpen, bookingDeleteModalReset} from "../../store/bookings/modalDelete.ts";
import ModalDelete from "../../components/ModalDelete.tsx";
import {bookingDeleteFx} from "../../store/bookings/removeBookings.ts";

const Karting = () => {
  const [
    booking, variants, deleteOpen, elemDelete, loadingBookings, variantsConfig
  ] = useUnit([
    $bookingsStore, $bookingsVariantsMainStore, $bookingIsOpen, $bookingDeleteElem, $bookingIsLoadingCombine, $bookingsVariantsMainConfig
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showModalAdd, setShowModalAdd] = useState<boolean>(false);
  const [variantOpen, setVariantOpen] = useState<IBookingVariants | null>(null);
  const [showModalInfo, setShowModalInfo] = useState<boolean>(false);
  const [bookingOpen, setBookingOpen] = useState<IBooking | null>(null);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const openModalAdd = (variant: IBookingVariants) => {
    if (variant.is_closed) return
    setVariantOpen(variant)
    setShowModalAdd(true)
  }

  const closeModalAdd = () => {
    setVariantOpen(null)
    setShowModalAdd(false)
  }

  const openModalInfo = (booking: IBooking) => {
    setShowModalInfo(true);
    setBookingOpen(booking);
  }

  const closeModalInfo = () => {
    setBookingOpen(null);
    setShowModalInfo(false);
  }

  const closeDelete = () => {
    bookingDeleteModalReset()
  }

  const handleRemove = async () => {
    if (elemDelete) {
      await bookingDeleteFx(elemDelete).then(async () => {
        await bookingsVariantsMainFx({
          booking: "karting",
          date: String(selectedDate.toLocaleDateString())
        })
      }).then(async () => {
        await bookingsGetFx({
          booking: "karting",
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
    bookingsStructureFx("karting");
    window.scrollTo(0, 0)
  }, [location]);

  useEffect(() => {
    const loadData = async () => {
      await bookingsVariantsMainFx({
        booking: "karting",
        date: String(selectedDate.toLocaleDateString())
      });
      await bookingsGetFx({
        booking: "karting",
        date: String(selectedDate.toLocaleDateString())
      });
    };
    loadData();
  }, [selectedDate]);
  //
  // const colorClasses = [
  //   // "bg-primary",
  //   // "bg-secondary",
  //   "bg-success",
  //   "bg-danger",
  //   // "bg-warning",
  //   // "bg-info",
  //   // "bg-light",
  //   // "bg-dark"
  // ];


  return (
    <>
      <Row>
        <Col>
          <div className="page-title-box">
            <h4 className="page-title">Картинг</h4>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Row className="align-items-center mb-3 row-gap-1">
                <Col lg={3}>
                  <Button
                    className="btn btn-lg font-16 btn-primary w-100"
                    onClick={openModal}
                  >
                    <i className="mdi mdi-plus-circle-outline"></i>Создать новую запись
                  </Button>
                </Col>
                <Col lg={9}>
                  <Row className="justify-content-between align-items-center">
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
                <Row className="row-gap-2 ">
                  {variants.map((variant, i) => {
                    const variantBookings = booking.filter(
                      (b) => b.started_at === variant.started_at && b.ended_at === variant.ended_at
                    );

                    const slots = Array(variantsConfig?.types?.[variant?.type_karting || ""]?.max_count || 8).fill(null); // Create an array of 8 slots initialized to null
                    // Populate the slots with the appropriate color based on the bookings
                    let slotIndex = 0;
                    for (let k = 0; k < variantBookings.length; k++) {
                      const bookingForSlot = variantBookings[k];
                      // const color = colorClasses[k % colorClasses.length]; // Pick color based on element index
                      const color = bookingForSlot.styles?.["background-color"] || ""
                      for (let j = 0; j < bookingForSlot.count_people; j++) {
                        if (slotIndex < (variantsConfig?.types?.[variant?.type_karting || ""]?.max_count || 8)) {
                          slots[slotIndex] = {color, booking: bookingForSlot};
                          slotIndex++;
                        }
                      }
                    }

                    return (
                      <Col key={variant.started_at + variant.ended_at + i} className="px-3" xs={6} lg={4} xl={3}>
                        <Row>
                          <p
                            className={classNames("p-1", {
                              "bg-warning-subtle": variant.type_code === "children",
                              "bg-danger-subtle": variant.type_code === "adult",
                              "bg-info-subtle": variant.type_code === "family",
                              "bg-secondary-subtle": variant.type_code === ""
                            })}
                          >
                            {formatDateTime(variant.started_at)}
                          </p>
                        </Row>
                        {variant.is_closed && variant.closed_label === "Техническое обслуживание" ? (
                          <div>Пит-Стоп</div>
                        ) : (
                          <Row className="row-gap-1">
                            {slots.map((slot, idx) => (
                              <Col key={variant.ended_at + idx} className="px-1" xs={3}>
                                {slot ? (
                                  <OverlayTrigger
                                    overlay={
                                      <Tooltip>
                                        <b>{slot.booking.count_people} чел.</b>
                                        <br/>
                                        {switchType(slot.booking.type_code)}
                                        <br/>
                                        {slot.booking.cars ? switchList(slot.booking.cars) : null}
                                        <br/>
                                        {slot.booking.user?.fio || ""}
                                      </Tooltip>
                                    }
                                  >
                                    <div className={styles.item}>
                                      <div onClick={() => openModalInfo(slot.booking)}
                                           className={classNames(styles.itemContent)}
                                           style={{backgroundColor: slot.color}}
                                      ></div>
                                    </div>
                                  </OverlayTrigger>
                                ) : (
                                  <div className={styles.item}>
                                    <div onClick={() => openModalAdd(variant)}
                                         className={classNames(styles.itemContent, "bg-light")}></div>
                                  </div>
                                )}
                              </Col>
                            ))}
                          </Row>
                        )}
                      </Col>
                    );
                  })}
                </Row>
                {loadingBookings && !variantsConfig?.types && (
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
      {showModal && <AddEditKarting selectedDate={selectedDate.toLocaleDateString()}
                                    isOpen={showModal}
                                    onClose={closeModal}
      />}
      {showModalAdd && variantOpen && <ModalAddKarting selectedDate={selectedDate.toLocaleDateString()}
                                                       onClose={closeModalAdd}
                                                       isOpen={showModalAdd}
                                                       variant={variantOpen}
      />}
      {showModalInfo && <ModalInfo isOpen={showModalInfo}
                                   type="karting"
                                   onClose={closeModalInfo}
                                   variant={bookingOpen} />}
      {deleteOpen && <ModalDelete isOpen={deleteOpen}
                                  handleDelete={handleRemove}
                                  onClose={closeDelete}
                                  title="Вы уверены, что хотите удалить запись?"
      />}
    </>
  );
};

export default Karting;
