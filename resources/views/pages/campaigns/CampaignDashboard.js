import React, {
	Component,
	useState,
	useEffect
} from 'react';
import {
	Row,
	Col,
	FormGroup,
	Card,
	CardHeader,
	CardBody,
	Input,
	Button,
	Modal,
	Alert,
	ModalHeader,
	ModalBody,
	ModalFooter
} from 'reactstrap';
import DataTable from 'react-data-table-component';
import {
	FaTimesCircle,
	FaCheckCircle
} from 'react-icons/fa';
import {Line} from 'react-chartjs-2';
import * as Feather from 'react-feather';

import {CampaignController} from '../../controllers';
import {
	URL,
	getTotalPay,
	getTotalDistance,
	dateTimeString,
	getTotalColumn,
	getDateRange,
	defaultLine,
	numberWithCommas
} from '../../config';

import {
	UserName,
	UserImage,
	Loader
} from '../../components';
import PageLoader from '../../layout/PageLoader';

export default class CampaignDashboard extends Component {
	constructor(props) {
		super(props);

		this.cid = this.props.match.params.id;
		if(isNaN(this.cid)) {
			this.props.history.push('/campaign/list');
		}

		this.state = {
			loading: true,
			campaign: {},
			users: []
		};
	}

	componentDidMount = () => {
		this.setState({loading: true});
		CampaignController.dashboard(this.cid)
		.then(res => {
			const {campaign, users} = res.data;
			this.setState({
				loading: false,
				campaign,
				users
			});
		})
		.catch(err => {
			console.log(err);
			console.log(err.response);
			if(err.response.data) {
				if(err.response.data.status === 'error') {
					alert(err.response.data.message);
					this.props.history.push('/campaign/list');
				} else {
					if(confirm('Server error. Click "Ok" to refresh.'))
						location.reload();

					this.setState({loading: false});
				}
			}
		});
	}

	campaignUsersUpdate = users => {
		const {campaign} = this.state;
		campaign.users = users;
		this.setState({campaign});
	}
	
	render() {
		return (
			<div className="campaign-dashboard-section">
				<PageLoader loading={this.state.loading}>
					<h1 className="mb-0">{this.state.campaign.name}</h1>
					<h5 className="text-muted mb-3">
						Location: {this.state.campaign.location
							? this.state.campaign.location.map(l => l.name).join(', ')
							: null}
					</h5>
					
					<Card style={{ backgroundColor: '#f7f7f7' }}>
						<CardBody>
							<p className="mb-0 text-muted">
								{this.state.campaign.description}
							</p>
						</CardBody>
					</Card>

					<CampaignContainer>
						<CampaignInfoCard campaign={this.state.campaign} />
						<CampaignUsers
							campaign={this.state.campaign}
							updateCampaign={this.campaignUsersUpdate}
							cid={this.cid}
							history={this.props.history}
						/>
					</CampaignContainer>
					
					<CampaignGraph
						cid={this.cid}
						users={this.state.users}
					/>
				</PageLoader>
			</div>
		);
	}
}

const NavForUserData = ({children}) => {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center'
			}}
		>{children}</div>
	)
}

const CampaignContainer = ({children}) => {
	return (
		<FormGroup
			style={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'flex-start',
				flexWrap: 'wrap',
				justifyContent: 'space-around',
				marginLeft: '-15px',
				marginRight: '-15px'
			}}
		>{children}</FormGroup>
	)
}

const CampaignInfoCard = ({campaign}) => {
	return (
		<div
			style={{
				paddingLeft: '15px',
				paddingRight: '15px',
				width: '100%',
				maxWidth: '600px',
			}}
		>
			<Card
				style={{
					overflow: 'hidden',
				}}
			>
				<div
					style={{				
						height: '320px',
						overflow: 'hidden'
					}}
				>
					<img
						src={`${URL.STORAGE_URL}/${campaign.url}`}
						style={{
							width: '100%',
							objectFit: 'cover'
						}}
					/>

					<div
						style={{
							position: 'absolute',
							height: '170px',
							width: '100%',
							top: 0,
							left: 0
						}}
					>
						<img
							src={`${URL.basePath}/images/active_campaign_gradient.png`}
							style={{
								width: '100%',
								height: '100%'
							}}
						/>
					</div>

					<div
						style={{
							position: 'absolute',
							top: 16,
							left: 16,
						}}
					>
						<DashboardText.White text={dateTimeString(campaign.duration_from)} />
						&nbsp;<DashboardText.White text={'-'} />&nbsp;
						<DashboardText.White text={dateTimeString(campaign.duration_to)} />
					</div>
				</div>

				<CardBody>
					<FormGroup>
						<h4 className="text-center">Campaign Details</h4>
						<Row>
							<Col md="4" className="text-center">
								<DashboardText.Label text="Total Pay" />
								<CampaignAdditionalInfo
									text={`₱${getTotalPay(campaign)}`}
								/>
							</Col>
							
							<Col md="4" className="text-center">
								<DashboardText.Label text="Total Distance" />
								<CampaignAdditionalInfo
									text={`${getTotalDistance(campaign)}km`}
								/>
							</Col>
							
							<Col md="4" className="text-center">
								<DashboardText.Label text="Bonus" />
								<CampaignAdditionalInfo
									text={`₱${numberWithCommas(campaign.completion_bonus)}`}
								/>
							</Col>
						</Row>
					</FormGroup>

					<hr />

					<FormGroup>
						<h4 className="text-center">Duration</h4>
						<Row>
							<Col md="4" className="text-center">
								<DashboardText.Label text="From" />
								<CampaignAdditionalInfo
									text={dateTimeString(campaign.duration_from, true)}
								/>
							</Col>
							
							<Col md="4" className="text-center">
								<DashboardText.Label text="To" />
								<CampaignAdditionalInfo
									text={dateTimeString(campaign.duration_to, true)}
								/>
							</Col>
							
							<Col md="4" className="text-center">
								<DashboardText.Label text="Update day" />
								<CampaignAdditionalInfo
									text={campaign.vehicle_update_date}
								/>
							</Col>
						</Row>
					</FormGroup>
				</CardBody>
			</Card>
		</div>
	);
}

