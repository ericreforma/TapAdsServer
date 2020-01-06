import React, { Component } from 'react';
import {
	Card,
	CardBody,
	Row,
	Col,
	Input,
	FormGroup,
	Label,
} from 'reactstrap';
import DataTable from 'react-data-table-component';
import FA from 'react-fontawesome';

import {
	getMonthDiff,
	numberWithCommas,
	checkDurationDate
} from '../../config/functions';
import { CampaignController } from '../../controllers';
import PageLoader from '../../layout/PageLoader';

const colors = ['bg-info', 'bg-success', 'bg-danger'];
const text = ['TO PUBLISH', 'ON-GOING', 'EXPIRED'];
const textDD = ['To Publish', 'On-going', 'Expired'];
const columns = [
	{
		name: 'Name',
		selector: 'name',
		sortable: true,
		grow: 2
	}, {
		name: 'Slots',
		selector: 'slots',
		width: '80px',
		sortable: true
	}, {
		name: 'Slots Remaining',
		selector: 'slots_remaining',
		sortable: true,
		width: '100px',
	}, {
		name: 'Location',
		selector: 'location',
		sortable: true
	}, {
		name: 'Overall Pay',
		sortable: true,
		cell: row =>
			<span>
				P{numberWithCommas(parseFloat(row.pay_basic) * getMonthDiff(row.duration_from, row.duration_to))}
			</span>
	}, {
		name: 'Distance',
		sortable: true,
		cell: row =>
			<span>
				{parseFloat(row.pay_basic_km) * getMonthDiff(row.duration_from, row.duration_to)}Km
			</span>
	}, {
		name: 'Duration From',
		selector: 'duration_from',
		sortable: true
	}, {
		name: 'Duration To',
		selector: 'duration_to',
		sortable: true
	}, {
		name: 'Status',
		cell: row =>
			<span className={'p-1 rounded text-white ' + colors[checkDurationDate(row.duration_from, row.duration_to)]}>
				{text[checkDurationDate(row.duration_from, row.duration_to)]}
			</span>
	}, {
		name: '',
		width: '50px',
		right: true,
		compact: true,
		cell: row => <div><FA name="eye" className="text-dark" /></div>
	}
];

export default class CampaignList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			lists: [],
			search: '',
			campaignStatus: 0
		}
	}

	componentDidMount = () => {
		this.campaignList();
	}

	campaignList = () => {
		CampaignController.list()
		.then(res => {
			this.setState({
				loading: false,
				lists: res.data
			});
		})
		.catch(error => {
			console.log(error.response);
			alert('Server error. Reload the page by clicking the "OK"');
			location.reload();
		});
	}

	render() {
		const { lists, search, campaignStatus } = this.state;
		const filteredListsStatus = campaignStatus === 0
			? lists
			: lists.filter(l =>
				campaignStatus === (checkDurationDate(l.duration_from, l.duration_to) + 1)
			);
		const filteredLists = search === ''
			? filteredListsStatus
			: filteredListsStatus.filter(l =>
				(new RegExp(search.toLowerCase())).test(l.name.toLowerCase()) ||
				(new RegExp(search.toLowerCase())).test(l.location.toLowerCase()) ||
				(new RegExp(search)).test(l.duration_from) ||
				(new RegExp(search)).test(l.duration_to)
			);

		return (
			<PageLoader loading={this.state.loading}>
				<Card>
					<CardBody>
						<Row>
							<Col lg="6">
								<Row>
									<Col md="6">
										<FormGroup>
											<Label className="text-dark">
												Campaign Status
											</Label>
											<Input
												type="select"
												onChange={e => this.setState({campaignStatus: parseInt(e.currentTarget.value)})}
												value={this.state.campaignStatus.toString()}
											>
												<option value="0">All</option>
												{textDD.map((t, tIdx) =>
													<option key={tIdx} value={tIdx + 1}>{t}</option>
												)}
											</Input>
										</FormGroup>
									</Col>

									<Col md="6">
										<FormGroup>
											<Label className="text-dark">
												Search
											</Label>
											<Input
												type="text"
												onChange={e => this.setState({search: e.currentTarget.value})}
											/>
										</FormGroup>
									</Col>
								</Row>
							</Col>
						</Row>

						<DataTable
							title="Campaigns"
							columns={columns}
							data={filteredLists}
							pagination={true}
							highlightOnHover={true}
							onRowClicked={row => this.props.history.push(`/campaign/dashboard/${row.id}`)}
						/>
					</CardBody>
				</Card>
			</PageLoader>
		);
	}
}
