import React, { Component, useState } from 'react';
import {
	Button,
	Card,
	CardBody,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	FormGroup,
	Row,
	Col,
	Label,
	Alert,
	Spinner
} from 'reactstrap';
import DataTable from 'react-data-table-component';
import FA from 'react-fontawesome';
import ImageGallery from 'react-image-gallery';

import { URL, VEHICLE } from '../../config/';
import { CampaignController } from '../../controllers';
import PageLoader from '../../layout/PageLoader';

import {
	UserImage,
	UserName
} from '../../components';

const vehicleClass = Object.values(VEHICLE.CLASS);
const vehicleType = Object.values(VEHICLE.TYPE);

export default class CampaignRequests extends Component {
	constructor(props){
		super(props);
		this.state = {
			loading: true,
			users: [],
			alertMessage: '',
			alertVisible: false
		};
	}

	componentDidMount = () => {
		this.init();
	}

	init = (setAlertVisible = false) => {
		this.setState({loading: true});
		CampaignController.requests()
		.then(res => {
			this.setState({
				users: res.data,
				loading: false
			});

			if(setAlertVisible) {
				this.setState({alertVisible: true});
				setTimeout(() => {
					this.setState({alertVisible: false});
				}, 5000);
			}
		})
		.catch(error => {
			console.log(error.response);
			alert('Server error. Reload the page by clicking the "OK"');
			location.reload();
		});
	}

	refreshData = alertMessage => {
		this.setState({alertMessage});
		this.init(true);
	}

	dismissAlert = () => {
		this.setState({alertVisible: false});
	}
	
	columns = [
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
			name: 'Campaign',
			selector: 'campaign_name',
			sortable: true
		}, {
			name: 'Vehicle',
			sortable: true,
			ignoreRowClick: true,
			cell: row =>
				<VehicleModal
					buttonLabel='Vehicles'
					row={row}
				/>
		}, {
			name: 'Vehicle Classification',
			sortable: true,
			cell: row => vehicleClass.find(v => v.id === row.vehicle_classification).name
		}, {
			name: 'Vehicle Type',
			sortable: true,
			cell: row => vehicleType.find(v => v.id === row.vehicle_type).name
		}, {
			name: '',
			right: true,
			width: '120px',
			cell: row => <ChangeStatus row={row} refreshData={this.refreshData} />
		}
	];

	render() {
		const { users } = this.state;
		const filteredLists = users;

		return (
			<PageLoader loading={this.state.loading}>
				<Alert color="success" isOpen={this.state.alertVisible} toggle={this.dismissAlert}>
					{this.state.alertMessage}
				</Alert>

				<Card>
					<CardBody>
						<DataTable
							title="User Requests"
							columns={this.columns}
							data={filteredLists}
							pagination={true}
							highlightOnHover={true}
						/>
					</CardBody>
				</Card>
			</PageLoader>
		);
	}
}

