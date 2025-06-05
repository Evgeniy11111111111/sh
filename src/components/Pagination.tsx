import React, {useCallback, useEffect, useState} from "react";
import classNames from "classnames";

interface IPagination {
  total: number,
  pageIndex: number,
  onPageChange?: (string: string) => void
  loading?: boolean
}

const Pagination = (props: IPagination) => {
  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get('page') || '1');

  const [pageCount, setPageCount] = useState<number>(props.total);
  const [pageIndex, setPageIndex] = useState<number>(initialPage);

  useEffect(() => {
    setPageCount(props.total);

  }, [props.total]);

  useEffect(() => {
    setPageIndex(props.pageIndex);
  }, [props.pageIndex]);
  const changePage = (page: number) => {

    if (page === pageIndex) {
      return;
    }

    const visiblePages = getVisiblePages(page, pageCount);
    setVisiblePages(filterPages(visiblePages));

    setPageIndex(page)
    if (props.onPageChange) {
      props.onPageChange(String(page))
    }

  };

  const filterPages = useCallback(
    (visiblePages: number[]) => {
      return visiblePages.filter((page: number) => page <= pageCount);
    },
    [pageCount]
  );

  /**
   * handle visible pages
   */
  const getVisiblePages = useCallback(
    (page: number | null, total: number) => {
      if (total < 7) {
        return filterPages([1, 2, 3, 4, 5, 6]);
      } else {
        if (page! % 5 >= 0 && page! > 4 && page! + 2 < total) {
          return [1, page! - 1, page!, page! + 1, total];
        } else if (page! % 5 >= 0 && page! > 4 && page! + 2 >= total) {
          return [1, total - 3, total - 2, total - 1, total];
        } else {
          return [1, 2, 3, 4, 5, total];
        }
      }
    },
    [filterPages]
  );

  const [visiblePages, setVisiblePages] = useState<number[]>(
    getVisiblePages(null, pageCount)
  );

  useEffect(() => {
    const visiblePages = getVisiblePages(pageIndex, pageCount);
    setVisiblePages(visiblePages);
  }, [pageCount, pageIndex, getVisiblePages]);

  const activePage: number = pageIndex;

  return (
    <>
      <div className="d-lg-flex align-items-center text-center pb-1">
        <span className="me-3">
          Страниц{" "}
          <strong>
            {pageIndex} из {props.total}
          </strong>{" "}
        </span>

        <span className="d-inline-block align-items-center text-sm-start text-center my-sm-0 my-2">
          <label className="form-label">Перейти на страницу : </label>
          <input
            type="number"
            value={pageIndex}
            min="0"
            onChange={(e: any) => {
              const page = e.target.value ? Number(e.target.value) : 0;
              if (page < 1 || page > props.total) return false
              changePage(page)
            }}
            className="form-control w-25 ms-1 d-inline-block"
          />
        </span>


        <ul className="pagination pagination-rounded d-inline-flex ms-auto align-item-center mb-0">
          <li key="prevpage"
              className={classNames("page-item", "paginate_button", "previous")}
          >
            <button disabled={props.loading}
                    onClick={() => {
                      if (activePage === 1) return;
                      changePage(activePage - 1);
                    }}
                    className="page-link"
            >
              <i className="mdi mdi-chevron-left"></i>
            </button>
          </li>
          {(visiblePages || []).map((page, index, array) => {
            return array[index - 1] + 1 < page ? (
              <React.Fragment key={page}>
                <li className="page-item d-none d-sm-inline-block">
                  <div className="page-link">
                    ...
                  </div>
                </li>
                <li className={classNames("page-item", "d-none", "d-sm-inline-block", {active: activePage === page,})}>
                  <button className="page-link"
                          onClick={() => changePage(page)}
                          disabled={props.loading}
                  >
                    {page}
                  </button>
                </li>
              </React.Fragment>
            ) : (
              <li key={page}
                  className={classNames("page-item", "d-none", "d-sm-inline-block", {active: activePage === page,})}
              >
                <button className="page-link"
                        onClick={() => changePage(page)}
                        disabled={props.loading}
                >
                  {page}
                </button>
              </li>
            );
          })}
          <li key="nextpage"
              className={classNames("page-item", "paginate_button", "next", {disabled: activePage === props.total})}
          >
            <button className="page-link"
                    onClick={() => {
                      if (activePage === props.total) return;
                      changePage(activePage + 1);
                    }}
                    disabled={props.loading}
            >
              <i className="mdi mdi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </div>
    </>
  )
}

export default Pagination;