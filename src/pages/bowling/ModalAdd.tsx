import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from 'yup';
import {Form, Modal, ModalBody} from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import {formatDateTime} from "../../utils/date.ts";
import {IBookingPost, IBookingVariants} from "../../store/bookings/interfaceBooking.ts";
import {IOption} from "../admin/Modal.tsx";
import {Controller, useForm} from "react-hook-form";
import AsyncSelect from "react-select/async";
import {loadOptions} from "../../helpers/api/loadFunctionOption.ts";
import FormInput from "../../components/FormInput.tsx";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import {bookingPostFx, bookingPostReset} from "../../store/bookings/postBookings.ts";
import {$bookingsVariantsConfig, bookingsGetFx, bookingsVariantsMainFx} from "../../store/bookings/getBookings.ts";
import {IndicatorsContainer} from "../../components/ComponentsWithoutLogic.tsx";
import {useUnit} from "effector-react";

interface IModalAddBowling {
  isOpen: boolean;
  onClose: () => void;
  variant: {
    variant: IBookingVariants,
    track: number
  },
  selectedDate: string
}

interface IFormData {
  user_id: IOption<number> | null
  started_at: string,
  ended_at: string,
  count_people: number,
  track: number,
  comment?: string
}

const ModalAddBowling = (props: IModalAddBowling) => {
  const [config] = useUnit([$bookingsVariantsConfig])

  const schema = yupResolver(yup.object().shape({
    user_id: yup.object().shape({
      value: yup.number().required(),
      label: yup.string().required()
    }).required("Введите пользователя"),
    count_people: yup.number().min(1, "Минимальное количество человек - 1")
      .max(config?.max_people_on_track || 6,`Максимальное количество человек - ${config?.max_people_on_track || 6}` )
      .transform((value, originalValue) => {
        return originalValue === "" ? 0 : value;
      })
      .required("Укажите количество"),
    started_at: yup.string().required("Выбрать время"),
    ended_at: yup.string().required("Выбрать время"),
    track: yup.number().required("Выбрать дорожку")
  }))

  const {control, handleSubmit, formState: {errors}, register} = useForm<IFormData>({
    resolver: schema,
    defaultValues: {
      user_id: null,
      started_at: formatDateTime(props.variant.variant.started_at),
      ended_at: formatDateTime(props.variant.variant.ended_at),
      count_people: 1,
      track: props.variant.track,
      comment: ""
    }
  })

  const onSubmit = async (FormData: IFormData) => {
    const data: IBookingPost = {
      location: "bowling",
      user_id: FormData.user_id?.value || 0,
      variants: [{
        started_at: props.variant.variant.started_at,
        ended_at: props.variant.variant.ended_at,
        count_people: FormData.count_people,
        tracks: [FormData.track],
      }],
      comment: FormData.comment
    }

    console.log(data)

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

  return (
    <Modal show={props.isOpen} onHide={props.onClose}>
      <HeadModal title={`Добавить запись на ${formatDateTime(props.variant.variant.started_at)}, дорожка №${props.variant.track}`} />
      <ModalBody className="px-4 pb-4 pt-0">
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
          <FormInput key="started_at"
                     name="started_at"
                     control={control}
                     disabled={true}
                     type="text"
                     placeholder="Начало"
                     errors={errors}
                     label="Начало"
                     register={register}
                     className="form-control"
                     containerClass={"mb-3"}
          />
          <FormInput key="ended_at"
                     name="ended_at"
                     control={control}
                     disabled={true}
                     type="text"
                     placeholder="Конец"
                     errors={errors}
                     label="Конец"
                     register={register}
                     className="form-control"
                     containerClass={"mb-3"}
          />
          <FormInput key="track"
                     name="track"
                     control={control}
                     disabled={true}
                     type="text"
                     placeholder="Дорожка"
                     errors={errors}
                     label="Дорожка"
                     register={register}
                     className="form-control"
                     containerClass={"mb-3"}
          />
          <FormInput key="count_people"
                     name="count_people"
                     control={control}
                     type="number"
                     min={1}
                     max={6}
                     placeholder="Укажите количество"
                     errors={errors}
                     label="Количество человек"
                     register={register}
                     className="form-control"
                     containerClass={"mb-3"}
          />
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



export default ModalAddBowling;