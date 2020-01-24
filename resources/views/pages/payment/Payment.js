import React, {
  Component,
  useState,
  useEffect
} from 'react';
import {
  Row,
  Col,
  Input,
  Button,
  Badge,
  Card,
  Alert,
  CardBody,
  FormGroup,
  InputGroup,
  InputGroupAddon
} from 'reactstrap';
import DataTable from 'react-data-table-component';
import FA from 'react-fontawesome';

import {PaymentController} from '../../controllers';
import {
  numberWithCommas,
  getMonthDiff,
  months,
  getDayDiff,
  URL
} from '../../config';

import {Loader} from '../../components';
import PageLoader from '../../layout/PageLoader';

export default class Payment extends Component {
  constructor(props) {
    super(props);

		this.cid = this.props.match.params.id;
		if(isNaN(this.cid))
			this.props.history.push('/campaign/list');
    
    this.state = {
      campaign: {},
      users: [],
      userPaymentData: [],
      loading: true,
      selectedMonth: null,
      selectedLoading: false,
      selectedUsers: [],
      alert: {
        visible: false,
        text: '',
        color: 'success'
      }
    };
  }

  componentDidMount = () => {
    PaymentController.data(this.cid)
    .then(res => {
      const {campaign, users} = res.data;
      this.setState({campaign, users, loading: false});
    })
    .catch(err => {
      console.log(err);
      console.log(err.response);
    });
  }

  selectedMonthChanged = month => {
    if(this.state.selectedMonth !== month) {
      this.setState({selectedMonth: month});
      this.getPaymentData(month);
    }
  }

  getPaymentData = (month = this.state.selectedMonth) => {
    this.setState({selectedLoading: true});
    PaymentController.getPayment(
      `?cid=${this.cid}&date=${month}`
    )
    .then(res => {
      this.setState({
        userPaymentData: res.data,
        selectedLoading: false
      });
    })
    .catch(err => {
      console.log(err);
      console.log(err.response);
      this.setState({selectedLoading: false});
    });
  }
 
  submitPayment = (amount, callback) => {
    const {selectedMonth, selectedUsers} = this.state;
    if(!selectedMonth) {
      callback();
      this.setAlert('danger', 'Please select the date in the dropdown below');
    } else if(selectedUsers.length === 0) {
      callback();
      this.setAlert('danger', `Please select users to pay`);
    } else {
      PaymentController.sendPayment({
        amount,
        cid: this.cid,
        date: selectedMonth,
        users: selectedUsers.map(u => u.id),
        date: this.state.selectedMonth
      })
      .then(res => {
        console.log(res.data);
        this.setAlert('success', `User payment updated`);
        callback();
        this.getPaymentData();
      })
      .catch(err => {
        console.log(err);
        console.log(err.response);
        callback();
      });
    }
  }

  setAlert = (color, text) => {
    const {alert} = this.state;
    alert.color = color;
    alert.text = text;
    this.setState({alert});

    if(alert.visible) {
      this.toggleAlert();
      setTimeout(() => this.toggleAlert(), 300);
    } else {
      this.toggleAlert();
    }
  }

  toggleAlert = () => {
    const {alert} = this.state;
    alert.visible = !alert.visible;
    this.setState({alert});
  }

  render() {
    return (
      <div className="campaign-payment-section">
        <Alert
          color={this.state.alert.color}
          isOpen={this.state.alert.visible}
          toggle={this.toggleAlert}
          fade={true}
        >{this.state.alert.text}</Alert>

        <PageLoader loading={this.state.loading}>
          <Row>
            <Col lg="6">
              <Card>
                <CardBody>
                  <h3>{this.state.campaign.name}</h3>
                  <SelectDate
                    campaign={this.state.campaign}
                    selectedMonthChanged={this.selectedMonthChanged}
                  />
                  </CardBody>
                </Card>
            </Col>

            <Col lg="6">
              <Card>
                <CardBody>
                  <h3>Payment</h3>
                  <PaymentSection
                    submitPayment={this.submitPayment}
                    setAlert={this.setAlert}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
          
          <UserTable
            userPaymentData={this.state.userPaymentData}
            selectedLoading={this.state.selectedLoading}
            selectedMonth={this.state.selectedMonth}
            setSelectedUsers={selectedUsers => this.setState({selectedUsers})}
            amount={this.state.paymentAmount}
            users={this.state.users}
          />
        </PageLoader>
      </div>
    )
  }
}

