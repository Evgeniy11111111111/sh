import { Card } from "react-bootstrap";
const SalesAnalyticsChart = () => {
  return (
    <>
      <Card>
        <Card.Body>
          <div className="float-end d-none d-md-inline-block">
            <div className="btn-group mb-2">
              <button type="button" className="btn btn-xs btn-light">
                Today
              </button>
              <button type="button" className="btn btn-xs btn-light">
                Weekly
              </button>
              <button type="button" className="btn btn-xs btn-secondary">
                Monthly
              </button>
            </div>
          </div>

          <h4 className="header-title mb-3">Sales Analytics</h4>
        </Card.Body>
      </Card>
    </>
  );
};

export default SalesAnalyticsChart;
