import {
  $bookingsStructureStore,
  $bookingsVariantsStore, $bookingsVariantsTimeRange, bookingsGetFx,
  bookingsVariantsFx,
  bookingsVariantsMainFx
} from "../../store/bookings/getBookings.ts";
import { IAddEditModal } from "../../interface/modal.ts";
import { Alert, Form, Modal } from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import { Controller, useForm } from "react-hook-form";
import AsyncSelect from "react-select/async";
import { loadOptions } from "../../helpers/api/loadFunctionOption.ts";
import { IndicatorsContainer } from "../../components/ComponentsWithoutLogic.tsx";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import HyperDatepicker from "../../components/Datepicker.tsx";
import { IOption } from "../admin/Modal.tsx";
import { useEffect, useState } from "react";
import { useUnit } from "effector-react";
import {
  addTimeIntervalIfNotExists,
  generateTimeSlots,
  getMinEndTime,
  isSameDate,
} from "../../utils/date.ts";
import renderInput from "./renderInput.tsx";
import { IBookingPost } from "../../store/bookings/interfaceBooking.ts";
import { $bookingPostError, bookingPostFx, bookingPostReset } from "../../store/bookings/postBookings.ts";
import {$bookingIsOpen, bookingDeleteElemEvent, bookingDeleteModal} from "../../store/bookings/modalDelete.ts";
import {bookingsPutFx, bookingsPutReset} from "../../store/bookings/putBookings.ts";
import Select from "react-select";
import {TableBookingProps} from "./bookingsTable";
import FormInput from "../../components/FormInput.tsx";

interface IFormData {
  user_id: IOption<number>;
  comment: string
  [key: string]: any;
}

interface IAddEditBookingModal extends IAddEditModal<TableBookingProps> {
  location: string;
  selectedDate: string
}

