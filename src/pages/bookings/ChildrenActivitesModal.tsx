import {Form, Modal} from "react-bootstrap";
import {IAddEditModal} from "../../interface/modal.ts";
import {IEventEdit} from "./booking1";
import HeadModal from "../../components/HeadModal.tsx";
import {IOption} from "../admin/Modal.tsx";
import {useUnit} from "effector-react";
import {
  $bookingsLoading,
  $bookingsStructureStore,
  $bookingsVariantsStore, $bookingsVariantsTimeRange, bookingsGetFx,
  bookingsVariantsFx, bookingsVariantsMainFx
} from "../../store/bookings/getBookings.ts";
import {useEffect, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import AsyncSelect from "react-select/async";
import {loadOptions} from "../../helpers/api/loadFunctionOption.ts";
import {IndicatorsContainer} from "../../components/ComponentsWithoutLogic.tsx";
import HyperDatepicker from "../../components/Datepicker.tsx";
import Select from "react-select";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import {IBookingPost} from "../../store/bookings/interfaceBooking.ts";
import {bookingsPutFx, bookingsPutReset} from "../../store/bookings/putBookings.ts";
import {bookingPostFx, bookingPostReset} from "../../store/bookings/postBookings.ts";
import {generationTimesMinutes, isSameDate} from "../../utils/date.ts";
import {$bookingIsOpen, bookingDeleteElemEvent, bookingDeleteModal} from "../../store/bookings/modalDelete.ts";
import FormInput from "../../components/FormInput.tsx";

interface IAddEditBookingModal extends IAddEditModal<IEventEdit> {
  location: string;
  selectedDate: string
}

interface IFormData {
  user_id: IOption<number>;
  [key: string]: any;
  comment: string
}

const ChildrenActivitiesModal = (props: IAddEditBookingModal) => {
  const [structure, variants, loadingVariants, timeRange, isOpenDelete] = useUnit([$bookingsStructureStore, $bookingsVariantsStore, $bookingsLoading, $bookingsVariantsTimeRange, $bookingIsOpen])

  const [selectedDate, setSelectedDate] = useState<Date>(props.editable?.started_at || new Date());
  const [startOptions, setStartOptions] = useState<IOption<Date>[]>([]);

  const options = structure.children_activity_package?.values.map((item) => ({
    label: item.name,
    value: item.code
  })) || []

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultUser = {
    value: props.editable?.user.id ?? -1,
    label: props.editable?.user.fio ?? ""
  }

  const defaultTime = props.editable && props.editable.started_at ? {
    value: props.editable?.started_at,
    label: props.editable?.started_at.toLocaleTimeString("ru-Ru",{hour: "2-digit", minute:"2-digit"}),
  } : null


  const defaultOption = structure.children_activity_package?.values.find(item => String(item.code) === props.editable?.children_activity_package)

  const {control, handleSubmit, formState: {errors}, register,  watch, setValue} = useForm<IFormData>({
    defaultValues: {
      children_activity_package: options?.length > 0 ? options[0] : null,
      count_people: props.editable?.count_people || 1,
      comment: props.editable?.comment || "",
    }
  })


  const onDateChange = (date: Date) => {
    setSelectedDate(date);
  }

  const openDeleteModal = () => {
    if (props.editable) {
      bookingDeleteElemEvent(props.editable.id)
      bookingDeleteModal(true)
    }
  }

  const watchPackage = watch("children_activity_package")

  const onSubmit = async (FormData: IFormData) => {
    if (props.editable) {
      const data: IBookingPost = {
        location: props.location,
        user_id: FormData.user_id.value,
        _method: "put",
        children_activity_package: String(FormData.children_activity_package.value),
        started_at: FormData["started_at"].value.toISOString(),
        ended_at: new Date(FormData["started_at"].value.getTime() + (timeRange || 60) * 60000).toISOString(),
        count_people: FormData.count_people,
        comment: FormData.comment
      }

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

    } else  {
      const data: IBookingPost = {
        location: props.location,
        user_id: FormData.user_id.value,
        children_activity_package: String(FormData.children_activity_package.value),
        started_at: FormData["started_at"].value.toISOString(),
        ended_at: new Date(FormData["started_at"].value.getTime() + (timeRange || 60) * 60000).toISOString(),
        count_people: FormData.count_people,
        comment: FormData.comment
      }
      bookingPostFx(data).then(() => {
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

  useEffect(() => {
    if (props.editable) {
      setValue("user_id", defaultUser);
    }
  }, [props.editable, defaultUser]);

  useEffect(() => {
    if (props.editable && defaultOption) {
      const selectedOption = {
        value: defaultOption.code,
        label: defaultOption.name,
      }
      if (selectedOption) {
        setValue("children_activity_package", selectedOption);
      }
    }
  }, [props.editable, defaultOption]);

  useEffect(() => {
    bookingsVariantsFx({booking: props.location, date: selectedDate.toLocaleDateString(), packageChildren: watchPackage.value || "", ignoreId: props.editable?.id ? String(props.editable.id): ""})
  }, [watchPackage, selectedDate]);

  useEffect(() => {
    setStartOptions(generationTimesMinutes(variants, timeRange || 60) || [])
  }, [variants]);

  useEffect(() => {
    if (props.editable && props.editable.started_at && defaultTime && isSameDate(props.editable.started_at, selectedDate) && startOptions.length > 0) {
      setValue("started_at", defaultTime)
    } else if (startOptions.length > 0) {
      setValue("started_at", startOptions[0])
    } else {
      setValue("started_at", null)
    }
  }, [startOptions]);

  return (
    <Modal centered={true}
           show={props.isOpen}
           onHide={props.onClose}
           style={{zIndex: isOpenDelete ? "1000" : ""}}
    >
      <HeadModal title={props.editable ? "Изменить бронирование" : "Добавить бронирование"} />
      <Modal.Body className="px-4 pb-4 pt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>ФИО покупателя</Form.Label>
            <Controller control={control}
                        name="user_id"
                        rules={{required: "Введите покупателя"}}
                        render={({field}) => (
                          <AsyncSelect className="react-select react-select-container"
                                       classNamePrefix="react-select"
                                       placeholder="Покупатель"
                                       ref={field.ref}
                                       loadOptions={loadOptions}
                                       components={{IndicatorsContainer}}
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
          <Form.Group className="mb-3">
            <Form.Label>
              {structure["children_activity_package"]?.label}
            </Form.Label>
            <Controller control={control} name="children_activity_package"
                        rules={{required: "Укажите пакет"}}
                        render={({field}) => (
                          <Select className="react-select react-select-container"
                                  classNamePrefix="react-select"
                                  placeholder="Пакет"
                                  components={{IndicatorsContainer}}
                                  options={options}
                                  ref={field.ref}
                                  value={field.value}
                                  onChange={field.onChange}
                          />
                        )}
            />
            {errors && errors["children_activity_package"] ? (
              <Form.Control.Feedback type="invalid" className="d-block">
                {errors["children_activity_package"]?.message?.toString()}
              </Form.Control.Feedback>
            ) : null}
          </Form.Group>
          {!loadingVariants ? (
            <Form.Group className="mb-3">
              <Form.Label>Выбрать время</Form.Label>
              <Controller name="started_at"
                          rules={{required: "Выбрать время"}}
                          control={control}
                          render={({field}) => (
                            <Select options={startOptions}
                                    className="react-select react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Время начала"
                                    components={{ IndicatorsContainer }}
                                    value={field.value}
                                    onChange={(option) => {
                                      field.onChange(option)
                                    }}
                            />
                          )}/>
              {errors &&  errors["started_at"] && (
                <div className="invalid-feedback text-danger d-block">
                  {errors?.["started_at"]?.message?.toString()}
                </div>
              )}
            </Form.Group>
          ) : null}
          <Form.Group className="mb-3">
            <Form.Label>Количество людей</Form.Label>
            <Form.Control type="number"
                          {...register("count_people", {
                            required: "Укажите количество людей"
                          })}
                          max={10}
                          min={1}
            />
            {errors && errors["count_people"] ? (
              <Form.Control.Feedback type="invalid" className="d-block text-danger">
                {errors["count_people"]?.message?.toString()}
              </Form.Control.Feedback>
            ) : null}
          </Form.Group>
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
  )
}

export default ChildrenActivitiesModal