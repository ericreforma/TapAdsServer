import React, {Component} from 'react';
import {
	Row,
	Col,
	Card,
	CardBody,
	Button
} from 'reactstrap';
import {IMAGES, URL} from '../../../config';

export default class CardInfo extends Component {
	readableDate = (date) => {
		var year = date.split('-')[0],
			month = parseInt(date.split('-')[1]) - 1,
			day = date.split('-')[2],
			months = [
				'January', 'February', 'March', 'April',
				'May', 'June', 'July', 'August',
				'September', 'October', 'November', 'December'
			];

		return `${months[month]} ${day}, ${year}`;
	}

	getAge = (dateString) => {
		var today = new Date();
		var birthDate = new Date(dateString);
		var age = today.getFullYear() - birthDate.getFullYear();
		var m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate()))
			age--;

		return age;
	}

	render() {
		const {userData} = this.props;

		return (
			<div className="ups-pi-wrapper">
				{/* user image */}
				<div
					style={{
						width: 130,
						height: 130,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						margin: '1rem 2rem 1rem 0px'
					}}
				>
					<div
						style={{
							width: 130,
							height: 130,
							borderRadius: '50%',
							overflow: 'hidden'
						}}
					>
						<img
							src={
								userData.url
								? `${URL.STORAGE_URL}/${userData.url}`
								: IMAGES.galleryIcon
							}
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								overflow: 'hidden'
							}}
						/>
					</div>
				</div>

				{/* other info */}
				<div className="ups-pi-user-other-info">
					<Card className="mb-0">
						<CardBody>
							<Row className="align-items-center">
								<Col md={6}>
									<Card color="light" className="mb-0">
										<CardBody>
											<h3>{userData.name}</h3>

											{/* star rating */}
											<div className="d-flex align-items-center">
												<small className="mr-2 text-muted">Rate:</small>
												{Array(5).fill(null).map((star, starIndex) =>
													<img
														key={starIndex}
														className="ups-pi-star-icon"
														src={starIndex < parseInt(userData.rate) ? IMAGES.icons.starActive : IMAGES.icons.starInactive}
													/>
												)}
												<small className="ml-2 text-muted">({userData.totalRating})</small>
											</div>
										</CardBody>
									</Card>
								</Col>
								
								<Col md={6} className="mb-3 mt-3">
									<h6 className="text-muted mb-0">{this.readableDate(userData.birthdate)} &#8211; {this.getAge(userData.birthdate)} years old</h6>
									<h6 className="text-muted mb-0">{userData.contact_number}</h6>
									<h6 className="text-muted mb-0">{userData.location}</h6>
									<h6 className="text-muted">{userData.email}</h6>

									<Button
										color="primary"
										size="sm"
										onClick={e => this.props.history.push('/messages', {id: userData.id})}
									>
										Message
									</Button>
								</Col>
							</Row>
						</CardBody>
					</Card>
				</div>
			</div>
		)
	}
}