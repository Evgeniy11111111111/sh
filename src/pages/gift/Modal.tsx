import {IAddEditModal} from "../../interface/modal.ts";
import {Form, Modal} from "react-bootstrap";
import HeadModal from "../../components/HeadModal.tsx";
import {useUnit} from "effector-react";
import {$giftSampleStore} from "../../store/gift/sample/getGiftSample.ts";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup"
import {Controller, useForm} from "react-hook-form";
import FormInput from "../../components/FormInput.tsx";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import style from "./modal.module.scss"
import classNames from "classnames";
import AsyncSelect from "react-select/async";
import {IOption} from "../admin/Modal.tsx";
import {giftPostFx, giftPostReset, IAddGift} from "../../store/gift/addGift.ts";
import {IGiftGet} from "../../store/gift/getGift.ts";
import {giftPutFx, giftPutReset} from "../../store/gift/putGift.ts";
import {loadOptions} from "../../helpers/api/loadFunctionOption.ts";
import {IndicatorsContainer} from "../../components/ComponentsWithoutLogic.tsx";
import {$giftRequestStore} from "../../store/gift/giftRequestStore.ts";
import {objectToString} from "../../utils";
import {useNavigate} from "react-router-dom";
import {Swiper, SwiperSlide} from "swiper/react";
import "swiper/scss"
import {useHookFormMask} from "use-mask-input";

interface IFormData  {
  fio: string
  phone: string,
  sum: string,
  selectedSample: number | null
  author: IOption<number> | null
}

const schema = yupResolver(
  yup.object().shape({
    fio: yup.string().required("Введите ФИО"),
    phone: yup.string().matches(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, 'Введите корректный номер телефона').required("Введите номер телефона"),
    sum: yup.number().required("Введите сумму"),
    selectedSample: yup.number().nullable().required("Выберите сертификат"),
    author: yup.object().shape({
      value: yup.number().required(),
      label: yup.string().required()
    }).required("Введите покупателя")
  })
)

function formatPhoneNumber(phoneNumber) {
  const digits = phoneNumber.replace(/\D/g, '');
  const match = digits.match(/^7(\d{3})(\d{3})(\d{2})(\d{2})$/);
  if (match) {
    return `+7 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
  }
  return phoneNumber;
}

const AddEditGift = (props: IAddEditModal<IGiftGet>) => {
  const [giftSample, giftRequest] = useUnit([$giftSampleStore, $giftRequestStore])

  const navigate = useNavigate()

  const defaultAuthor = {
    value: props.editable?.author.id,
    label: props.editable?.author.fio ?? ""
  }

  const defaultPhone = props.editable?.owner.phone
    ? formatPhoneNumber(props.editable.owner.phone)
    : '';

  const { control, handleSubmit, formState: { errors }, register } = useForm<IFormData>({
    resolver: schema,
    defaultValues: {
      fio: props.editable?.owner.fio || "",
      phone: defaultPhone,
      sum: String(props.editable?.sum) || "",
      selectedSample: props.editable?.template.id || null,
      author: defaultAuthor || null
    },
  });

  const onSubmit = async (FormData: IFormData) => {
    const currentDate = new Date()
    currentDate.setFullYear(currentDate.getFullYear() + 1)

    const data: IAddGift = {
      fio: FormData.fio,
      phone: FormData.phone,
      sum: Number(FormData.sum),
      template_id: Number(FormData.selectedSample),
      author_id: Number(FormData.author?.value),
      ended_at: currentDate.toLocaleDateString()
    }

    if (props.editable) {
      data._method = "put";
      await giftPutFx({id: props.editable.id, data: data}).then(() => {
        if (giftRequest) {
          const str = objectToString(giftRequest, "&")
          navigate(str ? `/gift?${str}` : "/gift")
        }
      })
      if (giftPutFx.doneData) {
        if (props.onClose) props.onClose()
        giftPutReset()
      }
    } else {
      await giftPostFx(data).then(() => {
        if (giftRequest) {
          const str = objectToString(giftRequest, "&")
          navigate(str ? `/gift?${str}` : "/gift")
        }
      })
      if (giftPostFx.doneData)  {
        if (props.onClose) props.onClose();
        giftPostReset()
      }
    }

  }

  const registerWithMask = useHookFormMask(register)

  return (
    <Modal centered={true}
           show={props.isOpen}
           onHide={props.onClose}
    >
      <HeadModal title={props.editable ? "Изменить сертификат" : "Добавить сертификат"} />
      <Modal.Body className="px-4 pb-4 pt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          {giftSample.length > 0 && (
            <div className="mb-2">
              <div className="fw-bold mb-1">Сертификат</div>
              <div className={`overflow-auto d-flex gap-2`}>
                <Controller
                  name="selectedSample"
                  control={control}
                  render={({field}) => (
                    <Swiper spaceBetween={10}
                            slidesPerView={"auto"}
                    >
                      {giftSample.map((elem) => (

                          <SwiperSlide style={{width: "auto"}}>
                            <div
                              key={elem.id}
                              onClick={() => field.onChange(field.value === elem.id ? null : elem.id)}
                              className={classNames(style.sampleItem, {[style.active]: field.value === elem.id})}
                            >
                              <img style={{maxHeight: "50px"}} src={elem.image}/>
                            </div>
                          </SwiperSlide>
                      ))}
                    </Swiper>
                  )}
                />
              </div>
              {errors.selectedSample && (
                <div className="invalid-feedback text-danger d-block">
                  {errors.selectedSample.message}
                </div>
              )}
            </div>
          )}
          <FormInput name="fio"
                     control={control}
                     type="text"
                     errors={errors}
                     placeholder="Введите ФИО"
                     label="ФИО"
                     register={register}
                     className="form-control"
                     containerClass={"mb-3"}
          />
          <div className="mb-3">
            <label className="form-label">Телефон</label>
            <input className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                   {...registerWithMask("phone", "+9 (999) 999-99-99")}
            />
            {errors.phone && (
              <Form.Control.Feedback className="d-block">
                {errors.phone.message}
              </Form.Control.Feedback>
            )}
          </div>
          <FormInput name="sum"
                     control={control}
                     type="number"
                     errors={errors}
                     min={0}
                     placeholder="Введите сумму"
                     label="Сумма"
                     register={register}
                     className="form-control"
                     containerClass={"mb-3"}
          />
          <Form.Group className="mb-3">
            <Form.Label>ФИО покупателя</Form.Label>
            <Controller name="author" control={control} render={
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
            {errors.author && (
              <div className="invalid-feedback text-danger d-block">
                {errors.author.message}
              </div>
            )}
          </Form.Group>
          {/*<div className="input-group mb-3 input-group-sm ">*/}
          {/*  <HyperDatepicker*/}
          {/*    value={selectedDate}*/}
          {/*    minDate={new Date()}*/}
          {/*    showMonthDropdown={true}*/}
          {/*    showYearDropdown={true}*/}
          {/*    yearDropdownItemNumber={3}*/}
          {/*    scrollableYearDropdown={true}*/}
          {/*    inputClass="border"*/}
          {/*    clear={() => {setSelectedDate(undefined)}}*/}
          {/*    onChange={(date) => {*/}
          {/*      onDateChange(date);*/}
          {/*    }}*/}
          {/*  />*/}
          {/*</div>*/}
          <BtnForModalForm editable={!!props.editable}/>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default AddEditGift;