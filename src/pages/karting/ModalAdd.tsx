import {Form, Modal, ModalBody, Row} from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import {formatDateTime} from "../../utils/date.ts";
import {IBookingPost, IBookingVariants, IBookingVariantsConfigCount} from "../../store/bookings/interfaceBooking.ts";
import {useUnit} from "effector-react";
import {
  $bookingsStructureStore, $bookingsVariantsConfig,
  $bookingsVariantsStore,
  bookingsGetFx, bookingsVariantsFx,
  bookingsVariantsMainFx
} from "../../store/bookings/getBookings.ts";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from 'yup';
import {Controller, useForm} from "react-hook-form";
import {IOption} from "../admin/Modal.tsx";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import FormInput from "../../components/FormInput.tsx";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import {bookingPostFx, bookingPostReset} from "../../store/bookings/postBookings.ts";
import {loadOptions} from "../../helpers/api/loadFunctionOption.ts";
import {IndicatorsContainer} from "../../components/ComponentsWithoutLogic.tsx";
import {useEffect, useState} from "react";
import {ISelectedVariants} from "./Modal.tsx";
import {RowForColumn} from "./RowForColumn.tsx";



interface IModalAddKarting {
  isOpen: boolean;
  onClose: () => void;
  variant: IBookingVariants
  selectedDate: string
}

interface IFormData {
  user_id: IOption<number> | null
  type_code: IOption<string>,
  started_at: string,
  ended_at: string,
  variants: ISelectedVariants | null,
  comment: string
}

const ModalAddKarting = (props: IModalAddKarting) => {
  const [structure, variants, config] = useUnit([$bookingsStructureStore, $bookingsVariantsStore, $bookingsVariantsConfig])
  const [bookingVariant, setBookingVariant] = useState<IBookingVariants | null>(null);


  const schema = yupResolver(
    yup.object().shape({
      user_id: yup.object().shape({
        value: yup.number().required(),
        label: yup.string().required()
      }).required("Введите пользователя"),
      type_code: yup.object().shape({
        value: yup.string().required(),
        label: yup.string().required()
      }).required("Введите тип"),
      started_at: yup.string().required("Выбрать время"),
      ended_at: yup.string().required("Выбрать время"),
      variants: yup.object().required("Вы должны выбрать хотя бы один вариант"),
    })
  )

  const filteredOptions = structure.type_code?.values.filter(elem => {
    if (props.variant.type_code === '') {
      return true;
    } else if (props.variant.type_code === 'adult') {
      return elem.code === 'adult';
    } else if (props.variant.type_code === 'children') {
      return elem.code === 'children';
    } else if (props.variant.type_code === 'family') {
      return  elem.code === 'family'
    }
  });

  const defaultTypeCode = filteredOptions?.[0] ? {
    label: filteredOptions[0].name,
    value: filteredOptions[0].code,
  } : { label: "", value: "" };

  const {control, handleSubmit, formState: {errors}, register, watch, setValue} = useForm<IFormData>({
    resolver: schema,
    defaultValues: {
      user_id: null,
      type_code: defaultTypeCode || {label: "", value: ""},
      started_at: formatDateTime(props.variant.started_at),
      ended_at: formatDateTime(props.variant.ended_at),
      variants: null,
      comment: ""
    }
  })


  const options = filteredOptions ?  filteredOptions.map(elem => ({
      value: elem.code,
      label: elem.name,
    })) : [];

  const selectedTypeCode = watch("type_code")

  useEffect(() => {
    bookingsVariantsFx({booking: "karting", date: props.variant.started_at ? new Date(props.variant.started_at).toLocaleDateString() : undefined})
  }, []);

  useEffect(() => {
    if (selectedTypeCode) {
      setValue("variants", null);
    }

    const bookingElem = variants.find(elem => {
      if (elem.started_at === props.variant.started_at &&
        (elem.type_code === selectedTypeCode.value || elem.type_code === "")) {
        return elem;
      }
    });

    if (bookingElem) setBookingVariant(bookingElem);

  }, [selectedTypeCode, variants]);


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
      <HeadModal title={`Добавить запись на ${formatDateTime(props.variant.started_at)}`} />
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
          <FormInput key="started_at"
                     name="started_at"
                     control={control}
                     disabled={true}
                     type="text"
                     placeholder="Начало заезда"
                     errors={errors}
                     label="Начало заезда"
                     register={register}
                     className="form-control"
                     containerClass={"mb-3"}
          />
          <FormInput key="ended_at"
                     name="ended_at"
                     control={control}
                     disabled={true}
                     type="text"
                     placeholder="Конец заезда"
                     errors={errors}
                     label="Конец заезда"
                     register={register}
                     className="form-control"
                     containerClass={"mb-3"}
          />
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
          <BtnForModalForm />
        </form>
      </ModalBody>
    </Modal>
  )
}

export default ModalAddKarting;