const CampaignAdditionalInfo = ({text}) => {
	return (
		<div
			style={{
				borderRadius: '40px',
				padding: '10px 20px',
				boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
				backgroundColor: '#37abb4',
				textAlign: 'center'
			}}
		>
			<DashboardText.White text={text} />
		</div>
	)
}

const CampaignUsers = props => {
	const {campaign, updateCampaign, cid} = props;
	const [userData, setUserData] = useState([]);

	useEffect(() => {
		setUserData(campaign.users);
	}, [campaign.users]);

	const dropdownValues = [
		'All', 'Pending', 'Accepted',
		'Rejected', 'Completed',
		'Incomplete', 'Installed',
		'Not yet Installed', 'Ended'
	];

	const columns = [
		{
			name: '',
			sortable: true,
			width: '100px',
			wrap: true,
			cell: row => <UserImage row={row} />
		}, {
			name: 'Name',
			sortable: true,
			cell: row => <UserName row={row} />
		}, {
			name: 'Campaign Traveled',
			sortable: true,
			selector: 'campaign_traveled',
		}, {
			name: 'Trip Traveled',
			sortable: true,
			selector: 'trip_traveled',
		}
	];

	const changedCategory = e => {
		const cat = parseInt(e.target.value);
		switch (cat) {
			case 1:
				setUserData(campaign.users.filter(u => u.request_status === 0));
				break;
				
			case 2:
				setUserData(campaign.users.filter(u => u.request_status === 1));
				break;
			
			case 3:
				setUserData(campaign.users.filter(u => u.request_status === 2));
				break;
				
			case 4:
				setUserData(campaign.users.filter(u => u.completed === 1));
				break;
		
			case 5:
				setUserData(campaign.users.filter(u => u.completed === 0));
				break;
		
			case 6:
				setUserData(campaign.users.filter(u => u.installed === 1));
				break;

			case 7:
				setUserData(campaign.users.filter(u => u.installed === 0));
				break;

			case 8:
				setUserData(campaign.users.filter(u => u.end === 1));
				break;

			default:
				setUserData(campaign.users);
		}
	}
	
	return (
		<div
			style={{
				paddingLeft: '15px',
				paddingRight: '15px',
				flex: 1,
				flexGrow: 1,
				minWidth: '55%'
			}}
		>
			<Card>
				<CardBody>
					<FormGroup>
						<NavForUserData>
							<EditUsersButton
								users={userData}
								updateCampaign={updateCampaign}
								cid={cid}
							/>

							<Button
								color="warning"
								onClick={() =>
									props.history.push(`/campaign/payment/${cid}`)
								}
							>
								Payment
							</Button>
						</NavForUserData>
					</FormGroup>

					<FormGroup>
						<Input
							type="select"
							defaultValue={0}
							onChange={changedCategory}
						>
							{dropdownValues.map((option, optionIdx) =>
								<option
									key={optionIdx}
									value={optionIdx}
								>{option}</option>
							)}
						</Input>
					</FormGroup>

					<FormGroup>
						<DataTable
							title="Users"
							columns={columns}
							data={userData}
							pagination={true}
							highlightOnHover={true}
						/>
					</FormGroup>
				</CardBody>
			</Card>
		</div>
	)
}

