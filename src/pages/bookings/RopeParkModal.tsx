import {IAddEditModal} from "../../interface/modal.ts";
import {IEventEdit} from "./booking1";
import {Col, Form, Modal} from "react-bootstrap";
import {useUnit} from "effector-react";
import {$bookingIsOpen, bookingDeleteElemEvent, bookingDeleteModal} from "../../store/bookings/modalDelete.ts";
import HeadModal from "../../components/HeadModal.tsx";
import {IOption} from "../admin/Modal.tsx";
import {useEffect, useRef, useState} from "react";
import {IBookingPost, IBookingVariants} from "../../store/bookings/interfaceBooking.ts";
import {Controller, ControllerRenderProps, useForm} from "react-hook-form";
import AsyncSelect from "react-select/async";
import {loadOptions} from "../../helpers/api/loadFunctionOption.ts";
import {IndicatorsContainer} from "../../components/ComponentsWithoutLogic.tsx";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import Select from "react-select";
import {
  $bookingsStructureStore, $bookingsVariantsConfig,
  $bookingsVariantsLoading, $bookingsVariantsStore, bookingsGetFx,
  bookingsVariantsFx, bookingsVariantsMainFx
} from "../../store/bookings/getBookings.ts";
import HyperDatepicker from "../../components/Datepicker.tsx";
import classNames from "classnames";
import styles from "./bookings.module.scss";
import {findVariant, isFindVariant} from "../../utils";
import {bookingPostFx, bookingPostReset} from "../../store/bookings/postBookings.ts";
import {bookingsPutFx, bookingsPutReset} from "../../store/bookings/putBookings.ts";
import FormInput from "../../components/FormInput.tsx";

interface IAddEditBookingModal extends IAddEditModal<IEventEdit> {
  location: string;
  selectedDate: string
}

interface IFormData {
  user_id: IOption<number>;
  variants: Array<any>
  [key: string]: any;
  comment: string
}

