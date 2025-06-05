import {Form, Modal, ModalBody} from "react-bootstrap";
import HeadModal from "../../../components/HeadModal.tsx";
import {IOption} from "../../admin/Modal.tsx";
import {useUnit} from "effector-react";
import {
  $bookingsStructureStore,
  $bookingsVariantsStore,
  $bookingsVariantsTimeRange, bookingsGetFx, bookingsVariantsFx, bookingsVariantsMainFx
} from "../../../store/bookings/getBookings.ts";
import {Controller, useForm} from "react-hook-form";
import AsyncSelect from "react-select/async";
import {loadOptions} from "../../../helpers/api/loadFunctionOption.ts";
import {IndicatorsContainer} from "../../../components/ComponentsWithoutLogic.tsx";
import BtnForModalForm from "../../../components/BtnForModalForm.tsx";
import HyperDatepicker from "../../../components/Datepicker.tsx";
import {generateTimeSlots} from "../../../utils/date.ts";
import renderInput from "../renderInput.tsx";
import {useEffect} from "react";
import {IBookingPost} from "../../../store/bookings/interfaceBooking.ts";
import {bookingPostFx, bookingPostReset} from "../../../store/bookings/postBookings.ts";
import FormInput from "../../../components/FormInput.tsx";

interface IModalAddTable {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string
  table: number
  location: string
  editable?: boolean
}

interface IFormData {
  user_id: IOption<number> | null
  [key: string]: any
  comment?: string
}

const ModalAddTable = (props: IModalAddTable) => {
  const [variants, structure, timeRange] = useUnit([$bookingsVariantsStore, $bookingsStructureStore, $bookingsVariantsTimeRange])

  const {control, handleSubmit, formState: {errors}, register, watch, reset} = useForm<IFormData>()

  const {freeTimeSlots, bookedTimeSlots} = generateTimeSlots(variants, timeRange || 60)

  const onSubmit = async (FormData: IFormData) => {
    const data: IBookingPost = {
      location: props.location,
      user_id: FormData.user_id?.value || -1,
      started_at: FormData.started_at.toISOString(),
      ended_at: variants[0].ended_at,
      count_people: FormData.count_people,
      tables: [props.table],
      comment: FormData.comment
    }

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

  useEffect(() => {
    if (variants && variants.length > 0 && freeTimeSlots.length > 0) {
      reset({
        ...watch(),
        started_at: freeTimeSlots[0].started_at,
      })
    } else {
      reset({
        ...watch(),
        started_at: undefined,
      })
    }
  }, [variants]);

  useEffect(() => {
    bookingsVariantsFx({ booking: props.location, date: props.selectedDate});
  }, []);

  return (
    <Modal show={props.isOpen} onHide={props.onClose}>
      <HeadModal title={`Забронировать стол #${props.table}`} />
      <ModalBody className="px-4 pb-4 pt-0">
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
          {structure["started_at"] && variants && (
            <Form.Group className="mb-3 d-flex flex-column">
              <Form.Label>
                {structure["started_at"]?.label}
              </Form.Label>
              <Controller control={control}
                          name={structure["started_at"]?.name || ""}
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
          {
            Object.keys(structure).map(elem => {
              const structureElement = structure[elem]
              if (structureElement && structureElement.name !== "tables") {
                return renderInput(structureElement, control, register, errors, )
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
          <BtnForModalForm />
        </form>
      </ModalBody>
    </Modal>
  )
}

export default ModalAddTable;