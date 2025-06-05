import {
  $bookingsStructureStore, $bookingsVariantsConfig,
  $bookingsVariantsStore, bookingsGetFx,
  bookingsVariantsFx,
  bookingsVariantsMainFx
} from "../../store/bookings/getBookings.ts";
import { IAddEditModal } from "../../interface/modal.ts";
import {Alert, Col, Form, Modal} from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import {Controller, ControllerRenderProps, useForm} from "react-hook-form";
import AsyncSelect from "react-select/async";
import { loadOptions } from "../../helpers/api/loadFunctionOption.ts";
import { IndicatorsContainer } from "../../components/ComponentsWithoutLogic.tsx";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import HyperDatepicker from "../../components/Datepicker.tsx";
import { IOption } from "../admin/Modal.tsx";
import { useEffect, useState } from "react";
import { useUnit } from "effector-react";
import renderInput from "./renderInput.tsx";
import {IBookingPost, IBookingVariants} from "../../store/bookings/interfaceBooking.ts";
import { $bookingPostError, bookingPostFx, bookingPostReset } from "../../store/bookings/postBookings.ts";
import { IEventEdit } from "./booking1";
import {$bookingIsOpen, bookingDeleteElemEvent, bookingDeleteModal} from "../../store/bookings/modalDelete.ts";
import {bookingsPutFx, bookingsPutReset} from "../../store/bookings/putBookings.ts";
import classNames from "classnames";
import styles from "./bookings.module.scss"
import {findVariant, isFindVariant} from "../../utils";
import FormInput from "../../components/FormInput.tsx";

interface IFormData {
  user_id: IOption<number>;
  variants: Array<any>
  [key: string]: any;
  comment: string
}

interface IAddEditBookingModal extends IAddEditModal<IEventEdit> {
  location: string;
  selectedDate: string
}

function stringToDate (date: string) {
  const [day, month, year] = date.split('.').map(Number);
  return  new Date(year, month - 1, day);
}

const AddEditBookingModal = (props: IAddEditBookingModal) => {
  const [
    structure, variants, errorPost, isOpenDelete, config
  ] = useUnit([
    $bookingsStructureStore, $bookingsVariantsStore, $bookingPostError, $bookingIsOpen, $bookingsVariantsConfig
  ]);
  const [selectedDate, setSelectedDate] = useState<Date>(props.editable?.started_at || stringToDate(props.selectedDate));
  const [defaultVariant, setDefaultVariant] = useState<IBookingVariants | null>(null)

  const { control, handleSubmit, formState: { errors }, register, setValue } = useForm<IFormData>({
    defaultValues: {
      comment: props.editable?.comment || "",
      variants: defaultVariant ? [defaultVariant] : []
    }
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultUser = {
    value: props.editable?.user.id ?? -1,
    label: props.editable?.user.fio ?? ""
  }

  const onDateChange = (date: Date) => {
    setSelectedDate(date);
    setValue("variants", [])
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
        comment: FormData.comment
      };

      if (FormData.type_code) {
        data.type_code = FormData.type_code.value
      }

      if (FormData.quest_code) {
        data.quest_code = FormData.quest_code.value
      }

      // Условно добавляем поле type_code, если оно существует

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
      const data: IBookingPost = {
        location: props.location,
        user_id: FormData.user_id.value,
        variants: FormData.variants.map(elem => ({
          started_at: elem.started_at,
          ended_at: elem.ended_at,
          count_people: FormData.count_people,
        })),
        comment: FormData.comment
      };


      // Условно добавляем поле type_code, если оно существует
      if (FormData.type_code) {
        data.variants = data.variants?.map(elem => ({
          ...elem,
          type_code: FormData.type_code.value
        }));
      }
      if (FormData.quest_code) {
        data.variants = data.variants?.map(elem => ({
          ...elem,
          quest_code: FormData.quest_code.value
        }))
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

  const openDeleteModal = () => {
    if (props.editable) {
      bookingDeleteElemEvent(props.editable.id)
      bookingDeleteModal(true)
    }
  }

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
            {
              Object.keys(structure).map(elem => {
                const structureElement = structure[elem]
                if (structureElement) {
                  const valueInput = props.editable ? props.editable[structureElement.name] : 1
                  return renderInput(structureElement, control, register, errors, valueInput, config  || undefined,)
                }
              })
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
  );
}

export default AddEditBookingModal;