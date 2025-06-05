import HeadPage from "../../components/HeadPage.tsx";
import {userSortGetFx} from "../../store/users/getUsers.ts";
import {useEffect} from "react";
import UsersTable from "./Table.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import {useUnit} from "effector-react";
import {$usersRequestStore, IUsersRequestStore, usersRequestInitial} from "../../store/users/userRequestStore.ts";
import {objectToString} from "../../utils";
import UsersFilter from "./Filter.tsx";
import {Card, Col, Row} from "react-bootstrap";
const Users = () => {
  const [userRequest] = useUnit([$usersRequestStore])
  const locations = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const initialRequest: IUsersRequestStore = {};
    queryParams.forEach((value, key) => {
      initialRequest[key] = `${key}=${value}`;
    });

    usersRequestInitial(initialRequest)
  }, []);

  useEffect(() => {
    window.scrollTo(0,0)
  }, []);

  useEffect(() => {
    if (userRequest) {
      const str = objectToString(userRequest, "&");

      navigate(str ? `/users?${str}` : '/users');
    }
  }, [userRequest]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    userSortGetFx(queryParams.toString())
  }, [locations.search]);


  return (
    <>
      <HeadPage title="Пользователи" />
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <UsersFilter />
              <UsersTable />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}
export default Users;