const CampaignGraph = ({cid, users}) => {
	return (
		<div>
			<Row>
				<Col xl={4}>
					<ClientTotalAmount users={users} />
				</Col>

				<Col xl={4}>
					<ClientTotalDistance users={users} />
				</Col>

				<Col xl={4}>
					<ClientTotalTrip users={users} />
				</Col>
			</Row>

			<Row>
				<Col xl={8}>
					<DashboardGraph cid={cid} />
				</Col>

				<Col xl={4}>
					<UserTopDistanceList users={users} />
				</Col>
			</Row>
		</div>
	);
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

const DashboardGraph = ({cid}) => {
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
		
		CampaignController.graph({
			cid,
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
        className="cds-user-list"
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

const EditUsersButton = props => {
	const {users, updateCampaign, cid} = props;
	const [modalVisible, setModalVisible] = useState(false);
	const [userData, setUserData] = useState([]);
	const [dataToSubmit, setDataToSubmit] = useState([]);
	const [alertVisible, setAlertVisible] = useState(false);
	const [alertColor, setAlertColor] = useState('success');
	const [alertMessage, setAlertMessage] = useState('');

	useEffect(() => {
		setUserData(users.filter(u => u.request_status !== 0 && u.end !== 1));
	}, [users]);

	const toggle = () => setModalVisible(!modalVisible);

	const toggleAlert = (visible = false) => setAlertVisible(visible);

	const checkboxToggle = (userCampaign, value, column_name) => {
		const userClickedIndex = dataToSubmit.findIndex(d => d.user_campaign_id === userCampaign.id && d.column_name=== column_name);
		const columnValue = users.find(u => u.id === userCampaign.id)[column_name];
		const newDataToSubmit = dataToSubmit;

		if(userClickedIndex !== -1) {
			if(columnValue === value) {
				newDataToSubmit.splice(userClickedIndex, 1);
			} else {
				newDataToSubmit[userClickedIndex].value = value;
			}
		} else {
			if(columnValue !== value)
				newDataToSubmit.push({
					user_campaign_id: userCampaign.id,
					column_name,
					value
				});
		}
		setDataToSubmit(newDataToSubmit);
	}

	const saveEditedUsers = () => {
		if(dataToSubmit.length !== 0) {
			CampaignController.updateUserData({formData: dataToSubmit, cid})
			.then(res => {
				setDataToSubmit([]);
				updateCampaign(res.data);
				setAlertColor('success');
				setAlertMessage('User updated successfully');
				toggleAlert(true);
			})
			.catch(err => {
				console.log(err);
				console.log(err.response);
				setAlertColor('danger');
				setAlertMessage('Server Error: Please try again later.');
				toggleAlert(true);
			});
		}
	}

	const backBtnClicked = () => {
		toggleAlert(false);
		toggle(false);
	}

	const columns = [
		{
			name: '',
			sortable: true,
			width: '100px',
			wrap: true,
			cell: row => <UserImage row={row} />
		}, {
			name: 'Name',
			sortable: true,
			cell: row => <UserName row={row} />
		}, {
			name: 'Completed',
			center: true,
			cell: row =>
				<CheckboxIcon
					row={row}
					col="completed"
					checkboxToggle={checkboxToggle}
				/>
		}, {
			name: 'Installed',
			center: true,
			cell: row => 
				<CheckboxIcon
					row={row}
					col="installed"
					checkboxToggle={checkboxToggle}
				/>
		}
	];

	return (
		<div className="pr-3">
			<Button color="primary" onClick={e => toggle()}>
				Edit Users
			</Button>

			<Modal isOpen={modalVisible} toggle={backBtnClicked} size="xl">
				<ModalHeader toggle={backBtnClicked}>
					Edit User Data
				</ModalHeader>

				<ModalBody>
					<Alert
						color={alertColor}
						isOpen={alertVisible}
						toggle={() => toggleAlert()}
					>{alertMessage}</Alert>

					<DataTable
						title="Users"
						columns={columns}
						data={userData}
						pagination={true}
						highlightOnHover={true}
					/>
				</ModalBody>

				<ModalFooter>
					<Button color="success" onClick={saveEditedUsers}>Save</Button>
					<Button color="danger" onClick={backBtnClicked}>Back</Button>
				</ModalFooter>
			</Modal>
		</div>
	)
}

const CheckboxIcon = props => {
	const {row, col, checkboxToggle} = props;
	const [checkbox, setCheckbox] = useState(false);

	useEffect(() => {
		const newCheckbox = row[col] ? true : false;
		setCheckbox(newCheckbox);
	}, [row]);

	const checkToggle = e => {
		setCheckbox(true);
		checkboxToggle(row, 1, col);
	}

	const timesToggle = e => {
		setCheckbox(false);
		checkboxToggle(row, 0, col);
	}

	return (
		<div className="icon-checkbox-container">
			<div className="icon-checkbox">
				<FaCheckCircle
					style={{
						color: checkbox ? '#1c7430' : '#7d7d7d',
						height: checkbox ? 26 : 20,
						width: checkbox ? 26 : 20
					}}
					onClick={checkToggle}
				/>
			</div>
			
			<div className="icon-checkbox">
				<FaTimesCircle
					style={{
						color: checkbox ? '#7d7d7d' : '#b21f2d',
						height: checkbox ? 20 : 26,
						width: checkbox ? 20 : 26
					}}
					onClick={timesToggle}
				/>
			</div>
		</div>
	);
}

const DashboardText = {
	White: ({text}) => {
		return (
			<span
				style={{
					color: '#ffffff'
				}}
			>{text}</span>
		)
	},
	Label: ({text}) => {
		return (
			<span
				className="text-muted"
			>{text}</span>
		)
	}
}