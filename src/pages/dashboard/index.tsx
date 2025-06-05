// import { useState } from "react";
import { Row, Col } from "react-bootstrap";

// components

import RevenueChart from "./RevenueChart";
import SalesAnalyticsChart from "./SalesAnalyticsChart";
import UsersBalances from "./UsersBalances";
import RevenueHistory from "./RevenueHistory";

import { balances, revenueHistory } from "./data";

const Dashboard1 = () => {
  // const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  //
  // /*
  //  * handle date change
  //  */
  // const onDateChange = (date: Date) => {
  //   if (date) {
  //     setSelectedDate(date);
  //   }
  // };

  return (
    <>
      <Row>
        <Col>
          <div className="page-title-box">
            <div className="page-title-right">
              <form className="d-flex align-items-center mb-3">
                <button className="btn btn-blue btn-sm ms-2">
                  <i className="mdi mdi-autorenew"></i>
                </button>
                <button className="btn btn-blue btn-sm ms-1">
                  <i className="mdi mdi-filter-variant"></i>
                </button>
              </form>
            </div>
            <h4 className="page-title">Dashboard</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={4}>
          <RevenueChart />
        </Col>
        <Col lg={8}>
          <SalesAnalyticsChart />
        </Col>
      </Row>

      <Row>
        <Col xl={6}>
          <UsersBalances balances={balances} />
        </Col>
        <Col xl={6}>
          <RevenueHistory revenueHistory={revenueHistory} />
        </Col>
      </Row>
    </>
  );
};

export default Dashboard1;