const VehicleModal = props => {
	const {
		buttonLabel,
		className,
		row
	} = props;

  const [modal, setModal] = useState(false);

	const toggle = () => setModal(!modal);
	
	const VehicleFormGroup = data => {
		return (
			<FormGroup>
				<Label className="mb-0">{data.label}</Label>
				<h3>{data.content}</h3>
			</FormGroup>
		);
	}

	const VehiclePhotosGallery = props => {
		const images = props.photos.map(p => {
			return {
				original: `${URL.STORAGE_URL}/${p.url}`,
				thumbnail: `${URL.STORAGE_URL}/${p.url}`
			};
		});

		return (
			<div
				style={{
					marginTop: 25,
					padding: 10,
					backgroundColor: '#37abb4',
					borderRadius: 15,
					boxShadow: '0px 0px 16px -6px rgba(0,0,0,0.75)'
				}}
			>
				<ImageGallery
					items={images}
					showFullscreenButton={false}
					showPlayButton={false}
					showBullets={true}
				/>
			</div>
		);
	}

  return (
    <div>
			<div onClick={toggle}>
				<h6 className="mb-0">{row.vehicle_manufacturer}</h6>
				<h6 className="mb-0">{row.vehicle_model}</h6>
				<h6 className="mb-0">{row.vehicle_year}</h6>
			</div>

      <Modal isOpen={modal} toggle={toggle} className={className}>
				<ModalHeader toggle={toggle}>
					<div>
						<h3 className="mb-0 font-weight-bold">{row.name}</h3>
						<h5 className="mb-0">{row.campaign_name}</h5>
					</div>
				</ModalHeader>

        <ModalBody>
					<VehicleFormGroup
						label="Vehicle Manufacturer"
						content={row.vehicle_manufacturer}
					/>
					
					<VehicleFormGroup
						label="Vehicle Model"
						content={row.vehicle_model}
					/>
					
					<VehicleFormGroup
						label="Vehicle Year"
						content={row.vehicle_year}
					/>
					
					<VehicleFormGroup
						label="Plate Number"
						content={row.vehicle_plate_number}
					/>

					<hr />

					<VehiclePhotosGallery photos={row.vehicle_photos} />
				</ModalBody>

        <ModalFooter>
          <Button color="danger" onClick={toggle}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

const ChangeStatus = props => {
	const { row, refreshData } = props;
	const statusName = [null, 'ACCEPT', 'REJECT'];
	const statusColor = [null, 'text-success', 'text-danger'];
	const buttonText = [null, 'Accept', 'Reject'];
	const buttonColor = [null, 'success', 'danger'];
	const [loading, setLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [status, setStatus] = useState(false);
	const [alertVisible, setAlertVisible] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');
	// accept - 1, reject - 2

	const toggle = () => {
		setModalVisible(false);
		setAlertVisible(false);
	}

	const dismissAlert = () => setAlertVisible(false);

	const requestToggle = stat => e => {
		setStatus(stat);
		setModalVisible(true);
	}

	const buttonStatusOnClick = e => {
		setLoading(true);
		CampaignController.changeStatus({
			user_id: row.user_id,
			campaign_name: row.campaign_name,
			user_campaign_id: row.user_campaign_id,
			campaign_id: row.campaign_id,
			status
		})
		.then(res => {
			setLoading(false);
			if(res.data.status) {
				setAlertVisible(false);
				toggle();
				refreshData(res.data.message);
			} else {
				setAlertVisible(true);
				setAlertMessage(res.data.message);
			}
		})
		.catch(err => {
			console.log(err);
			console.log(err.response);
			setLoading(false);
		})
	}

	return (
		<div>
			<Button color="success"	onClick={requestToggle(1)}>
				<FA name="check" />
			</Button>
			&nbsp;&nbsp;
			<Button color="danger" onClick={requestToggle(2)}>
				<FA name="times" />
			</Button>
			
      <Modal isOpen={modalVisible} toggle={toggle}>
				<ModalHeader toggle={toggle}>
					<div>
						<h2 className="mb-0">{row.campaign_name}</h2>
					</div>
				</ModalHeader>

				<ModalBody>
					<Alert color="danger" isOpen={alertVisible} toggle={dismissAlert}>
						{alertMessage}
					</Alert>
					
					<p style={{ textAlign: 'center' }}>
						Are you sure you want to{' '}
						<strong className={statusColor[status]}>
							<u>{statusName[status]}</u>
						</strong> this request?
					</p>
					
					<Card style={{ backgroundColor: '#f7f7f7' }}>
						<CardBody>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center'
								}}
							>
								<div>
									<h5 className="mb-0">
										<strong>{row.name}</strong>
									</h5>

									<h6 className="mb-0">
										{row.username}
									</h6>
								</div>
								
								<div
									style={{
										width: 60,
										height: 60,
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
							</div>
						</CardBody>
					</Card>
					
					<div className="text-center">
						<Label>Vehicle</Label>
					</div>
					
					<FormGroup>
						<Row>
							<Col sm="6" className="text-center text-sm-left">
								<Label className="mb-0">Manufacturer</Label>
							</Col>
							
							<Col sm="6" className="text-center text-sm-right">
								<span>{row.vehicle_manufacturer}</span>
							</Col>
						</Row>
					</FormGroup>

					<FormGroup>
						<Row>
							<Col sm="6" className="text-center text-sm-left">
								<Label className="mb-0">Model</Label>
							</Col>
							
							<Col sm="6" className="text-center text-sm-right">
								<span>{row.vehicle_model}</span>
							</Col>
						</Row>
					</FormGroup>

					<FormGroup>
						<Row>
							<Col sm="6" className="text-center text-sm-left">
								<Label className="mb-0">Year</Label>
							</Col>
							
							<Col sm="6" className="text-center text-sm-right">
								<span>{row.vehicle_year}</span>
							</Col>
						</Row>
					</FormGroup>

					<Row>
						<Col sm="6" className="text-center text-sm-left">
							<Label className="mb-0">Plate Number</Label>
						</Col>
						
						<Col sm="6" className="text-center text-sm-right">
							<span>{row.vehicle_plate_number ? row.vehicle_plate_number : <i className="text-muted">-- no plate number --</i>}</span>
						</Col>
					</Row>
				</ModalBody>

        <ModalFooter>
					{loading ? (
						<Spinner color="primary" />
					) : (
						<div>
							<Button
								color={buttonColor[status]}
								onClick={buttonStatusOnClick}
							>{buttonText[status]}</Button>
							&nbsp;&nbsp;
							<Button
								color="secondary"
								onClick={toggle}
							>Cancel</Button>
						</div>
					)}
        </ModalFooter>
			</Modal>
		</div>
	);
}