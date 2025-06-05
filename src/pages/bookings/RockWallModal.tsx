import {IAddEditModal} from "../../interface/modal.ts";
import {IEventEdit} from "./booking1";
import {IOption} from "../admin/Modal.tsx";
import {useUnit} from "effector-react";
import {
  $bookingsVariantsConfig,
  $bookingsVariantsStore, bookingsGetFx, bookingsVariantsFx, bookingsVariantsMainFx
} from "../../store/bookings/getBookings.ts";
import {$bookingIsOpen, bookingDeleteElemEvent, bookingDeleteModal} from "../../store/bookings/modalDelete.ts";
import {useEffect, useState} from "react";
import {IBookingPost, IBookingVariants} from "../../store/bookings/interfaceBooking.ts";
import {Controller, ControllerRenderProps, useForm} from "react-hook-form";
import {bookingsPutFx, bookingsPutReset} from "../../store/bookings/putBookings.ts";
import {$bookingPostError, bookingPostFx, bookingPostReset} from "../../store/bookings/postBookings.ts";
import {findVariant, isFindVariant} from "../../utils";
import {Alert, Col, Form, Modal} from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import AsyncSelect from "react-select/async";
import {loadOptions} from "../../helpers/api/loadFunctionOption.ts";
import {IndicatorsContainer} from "../../components/ComponentsWithoutLogic.tsx";
import HyperDatepicker from "../../components/Datepicker.tsx";
import classNames from "classnames";
import styles from "./bookings.module.scss";
import FormInput from "../../components/FormInput.tsx";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";

interface IAddEditRockWallModal extends IAddEditModal<IEventEdit> {
  location: string;
  selectedDate: string
}

interface IFormData {
  user_id: IOption<number>;
  variants: Array<any>
  [key: string]: any;
  adult_peoples: number,
  children_peoples: number
  comment: string
}

const AddEditRockWall = (props: IAddEditRockWallModal) => {
  const [
    variants, errorPost, isOpenDelete, config
  ] = useUnit([
    $bookingsVariantsStore, $bookingPostError, $bookingIsOpen, $bookingsVariantsConfig
  ]);

  const [selectedDate, setSelectedDate] = useState<Date>(props.editable?.started_at || new Date());
  const [defaultVariant, setDefaultVariant] = useState<IBookingVariants | null>(null)

  const defaultUser = {
    value: props.editable?.user.id ?? -1,
    label: props.editable?.user.fio ?? ""
  }

  console.log(props.editable)

  const {control, handleSubmit, formState: {errors}, register, setValue, watch} = useForm<IFormData>({
    defaultValues: {
      variants: defaultVariant ? [defaultVariant] : [],
      count_people: props.editable?.count_people || 0,
      comment: props.editable?.comment || "",
      children_peoples: props.editable?.peoples?.children ? Number(props.editable.peoples.children) : 0,
      adult_peoples: props.editable?.peoples?.adult ? Number(props.editable.peoples.adult) : 1
    }
  })

  const onDateChange = (date: Date) => {
    setSelectedDate(date);
    setValue("variants", [])
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
        peoples: {
          adult: FormData.adult_peoples,
          children: FormData.children_peoples
        },
        count_people: FormData.count_people,
        started_at: FormData.variants[0].started_at,
        ended_at: FormData.variants[0].ended_at,
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
          peoples: {
            adult: FormData.adult_peoples,
            children: FormData.children_peoples
          },
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

  useEffect(() => {
    if (props.isOpen) {
      (async () => {
        await bookingsVariantsFx({ booking: props.location, date: selectedDate.toLocaleDateString()});
      })()
    }
  }, [selectedDate]);

  useEffect(() => {
    if (props.editable) {
      setValue("user_id", defaultUser);
    }
  }, [props.editable, setValue, defaultUser]);

  useEffect(() => {
    if (variants.length > 0 && props.editable?.started_at && props.editable.ended_at) {
      const variant = findVariant(variants, props.editable.started_at, props.editable.ended_at);
      setDefaultVariant(variant || null)
    }
  }, [variants]);

  useEffect(() => {
    if (props.editable) {
      setValue("variants", [defaultVariant] || [])
    }
  }, [defaultVariant]);

  const childrenPeoples = watch("children_peoples");
  const adultPeoples = watch("adult_peoples");

  useEffect(() => {
    // Вычисляем сумму и устанавливаем её в count_people
    const totalPeople = (Number(childrenPeoples) || 0) + (Number(adultPeoples) || 0);
    setValue("count_people", totalPeople);
  }, [childrenPeoples, adultPeoples, setValue]);

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
            <div className="mb-3">
              <Form.Label>Выбрать время</Form.Label>
              <Controller name="variants"
                          control={control}
                          rules={{required: "Выбрать время"}}
                          render={({field}) => (
                            <div ref={field.ref} className="row  row-gap-2">
                              {variants.map((item, i) =>{
                                if (!item.is_closed || (defaultVariant && props.editable && isFindVariant(item, defaultVariant?.started_at, defaultVariant?.ended_at))) {
                                  return <Col key={i + item.started_at} xs={6}>
                                    <div onClick={() => handleVariantSelect(field, item)}
                                         className={classNames("w-100 shadow d-flex align-items-center justify-content-center border px-1 py-1", styles.itemTime, {
                                           [styles.isSelected]: Array.isArray(field.value) && field.value.some(v => v && v.started_at === item.started_at && v.ended_at === item.ended_at),
                                         })}
                                    >
                                      {new Date(item.started_at).toLocaleTimeString("ru-Ru", {hour: '2-digit',
                                        minute: '2-digit'})} - {new Date(item.ended_at).toLocaleTimeString("ru-Ru", {hour: '2-digit',
                                      minute: '2-digit'})}
                                    </div>
                                  </Col>
                                }
                              })}
                            </div>
                          )} />
              {errors.variants && (
                <div className="invalid-feedback text-danger d-block">
                  {errors.variants.message}
                </div>
              )}
            </div>
            <FormInput name="adult_peoples"
                       className="form-control"
                       type="number"
                       register={register}
                       containerClass={"mb-3"}
                       label="Количество взрослых"
                       min={0}
                       max={50}
            />
            <FormInput name="children_peoples"
                       className="form-control"
                       type="number"
                       register={register}
                       containerClass={"mb-3"}
                       label="Количество детей"
                       min={0}
                       max={50}
            />
            <Form.Group className="mb-3">
              <Form.Label>Количество людей</Form.Label>
              <Controller control={control}

                          {...register("count_people", {
                            required: `Укажите количество людей`,
                            max: {
                              value: config?.max_count_people || 10,
                              message: `Максимальное значение — ${config?.max_count_people ? config?.max_count_people : 10}`
                            },
                            min: {
                              value: config?.min_count_people || 1,
                              message: `Максимальное значение — ${config?.min_count_people ? config?.min_count_people : 1}`
                            }
                          })}
                          render={({field}) => (
                            <Form.Control type="number"
                                          disabled={true}
                                          {...field}
                                          max={100}
                                          min={0}
                            />
                          )}
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
            {
              errorPost && errorPost.length > 0 && (
                <Alert variant="danger">
                  {errorPost}
                </Alert>
              )

            }
            <BtnForModalForm editable={!!props.editable} onClickDelete={openDeleteModal}/>
          </form>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default AddEditRockWall;