import classNames from "classnames";

const externalEvents = [
  {
    id: 1,
    className: "bg-warning",
    title: "Детский"
  },
  {
    id: 2,
    className: "bg-danger",
    title: "Взрослый"
  },
  {
    id: 3,
    className: "bg-info",
    title: "Семейный"
  },
]
const SidePanel = () => {
  return (
    <div>
      {(externalEvents || []).map((event, index) => {
        return (
          <div key={event.title + index}
               title={event.title}
               data-class={event.className}
               className={classNames("external-event", event.className)}
          >
            <i className="mdi mdi-checkbox-blank-circle me-2 vertical-middle"></i>
            {event.title}
          </div>
        )
      })}
    </div>
  )
}

export default SidePanel;