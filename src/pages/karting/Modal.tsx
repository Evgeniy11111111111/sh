import {IAddEditModal} from "../../interface/modal.ts";
import {Form, Modal, Row} from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from 'yup';
import {useUnit} from "effector-react";
import {
  $bookingsStructureStore, $bookingsVariantsConfig,
  $bookingsVariantsStore, bookingsGetFx,
  bookingsVariantsFx,
  bookingsVariantsMainFx
} from "../../store/bookings/getBookings.ts";
import HyperDatepicker from "../../components/Datepicker.tsx";
import {useEffect, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import AsyncSelect from "react-select/async";
import {IOption} from "../admin/Modal.tsx";
import Select from "react-select";
import {
  IBookingPost,
  IBookingVariants,
  IBookingVariantsConfigCount
} from "../../store/bookings/interfaceBooking.ts";
import {bookingPostFx, bookingPostReset} from "../../store/bookings/postBookings.ts";
import {formatDateTime} from "../../utils/date.ts";
import {loadOptions} from "../../helpers/api/loadFunctionOption.ts";
import {IndicatorsContainer} from "../../components/ComponentsWithoutLogic.tsx";
import {RowForColumn} from "./RowForColumn.tsx";
import FormInput from "../../components/FormInput.tsx";

interface IOptionStartTime extends IOption<string> {
  started_at: string,
  ended_at: string,
  count_people: number
}

interface IFormData {
  user_id: IOption<number> | null
  type_code: IOption<string> | null,
  variants: ISelectedVariants | null,
  time_start: IOptionStartTime | null,
  comment?: string
}

export interface ISelectedVariants {
  started_at: string,
  ended_at: string,
  count_people?: number,
  numberEl: {
    [key: string]: number[]
  }
  type_code: string
  cars?: {
    [key: string]: number
  },
  free_count: number
}

interface IAddEditModalKarting extends IAddEditModal<null>{
  selectedDate: string
}

const AddEditKarting = (props: IAddEditModalKarting) => {
  const [structure, variants, config] = useUnit([$bookingsStructureStore, $bookingsVariantsStore, $bookingsVariantsConfig])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectTime, setSelectTime] = useState<IOptionStartTime[]>([]);
  const [bookingVariant, setBookingVariant] = useState<IBookingVariants | null>(null);

  const schema = yup.object().shape({
    user_id: yup.object().shape({
      value: yup.number().required(),
      label: yup.string().required()
    }).required("Введите пользователя"),
    type_code: yup.object().shape({
      value: yup.string().required(),
      label: yup.string().required()
    }).required("Введите тип"),
    time_start: yup.object().shape({
      value: yup.string().required(),
      label: yup.string().required(),
      started_at: yup.string().required(), // Expecting started_at instead of count_number
      ended_at: yup.string().required(),
    }).required("Выбрать время"),
    variants: yup.object().required("Вы должны выбрать хотя бы один вариант"),
  });

  const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<IFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      user_id: null,
      type_code: null,
      variants: null,
      time_start: null,
      comment: ""
    },
  })


  const options = structure && structure.type_code ? structure.type_code.values.map(elem => ({
    label: elem.name,
    value: elem.code
  })) : undefined;

  const selectedTypeCode = watch("type_code")

  const selectedStartTime = watch("time_start")

  const onDateChange = (date: Date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  useEffect(() => {
    bookingsVariantsFx({booking: "karting", date: selectedDate ? selectedDate.toLocaleDateString() : undefined})
    setValue("variants", null)
  }, [selectedDate]);

  useEffect(() => {
    const arr: IOptionStartTime[] = variants.reduce((acc: IOptionStartTime[], elem ) => {
      if (!elem.is_closed) {
        const timeElem: IOptionStartTime = {
          value: elem.started_at,
          label: formatDateTime(elem.started_at).split(" ")[1],
          started_at: elem.started_at,
          ended_at: elem.ended_at,
          count_people: elem.count_people,
        }

        acc.push(timeElem)
      }

      return acc
    }, [])

    setSelectTime(arr || [])
  }, [variants])

  useEffect(() => {
    setValue("time_start", selectTime[0])
  }, [selectTime])

  useEffect(() => {
    if (selectedStartTime && selectedTypeCode) {
      setValue("variants", null)
      const bookingElem = variants.find(elem => {
        if (elem.started_at == selectedStartTime.started_at && (elem.type_code === selectedTypeCode.value || elem.type_code === "")) {
          return elem
        }
      })
      if (bookingElem) setBookingVariant(bookingElem)


    }



  }, [selectedTypeCode, selectedStartTime])

  const onSubmit = async (FormData: IFormData) => {
    const data: IBookingPost = {
      location: "karting",
      user_id: FormData.user_id?.value || 0,
      count_people: FormData.variants?.count_people || 0,
      started_at: FormData.variants?.started_at || "",
      ended_at: FormData.variants?.ended_at || "",
      type_code: selectedTypeCode?.value || "",
      cars: FormData.variants?.cars || {},
      comment: FormData.comment
    }

    await bookingPostFx(data).then(() => {
      bookingsVariantsMainFx({
        booking: "karting",
        date: props.selectedDate
      })
    }).then(() => {
      bookingsGetFx({
        booking: "karting",
        date: props.selectedDate
      });
    })

    if (bookingPostFx.doneData) {
      if (props.onClose) props.onClose()
      bookingPostReset()
    }
  }

  const bookingArr: [string, IBookingVariantsConfigCount][] = config?.types && selectedTypeCode ? Object.entries(config?.types?.[selectedTypeCode.value]?.cars) : []

  const variantsValues = watch('variants');

  return (
    <Modal show={props.isOpen} onHide={props.onClose}>
      <HeadModal title={props.editable ? "Изменить бронирования": "Добавить бронирования"} />
      <Modal.Body >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>ФИО покупателя</Form.Label>
            <Controller name="user_id" control={control} render={
              ({field}) => (
                <AsyncSelect className="react-select react-select-container"
                             classNamePrefix="react-select"
                             placeholder="Покупатель"
                             loadOptions={loadOptions}
                             components={{IndicatorsContainer}}
                             defaultOptions={[]}
                             {...field}
                />
              )
            }
            />
            {errors.user_id && (
              <div className="invalid-feedback text-danger d-block">
                {errors.user_id.message}
              </div>
            )}
          </Form.Group>
          <div className="input-group mb-3 input-group-sm ">
            <HyperDatepicker
              value={selectedDate}
              minDate={new Date()}
              inputClass="border"
              onChange={(date) => {
                onDateChange(date);
              }}
            />
          </div>
          <Form.Group className="mb-3">
            <Form.Label>Тип</Form.Label>
            <Controller name="type_code" control={control} render={
              ({field}) => (
                <Select className="react-select react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Выбрать раздел"
                        options={options}
                        {...field}
                />
              )
            }
            />
            {errors.type_code && (
              <div className="invalid-feedback text-danger d-block">
                {errors.type_code.message}
              </div>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Время заезда</Form.Label>
            <Controller name="time_start" control={control} render={
              ({field}) => (
                <Select className="react-select react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Начало заезда"
                        isSearchable={false}
                        components={{IndicatorsContainer}}
                        options={selectTime}
                        {...field}
                />
              )
            }
            />
            {errors.time_start && (
              <div className="invalid-feedback text-danger d-block">
                {errors.time_start.message}
              </div>
            )}
          </Form.Group>
          {
            bookingVariant && selectedTypeCode && (bookingVariant.type_code === selectedTypeCode.value || bookingVariant.type_code === '') && (
              <Form.Group className="mb-3">
                <Form.Label>Выбрать машинки</Form.Label>
                <Controller name='variants'
                            control={control}
                            render={() => (
                              <Row className="row-gap-3">
                                {bookingArr.map(elem => (
                                  <div key={elem[0]} className="mb-3">
                                    <h3 className="bg-secondary-subtle py-1 px-2">
                                      {config?.cars?.[elem[0]].label}
                                    </h3>
                                    <RowForColumn elem={elem}
                                                  bookingVariant={bookingVariant}
                                                  getVariant={variantsValues}
                                                  selectedTypeCode={selectedTypeCode}
                                                  setValue={setValue}
                                                  config={config}
                                    />
                                  </div>
                                ))}
                              </Row>
                            )}
                />
                {errors.variants && (
                  <div className="invalid-feedback text-danger d-block">
                    {errors.variants.message}
                  </div>
                )}
              </Form.Group>
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
          <BtnForModalForm/>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default AddEditKarting;