const SelectDate = ({campaign, selectedMonthChanged}) => {
  const [monthsOptions, setMonthsOptions] = useState([]);
  const [badgeColor, setBadgeColor] = useState('success');
  const [dueIn, setDueIn] = useState('');
  
  useEffect(() => {
    if(Object.keys(campaign).length !== 0) {
      const monthDiff = getMonthDiff(campaign.duration_from, campaign.duration_to);
      const firstMonth = parseInt(campaign.duration_from.split('-')[1]) - 1;
      const year = parseInt(campaign.duration_from.split('-')[0]);
      const d = new Date();
      const dYear = d.getFullYear();
      const dMonth = d.getMonth() + 1;
      const lastDay = (new Date(dYear, dMonth, 0)).getDate();
      const dueDay = campaign.vehicle_update_date > lastDay ? lastDay : campaign.vehicle_update_date;
      const upcomingDate = `${dYear}-${dMonth}-${dueDay}`;
      const dayRemaning = getDayDiff(upcomingDate, d);
      const dueText = `Due ${dayRemaning === 0 ? 'today' : `in ${dayRemaning} day/s`}`;
      const dueColor = dayRemaning === 0 ? 'danger' : (dayRemaning > 5 ? 'success' : 'warning');
      setDueIn(dueText);
      setBadgeColor(dueColor);
      
      const monthToSet = Array(monthDiff).fill(null).map((d, dIdx) => {
        const monthAdded = firstMonth + 1 + dIdx;
        const yearToAdd = Math.floor(monthAdded / 12);
        const nextMonth = monthAdded - (12 * yearToAdd);
        return {
          label: `${months.three[nextMonth]}, ${year + yearToAdd}`,
          value: `${year + yearToAdd}-${nextMonth}-${dueDay}/${year + yearToAdd}-${nextMonth + 1}-${dueDay}`
        };
      });
      setMonthsOptions(monthToSet);
    }
  }, [campaign]);

  const monthOnChange = e => {
    const selectedMonth = e.target.value;
    selectedMonthChanged(selectedMonth);
  }
  
  return (
    <div>
      <Row className="align-items-center mb-2">
        <Col lg="6">
          <Input
            type="select"
            onChange={monthOnChange}
          >
            <option value="">-- Select Date --</option>
            {monthsOptions.map((m, mIdx) =>
              <option key={mIdx} value={m.value}>{m.label}</option>  
            )}
          </Input>
        </Col>
      </Row>

      <Badge color={badgeColor}>{dueIn}</Badge>
    </div>
  );
}

const UserTable = props => {
  const {
    users,
    selectedLoading,
    setSelectedUsers,
    selectedMonth,
    userPaymentData
  } = props;
  const [tableUsers, setTableUsers] = useState(users);
  const [clearRows, setClearRows] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const newTableUsers = searchText === ''
      ? users
      : users.filter(u =>
        (new RegExp(searchText.toLowerCase())).test(u.name.toLowerCase()) ||
        (new RegExp(searchText.toLowerCase())).test(u.username.toLowerCase())
      );
    setTableUsers(newTableUsers);
  }, [searchText]);

  useEffect(() => {
    const newTableUsers = tableUsers.map(u => {
      const up = userPaymentData.find(p => p.id === u.id);
      if(up)
        Object.assign(u, {
          remaining_distance: !up.remaining_distance ? '0.00' : numberWithCommas(up.remaining_distance),
          trip_traveled: !up.trip_traveled ? '0.00' : numberWithCommas(up.trip_traveled),
          campaign_traveled: !up.campaign_traveled ? '0.00' : numberWithCommas(up.campaign_traveled),
          amount_paid: !up.amount_paid ? '0.00' : numberWithCommas(up.amount_paid)
        });
        
      return u;
    });
    
    setTableUsers(newTableUsers);
  }, [userPaymentData]);
  
  const handleChange = (state) => {
    setClearRows(false);
    setSelectedUsers(state.selectedRows);
  }
  
  const onClearRowsClicked = () => {
    setClearRows(true);
    setSelectedUsers([]);
  }

  return (
    <Card>
      <CardBody>
        <FormGroup>
          <Row>
            <Col lg="3">
              <Input
                type="text"
                placeholder="search user..."
                onChange={({currentTarget}) =>
                  setSearchText(currentTarget.value)
                }
              />
            </Col>
          </Row>
        </FormGroup>

        <FormGroup>
          {selectedLoading ? (
            <Loader type="puff" />
          ) : (
            <DataTable
              title="Users"
              columns={tableColumns.user()}
              data={selectedMonth ? tableUsers : []}
              pagination
              highlightOnHover
              selectableRows
              selectableRowsHighlight
              onSelectedRowsChange={handleChange}
              clearSelectedRows={clearRows}
              contextMessage={{
                singular: 'user',
                plural: 'users',
                message: 'selected'
              }}
            />
          )}
        </FormGroup>
        
        <Button
          color="primary"
          onClick={onClearRowsClicked}
        >Clear Rows</Button>
      </CardBody>
    </Card>
  )
}

