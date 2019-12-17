import React, { Component } from 'react';
import {
	Button,
	Form,
	FormText,
	FormGroup,
	Label,
	Input,
	InputGroup,
	InputGroupAddon,
	Col,
	Row,
	Card,
	CardBody
} from 'reactstrap';
import GoogleMapReact from 'google-map-react';

//components
import { Loader } from '../../components';

import { URL, KEYS } from '../../config';
import { HttpRequest } from '../../services/http';

export default class CampaignCreate extends Component {
	state = {
		loaderShow: true,

		// forms
		formData: [
			{
				id: 'campaign_image',
				type: 'file',
				label: 'Campaign Image',
				value: '',
				addonShow: false,
				multipleRow: false,
				invalid: false,
				image: true,
				imagePreviewUrl: '',
				notRequired: true
			}, {
				id: 'name',
				type: 'text',
				label: 'Campaign Name',
				value: '',
				addonShow: false,
				multipleRow: false,
				invalid: false,
			},{
				id: 'description',
				type: 'textarea',
				label: 'Description',
				value: '',
				addonShow: false,
				multipleRow: false,
				invalid: false,
				hr: true,
			},{
				multipleRow: true,
				hr: true,
				data: [
					{
						id: 'vehicle_classification',
						type: 'radio',
						label: 'Vehicle Classification',
						value: '',
						addonShow: false,
						invalid: false,
						options: [
							'Regular (compact to light SUVs)',
							'Premium (large SUVs)',
							'Motorcycle',
							'Van',
							'Truck'
						]
					},{
						id: 'vehicle_type',
						type: 'radio',
						label: 'Vehicle Type',
						value: '',
						addonShow: false,
						invalid: false,
						options: [
							'Private',
							'Public',
							'On-call'
						]
					},{
						id: 'vehicle_stickerArea',
						type: 'radio',
						label: 'Vehicle Sticker Area',
						value: '',
						addonShow: false,
						invalid: false,
						options: [
							'Full Wrap',
							'4 Doors',
							'2 Doors',
							'Bumper',
							'Rear Windows',
							'In-Car',
							'Motorcycle'
						]
					}
				]
			},{
				multipleRow: true,
				hr: true,
				data: [
					{
						id: 'duration_from',
						type: 'date',
						label: 'Campaign Duration',
						value: '',
						addonShow: true,
						addon: 'From',
						invalid: false,
					},{
						id: 'duration_to',
						type: 'date',
						label: 'Campaign Duration',
						value: '',
						addonShow: true,
						addon: 'To',
						invalid: false,
					},{
						id: 'vehicle_update_date',
						type: 'number',
						label: 'Sticker Update Date (1-31)',
						value: '',
						addonShow: false,
						invalid: false,
					}
				]
			},{
				multipleRow: true,
				data: [
					{
						id: 'slots',
						type: 'number',
						label: 'Slots',
						value: '',
						addonShow: false,
						invalid: false,
					},{
						id: 'pay_basic',
						type: 'number',
						label: 'Basic Pay',
						value: '',
						addonShow: true,
						addon: '₱',
						invalid: false,
					}
				]
			},{
				multipleRow: true,
				data: [
					{
						id: 'pay_basic_km',
						type: 'number',
						label: 'Campaign Distance',
						value: '',
						addonShow: true,
						addon: 'km',
						append: true,
						invalid: false,
					},{
						id: 'completion_bonus',
						type: 'number',
						label: 'Completion Bonus',
						value: '',
						addonShow: true,
						addon: '₱',
						invalid: false,
					}
				]
			}
		],

		// google map data
		polygons: [],
		google: {},
		defaultGeoLocations: [],
		locationInvalid: false,
		defaultCenter: {
			lat: 14.6053665,
			lng: 121.0531643
		},
		defaultZoom: 10,
		markers: [],
		hideMarkers: false,
		customLocationName: '',
		customLocationError: false,

		// google map options
		activeButton: 'Default',
		selectedGeoLocationId: [],
	}

