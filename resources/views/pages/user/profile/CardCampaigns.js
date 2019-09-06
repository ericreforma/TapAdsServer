import React, {Component} from 'react';
import { IMAGES } from '../../../config/variable';

export default class CardCampaigns extends Component {
    render() {
        const {campaign} = this.props;

        return (
            <div className="ups-fc-card">
                <div className="ups-fc-c-client-image">
                    <img
                        src={campaign.media_campaign_url ? IMAGES.imgPath(campaign.media_campaign_url) : IMAGES.galleryIcon}
                        alt={campaign.business_name}
                    />
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