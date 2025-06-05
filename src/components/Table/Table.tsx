import classNames from "classnames";
import {arrayToString} from "../../utils";
import Pagination from "../Pagination.tsx";
import styles from "./style.module.scss"
import {Spinner} from "react-bootstrap";

export interface ITableColumns {
  Header: string,
  accessor: string,
  sort?: () => void
}
interface TableProps {
  columns: ITableColumns[];
  data: any[];
  tableClass?: string;
  theadClass?: string;
  pagination?: number;
  currentPage?: number;
  pageChange?: (string: string) => void;
  loading?: boolean
}

// function arrayRows<T>(rows: T[]) {
//   return Object.entries(rows)
// }

const Table = (props: TableProps) => {

  return (
    <>
      <div className="table-responsive">
        <table
          className={classNames(
            "table table-centered react-table table-striped dt-responsive w-100",
          )}
        >
          <thead className={props["theadClass"]}>
            <tr>
              {(props.columns || []).map((column) => (
                <th onClick={column.sort}>
                  {column.Header}
                </th>
              ))}
            </tr>

          </thead>
          <tbody>
          {(props.data || []).map((row) => {
            return (
              <tr key={row.id}>
                {(props.columns || []).map((column) => {
                  const cellValue = row[column.accessor];
                  return (
                    <td key={column.accessor + row.id}
                        className={column.accessor === "phone" ? "text-nowrap" : ''}
                    >
                      {
                        Array.isArray(cellValue) ? arrayToString(cellValue) : cellValue
                      }
                    </td>
                  );
                })}
              </tr>
            );
          })}
          </tbody>
        </table>
        {props.loading && (
          <div className={styles.loading}>
            <Spinner animation="grow" variant="primary" style={{width: "100px", height: "100px"}}/>
          </div>
        )}
      </div>
      {props.pagination && props.pagination > 0 && (
        <Pagination total={props.pagination}
                    pageIndex={props.currentPage ? props.currentPage : 1}
                    onPageChange={(props.pageChange)}
                    loading={props.loading}
        />
      )}
    </>
  );
};

export default Table;
