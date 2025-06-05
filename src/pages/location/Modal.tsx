import {Card, Form, FormGroup, FormLabel, Modal} from "react-bootstrap";
import FormInput from "../../components/FormInput.tsx";
import FileUploader, {FileType} from "../../components/FileUploader.tsx";
import {ChangeEvent, useEffect, useState} from "react";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from 'yup';
import {useUnit} from "effector-react";
import {
  $locationPostLoading, IAddLocation,
  locationPostFx, locationPostReset
} from "../../store/location/addLocation.ts";
import {
  $locationsStore,
  $locationStore,
  ILocationsGetData, ILocationsPrices, ILocationsRange,
  locationGetFx,
  locationReset
} from "../../store/location/getLocations.ts";
import {Controller, useForm} from "react-hook-form";
import {locationPutFx, locationPutReset} from "../../store/location/putLocation.ts";
import {$locationIsOpen, locationDeleteElemEvent, locationDeleteModal} from "../../store/location/modalDelete.ts";
import Select, {MultiValue} from "react-select";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import HeadModal from "../../components/HeadModal.tsx";
import {IAddEditModal} from "../../interface/modal.ts";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from 'html-to-draftjs';
import {capitalizeFirstLetter} from "../../utils/string.ts";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {ContentState, convertToRaw, EditorState} from "draft-js";
import {Editor} from "react-draft-wysiwyg";
import classNames from "classnames";

interface IFormData {
  title: string,
  description?: string,
  combining ?: string[],
  [key: string]: string | string[] | undefined
}

const schemaResolver = yupResolver(
  yup.object().shape({
    title: yup.string().required("Введите название локации"),
    description: yup.string().required("Введите описание локации"),
  })
)

interface ICombining {
  value: string,
  label: string
}

const workRangeValuesGet = (workRange: {[key: string]: ILocationsRange} | null | undefined) => {
  if (!workRange) return []

  const workRangeArray = Object.entries(workRange)
  return  workRangeArray.map(range => {

    return {
      label: range[1].label,
      value: `${range[1].started_at}-${range[1].ended_at}`,
      name: range[0]
    }
  })
}

const workRangeValuePost = (FormData: IFormData, workRange: { label: string, value: string, name: string }[]) => {
  if (!workRange) {
    return null;
  }

  // Объект для хранения извлечённых значений
  const extractedValues: { [key: string]: {hour_start: string, hour_end: string, minute_start: string, minute_end: string}} = {};

  // Перебираем элементы массива workRange
  workRange.forEach((item) => {
    const key = item.name; // Используем поле name как ключ
    if (Object.prototype.hasOwnProperty.call(FormData, key)) {
      const value = FormData[key]
      const valueArray = typeof value === "string" ? value.split("-") : null
      if (valueArray) {
        const start = valueArray[0].split(":")
        const end = valueArray[1].split(":")
        extractedValues[key] = {
          hour_start: start[0],
          hour_end: end[0],
          minute_start: start[1],
          minute_end: end[1],
        };
      }
    }
  });

  // Возвращаем извлечённые значения
  return extractedValues;
}

const pricesValuesGet = (prices: ILocationsPrices | null | undefined) => {
  if (!prices) return []
  const pricesArray = Object.entries(prices)
  const arrayForRender: {label: string, price: string, name: string}[] = []

  pricesArray.forEach(([elemName, elem]) => {
    const addToRender = (label: string, price: string, name: string) => {
      arrayForRender.push({
        label: capitalizeFirstLetter(label),
        price,
        name,
      });
    };

    if (elem.types) {
      Object.entries(elem.types).forEach(([nameItem, item]) => {
        addToRender(`${elem.label} ${item.label}`, item.price, `${elemName}-${nameItem}`)
      })
    } else {
      addToRender(elem.label, elem.price, elemName)
    }
  })

  return arrayForRender
}


