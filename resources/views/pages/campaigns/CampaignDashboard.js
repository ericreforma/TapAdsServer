import React, { Component, useState, useEffect } from 'react';
import {
	Row,
	Col,
	FormGroup,
	Card,
	CardHeader,
	CardBody,
	Progress,
	Input,
	Button
} from 'reactstrap';
import DataTable from 'react-data-table-component';
import FA from 'react-fontawesome';
import { Doughnut, Line } from 'react-chartjs-2';

import { Switch } from '../../components';
import { CampaignController } from '../../controllers';
import {
	URL,
	getTotalPay,
	getTotalDistance,
	dateTimeString,
	numberWithCommas
} from '../../config';

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
			campaign: {}
		};
	}

	componentDidMount = () => {
    console.log(this.props);
		this.setState({loading: true});
		CampaignController.dashboard(this.cid)
		.then(res => {
			this.setState({
				loading: false,
				campaign: res.data
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
	
	render() {
		return (
			<PageLoader loading={this.state.loading}>
				<CampaignContainer>
					<CampaignInfoCard campaign={this.state.campaign} />
					<CampaignUsers campaign={this.state.campaign} />
				</CampaignContainer>
				
				<CampaignGraph />
			</PageLoader>
		);
	}
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
					<h4 className="mb-0">{campaign.name}</h4>
					<h6 className="text-muted mb-3">
						Location: {campaign.location.map(l => l.name).join(', ')}
					</h6>

					<Card style={{ backgroundColor: '#f7f7f7' }}>
						<CardBody>
							<p
								className="text-muted"
								style={{
									lineHeight: '1rem',
									marginBottom: 0,
								}}
							>
								{campaign.description}
							</p>
						</CardBody>
					</Card>

					<hr />

					<FormGroup>
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

const CampaignUsers = ({campaign}) => {
	const [userData, setUserData] = useState(campaign.users);

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
			cell: row =>
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
		}, {
			name: 'Name',
			sortable: true,
			cell: row =>
				<div>
					<h5 className="mb-0 font-weight-bold">{row.name}</h5>
					<h6 className="mb-0">{row.username}</h6>
				</div>
		}, {
			name: 'Campaign Traveled',
			sortable: true,
			selector: 'campaign_traveled',
		}, {
			name: 'Trip Traveled',
			sortable: true,
			selector: 'trip_traveled',
		}, {
			name: '',
			width: '50px',
			right: true,
			compact: true,
			cell: row => <div><FA name="eye" className="text-dark" /></div>
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

					<DataTable
						title="Users"
						columns={columns}
						data={userData}
						pagination={true}
						highlightOnHover={true}
					/>
				</CardBody>
			</Card>
		</div>
	)
}

const CampaignGraph = ({campaign}) => {
	const [facebook, setFacebook] = useState(true);
	const [twitter, setTwitter] = useState(false);

	const chartColors = {
		red: 'rgb(233, 30, 99)',
		danger: 'rgb(233, 30, 99)',
		dangerTransparent: 'rgba(233, 30, 99, .8)',
		orange: 'rgb(255, 159, 64)',
		yellow: 'rgb(255, 180, 0)',
		green: 'rgb(34, 182, 110)',
		blue: 'rgb(68, 159, 238)',
		primary: 'rgb(68, 159, 238)',
		primaryTransparent: 'rgba(68, 159, 238, .8)',
		purple: 'rgb(153, 102, 255)',
		grey: 'rgb(201, 203, 207)',

		primaryShade1: 'rgb(68, 159, 238)',
		primaryShade2: 'rgb(23, 139, 234)',
		primaryShade3: 'rgb(14, 117, 202)',
		primaryShade4: 'rgb(9, 85, 148)',
		primaryShade5: 'rgb(12, 70, 117)'
	};
	const donutData = {
		labels: ['Q1', 'Q2', 'Q3'],
		datasets: [
			{
				data: [300, 50, 100],
				backgroundColor: [
					chartColors.primaryShade1,
					chartColors.primaryShade2,
					chartColors.primaryShade3
				],
				hoverBackgroundColor: [
					chartColors.primaryShade4,
					chartColors.primaryShade4,
					chartColors.primaryShade4
				]
			}
		]
	};
	const line = {
		data: {
			labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
			datasets: [
				{
					label: '# of Votes',
					data: [3, 6, 4, 10, 8, 12],
					borderColor: 'transparent',
					backgroundColor: chartColors.primary,
					pointBackgroundColor: 'rgba(0,0,0,0)',
					pointBorderColor: 'rgba(0,0,0,0)',
					borderWidth: 4
				}
			]
		},
		options: {
			scales: {
				xAxes: [
					{
						display: false
					}
				],
				yAxes: [
					{
						display: false
					}
				]
			},
			legend: {
				display: false
			},
			tooltips: {
				enabled: false
			}
		}
	};

	return (
		<div>
			<Row>
				<Col md={4} xs={12}>
					<Card>
						<CardHeader>
							Page Views{' '}
							<Button size="sm" className="pull-right">
								View
							</Button>
						</CardHeader>
						<CardBody>
							<h2 className="m-b-20 inline-block">
								<span>13K</span>
							</h2>{' '}
							<i
								className="fa fa-caret-down text-danger"
								aria-hidden="true"
							/>
							<Progress value={77} color="warning" />
						</CardBody>
					</Card>
				</Col>
				<Col md={4} xs={12}>
					<Card>
						<CardHeader>
							Product Sold{' '}
							<Button size="sm" className="pull-right">
								View
							</Button>
						</CardHeader>
						<CardBody>
							<h2 className="m-b-20 inline-block">
								<span>1,890</span>
							</h2>{' '}
							<i className="fa fa-caret-up text-danger" aria-hidden="true" />
							<Progress value={77} color="success" />
						</CardBody>
					</Card>
				</Col>
				<Col md={4} xs={12}>
					<Card>
						<CardHeader>
							Server Capacity{' '}
							<Button size="sm" className="pull-right">
								View
							</Button>
						</CardHeader>
						<CardBody>
							<h2 className="inline-block">
								<span>14%</span>
							</h2>
							<Progress value={14} color="primary" />
						</CardBody>
					</Card>
				</Col>
			</Row>

			<Row>
				<Col md={8} sm={12}>
					<Card>
						<CardHeader>Traffic</CardHeader>
						<CardBody>
							<div className="full-bleed">
								<Line
									data={line.data}
									width={2068}
									height={846}
									legend={{ display: false }}
									options={line.options}
								/>
							</div>
						</CardBody>
					</Card>
				</Col>
				<Col md={4} sm={12}>
					<Card>
						<CardHeader>Product Views</CardHeader>
						<CardBody>
							<Doughnut
								data={donutData}
								width={908}
								height={768}
								legend={{ display: false }}
							/>
						</CardBody>
					</Card>
				</Col>
			</Row>

			<Row>
				<Col md={8} sm={12}>
					<Card>
						<CardHeader>Conversions</CardHeader>
						<CardBody>
							<Row className="m-b-md">
								<Col xs={4}>
									<h5>Added to Cart</h5>
									<div className="h2">4.30%</div>
									<small className="text-muted">23 Visitors</small>
								</Col>
								<Col xs={4}>
									<h5>Reached Checkout</h5>
									<div className="h2">2.93</div>
									<small className="text-muted">12 Visitors</small>
								</Col>
								<Col xs={4}>
									<h5>Pruchased</h5>
									<div className="h2">10</div>
									<small className="text-muted">10 Customers</small>
								</Col>
							</Row>
						</CardBody>
					</Card>
				</Col>
				<Col md={4} xs={12}>
					<Card>
						<CardHeader>Integrations</CardHeader>
						<CardBody>
							<Switch
								enabled={facebook}
								toggle={() => setFacebook(!facebook)}
							/>
							<span className="text-facebook pull-right">
								Facebook
							</span>
							<hr />
							<Switch
								enabled={twitter}
								toggle={() => setTwitter(!twitter)}
							/>
							<span className="text-twitter pull-right">
								Twitter
							</span>
						</CardBody>
					</Card>
				</Col>
			</Row>
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