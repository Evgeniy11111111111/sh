import {Col, Form, FormGroup, Modal, Row} from "react-bootstrap";
import {IAddEditModal} from "../../interface/modal.ts";
import HeadModal from "../../components/HeadModal.tsx";
import {IOption} from "../admin/Modal.tsx";
import {useUnit} from "effector-react";
import {
  $bookingsVariantsConfig,
  $bookingsVariantsStore, $bookingsVariantsWorkRangeStore,
  bookingsGetFx,
  bookingsVariantsFx,
  bookingsVariantsMainFx
} from "../../store/bookings/getBookings.ts";
import {useEffect, useState} from "react";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from 'yup';
import {Controller, useForm} from "react-hook-form";
import AsyncSelect from "react-select/async";
import HyperDatepicker from "../../components/Datepicker.tsx";
import FormInput from "../../components/FormInput.tsx";
import classNames from "classnames";
import {getTimeFormatedDate, splitIntoHourIntervals} from "../../utils/date.ts";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import {IBookingPost} from "../../store/bookings/interfaceBooking.ts";
import {bookingPostFx, bookingPostReset} from "../../store/bookings/postBookings.ts";
import {loadOptions} from "../../helpers/api/loadFunctionOption.ts";
import {IndicatorsContainer} from "../../components/ComponentsWithoutLogic.tsx";

interface IFormData {
  user_id: IOption<number> | null
  count_people: number
  variants: ISelectedVariants[],
  comment?: string
}

interface ISelectedVariants {
  started_at: string,
  ended_at: string,
  count_people: number,
  tracks: number[]
}

interface IAddEditModalBowling extends IAddEditModal<null> {
  selectedDate: string;
}