const pricesValuesPost = (FormData: IFormData) => {
  const parsedPrices: Record<string, any> = {}

  for (const [key, value] of Object.entries(FormData)) {
    if (key === "title" || key === "description") continue;

    const category = key.split("-")
    const mainKey = category[0];

    if (!parsedPrices[mainKey]) {
      parsedPrices[mainKey] = {};
    }

    if (category.length === 2) {
      if (!parsedPrices[mainKey].types) {
        parsedPrices[mainKey].types = {};
      }

      parsedPrices[mainKey].types[category[1]] = {
        price: value
      }
    } else if (category.length === 1) {
      parsedPrices[mainKey] = {
        price: value
      }
    }
  }

  return parsedPrices
}


const AddEditLocation = (props: IAddEditModal<ILocationsGetData>) => {
  const [loading, deleteOpen, locations, location,] = useUnit([$locationPostLoading, $locationIsOpen, $locationsStore, $locationStore])

  const defaultValue: MultiValue<ICombining> = props.editable && props.editable.combinings?.map((location) => ({
    value: location.code,
    label: location.name
  })) || []

  const [selectedFiles, setSelectedFiles] = useState<FileType | null>(null);
  const [mainShow, setMainShow] = useState<number>(0)
  const [arrayCombining, setArrayCombining] = useState<MultiValue<ICombining>>(defaultValue)
  const [pricesArray, setPricesArray] = useState<{label: string, price: string, name: string}[]>([])
  const [workRangeArray, setWorkRangeArray] = useState<{ label: string, value: string, name: string }[]>([])
  const [editorState, setEditorState] = useState<EditorState>();


  const { control, handleSubmit, formState: { errors }, register, setError, setValue, clearErrors } = useForm<IFormData>({
    resolver: schemaResolver,
  });

  const optionsCombinings = locations.map((elem) => ({
    value: elem.code,
    label: elem.name
  }))

  useEffect(() => {
    (async () => {
      if (props.editable) {
        await locationGetFx(props.editable?.code || "")
        setMainShow(props.editable.is_showed_main_page || 0);
      }
    })()

    return () => {
      locationReset()
    }
  }, [props.editable]);

  const changeMainShow = () => {
    setMainShow((prevState) => (prevState === 0 ? 1 : 0));
  }
  const handleFileUpload = (files: FileType[]) => {
    setSelectedFiles(files[0]);
  };

  const onEditorStateChange = (newState: EditorState) => {
    clearErrors("description")
    setEditorState(newState);
    const htmlContent = draftToHtml(convertToRaw(newState.getCurrentContent()))
    setValue('description', htmlContent); // Синхронизация с формой
  };

  const onSubmit = async (FormData: IFormData) => {
    let hasError = false

    if (!editorState || editorState?.getCurrentContent()?.getPlainText()?.length < 1) {
      setError("description", {
        type: "manual",
        message: "Введите основной текст"
      })
    }

    pricesArray.map(elem => {
      if (!FormData[elem.name] || FormData[elem.name] === "") {
        setError(elem.name, {
          type: "manual",
          message: "Введите цену"
        })
        hasError = true
      }
    })

    workRangeArray.map(elem => {
      const lengthInput = (FormData[elem.name]?.length || 0)
      if (!FormData[elem.name] || lengthInput < 11) {
        setError(elem.name, {
          type: "manual",
          message: "Это поле обязательно для заполнения",
        });
        hasError = true;
      }
    })

    if (hasError) {
      return
    }

    const selectCombining = arrayCombining.map((elem) => (
      elem.value
    ))
    const data: IAddLocation = {
      name: FormData.title,
      description: FormData.description,
      combinings: selectCombining,
      is_showed_main_page: mainShow,
      image: selectedFiles,
    }
    if (props.editable) {
      data._method = 'put';

      data.prices = pricesValuesPost(FormData)

      const rangeWork = workRangeValuePost(FormData, workRangeArray)

      if (rangeWork) {
       data.work_ranges = rangeWork
      }

      await locationPutFx({id: props.editable.code, data: data})
      if (locationPutFx.doneData) {
        if (props.onClose) props.onClose()
        locationPutReset()
      }
    } else {
      await locationPostFx(data)
      if (locationPostFx.doneData) {
        if (props.onClose) props.onClose()
        locationPostReset()
      }
    }
  }

  const openDelete = () => {
    if (props.editable) {
      locationDeleteElemEvent(props.editable.code)
      locationDeleteModal(true)
    }
  }

  const changeSelect = (select: MultiValue<ICombining>) => {
    setArrayCombining(select)
  }

  useEffect(() => {
    if (props.editable?.code !== "quest") {
      const arrayPrice = pricesValuesGet(location?.prices)
      setPricesArray(arrayPrice)
    } else {
      setPricesArray([])
    }

    const arrayWorkRange = workRangeValuesGet(location?.work_ranges)
    setWorkRangeArray(arrayWorkRange)
  }, [location]);

  useEffect(() => {
    if (props.isOpen) {
      if (props.editable?.description) {
        const contentBlock = htmlToDraft(props.editable.description)
        const contentState = ContentState.createFromBlockArray(
          contentBlock.contentBlocks
        );
        setValue("description", props.editable.description)
        setEditorState(EditorState.createWithContent(contentState))
      } else {
        setEditorState(EditorState.createEmpty())
      }
    }

  }, [props.isOpen]);

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>, name: string) => {
    const value = e.target.value;
    const inputNumberValue = value.replace(/\D/g, '');
    let formattedInputValue = '';
    const selectionStart = e.target.selectionStart;

    // Проверка на ввод нечислового символа
    if (selectionStart && value.length > selectionStart) {
      return
    }

    if (/^[3-9]/.test(inputNumberValue)) {
      formattedInputValue = `0${inputNumberValue}`;
    } else {
      formattedInputValue = inputNumberValue;
    }

    if (inputNumberValue.length === 2 && Number(inputNumberValue) > 23) {
      formattedInputValue = '23';
    }

    if (inputNumberValue.length === 3) {
      const minutes = Number(inputNumberValue.slice(-1));
      formattedInputValue = `${inputNumberValue.slice(0, 2)}:${minutes > 5 ? `0${minutes}` : minutes}`;
    }

    if (inputNumberValue.length === 4) {
      formattedInputValue = `${inputNumberValue.slice(0, 2)}:${inputNumberValue.slice(-2)}`;
    }

    if (inputNumberValue.length === 5) {
      const lastDigit = Number(inputNumberValue.slice(-1));
      const string = `${inputNumberValue.slice(0, 2)}:${inputNumberValue.slice(2, 4)}-${lastDigit > 2 ? `0${lastDigit}` : lastDigit}`;
      if (string.length === 8) {
        const stringArray = string.split('-');
        const firstElemString = stringArray[0].split(":")[0];
        const lastElemString = stringArray[1];
        formattedInputValue = `${inputNumberValue.slice(0, 2)}:${inputNumberValue.slice(2, 4)}-${firstElemString >= lastElemString ? firstElemString : lastElemString}`
      } else if (string.length === 7) {
        formattedInputValue = string
      }
    }

    if (inputNumberValue.length === 6) {
      const lastTwoDigits = inputNumberValue.slice(-2);
      const firstTwoDigits = inputNumberValue.slice(0, 2)
      formattedInputValue = `${inputNumberValue.slice(0, 2)}:${inputNumberValue.slice(2, 4)}-${firstTwoDigits >= lastTwoDigits ? firstTwoDigits : lastTwoDigits > "23" ? "23" : lastTwoDigits}`;
    }

    if (inputNumberValue.length === 7) {
      const lastDigit = Number(inputNumberValue.slice(-1));
      formattedInputValue = `${inputNumberValue.slice(0, 2)}:${inputNumberValue.slice(2, 4)}-${inputNumberValue.slice(4, 6)}:${lastDigit > 5 ? `0${lastDigit}` : lastDigit}`;
    }

    if (inputNumberValue.length === 8) {
      const hours = inputNumberValue.slice(4,6)
      const minutes = inputNumberValue.slice(-2);
      const firstHours = inputNumberValue.slice(0, 2)
      const firstMinutes = inputNumberValue.slice(2,4)
      formattedInputValue = `${inputNumberValue.slice(0, 2)}:${inputNumberValue.slice(2, 4)}-${inputNumberValue.slice(4, 6)}:${hours === firstHours && firstMinutes >= minutes ? firstMinutes : minutes > "59" ? "59" : inputNumberValue.slice(-2)}`;
    }

    if (inputNumberValue.length > 8) {
      const lastDigit = Number(inputNumberValue.slice(7,8));
      formattedInputValue = `${inputNumberValue.slice(0, 2)}:${inputNumberValue.slice(2, 4)}-${inputNumberValue.slice(4, 6)}:${inputNumberValue.slice(6,7)}${lastDigit}`
    }

    setValue(name, formattedInputValue);
  };
  return (
    <Modal  style={{zIndex: deleteOpen ? "1000" : ''}} show={props.isOpen} onHide={props.onClose}>
      <HeadModal title={props.editable ? "Изменить локацию" : "Добавить локацию"} />
      <Modal.Body className="px-4 pb-4 pt-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            key="title"
            name="title"
            control={control}
            defaultValue={props.editable ? props.editable.name : ""}
            type="text"
            placeholder="Введите название локации"
            errors={errors}
            label="Название локации"
            register={register}
            className="form-control"
            containerClass={"mb-3"}
          />
          {editorState && (
            <FormGroup className="mb-3">
              <FormLabel>
                Основной текст новости
              </FormLabel>
              <Editor wrapperClassName={classNames("border p-1", {"border-danger": errors.description})}
                      editorStyle={{minHeight: "230px"}}
                      editorClassName="draft-editor"
                      editorState={editorState}
                      onEditorStateChange={onEditorStateChange}
              />
              {errors && errors.description ? (
                <Form.Control.Feedback type="invalid" className="d-block">
                  {errors.description?.message?.toString()}
                </Form.Control.Feedback>
              ) : null}
            </FormGroup>
          )}
          <FormInput name="showMain"
                     checked={mainShow === 1}
                     onChange={changeMainShow}
                     label="Показать на главной"
                     type="checkbox"
                     containerClass={"mb-3"}
          />
          {locations.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label>Локации, с которыми данная локация пересекается.</Form.Label>
              <Select isMulti={true}
                      defaultValue={props.editable && defaultValue ? defaultValue : []}
                      className="react-select react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Выбрать локацию"
                      options={optionsCombinings}
                      name="combining"
                      onChange={(selectOption) => {changeSelect(selectOption)}}
              />
            </Form.Group>
          )}
          {pricesArray.length > 0 ? (
            pricesArray.map((elem) => (
              <FormGroup key={elem.name + elem.label} className="mb-3">
                <Form.Label>{elem.label}</Form.Label>
                <Controller control={control}

                            {...register(elem.name, {
                              required: "Введите цену",
                              minLength: 1,
                              value: elem.price || "1"
                            })}
                            render={({field}) => (
                              <Form.Control {...field}
                                            type="number"
                                            className={errors[elem.name] ? 'is-invalid' : ''}
                                            min={1}
                              />
                            )}
                />
                {errors && errors[elem.name] ? (
                  <Form.Control.Feedback type="invalid" className="d-block">
                    {errors[elem.name]?.message?.toString()}
                  </Form.Control.Feedback>
                ) : null}
              </FormGroup>

            ))
          ) : null}
          {workRangeArray.length > 0 ? (
            workRangeArray.map((elem , index) => (
              <FormGroup key={elem.label + index + location?.code} className="mb-3">
                <Form.Label>{elem.label}</Form.Label>
                <Controller control={control}
                            name={elem.name}
                            defaultValue={elem.value || ""} // Передаем начальное значение
                            render={({field}) => (
                              <input {...field} onChange={event =>  handleChangeInput(event, elem.name)}  className={`form-control ${errors[elem.name] ? 'is-invalid' : ''}`}/>
                            )}
                />
                {errors && errors[elem.name] ? (
                  <Form.Control.Feedback type="invalid" className="d-block">
                    {errors[elem.name]?.message?.toString()}
                  </Form.Control.Feedback>
                ) : null}
              </FormGroup>
            ))
          ) : null}
          <Card>
          <h5 className="text-uppercase mt-0 mb-3 bg-light p-2">
              Изображение локации
            </h5>
            <FileUploader isImage={true} onFileUpload={handleFileUpload}/>
          </Card>
          <BtnForModalForm editable={!!props.editable} disabled={loading} onClickDelete={openDelete}/>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default AddEditLocation;