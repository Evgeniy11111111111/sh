import {Col, Row} from "react-bootstrap";
import styles from "./karting.module.scss";
import classNames from "classnames";
import {
  IBookingVariants,
  IBookingVariantsConfig,
  IBookingVariantsConfigCount
} from "../../store/bookings/interfaceBooking.ts";
import {ISelectedVariants} from "./Modal.tsx";
import {IOption} from "../admin/Modal.tsx";


interface IClickVariant {
  type_car: string
  idx: number,
  started_at: string,
  ended_at: string,
}

interface IRowForColumn {
  elem: [string, IBookingVariantsConfigCount],
  bookingVariant: IBookingVariants,
  getVariant: ISelectedVariants | null
  selectedTypeCode: IOption<string> | null
  setValue: any
  config: IBookingVariantsConfig | null
}

export const RowForColumn = ({
  elem,
  bookingVariant,
  getVariant,
  selectedTypeCode,
  setValue,
  config
}: IRowForColumn ) => {

  const clickVariant = (props: IClickVariant) => {
    const maxPeopleForBooking = bookingVariant.type_code === '' ? config?.types?.[selectedTypeCode?.value ?? "adult"].max_count : bookingVariant.count_people;

    if (maxPeopleForBooking && maxPeopleForBooking <= 0) return false;

    if (!getVariant) {
      const selectedElem: ISelectedVariants = {
        cars: {
          [props.type_car]: 1,
        },
        count_people: 1,
        numberEl: {
          [props.type_car]: [props.idx],
        },
        started_at: props.started_at,
        ended_at: props.ended_at,
        type_code: selectedTypeCode ? selectedTypeCode.value : "",
        free_count: (maxPeopleForBooking || 8) - 1,
      };

      if (selectedElem.free_count < 0) return false;
      setValue("variants", selectedElem);
    } else {
      const updateItem = { ...getVariant };
      const numberObj = updateItem.numberEl[props.type_car];

      if (numberObj) {
        const numberIdx = numberObj.findIndex((e) => e === props.idx);
        if (numberIdx !== -1) {
          // Удаляем элемент (деселекция)
          updateItem.numberEl[props.type_car] = numberObj.filter((e) => e !== props.idx);
          if (updateItem.numberEl[props.type_car].length === 0 && updateItem.cars) {
            delete updateItem.numberEl[props.type_car];
            delete updateItem.cars[props.type_car];
          }
        } else {
          // Добавляем элемент (селекция)
          updateItem.numberEl[props.type_car] = [...numberObj, props.idx];
        }
      } else {
        // Добавляем первый элемент данного типа
        updateItem.numberEl[props.type_car] = [props.idx];
      }

      // Пересчитываем общее количество выбранных элементов
      let count = 0;
      Object.entries(updateItem.numberEl).forEach(([key, value]) => {
        if (updateItem.cars) {
          updateItem.cars[key] = value.length;
        }
        count += value.length;
      });

      updateItem.count_people = count;
      updateItem.free_count = (maxPeopleForBooking || 8) - count;

      if (updateItem.free_count < 0) return false;

      if (count > 0) {
        setValue("variants", updateItem);
      } else {
        setValue("variants", null);
      }
    }
  };

  const isSelected = (props: IClickVariant) => {
    const variant = getVariant; // Актуальный вариант
    if (!variant) return "";
    const selectedIndices = variant.numberEl?.[props.type_car] || [];
    return selectedIndices.includes(props.idx) ? "bg-danger" : "";
  };

  return (
    <Row className="row-gap-1 justify-content-evenly">
      {

        Array.from({length: elem[1].max_count}).map((_, idx) => {
          const freeCars = bookingVariant?.available_cars?.[elem[0]]?.count ?? config?.types?.[selectedTypeCode?.value ?? "adult"]?.cars?.[elem[0]].count
          const maxCars = bookingVariant?.available_cars?.[elem[0]]?.max_count ?? config?.types?.[selectedTypeCode?.value ?? "adult"]?.cars?.[elem[0]].max_count

          return (
            <Col key={bookingVariant.started_at + bookingVariant.ended_at + idx} xs={3}
                 className="px-2"
            >
              {(maxCars || 0) - (freeCars || 0) >= idx + 1 ? (
                <div className={styles.item}>
                  <div className={classNames(styles.itemContent,  {
                      "bg-primary":  (maxCars || 0) - (freeCars || 0) >= idx + 1
                    }
                  )}/>
                </div>
              ) : (
                <div className={styles.item}
                     onClick={() => {clickVariant({
                       type_car: elem[0],
                       started_at: bookingVariant?.started_at,
                       ended_at: bookingVariant?.ended_at,
                       idx
                     })}}
                >
                  <div className={classNames(styles.itemContent, isSelected({
                      type_car: elem[0],
                      started_at: bookingVariant?.started_at,
                      ended_at: bookingVariant?.ended_at,
                      idx
                    })
                  )}/>
                </div>
              )}

            </Col>
          )
      })
      }
    </Row>
  )

}