const AddEditBowling = (props: IAddEditModalBowling) => {
  const [
    variants,
    workRange,
    config
  ] = useUnit([$bookingsVariantsStore, $bookingsVariantsWorkRangeStore, $bookingsVariantsConfig])

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const schema = yupResolver(
    yup.object().shape({
      user_id: yup.object().shape({
        value: yup.number().required(),
        label: yup.string().required()
      }).required("Введите пользователя"),
      count_people: yup.number()
        .min(1, "Минимальное количество человек - 1")
        .max(config?.max_people_on_track || 6,`Максимальное количество человек - ${config?.max_people_on_track || 6}` )
        .transform((value, originalValue) => {
          return originalValue.trim() === "" ? 0 : value;
        })
        .required("Укажите количество"),
      variants: yup.array().of(
        yup.object().shape({
          started_at: yup.string().required(),
          ended_at: yup.string().required(),
          tracks: yup.array().of(yup.number()).required(),
        })
      ).min(1, "Вы должны выбрать хотя бы один вариант").required(),
    })
  )

  const {control, handleSubmit, formState: {errors}, register, setValue, getValues, setFocus,} = useForm<IFormData>({
    resolver: schema,
    defaultValues: {
      user_id: null,
      count_people: 1,
      variants: [],
      comment: ""
    }
  })

  const onDateChange = (date: Date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const clickVariant = (started_at: string, ended_at: string, idx: number, notActive?: boolean, trackActive?: boolean,) => {
    if (!trackActive) {
      return false
    }

    if (!getValues("count_people")) {
      setFocus('count_people')
      return false
    }

    if (notActive) {
      return false
    }

    const currentVariant = getValues("variants")
    const variantIndex = currentVariant.findIndex(v => v.started_at === started_at && v.ended_at === ended_at);

    if (variantIndex === -1) {
      const newVariant: ISelectedVariants = {
        started_at: started_at,
        ended_at: ended_at,
        count_people: getValues("count_people") > 6 ? 6 : Number(getValues("count_people")),
        tracks: [idx]
      }

      setValue('variants', [...currentVariant, newVariant])
    } else {
      const updatedVariants = [...currentVariant]
      const updateItem = { ...updatedVariants[variantIndex] }

      const numberIdx = updateItem.tracks.findIndex(e => e === idx);

      if (numberIdx !== -1) {
        updateItem.tracks = updateItem.tracks.filter(e => e !== idx)
        updateItem.count_people = updateItem.tracks.length * 6 < getValues("count_people") ? updateItem.tracks.length * 6 : Number(getValues("count_people"));
      } else {
        updateItem.tracks = [...updateItem.tracks, idx];
        updateItem.count_people = updateItem.tracks.length * 6 < getValues("count_people") ? updateItem.tracks.length * 6 : Number(getValues("count_people"));
      }

      if (updateItem.tracks.length === 0) {
        updatedVariants.splice(variantIndex, 1);
      } else {
        updatedVariants[variantIndex] = updateItem;
      }

      setValue("variants", updatedVariants)
    }
  }

  const onSubmit = async (FormData: IFormData) => {
    const data: IBookingPost = {
      location: 'bowling',
      user_id: FormData.user_id?.value || 0,
      variants: FormData.variants,
      comment: FormData.comment
    }

    if (data.variants && data.variants.length > 0) {
      data.variants =  data.variants.map(elem => {
        return {...elem, count_people: FormData.count_people}
      })
    }


    await bookingPostFx(data).then(() => {
      bookingsVariantsMainFx({
        booking: "bowling",
        date: props.selectedDate
      })
    }).then(() => {
      bookingsGetFx({
        booking: "bowling",
        date: props.selectedDate
      });
    })
    if (bookingPostFx.doneData) {
      if (props.onClose) props.onClose()
      bookingPostReset()
    }
  }

  useEffect( () => {
    bookingsVariantsFx({booking: "bowling", date: selectedDate ? selectedDate.toLocaleDateString() : undefined})
  }, [selectedDate]);

  return (
    <Modal size={"lg"} centered={true} show={props.isOpen} onHide={props.onClose}>
      <HeadModal title="Добавить бронирование" />
      <Modal.Body className="px-4 pb-4 pt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>ФИО покупателя</Form.Label>
            <Controller name="user_id" control={control}
                        render={({field}) => (
                          <AsyncSelect className="react-select react-select-container"
                                       classNamePrefix="react-select"
                                       placeholder="Покупатель"
                                       loadOptions={loadOptions}
                                       components={{IndicatorsContainer}}
                                       defaultOptions={[]}
                                       {...field}
                          />
                        )}
            />
            {errors.user_id && (
              <div className="invalid-feedback text-danger d-block">
                {errors.user_id.message}
              </div>
            )}
          </Form.Group>
          <FormInput key="count_people"
                     name="count_people"
                     control={control}
                     type="number"
                     min={config?.min_count_people || 1}
                     max={config?.max_people_on_track || 6}
                     placeholder="Укажите количество"
                     errors={errors}
                     label="Количество человек"
                     register={register}
                     className="form-control"
                     containerClass={"mb-3"}
          />
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
          <Controller name="variants" control={control} render={() => (
            <FormGroup className="mb-3">
              {Array.from({ length: 6 }).map((_, i) => {
                return (
                  <Col key={"track-" + i}>
                    <Row className="mx-0">
                      <p className="bg-secondary-subtle p-1 mb-0">Дорожка №{i + 1}</p>
                    </Row>
                    <div className="row-gap-1 overflow-auto d-flex mx-0">
                      {(workRange ? splitIntoHourIntervals(workRange) : []).map((variant, idx) => {
                        const trackVariant = variants.find(elem => new Date(elem.started_at).getTime() === new Date(variant.started_at).getTime())
                        const trackActive = trackVariant && trackVariant.tracks.includes(i + 1)
                        const isCurrentlyBooked = getValues("variants").some(v => v.started_at === variant.started_at && v.ended_at === variant.ended_at && v.tracks.includes(i + 1));
                        const notActiveBookings = trackVariant && trackVariant.is_closed && trackVariant.closed_label === "Неподходящее время для бронирования"

                        return (
                          <Col
                            onClick={() => clickVariant(variant.started_at, variant.ended_at, i + 1, notActiveBookings, trackActive)}
                            className={classNames(
                              "d-flex justify-content-center align-items-center py-2 border-top border-light border-end border-bottom",
                              {
                                "bg-warning": !isCurrentlyBooked && !trackActive,
                                "bg-danger": trackActive && notActiveBookings,
                                "bg-success": isCurrentlyBooked,
                                "border-start": idx === 0
                              }
                            )}
                            key={variant.started_at + idx}
                          >
                            {getTimeFormatedDate(variant.started_at)}
                          </Col>
                        );
                      })}
                    </div>
                  </Col>
                );
              })}
            </FormGroup>
          )} />
          <FormInput name="comment"
                     register={register}
                     type="textarea"
                     placeholder="Комментарий"
                     label="Комментарий"
                     className="form-control"
                     containerClass={"mb-3"}
                     rows="4"
          />
          <BtnForModalForm />
        </form>
      </Modal.Body>
    </Modal>
  )

}

export default AddEditBowling