const AddEditBookingModalTime = (props: IAddEditBookingModal) => {
  const [
    structure, variants, errorPost, timeRange, isOpenDelete
  ] = useUnit([
    $bookingsStructureStore, $bookingsVariantsStore, $bookingPostError, $bookingsVariantsTimeRange,$bookingIsOpen
  ]);
  const [selectedDate, setSelectedDate] = useState<Date>(props.editable && props.editable.started_at ? (new Date(props.editable.started_at)) : new Date());
  const [optionTable, setOptionTable] = useState<IOption<number>[]>([])

  const { control, handleSubmit, formState: { errors }, register, setValue } = useForm<IFormData>({
    defaultValues: {
      comment: props.editable?.comment || ""
    }
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultUser = {
    value: props.editable?.user.id ?? -1,
    label: props.editable?.user.fio ?? ""
  }

  const defaultTable = props.editable?.tables?.map(item => ({
    value: item,
    label: `Стол #${item}`
  }))

  const onDateChange = (date: Date) => {
    setSelectedDate(date);
  }

  const handleStartedAtChange = (date: Date) => {
    const newEndTime = new Date(date.getTime() + (timeRange || 60) * 60 * 1000); // Add 1 hour to the selected date
    setValue("ended_at", newEndTime);
  };

  const onSubmit = async (FormData: IFormData) => {
    const data: IBookingPost = {
      location: props.location,
      user_id: FormData.user_id.value,
      started_at: FormData.started_at.toISOString(),
      ended_at: variants[0].ended_at || "",
      count_people: FormData.count_people,
      comment: FormData.comment
    }

    if (FormData.tables) {
      data.tables = FormData.tables.map((table) => table.value)
    }

    if (props.editable) {
      data._method = 'put'
      await bookingsPutFx({id: props.editable.id, data: data})
        .then(() => {
          bookingsVariantsMainFx({
            booking: props.location,
            date: props.selectedDate
          })
        }).then(() => {
          bookingsGetFx({
            booking: props.location,
            date: props.selectedDate
          });
        })
      if (bookingsPutFx.doneData) {
        if (props.onClose) props.onClose()
        bookingsPutReset()
      }
    } else {
      await bookingPostFx(data).then(() => {
        bookingsVariantsMainFx({
          booking: props.location,
          date: props.selectedDate
        })
      }).then(() => {
        bookingsGetFx({
          booking: props.location,
          date: props.selectedDate
        });
      })
      if (bookingPostFx.doneData) {
        if (props.onClose) props.onClose()
        bookingPostReset()
      }
    }

  }

  const openDeleteModal = () => {
    if (props.editable) {
      bookingDeleteElemEvent(props.editable.id)
      bookingDeleteModal(true)
    }
  }


  const {freeTimeSlots, bookedTimeSlots} = props.editable && props.editable.started_at && props.editable.ended_at && isSameDate(selectedDate, new Date(props.editable.started_at))
    ? generateTimeSlots(addTimeIntervalIfNotExists(
      variants, {
        started_at: new Date(props.editable.started_at),
        ended_at: new Date(props.editable.ended_at)
      }
    ), timeRange || 60)
    : generateTimeSlots(variants, timeRange || 60)

  useEffect(() => {
    bookingsVariantsFx({ booking: props.location, date: selectedDate.toLocaleDateString()});
  }, [selectedDate]);

  useEffect(() => {
    if (props.editable?.started_at && new Date(selectedDate).setHours(0,0, 0, 0) === new Date(props.editable.started_at).setHours(0, 0, 0, 0)) {
      setValue("started_at", new Date(props.editable.started_at))
      setValue("ended_at", new Date(props.editable.ended_at))
    } else if (variants && variants.length > 0) {
      setValue("started_at", freeTimeSlots[0].started_at)
      setValue("ended_at", getMinEndTime(freeTimeSlots[0].started_at, freeTimeSlots[0].ended_at, timeRange || 60))
    } else {
      setValue("started_at", undefined)
      setValue("ended_at", undefined )
    }
  }, [variants]);

  useEffect(() => {
    if (props.editable) {
      setValue("user_id", defaultUser);

      setValue("tables", defaultTable)
    }
  }, [props.editable]);

  useEffect(() => {
    let values: IOption<number>[] = [];

    if (variants.length > 0 && variants[0].tables && !variants[0].is_closed) {
      values = variants[0].tables.map(elem => ({
        label: `Стол #${elem}`,
        value: elem
      }));
    }

    // Если props.editable, добавляем дополнительные элементы из другого массива
    if (props.editable && props.editable.tables) {
      const additionalValues = props.editable.tables.map(elem => ({
        label: `Cтол #${elem}`,
        value: elem
      }));
      values = [...values, ...additionalValues];
      values.sort((a, b) => a.value - b.value)
    }

    setOptionTable(values);
  }, [variants, props.editable])

  return (
    <>
      <Modal centered={true} style={{zIndex: isOpenDelete ? "1000": ""}} show={props.isOpen} onHide={props.onClose}>
        <HeadModal title={props.editable ? "Изменить бронирование" : "Добавить бронирование"} />
        <Modal.Body className="px-4 pb-4 pt-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>ФИО покупателя</Form.Label>
              <Controller control={control}
                          name="user_id"
                          rules={{ required: "Введите покупателя" }}
                          render={({ field }) => (
                            <AsyncSelect className="react-select react-select-container"
                                         classNamePrefix="react-select"
                                         placeholder="Покупатель"
                                         loadOptions={loadOptions}
                                         components={{ IndicatorsContainer }}
                                         value={field.value}
                                         onChange={field.onChange}
                            />
                          )}
              />
              {errors.user_id && (
                <div className="invalid-feedback text-danger d-block">
                  {errors.user_id.message}
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-3 d-flex flex-column">
              <Form.Label>Выбрать дату</Form.Label>
              <HyperDatepicker
                value={selectedDate}
                minDate={new Date()}
                inputClass="border"
                onChange={onDateChange}
              />
            </Form.Group>
            {structure["started_at"] && variants && (
              <Form.Group className="mb-3 d-flex flex-column">
                <Form.Label>
                  {structure["started_at"]?.label}
                </Form.Label>
                <Controller control={control}
                            name={structure["started_at"]?.name}
                            rules={{
                              required: structure["started_at"].required ? `Укажите ${structure["started_at"].label}` : false,
                            }}
                            render={({ field }) => (
                              <HyperDatepicker
                                {...field}
                                hideAddon={true}
                                minTime={freeTimeSlots && freeTimeSlots.length > 0 ? new Date(freeTimeSlots[0].started_at) : new Date(new Date().setHours(23, 59, 59, 999))}
                                maxTime={freeTimeSlots && freeTimeSlots.length > 0 ? new Date(new Date(freeTimeSlots[freeTimeSlots.length - 1].ended_at).getTime() - (30) * 60 * 1000) : new Date(new Date().setHours(23, 59, 59, 999))}
                                excludeTimes={bookedTimeSlots}
                                showTimeSelectOnly={true}
                                showTimeSelect={true}
                                inputClass="border"
                                timeFormat="p"
                                tI={30}
                                onChange={(date) => {
                                  field.onChange(date)
                                  handleStartedAtChange(date)
                                }}
                              />
                            )}
                />
                {structure["started_at"].required && errors[structure["started_at"]?.name]?.message && (
                  <div className="invalid-feedback text-danger d-block">
                    {errors[structure["started_at"]?.name]?.message?.toString()}
                  </div>
                )}
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>{structure["tables"]?.label}</Form.Label>
              <Controller name={structure["tables"]?.name || ""} control={control}
                          rules={{ required: "Выберите стол" }}
                          render={({field}) => (
                            <Select className="react-select react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder={structure["tables"]?.label}
                                    components={{IndicatorsContainer}}
                                    options={optionTable}
                                    ref={field.ref}
                                    isMulti={true}
                                    value={field.value}
                                    onChange={field.onChange}
                            />
                          )}
                          />
              {structure["tables"] && structure["tables"].required && errors[structure["tables"]?.name]?.message && (
                <div className="invalid-feedback text-danger d-block">
                  {errors[structure["tables"]?.name]?.message?.toString()}
                </div>
              )}
            </Form.Group>
            {
              Object.keys(structure).map(elem => {
                const structureElement = structure[elem]
                if (structureElement && structureElement.name !== "tables") {
                  const valueInput = props.editable ? props.editable[structureElement.name] : 1
                  return renderInput(structureElement, control, register, errors, valueInput)
                }
              })
            }
            {
              errorPost && errorPost.length > 0 && (
                <Alert variant="danger">
                  {errorPost}
                </Alert>
              )
            }
            <FormInput name="comment"
                       register={register}
                       type="textarea"
                       placeholder="Комментарий"
                       label="Комментарий"
                       className="form-control"
                       containerClass={"mb-3"}
                       rows="4"
            />
            <BtnForModalForm editable={!!props.editable} onClickDelete={openDeleteModal}/>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AddEditBookingModalTime;
