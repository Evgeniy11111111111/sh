import { Card, Dropdown} from "react-bootstrap";

// components
const RevenueChart = () => {

  return (
    <>
      <Card>
        <Card.Body>
          <Dropdown className="float-end" align="end">
            <Dropdown.Toggle as="a" className="cursor-pointer card-drop">
              <i className="mdi mdi-dots-vertical"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>Sales Report</Dropdown.Item>
              <Dropdown.Item>Export Report</Dropdown.Item>
              <Dropdown.Item>Profit</Dropdown.Item>
              <Dropdown.Item>Action</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <h4 className="header-title mb-0">Total Revenue</h4>

          <div className="widget-chart text-center" dir="ltr">

            <h5 className="text-muted mt-0">Total sales made today</h5>
            <h2>$178</h2>

            <p className="text-muted w-75 mx-auto sp-line-2">
              Traditional heading elements are designed to work best in the meat
              of your page content.
            </p>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default RevenueChart;
