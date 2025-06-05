import "@fullcalendar/react/dist/vdom";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import BootstrapTheme from "@fullcalendar/bootstrap";
import ruLocale from "@fullcalendar/core/locales/ru"
import {EventInput} from "@fullcalendar/core";
import {forwardRef} from "react";
import "../../../assets/scss/Custom.scss"

interface CalendarProps {
  events: EventInput[];
  onEventClick: (value: any) => void
  onDatesSet?: (arg: any) => void;
  slotDuration?: string
  slotMinTime?: string
  slotMaxTime?: string
  prevFunction?: () => void,
  nextFunction?: () => void,
  todayFunction?: () => void,
}

const Calendar = forwardRef<FullCalendar, CalendarProps>((props, ref) => {

  const handleEventClick = (arg: any) => {
    props.onEventClick(arg)
  }

  return (
    <div id="calendar">
      <FullCalendar plugins={[
        timeGridPlugin,
        BootstrapTheme
      ]} // Убедитесь, что плагин включен
                    initialView="timeGridDay"
                    ref={ref}
                    handleWindowResize={true}
                    eventClick={handleEventClick}
                    themeSystem="bootstrap"
                    buttonText={{
                      today: "Сегодня",
                      month: "Месяц",
                      week: "Неделя",
                      day: "День",
                      list: "Список",
                      prev: "Предыдущий",
                      next: "Следующий",
                    }}
                    headerToolbar={{
                      left: "customPrev,customNext",
                      center: "title",
                      right: "customToday",
                    }}
                    customButtons={{
                      customPrev: {
                        text: 'Предыдущий',
                        click: () => {
                          if (props.prevFunction) {
                            props.prevFunction()
                          }
                        },

                      },
                      customNext: {
                        text: 'Следующий',
                        click: () => {
                          if (props.nextFunction) {
                            props.nextFunction()
                          }
                        },
                      },
                      customToday: {
                        text: 'Сегодня',
                        click: () => {
                          if (props.todayFunction) {
                            props.todayFunction()
                          }
                        },
                      }
                    }}
                    editable={true}
                    selectable={true}
                    droppable={true}
                    contentHeight={530}
                    locale={ruLocale}
                    slotDuration={props.slotDuration || "01:00:00"}
                    slotMinTime={props.slotMinTime || "09:00:00"}
                    slotMaxTime={props.slotMaxTime || "23:59:59"}
                    scrollTime="16:00:00"
                    slotLabelFormat={{
                      hour: '2-digit',
                      minute: '2-digit',
                      meridiem: false,
                      hour12: false
                    }}
                    eventTimeFormat={{
                      hour: '2-digit',
                      minute: '2-digit',
                      meridiem: false,
                      hour12: false
                    }}
                    events={props.events}
                    datesSet={props.onDatesSet}
                    eventContent={(eventInfo) => (
                      <div>
                        <b>{eventInfo.event.extendedProps.count_people > 0 ? eventInfo.event.extendedProps.count_people + ' чел. ' : ' '}</b>
                        <i>{eventInfo.event.title}</i>
                        <br/>
                        <p>{eventInfo.event.start?.toLocaleTimeString("ru-Ru", {hour: '2-digit',
                          minute: '2-digit'})} - {eventInfo.event.end?.toLocaleTimeString("ru-Ru", {hour: '2-digit',
                          minute: '2-digit'})}</p>
                      </div>
                    )}
      />
    </div>
  )
})

export default Calendar;