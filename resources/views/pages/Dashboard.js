import React, { 
  Component,
  useState,
  useEffect
} from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  FormGroup,
	Input,
  Row,
  Col,
  Button
} from 'reactstrap';
import { Line } from 'react-chartjs-2';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import * as Feather from 'react-feather';

import PageLoader from '../layout/PageLoader';
import {
  UserName,
  UserImage,
  Loader
} from '../components';

import {
  URL,
  months,
  getDateRange,
  getTotalColumn,
  defaultLine,
  numberWithCommas
} from '../config';
import {DashboardController} from '../controllers';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      client: {},
      users: []
    };
  }

  loadingToggle = loading => this.setState({loading});

  componentDidMount = () => {
    this.getDashboardData();
  }

  getDashboardData = () => {
    DashboardController.data()
    .then(res => {
      this.loadingToggle(false);
      const {
        client,
        users
      } = res.data;

      this.setState({
        client,
        users
      });
    })
    .catch(err => {
      this.loadingToggle(false);
      console.log(err);
      console.log(err.response);
    });
  }

  render() {
    return (
      <div className="dashboard-section">
        <PageLoader loading={this.state.loading}>
          <FormGroup>
            <h1>{this.state.client.business_name}</h1>
            <p className="text-muted">
              {this.state.client.name} ({this.state.client.business_nature})
            </p>
          </FormGroup>

          <Row>
            <Col xl={4}>
              <ClientTotalAmount users={this.state.users} />
            </Col>

            <Col xl={4}>
              <ClientTotalDistance users={this.state.users} />
            </Col>

            <Col xl={4}>
              <ClientTotalTrip users={this.state.users} />
            </Col>
          </Row>

          <Row>
            <Col xl={8}>
              <DashboardGraph />
            </Col>

            <Col xl={4}>
              <UserTopDistanceList users={this.state.users} />
            </Col>
          </Row>
        </PageLoader>
      </div>
    );
  }
}

const ClientTotalAmount = ({users}) => {
  const totalAmount = users.length !== 0 ? getTotalColumn(users, 'amount') : 0;

  return (
    <Card>
      <CardHeader>
        Total Amount{' '}&nbsp;
        <Feather.TrendingUp className="text-success" />
        {/* <Button size="sm" className="pull-right">
          View
        </Button> */}
      </CardHeader>
      <CardBody>
        <Card className="mb-0 bg-light">
          <CardBody>
            <h2 className="mb-0 inline-block">
              <span>₱ {numberWithCommas(totalAmount)}</span>
            </h2>
          </CardBody>
        </Card>
      </CardBody>
    </Card>
  )
}

const ClientTotalDistance = ({users}) => {
  const totalDistance = users.length !== 0 ? getTotalColumn(users, 'campaign_traveled') : 0;

  return (
    <Card>
      <CardHeader>
        Total Campaign Traveled{' '}&nbsp;
        <Feather.Compass className="text-primary" />
        {/* <Button size="sm" className="pull-right">
          View
        </Button> */}
      </CardHeader>
      <CardBody>
        <Card className="mb-0 bg-light">
          <CardBody>
            <h2 className="mb-0 inline-block">
              <span>{numberWithCommas(totalDistance)} km</span>
            </h2>
          </CardBody>
        </Card>
      </CardBody>
    </Card>
  )
}

const ClientTotalTrip = ({users}) => {
  const totalTrip = users.length !== 0 ? getTotalColumn(users, 'trip_traveled') : 0;

  return (
    <Card>
      <CardHeader>
        Total Trips Traveled{' '}&nbsp;
        <Feather.Map className="text-danger" />
        {/* <Button size="sm" className="pull-right">
          View
        </Button> */}
      </CardHeader>
      <CardBody>
        <Card className="mb-0 bg-light">
          <CardBody>
            <h2 className="mb-0 inline-block">
              <span>{numberWithCommas(totalTrip)} km</span>
            </h2>
          </CardBody>
        </Card>
      </CardBody>
    </Card>
  )
}

const DashboardGraph = props => {
  const [init, setInit] = useState(false);
  const [line, setLine] = useState(defaultLine([], []));
  const [searchLoading, setSearchLoading] = useState(true);
  
  useEffect(() => {
    if(!init) {
      setInit(true);
      getGraphData();
    }
  });

  const getGraphData = (value = 0) => {
    const dateRange = getDateRange(value);
    const l = dateRange.map(dr => dr.label);
    const ds = dateRange.map(dr => dr.dataset);
    
    DashboardController.graph({
      date_from: ds[0],
      date_to: ds[ds.length - 1]
    })
    .then(res => {
      const {data} = res;
      const dsToSend = ds.map((dsData, index) => {
        const fromDateData = new Date(dsData).getTime();
        const toDateData = index === (ds.length - 1) ? null : new Date(ds[index + 1]).getTime();
        const filteredData = data.map(resData => {
          const filteredDateData = new Date(resData.started).getTime();
          if(fromDateData <= filteredDateData)
            if(!toDateData || toDateData > filteredDateData)
              return parseFloat(resData.campaign_traveled);
              
          return 0;
        });

        return filteredData.length !== 0
          ? filteredData.reduce((total, elem) => total + elem)
          : 0;
      });

      setLine(defaultLine(l, dsToSend));
      setSearchLoading(false);
    })
    .catch(err => {
      console.log(err);
      console.log(err.response);
      setSearchLoading(false);
    });
  }

  const selectDateRange = e => {
    const range = parseInt(e.currentTarget.value);
    setSearchLoading(true);
    getGraphData(range);
  }

  return (
    <Card>
      <CardHeader className="d-flex justify-content-between align-items-center">
        Campaign Graph
        <div className="float-right">
          <Input
            type="select"
            onChange={selectDateRange}
            defaultValue="0"
          >
            <option value="0">week</option>
            <option value="1">month</option>
            <option value="2">year</option>
          </Input>
        </div>
      </CardHeader>
      <CardBody>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {searchLoading ? (
            <Loader type="spin" />
          ) : (
            <Line
              data={line.data}
              width={2068}
              height={846}
              legend={{ display: false }}
              options={line.options}
            />
          )}
        </div>
      </CardBody>
    </Card>
  )
}

const UserTopDistanceList = ({users}) => {
  return (
    <Card>
      <CardHeader>Top Distance Users (km)</CardHeader>
      <CardBody>
        <UserContainer>
          <UserList users={users} />
        </UserContainer>
      </CardBody>
    </Card>
  )
}

const UserContainer = ({children}) => {
  return (
    <div
      style={{
        height: '405px'
      }}
    >{children}</div>
  )
}

const UserList = ({users}) => {
  if(users.length !== 0) {
    return users.map((u, uIdx) =>
      <div
        key={uIdx}
        className="ds-user-list"
      >
        <div
          style={{
            width: 40
          }}
        >
          <h5 className="mb-0">{uIdx + 1}.</h5>
        </div>

        <UserImage row={u} />

        <UserName
          row={u}
          style={{
            padding: '0px 15px',
            flex: 2
          }}
        />

        <div
          style={{
            flex: 1
          }}
        >
          <h5 className="mb-0 font-weight-bold">{u.campaign_traveled}</h5>
        </div>
      </div>
    )
  } else {
    return (
      <div className="text-center">
        <i>-- no users available --</i>
      </div>
    )
  }
}