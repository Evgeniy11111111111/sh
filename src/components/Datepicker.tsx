import React, { forwardRef } from "react";
import DatePicker, {registerLocale} from "react-datepicker";
import classNames from "classnames";
import "react-datepicker/dist/react-datepicker.css";
import {ru} from "date-fns/locale/ru";
import {Button} from "react-bootstrap";

interface DatepickerInputProps {
  onClick?: () => void;
  value?: string;
  inputClass: string;
  children?: React.ReactNode;
  clear?: () => void
}


registerLocale("ru", ru)
/* Datepicker with Input */
const DatepickerInput = forwardRef<HTMLInputElement, DatepickerInputProps>(
  (props, ref) => {

    return (
      <input
        type="text"
        className={classNames("form-control", props.inputClass)}
        onClick={props.onClick}
        value={props.value}
        readOnly={true}
        ref={ref}
      />
    );
  }
);

/* Datepicker with Addon Input */
const DatepickerInputWithAddon = forwardRef<
  HTMLInputElement,
  DatepickerInputProps
>((props, ref) => (
  <div className="input-group input-group-sm" ref={ref}>
    <input
      type="text"
      className={classNames("form-control", props.inputClass)}
      onClick={props.onClick}
      value={props.value}
      readOnly
    />
    <span className="input-group-text bg-blue border-blue text-white">
      <i className="mdi mdi-calendar-range"></i>
    </span>
    {props.value && props.value?.length > 0 && props.clear && (
      <Button className="btn btn-sm" onClick={props.clear}>
        <i className="mdi mdi-close"></i>
      </Button>
    )}
  </div>
));

interface HyperDatepickerProps {
  value?: Date | undefined;
  onChange: (date: any) => void;
  hideAddon?: boolean;
  inputClass?: string;
  dateFormat?: string;
  excludeDates?: Date[] | Array<{date: Date, message: string}>
  excludeTimes?: Date[]
  minDate?: Date;
  minTime?: Date | undefined
  maxDate?: Date;
  maxTime?: Date | undefined
  showMonthDropdown?: boolean
  showYearDropdown?: boolean
  yearDropdownItemNumber?: number
  scrollableYearDropdown?: boolean
  showTimeSelect?: boolean;
  tI?: number;
  startDate?: Date | null | undefined
  endDate?: Date | null | undefined
  selectsRange?: boolean
  clear?: () => void
  timeCaption?: string;
  timeFormat?: string;
  showTimeSelectOnly?: boolean;
  monthsShown?: number;
  inline?: boolean;
  includeTimes?: Date[] | undefined
  injectTimes?: Date[] | undefined
}

const HyperDatepicker = (props: HyperDatepickerProps) => {
  // handle custom input
  // ;
  const input =
    (props.hideAddon || false) === true ? (
      <DatepickerInput
        inputClass={props.inputClass!}
        value={props.showTimeSelect === true ? props.value?.toLocaleTimeString("ru-Ru", { hour: '2-digit', minute: '2-digit' })  : props.value?.toLocaleDateString()}
      />
    ) : (
      <DatepickerInputWithAddon
        inputClass={props.inputClass!}
        value={props.showTimeSelect === true ? props.value?.toLocaleTimeString("ru-Ru", { hour: '2-digit', minute: '2-digit' }) : props.value?.toLocaleDateString()}
        clear={props.clear}
      />
    );

  return (
    <>
      {/* date picker control */}
      <DatePicker
        customInput={input}
        timeIntervals={props.tI}
        selected={props.value}
        locale={ru}
        startDate={props.startDate}
        endDate={props.endDate}
        includeTimes={props.includeTimes}
        injectTimes={props.injectTimes}
        excludeDates={props.excludeDates}
        excludeTimes={props.excludeTimes}
        selectsRange={props.selectsRange}
        showMonthDropdown={props.showMonthDropdown}
        showYearDropdown={props.showYearDropdown}
        yearDropdownItemNumber={props.yearDropdownItemNumber}
        scrollableYearDropdown={props.scrollableYearDropdown}
        value={props.showTimeSelect === true ? props.value?.toLocaleTimeString("ru-Ru", { hour: '2-digit', minute: '2-digit' })  : props.value?.toLocaleDateString()}
        onChange={(date) => props.onChange(date)}
        showTimeSelect={props.showTimeSelect}
        timeFormat={props.timeFormat || "hh:mm a"}
        timeCaption={props.timeCaption}
        dateFormat={props.dateFormat || "P"}
        minDate={props.minDate}
        minTime={props.minTime}
        maxDate={props.maxDate}
        maxTime={props.maxTime}
        monthsShown={props.monthsShown}
        showTimeSelectOnly={props.showTimeSelectOnly}
        inline={props.inline}
        autoComplete="off"
      />
    </>
  );
};

export default HyperDatepicker;