const AddEditRopeModalPark = (props: IAddEditBookingModal) => {
  const [structure ,isOpenDelete, loadingVariants, variants, config] = useUnit([$bookingsStructureStore, $bookingIsOpen, $bookingsVariantsLoading, $bookingsVariantsStore, $bookingsVariantsConfig])

  const [selectedDate, setSelectedDate] = useState<Date>(props.editable?.started_at || new Date());
  const [defaultVariant, setDefaultVariant] = useState<IBookingVariants | null>(null)

  const timerId = useRef<number | null>(null);

  const options = structure?.type_code?.values.map(item => ({
    label: item.name,
    value: item.code
  })) || []

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultUser = {
    value: props.editable?.user.id ?? -1,
    label: props.editable?.user.fio ?? ""
  }

  const {control, handleSubmit, formState: {errors}, register, setValue, watch} = useForm<IFormData>({
    defaultValues: {
      variants: defaultVariant ? [defaultVariant] : [],
      count_people: props.editable?.count_people || 1,
      type_code: null,
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

  const onSubmit = async (FormData: IFormData) => {
    if (props.editable) {
      const data: IBookingPost = {
        location: props.location,
        user_id: FormData.user_id.value,
        _method: "put",
        count_people: FormData.count_people,
        started_at: FormData.variants[0].started_at,
        ended_at: FormData.variants[0].ended_at,
        type_code: FormData.type_code.value,
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
        comment: FormData.comment,
        variants: FormData.variants.map(elem => ({
          started_at: elem.started_at,
          ended_at: elem.ended_at,
          count_people: FormData.count_people,
          type_code: FormData.type_code.value,
        })),
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

  const handleVariantSelect = (field: ControllerRenderProps<IFormData>, variant: IBookingVariants,) => {
    const currentVariants = Array.isArray(field.value) ? field.value : [];
    const exists = currentVariants.some(v => v && new Date(v.started_at).getTime() === new Date(variant.started_at).getTime() && new Date(v.ended_at).getTime() === new Date(variant.ended_at).getTime());
    if (props.editable) {
      field.onChange(exists ? [] : [variant])
    } else {
      if (exists) {
        field.onChange(currentVariants.filter(v => v && v.started_at !== variant.started_at));
      } else {
        field.onChange([...currentVariants, variant]);
      }
    }

  };

  const watchCountPeople = watch("count_people")

  useEffect(() => {
    if (timerId.current !== null) {
      clearTimeout(timerId.current)
      timerId.current = null
    }
    timerId.current = setTimeout(() => {
      bookingsVariantsFx({ booking: props.location, date: selectedDate.toLocaleDateString(), count_people: watchCountPeople, ignoreId: props.editable?.id ? String(props.editable.id) : ""});
    }, 300)
  }, [watchCountPeople, selectedDate]);

  useEffect(() => {
    setValue("variants", [])
    if (variants.length > 0 && props.editable?.started_at && props.editable.ended_at) {
      const variant = findVariant(variants, props.editable.started_at, props.editable.ended_at);
      setDefaultVariant(variant || null)
    }
  }, [variants]);

  useEffect(() => {
    if (props.editable) {
      setValue("user_id", defaultUser);
    }
  }, [props.editable, setValue, defaultUser]);

  useEffect(() => {
    const defaultType = options.find(elem => elem.value === props.editable?.type_code)
    if (props.editable) {
      setValue("type_code", options.length > 0 && defaultType ? defaultType : options?.length > 0 ? options[0] :  null)
    }
  }, [props.editable, options]);

  useEffect(() => {
    if (props.editable) {
      setValue("variants", [defaultVariant] || [])
    }
  }, [defaultVariant]);

  return (
    <>
      <Modal centered={true}
             style={{zIndex: isOpenDelete ? "1000" : ""}}
             show={props.isOpen}
             onHide={props.onClose}
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
            <Form.Group className="mb-3">
              <Form.Label>Количество людей</Form.Label>
              <Controller control={control}

                          {...register("count_people", {
                            required: `Укажите количество людей`,
                            max: {
                              value: config?.max_count_people || 10,
                              message: `Максимальное значение — ${config?.max_count_people ? config?.max_count_people : 10}`
                            }
                          })}
                          render={({field}) => (
                            <Form.Control type="number"
                                          {...field}
                                          max={50}
                                          min={1}
                            />
                          )}
              />
              {errors && errors["count_people"] ? (
                <Form.Control.Feedback type="invalid" className="d-block text-danger">
                  {errors["count_people"]?.message?.toString()}
                </Form.Control.Feedback>
              ) : null}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Тип</Form.Label>
              <Controller control={control}
                          {...register("type_code", {
                            required: `Укажите тип`,
                          })}
                          render={({field}) => (
                            <Select className="react-select react-select-container"
                                    classNamePrefix="react-select"
                                    placeholder="Тип"
                                    components={{IndicatorsContainer}}
                                    options={options}
                                    ref={field.ref}
                                    value={field.value}
                                    onChange={field.onChange}
                            />
                          )}
              />
              {errors && errors["type_code"] ? (
                <Form.Control.Feedback type="invalid" className="d-block">
                  {errors["type_code"]?.message?.toString()}
                </Form.Control.Feedback>
              ) : null}
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
            {!loadingVariants ? (
              <Form.Group className="mb-3">
                <Form.Label>Выбрать время</Form.Label>
                <Controller name="variants"
                            rules={{required: "Выбрать время"}}
                            control={control}
                            render={({field}) => (
                  <div ref={field.ref} className="row  row-gap-2">
                    {variants.map((item, i) => {
                      if (!item.is_closed || (defaultVariant && props.editable && isFindVariant(item, defaultVariant?.started_at, defaultVariant?.ended_at))) {
                        return <Col key={i + item.started_at} xs={6}>
                          <div onClick={() => handleVariantSelect(field, item)}
                               className={classNames("w-100 shadow d-flex align-items-center justify-content-center border px-1 py-1", styles.itemTime, {
                                 [styles.isSelected]: Array.isArray(field.value) && field.value.some(v => v && v.started_at === item.started_at && v.ended_at === item.ended_at),
                               })}
                          >
                            {new Date(item.started_at).toLocaleTimeString("ru-Ru", {hour: "2-digit", minute: "2-digit"})} - {new Date(item.ended_at).toLocaleTimeString("ru-Ru", {hour: "2-digit", minute: "2-digit"})}
                          </div>
                        </Col>
                      }
                    })}
                  </div>
                )}/>
                {errors.variants && (
                  <div className="invalid-feedback text-danger d-block">
                    {errors.variants.message}
                  </div>
                )}
              </Form.Group>
            ) : null}
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
  )
}

export default AddEditRopeModalPark