	// init functions >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	componentDidMount = () => {
		this.getGeoLocation();
	}

	getGeoLocation = () => {
		HttpRequest.get(URL.api.getGeoLocation).then(response => {
			if(response.data.status == 'success') {
				this.setState({
					loaderShow: false,
					defaultGeoLocations: response.data.message.geo_location
				});
			} else {
				setTimeout(() => this.getGeoLocation(), 1000);
			}
		}).catch(error => {
			setTimeout(() => this.getGeoLocation(), 1000);
		});
	}

	handleGoogleMapApi = (google) => {
		google.map.addListener('click', this.googleMapOnClick);
		this.setState({google});
	}
	// end init functions >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


	// for location >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	activeButtonOnClick = (activeButton) => (e) => {
		e.preventDefault();
		this.removeCurrentPaths();
		this.removeCurrentMarkers();
		this.setState({
			activeButton: activeButton,
			customLocationName: '',
			customLocationError: false,
			hideMarkers: false,
			selectedGeoLocationId: [],
		});
	}

	defaultGeoLocationOnInput = (e) => { // default select input on change
		var options = e.target.options,
			defaultGeoLocations = this.state.defaultGeoLocations,
			geoLocations = [],
			geoLocationsId = [];

		this.removeCurrentPaths();

		for(var x = 0; x < options.length; x++) {
			if(options[x].selected) {
				geoLocationsId.push(parseInt(options[x].value));
				geoLocations.push(defaultGeoLocations.filter(dg => dg.id == parseInt(options[x].value))[0]);
			}
		}

		var google = this.state.google,
			bounds = new google.maps.LatLngBounds(),
			newPolygons = [];

		geoLocations.map(gl => {
			var coordinates = JSON.parse(gl.json_coordinates);

			coordinates.map(json => {
				json.map(c => {
					var lat = c.lat,
						lng = c.lng,
						loc = new google.maps.LatLng(lat, lng);

					bounds.extend(loc);
				});

				var polygons = new google.maps.Polygon({
					map: google.map,
					path: json,
					strokeColor: '#33BD4E',
					strokeOpacity: 0.8,
					fillColor: '#33BD4E',
					fillOpacity: 0.2,
					strokeWeight: 3,
				});

				newPolygons.push(polygons);
			});
		});

		google.map.fitBounds(bounds);
		google.map.panToBounds(bounds);

		this.setState({
			polygons: newPolygons,
			selectedGeoLocationId: geoLocationsId
		});
	}

	removeCurrentPaths = () => {
		var paths = this.state.polygons;
		paths.map(p => {
			p.setMap(null);
		});
		this.setState({polygons: []});
	}

	removeCurrentMarkers = () => {
		var paths = this.state.markers;
		paths.map(p => {
			p.setMap(null);
		});
		this.setState({markers: []});
	}

	googleMapOnClick = (event) => {
		if(this.state.activeButton == 'Custom') {
			var google = this.state.google,
				markers = this.state.markers,
				lat = event.latLng.lat(),
				lng = event.latLng.lng(),
				marker = new google.maps.Marker({
					map: google.map,
					position: {lat: lat, lng: lng},
					title: 'Lat: ' + lat + '\nLng: ' + lng,
					draggable: true,
				});
			markers.push(marker);
			marker.addListener('drag', this.markerDrag);
			this.setState({markers});
			this.createPolygonWithMarkers();
		}
	}

	markerDrag = (event) => {
		this.createPolygonWithMarkers();
	}

	toggleHideMarkers = (e) => {
		e.preventDefault();

		var markers = this.state.markers;
		markers.map(m => {
			m.setVisible(this.state.hideMarkers);
		});

		this.setState({hideMarkers: !this.state.hideMarkers});
	}

	customLocationCreateOnClick = (create) => (e) => {
		e.preventDefault();
		if(create) { // create custom geo location
			const {
				markers,
				customLocationName } = this.state,
				markerLength = markers.length;

			if(markerLength == 0) {
				alert('Click on the maps to create markers');
			} else if(markerLength < 3) {
				alert('Markers must have 3 or more points');
			} else {
				if(customLocationName !== '') {
					var paths = markers.map(m => {
							return {
								lng: m.getPosition().lng(),
								lat: m.getPosition().lat()
							}
						}),
						form = {
							coordinates: JSON.stringify([paths]),
							name: this.state.customLocationName
						};

					HttpRequest.post(URL.api.createGeoLocation, form).then(response => {
						if(response.data.status == 'success') {
							var { defaultGeoLocations } = this.state;

							defaultGeoLocations.push(response.data.message.geo_location);
							this.removeCurrentPaths();
							this.removeCurrentMarkers();
							this.setState({
								activeButton: 'Default',
								customLocationName: '',
								customLocationError: false,
								hideMarkers: false,
								defaultGeoLocations: defaultGeoLocations,
								selectedGeoLocationId: []
							});

							alert(response.data.message.message);
						} else {
							alert(response.data.message);
						}
					}).catch(error => {
						alert('Error occured. Please try again later');
					});
				}
			}

			this.setState({
				customLocationError: customLocationName !== '' ? false : true
			});
		} else { // reset markers
			this.removeCurrentMarkers();
			this.removeCurrentPaths();
			this.setState({customLocationName: ''});
		}
	}

	createPolygonWithMarkers = () => {
		this.removeCurrentPaths();

		var google = this.state.google,
			markers = this.state.markers,
			markerLatLng = markers.map(m => {
				return {
					lat: m.getPosition().lat(),
					lng: m.getPosition().lng()
				}
			}),
			polygon = new google.maps.Polygon({
				map: google.map,
				path: markerLatLng,
				strokeColor: '#33BD4E',
				strokeOpacity: 0.8,
				fillColor: '#33BD4E',
				fillOpacity: 0.2,
				strokeWeight: 3,
			});

		this.setState({
			polygons: [polygon],
		});
	}

	inputTypeFileUpload = index => e => {
		const { formData } = this.state;
		let reader = new FileReader();
		let file = e.target.files[0];

		reader.onloadend = (e) => {
			formData[index].value = e.target.result;
			formData[index].imagePreviewUrl = reader.result;
			this.setState({ formData });
		}

		reader.readAsDataURL(file);
	}
	// for location end >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


	// submit campaign >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	submitCampaign = (e) => {
		e.preventDefault();
		var formData = this.state.formData,
			proceed = true,
			sentForm = {};

		formData = formData.map(form => {
			if(form.multipleRow) {
				form.data = form.data.map(data => {
					if(data.value !== '') {
						sentForm[data.id] = data.value;
						data.invalid = false;
					} else {
						if(!data.notRequired) {
							proceed = false;
							data.invalid = true;
						} else {
							sentForm[data.id] = data.value;
						}
					}

					return data;
				});
			} else {
				if(form.value !== '') {
					sentForm[form.id] = form.value;
					form.invalid = false;
				} else {
					if(!form.notRequired) {
						proceed = false;
						form.invalid = true;
					} else {
						sentForm[form.id] = form.value;
					}
				}
			}

			return form;
		});

		if(this.state.selectedGeoLocationId.length === 0) {
			proceed = false;
			this.setState({locationInvalid: true});
		} else {
			const { defaultGeoLocations, selectedGeoLocationId } = this.state;
			const geoLocationNames = defaultGeoLocations
				.filter(l => selectedGeoLocationId.includes(l.id))
				.map(l => l.name);
			sentForm['location'] = geoLocationNames.join(', ');
			sentForm['location_id'] = selectedGeoLocationId;
			this.setState({locationInvalid: false});
		}

		if(proceed) {
			this.setState({formData});
			HttpRequest.post(URL.api.createCampaign, sentForm).then(response => {
				if(response.data.status == 'success') {
					document.getElementById('createCampaignForm').reset();
					this.removeCurrentMarkers();
					this.removeCurrentPaths();

					var { formData,
						selectedGeoLocationId } = this.state;
					formData = formData.map(f => {
						if(f.multipleRow) {
							var { data } = f;
							data = data.map(d => {
								d.value = '';
								if(d.image) d.imagePreviewUrl = '';
								return d;
							});
							f.data = data;
						} else {
							f.value = '';
							if(f.image) f.imagePreviewUrl = '';
						}

						return f;
					});
					selectedGeoLocationId = [];
					this.setState({ formData, selectedGeoLocationId });
				}

				alert(response.data.message);
			}).catch(error => {
				console.log(error);
			});
		} else {
			this.setState({formData});
		}
	}
	// end submit campaign >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

	singleRow = (fd, fdIndex) => {
		if(fd.type === 'select') {
			return (
				<FormGroup>
					<Input
						type={fd.type}
						id={fd.id}
						invalid={fd.invalid}
						defaultValue=""
						onChange={(value) => this.state.formData[fdIndex].value = parseInt(value.target.value)}
					>
						<option value="" disabled>-- select --</option>
						{fd.options.map((option, optionIdx) =>
							<option
								key={optionIdx}
								value={optionIdx}
							>{option}</option>
						)}
					</Input>
				</FormGroup>
			);
		} else if(fd.type === 'radio') {

		} else {
			return (
				fd.image ? (
					<Row>
						<Col md="6">
							<FormGroup>
								<div
									className='form-control'
									style={{
										height: '200px',
										width: '100%'
									}}
								>
									{fd.imagePreviewUrl ? (
										<img
											src={fd.imagePreviewUrl}
											style={{
												width: '100%',
												height: '100%',
												objectFit: 'contain',
												overflow: 'hidden'
											}}
										/>
									) : (
										<div
											style={{
												width: '100%',
												height: '100%',
												display: 'flex',
												justifyContent: 'center',
												alignItems: 'center'
											}}
										>
											<FormText color="muted">-- upload campaign photo --</FormText>
										</div>
									)}
								</div>
							</FormGroup>
						</Col>

						<Col md="6">
							<FormGroup>
								<Input
									type={fd.type}
									id={fd.id}
									invalid={fd.invalid}
									step={fd.type == 'number' ? '0.01' : ''}
									onChange={this.inputTypeFileUpload(fdIndex)}
								/>
							</FormGroup>
						</Col>
					</Row>
				) : (
					<FormGroup>
						<InputGroup>
							{fd.addonShow && !fd.append ? (
								<InputGroupAddon addonType="prepend">{fd.addon}</InputGroupAddon>
							) : null}

							<Input
								type={fd.type}
								id={fd.id}
								invalid={fd.invalid}
								step={fd.type == 'number' ? '0.01' : ''}
								onChange={(value) => this.state.formData[fdIndex].value = value.target.value}
							/>

							{fd.addonShow && fd.append ? (
								<InputGroupAddon addonType="append">{fd.addon}</InputGroupAddon>
							) : null}
						</InputGroup>
					</FormGroup>
				)
			);
		}
	}

	multipleRow = (fdIndex, data, dataIdx) => {
		if(data.type === 'select') {
			return (
				<FormGroup>
					<Input
						type={data.type}
						id={data.id}
						invalid={data.invalid}
						defaultValue=""
						onChange={(value) => this.state.formData[fdIndex].data[dataIdx].value = parseInt(value.target.value)}
					>
						<option value="" disabled>-- select --</option>
						{data.options.map((option, optionIdx) =>
							<option
								key={optionIdx}
								value={optionIdx}
							>{option}</option>
						)}
					</Input>
				</FormGroup>
			);
		} else if(data.type === 'radio') {
			return (
				<FormGroup>
					<div className="ccs-checkbox-section">
						{data.options.map((option, optionIdx) =>
							<FormGroup
								key={optionIdx}
								check
							>
								<Label>
									<Input
										type="radio"
										value={optionIdx}
										name={data.label}
										onChange={(value) => this.state.formData[fdIndex].data[dataIdx].value = parseInt(value.target.value)}
									/>{' '}
									{option}
								</Label>
							</FormGroup>
						)}

						{data.invalid ? (
							<small className="text-danger">
								Choose {data.label}
							</small>
						) : null}
					</div>
				</FormGroup>
			);
		} else {
			return (
				<FormGroup>
					<InputGroup>
						{data.addonShow && !data.append ? (
							<InputGroupAddon addonType="prepend">{data.addon}</InputGroupAddon>
						) : null}
						<Input
							type={data.type}
							id={data.id}
							invalid={data.invalid}
							step={data.type == 'number' ? '0.01' : ''}
							onChange={(value) => this.state.formData[fdIndex].data[dataIdx].value = value.target.value}
						/>
						{data.addonShow && data.append ? (
							<InputGroupAddon addonType="append">{data.addon}</InputGroupAddon>
						) : null}
					</InputGroup>
				</FormGroup>
			);
		}
	}

	render() {
		if(this.state.loaderShow) {
			return (
				<Loader type="puff" />
			);
		} else {
			return (
				<div className="create-campaign-section">
					{this.state.loaderShow ? (
						<div
							className="mt-5"
						>
							<Loader type="puff" />
						</div>
					) : (
						<Row>
							<Col
								xl={{
									size: 8,
									offset: 2
								}}
							>
								<Card>
									<CardBody>
										<Form
											onSubmit={this.submitCampaign}
											id="createCampaignForm"
										>
											{this.state.formData.map((fd, fdIndex) =>
												<div key={fdIndex}>
													{!fd.multipleRow ? (
														<div>
															<Label for={fd.id}>{fd.label}</Label>
															{this.singleRow(fd, fdIndex)}
														</div>
													) : (
														<Row>
															{fd.data.map((data, dataIdx) =>
																<Col
																	key={dataIdx}
																	md={{
																		size: 12 / fd.data.length
																	}}
																>
																	<Label for={data.id}>{data.label}</Label>
																	{this.multipleRow(fdIndex, data, dataIdx)}
																</Col>
															)}
														</Row>
													)}
													
													{fd.hr ? <hr /> : null}
												</div>
											)}

											<hr />

											<Label for="googleMap">Location (Metro Manila)</Label>
											<Card color="light">
												<CardBody>
													<FormGroup>
														<div
															style={{
																width: '100%',
																height: '50vh',
															}}
														>
															<GoogleMapReact
																bootstrapURLKeys={{ key: KEYS.google }}
																defaultCenter={this.state.defaultCenter}
																defaultZoom={this.state.defaultZoom}
																yesIWantToUseGoogleMapApiInternals
																onGoogleApiLoaded={this.handleGoogleMapApi}
																options={{
																	clickableIcons: false
																}}
															></GoogleMapReact>
														</div>
													</FormGroup>

													<FormGroup>
														<p>
															<Button
																color={this.state.activeButton == 'Default' ? 'primary' : 'secondary'}
																onClick={this.activeButtonOnClick('Default')}
															>
																Geo Location
															</Button>
															{' '}
															<Button
																color={this.state.activeButton == 'Custom' ? 'primary' : 'secondary'}
																onClick={this.activeButtonOnClick('Custom')}
															>
																Create Custom Location
															</Button>
														</p>
													</FormGroup>

													<hr />

													{this.state.activeButton == 'Default' ? (
														<Input
															type="select"
															invalid={this.state.locationInvalid}
															onInput={this.defaultGeoLocationOnInput}
															multiple
														>
															{this.state.defaultGeoLocations.map(geo =>
																<option
																	key={geo.id}
																	value={geo.id}
																>{geo.name}</option>
															)}
														</Input>
													) : (
														<div>
															<Label>Click on the map to create paths:</Label>
															<FormGroup>
																<Input
																	type="text"
																	placeholder="Input Custom Location Name.."
																	invalid={this.state.customLocationError}
																	value={this.state.customLocationName}
																	onChange={(text) => this.setState({customLocationName: text.target.value})}
																/>
															</FormGroup>
															<Row>
																<Col sm="4">
																	<FormGroup>
																		<Button
																			type="submit"
																			color="danger"
																			block
																			onClick={this.customLocationCreateOnClick(false)}
																		>
																			Reset
																		</Button>
																	</FormGroup>
																</Col>

																<Col sm="4">
																	<FormGroup>
																		<Button
																			type="submit"
																			color="primary"
																			block
																			onClick={this.toggleHideMarkers}
																		>
																			Toggle markers
																		</Button>
																	</FormGroup>
																</Col>

																<Col sm="4">
																	<FormGroup>
																		<Button
																			type="submit"
																			color="success"
																			block
																			onClick={this.customLocationCreateOnClick(true)}
																		>
																			Create Geo-Location
																		</Button>
																	</FormGroup>
																</Col>
															</Row>
														</div>
													)}
												</CardBody>
											</Card>

											<div
												className="mt-3"
											>
												<Button
													type="submit"
													color="success"
													block
												>
													Submit Campaign
												</Button>
											</div>
										</Form>
									</CardBody>
								</Card>
							</Col>
						</Row>
					)}
				</div>
			);
		}
	}
}
