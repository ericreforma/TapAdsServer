import React, { Component } from 'react';
import {
    Label,
    Input
} from 'reactstrap';

export default class CampaignList extends Component {
    campaignOnChange = (e) => {
        var activeCampaign = parseInt(e.target.value),
            { pagination,
            activeUserId } = this.props;

        this.props.mainSetState({activeCampaign});
        
        pagination.currPage = 0;
        this.props.mainSetState({pagination});
        
        activeUserId = false;
        this.props.mainSetState({activeUserId});
    }

    render() {
        return (
            <div>
                <Label for="campaignSelect">Campaigns</Label>
                <Input
                    type="select"
                    name="campaignSelect"
                    id="campaignSelect"
                    defaultValue=""
                    onChange={this.campaignOnChange}
                >
                    <option value="" disabled>-- Select Campaign --</option>
                    {this.props.campaigns.map(c =>
                        <option value={c.id} key={c.id}>{c.name}</option>
                    )}
                </Input>
            </div>
        )
    }
}