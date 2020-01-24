import React, {Component} from 'react';
import { IMAGES, URL } from '../../../config';

export default class CardCampaigns extends Component {
	render() {
		const {campaign} = this.props;

		return (
			<div className="ups-fc-card">
				<div
					style={{
						width: 70,
						height: 70,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						margin: '0.75rem 1rem 0.75rem 0px'
					}}
				>
					<div
						style={{
							width: 70,
							height: 70,
							borderRadius: '50%',
							overflow: 'hidden'
						}}
					>
						<img
							src={
								campaign.media_client_url
								? `${URL.STORAGE_URL}/${campaign.media_client_url}`
								: IMAGES.galleryIcon
							}
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								overflow: 'hidden'
							}}
							alt={campaign.business_name}
						/>
					</div>
				</div>

				<div className="ups-fc-c-lists">
					<div className="ups-fc-c-l-header">
						<h4 className="mr-3 mb-0"><strong>{campaign.campaign_name}</strong></h4>

						<img
							className="ups-fc-c-favorite-icon"
							src={IMAGES.icons.favorite}
							alt="Favorite"
						/>
					</div>

					<h5 className="mb-0 text-muted">{campaign.business_name}</h5>
					<h6 className="mb-0 text-muted">{campaign.business_nature}</h6>
				</div>
			</div>
		)
	}
}