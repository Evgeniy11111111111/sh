import HeadPage from "../../components/HeadPage.tsx";
import HyperDatepicker from "../../components/Datepicker.tsx";
import {ChangeEvent, useEffect, useState} from "react";
import {Card, Col, Form, FormGroup, Row} from "react-bootstrap";
import {
  $operationMode,
  $operationModeLoading,
  getOperationModeFx,
  IOperationMode
} from "../../store/opertaionMode/getOperationMode.ts";
import {useUnit} from "effector-react";
import {Controller, useForm} from "react-hook-form";
import BtnForModalForm from "../../components/BtnForModalForm.tsx";
import {
  $postOperationModeLoading,
  IPostOperationMode,
  postOperationModeFx
} from "../../store/opertaionMode/postOperationMode.ts";

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы индексируются с 0
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface IFormData {
  [key: string]: string | undefined | null
}

const workRangeValuesGet = (array: IOperationMode[], date: string) => {
  if (!array || array.length < 1) return []

  return array.map(item => {
    const value = !item.opened_at || !item.closed_at ? "" : `${item.opened_at}-${item.closed_at}`

    return {
      label: item.location_name,
      value: value,
      name: `${item.location_code}-${date}`,
    }
  })
}

const workRangeValuesPost = (FormData: IFormData) => {
  const parsedValues: {location_code: string, opened_at: string | null, closed_at: string | null}[] = []

  for (const [key, value] of Object.entries(FormData)) {
    const keyCode = key.split("-")
    const valueArr = !value || value.length < 11 ? [] : value.split("-")
    const open = valueArr.length < 1 ? null : valueArr[0]
    const close = valueArr.length < 1 ? null : valueArr[1]

    const data = {
      location_code: keyCode[0],
      opened_at: open,
      closed_at: close
    }

    parsedValues.push(data)
  }

  return parsedValues
}

const OperationMode = () => {
  const [workSchedule, loading, loadingPost] = useUnit([$operationMode, $operationModeLoading, $postOperationModeLoading])

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [workRange, setWorkRange] = useState<{ label: string, value: string, name: string }[]>([])

  const {control, handleSubmit, formState: {errors}, setValue, setError, getValues, reset, clearErrors, unregister} = useForm<IFormData>()

  useEffect(() => {
    const date = formatDate(selectedDate)
    getOperationModeFx(date)
    reset()
  }, [selectedDate]);

  useEffect(() => {
    const date = formatDate(selectedDate)
    console.log(date)
    const array = workRangeValuesGet(workSchedule, date)
    setWorkRange(array)
  }, [workSchedule]);

  useEffect(() => {
    const currentFieldNames = workRange.map(item => item.name);
    const formFieldNames = Object.keys(getValues());

    const staleFieldNames = formFieldNames.filter(
      name => !currentFieldNames.includes(name)
    );

    // Удаляем старые поля из формы
    staleFieldNames.forEach(name => {
      unregister(name)
      clearErrors(name);
    });
  }, [workRange]);

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>, name: string) => {
    const value = e.target.value;
    clearErrors(name)
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

  const onSubmit = async (FormData: IFormData) => {
    let hasError = false;

    workRange.forEach(item => {
      const value = FormData[item.name];
      const lengthInput = value?.length || 0;

      // Проверяем только заполненные поля с длиной < 11
      if (value && lengthInput > 0 && lengthInput < 11) {
        setError(item.name, {
          type: "manual",
          message: "Формат должен быть 00:00-00:00",
        });
        hasError = true;
      }
    });

    if (hasError) {
      return;
    }

    const date = formatDate(selectedDate)

    const data: IPostOperationMode = {
      _method: "put",
      date: date,
      work_schedules: workRangeValuesPost(FormData)
    }

    await postOperationModeFx(data)

    if (postOperationModeFx.doneData) {
      await getOperationModeFx(date)
    }
  }

  return (
    <>
      <HeadPage title="Режим работы" />
      <HyperDatepicker inline={true}
                       minDate={new Date()}
                       value={selectedDate}
                       onChange={(date) => {setSelectedDate(date)}}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="mt-3">
        <Row>
          {workRange && workRange.length > 0 ? (
            workRange.map((item, index) => (
              <Col className="d-flex" key={index } md={6}>
                <Card className="w-100 p-3">
                  <h5 className="text-uppercase mt-0 mb-3">
                    {item.label}
                  </h5>
                  <FormGroup key={item.name + index + item.label}>
                    <Form.Label>Время работы</Form.Label>
                    <Controller control={control}
                                name={item.name}
                                defaultValue={item.value ?? ""} // Передаем начальное значение
                                render={({field}) => {
                                  const value = field.value ?? "";
                                  return (
                                    <input {...field}
                                           value={value}
                                           disabled={loading || loadingPost}
                                           onChange={event => handleChangeInput(event, item.name)}
                                           className={`form-control ${errors[item.name] ? 'is-invalid' : ''}`}
                                    />

                                  )
                                }}
                    />
                    {errors && errors[item.name] ? (
                      <Form.Control.Feedback type="invalid" className="d-block">
                        {errors[item.name]?.message?.toString()}
                      </Form.Control.Feedback>
                    ) : null}
                  </FormGroup>
                </Card>
              </Col>
            ))
          ) : null}
        </Row>
        <BtnForModalForm disabled={loading || loadingPost}/>
      </form>
    </>
  )
}

export default OperationMode;