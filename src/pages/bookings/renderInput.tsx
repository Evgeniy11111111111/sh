import {IBookingStructureItem, IBookingVariantsConfig} from "../../store/bookings/interfaceBooking.ts";
import {Form} from "react-bootstrap";
import {Control, Controller, FieldErrors, UseFormRegister} from "react-hook-form";
import Select from "react-select";
import {IndicatorsContainer} from "../../components/ComponentsWithoutLogic.tsx";

const
  renderInput = (
  structure: IBookingStructureItem,
  control: Control<any, any>,
  register: UseFormRegister<any>,
  errors: FieldErrors<any>,
  value?: any,
  config?: IBookingVariantsConfig,
) => {
  switch (structure.type) {
    case "integer":
      return (
        <>
          <Form.Group className="mb-3">
            <Form.Label>{structure.label}</Form.Label>
            <Controller control={control}
                        {...register(structure.name, {
                          max: {
                            value: config?.max_count_people ? config?.max_count_people : 10,
                            message: `Максимальное значение — ${config?.max_count_people ? config?.max_count_people : 10}`,
                          },
                          required: structure.required ? `Укажите ${structure.label.toLowerCase()}` : false,
                          value: value || 1,
                        })}
                        render={({field}) => (
                          <Form.Control type="number"
                                        {...field}
                                        max={10}
                                        min={1}
                          />
                        )}
            />
            {errors && errors[structure.name] ? (
              <Form.Control.Feedback type="invalid" className="d-block">
                {errors[structure.name]?.message?.toString()}
              </Form.Control.Feedback>
            ) : null}
          </Form.Group>
        </>
      )
    case "select":{
      const options = structure.values.map(item => ({
        label: item.name,
        value: item.code
      }))
      const defaultOptions = options.find(elem => elem.value === value)
      return (
        <Form.Group className="mb-3">
          <Form.Label>{structure.label}</Form.Label>
          <Controller control={control}
                      {...register(structure.name, {
                        required: structure.required ? `Укажите ${structure.label.toLowerCase()}` : false,
                        value: defaultOptions ? defaultOptions : options && options.length > 0 ? options[0] : null,
                      })}
                      render={({field}) => (
                        <Select className="react-select react-select-container"
                                classNamePrefix="react-select"
                                placeholder={structure.label}
                                components={{IndicatorsContainer}}
                                options={options}
                                ref={field.ref}
                                value={field.value}
                                onChange={field.onChange}
                        />
                      )}
          />
          {errors && errors[structure.name] ? (
            <Form.Control.Feedback type="invalid" className="d-block">
              {errors[structure.name]?.message?.toString()}
            </Form.Control.Feedback>
          ) : null}
        </Form.Group>
      )
    }
  }
}

export default renderInput;