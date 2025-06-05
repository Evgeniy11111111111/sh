import {Button, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import {
  $usersRequestStore,
  usersRequestFilters,
  usersRequestPage,
  usersRequestSortingReset
} from "../../store/users/userRequestStore.ts";
import {useUnit} from "effector-react";
import HyperDatepicker from "../../components/Datepicker.tsx";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from 'yup';
import {Controller, useForm} from "react-hook-form";

const schemaSearch = yupResolver(
  yup.object().shape({
    search: yup.string()
  })
)

interface IFormData {
  search?: string
}

const updateFilter = (key: string, value: string | null, setter: React.Dispatch<React.SetStateAction<string>>) => {
  setter(value ? value.replace(`filter[${key}]=`, "") : "");
};

const UsersFilter = () => {
  const userRequest = useUnit($usersRequestStore)
  const [gender, setGender] = useState("");
  // const [email, setEmail] = useState("");
  const [family, setFamily] = useState("")
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange

  const handleFilterChange = (setFilter: React.Dispatch<React.SetStateAction<string>>, filterName: string) => (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;

    if (value === "") {
      usersRequestFilters({ name: filterName, value: "" });
    } else {
      const filterValue = `filter[${filterName}]=${value}`;
      usersRequestFilters({ name: filterName, value: filterValue });
    }

    setFilter(value);
  };

  const onDateChange = (date: [Date | null, Date | null]) => {
    if (date) {
      const start = date[0];
      const end = date[1];

      if (start) {
        usersRequestFilters({
          name: `birth_date_from`,
          value: `filter[birth_date_from]=${start.toLocaleDateString()}`,
        });
      } else {
        usersRequestFilters({ name: `birth_date_from`, value: null });
      }

      if (end) {
        usersRequestFilters({
          name: `birth_date_to`,
          value: `filter[birth_date_to]=${end.toLocaleDateString()}`,
        });
      } else {
        usersRequestFilters({ name: `birth_date_to`, value: null });
      }

      setDateRange(date);
    }
  };

  const clearDate = () => {
    usersRequestFilters({name: `birth_date_from`, value: null})
    usersRequestFilters({name: `birth_date_to`, value: null})
    setDateRange([null, null])
  }

  const { control, handleSubmit, reset} = useForm<IFormData>({
    resolver: schemaSearch,
    defaultValues: {
      search:  userRequest?.["filter[fio]"]?.replace("filter[fio]=", "") || ""
    }
  });

  useEffect(() => {
    const filters = [
      { key: "gender", setter: setGender },
      // { key: "has_email", setter: setEmail },
      { key: "has_family_members", setter: setFamily },
    ];

    filters.forEach(({ key, setter }) => {
      updateFilter(key, userRequest?.[`filter[${key}]`] || null, setter);
    });

    const dateFrom = userRequest?.["filter[birth_date_from]"]?.replace('filter[birth_date_from]=', '');
    const dateTo = userRequest?.["filter[birth_date_to]"]?.replace('filter[birth_date_to]=', '');

    const parseDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split('.');
      return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    };

    setDateRange([dateFrom ? parseDate(dateFrom) : null, dateTo ? parseDate(dateTo) : null]);

    reset({
      search: userRequest?.["filter[fio]"]?.replace("filter[fio]=", "") || ""
    });
  }, [userRequest]);



  const searchSubmit = (FormData: IFormData) => {
    if (FormData.search?.length === 0) {
      usersRequestPage(`page=1`)
      usersRequestFilters({name: "fio", value: null})
    } else {
      usersRequestPage(`page=1`)
      usersRequestFilters({name: "fio", value: `filter[fio]=${FormData.search}`})
    }
  }
  return (
    <Row className="row-gap-2 justify-content-between">
      <div className="col-auto">
        <Row className="row-gap-2">
          <div className="col-auto">
            <form onSubmit={handleSubmit(searchSubmit)}>
              <Controller
                name="search"
                control={control}
                render={({field}) => (
                  <input className={`form-control`}
                         {...field}
                         placeholder="Поиск"
                  />
                )}
              />
            </form>
          </div>
          <div className="col-auto">
            <select
              className="form-select w-auto"
              value={gender}
              onChange={handleFilterChange(setGender, "gender")}
            >
              <option value="">Пол</option>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </div>
          {/*<div className="col-auto">*/}
          {/*  <select*/}
          {/*    className="form-select w-auto"*/}
          {/*    value={email}*/}
          {/*    onChange={handleFilterChange(setEmail, "has_email")}*/}
          {/*  >*/}
          {/*    <option value="">Почта</option>*/}
          {/*    <option value="1">Есть почта</option>*/}
          {/*    <option value="0">Нет почты</option>*/}
          {/*  </select>*/}
          {/*</div>*/}
          <div className="col-auto">
            <select
              className="form-select w-auto"
              value={family}
              onChange={handleFilterChange(setFamily, "has_family_members")}
            >
              <option value="">Члены семьи</option>
              <option value="1">Есть семья</option>
              <option value="0">Нет семьи</option>
            </select>
          </div>
          <div className="col-auto">
            <HyperDatepicker
              startDate={startDate}
              endDate={endDate}
              selectsRange={true}
              maxDate={new Date()}
              yearDropdownItemNumber={40}
              showYearDropdown={true}
              showMonthDropdown={true}
              scrollableYearDropdown={true}
              inputClass="border"
              onChange={(update: [Date | null, Date | null]) => {
                onDateChange(update);
              }}
              clear={clearDate}
            />
          </div>
        </Row>
      </div>
      <div className="col-auto float-end">
        <Button onClick={() => {
          usersRequestSortingReset()
        }}>Сбросить фильтр</Button>
      </div>
    </Row>
  );
};

export default UsersFilter;