const PaymentSection = ({submitPayment, setAlert}) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentPrevent, setPaymentPrevent] = useState(false);
  const [loading, setLoading] = useState(false);

  const paymentOnChange = e => {
    const {value} = e.currentTarget;
    if(!paymentPrevent) {
      setPaymentAmount(value);
    } else {
      e.preventDefault();
    }
  }

  const paymentOnKeyDown = e => {
    setPaymentPrevent((!isNaN(e.key) || e.key === 'Backspace') && e.keyCode !== 32 ? false : true);
  }

  const submitButtonOnClick = () => {
    if(paymentAmount !== '' && paymentAmount > 0) {
      setLoading(true);
      submitPayment(paymentAmount, () => {
        setLoading(false);
      });
    } else {
      setAlert('danger', 'Please put the amount of payment. Thank you!');
    }
  }

  return (
    <div>
      <Row className="mb-2">
        <Col lg="6">
          <InputGroup>
            <InputGroupAddon addonType="prepend">₱</InputGroupAddon>
            <Input
              type="text"
              value={paymentAmount}
              onChange={paymentOnChange}
              onKeyDown={paymentOnKeyDown}
              placeholder="Payment Amount"
            />
            <InputGroupAddon addonType="append">.00</InputGroupAddon>
          </InputGroup>
        </Col>
      </Row>

      <Button
        color="success"
        onClick={submitButtonOnClick}
        disabled={loading}
      >
        {loading ? (
          <Loader type="puff" small={true} />
        ) : (
          <span>Submit{' '}<FA name="paper-plane" /></span>
        )}
        
      </Button>
    </div>
  )
}

const TableRow = {
	Name: ({row}) => {
		return (
			<div>
				<h5 className="mb-0 font-weight-bold">{row.name}</h5>
				<h6 className="mb-0">{row.username}</h6>
			</div>
		);
	},
	Image: ({row}) => {
		return (
			<div
				style={{
					width: 80,
					height: 80,
					display: 'flex',
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				<div
					style={{
						width: 60,
						height: 60,
						borderRadius: 40,
						overflow: 'hidden'
					}}
				>
					<img
						src={`${URL.STORAGE_URL}/${row.url}`}
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
							overflow: 'hidden'
						}}
					/>
				</div>
			</div>
		);
	}
}

const tableColumns = {
  user: () => {
    return [
      {
        name: '',
        sortable: true,
        width: '100px',
        wrap: true,
        cell: row => <TableRow.Image row={row} />
      }, {
        name: 'Name',
        sortable: true,
        cell: row => <TableRow.Name row={row} />
      }, {
        name: 'Remaining Travel Distance',
        sortable: true,
        selector: 'remaining_distance',
        cell: row => {
          const text = row.remaining_distance;
          const rdNumber = isNaN(text) ? text.replace(/,/g, '') : text;
          const className = parseFloat(rdNumber) < 50 ? (
            parseFloat(rdNumber) > 0 ? 'bg-warning' : 'bg-danger'
          ) : 'bg-success';
          return <span className={`p-1 rounded text-white ${className}`}>{text}</span>
        }
      }, {
        name: 'Campaign Traveled',
        sortable: true,
        selector: 'campaign_traveled',
      }, {
        name: 'Trip Traveled',
        sortable: true,
        selector: 'trip_traveled',
      }, {
        name: 'Amount Paid (₱)',
        sortable: true,
        selector: 'amount_paid',
      }, {
        name: 'Vehicle Update Photos',
        sortable: false,
        cell: row =>
          <Button color="success">
            View
          </Button>
      }
    ];
  }
}