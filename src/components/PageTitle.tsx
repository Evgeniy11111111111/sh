import { Row, Col, Breadcrumb } from "react-bootstrap";

interface BreadcrumbItems {
  label: string;
  path: string;
  active?: boolean;
}

interface PageTitleProps {
  breadCrumbItems: Array<BreadcrumbItems>;
  title: string;
}

/**
 * PageTitle
 */
const PageTitle = (props: PageTitleProps) => {
  return (
    <Row>
      <Col>
        <div className="page-title-box">
          <div className="page-title-right">
            <Breadcrumb className="m-0">
              <Breadcrumb.Item href="/">UBold</Breadcrumb.Item>

              {(props["breadCrumbItems"] || []).map((item, index) => {
                return item.active ? (
                  <Breadcrumb.Item active key={index}>
                    {item.label}
                  </Breadcrumb.Item>
                ) : (
                  <Breadcrumb.Item key={index} href={item.path}>
                    {item.label}
                  </Breadcrumb.Item>
                );
              })}
            </Breadcrumb>
          </div>
          <h4 className="page-title">{props["title"]}</h4>
        </div>
      </Col>
    </Row>
  );
};

export default PageTitle;
