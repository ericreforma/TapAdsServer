import React, { Component } from 'react';
import { Card, CardBody, Table } from 'reactstrap';
import axios from 'axios';
import { Loader } from '../../components';

const vtype = [
	require('../../../img/car_small_icon.png'),
	require('../../../img/car_mid.icon.png'),
	require('../../../img/car_large_icon.png'),
	require('../../../img/motorcycle_icon.png')
]; 
const sampleimg = require('../../../img/placeholder1.png');
// configs for api url, apiKey, etc..
import config from '../../config';

export default class CampaignList extends Component {
	constructor(props){
		super(props);
		this.state = {
			loader: true,
			campaigns:[],
			locations:[],
			firstPage:'',
			lastPage:'',
			currentPage:''
		}
	}
	componentWillMount(){
		this.LoadCampaign();
	}

	LoadCampaign = (page) => {
		var p = page?page:1;
		var token =  localStorage.getItem('client_token');
		var data = {
			headers: {
				Authorization: 'Bearer ' + token
			}
		}

		axios.get(config.api.campaignList,data).then( (res) => {
			this.setState({
				campaigns:res.data.campaigns,
				locations:res.data.locations
			});
			
			this.setState({loader: false});
        }).catch(error => {
			setTimeout(this.LoadCampaign, 1000);
        })
	}
	getLocation = (index) =>{
		let Locations = this.state.locations;
		let location_disp = "";
		for(var i=0; i < index.length; i++){
			Locations.filter(function(e) {
				if( e.location_index == index[i]){
					location_disp = location_disp + e.location_name.toString() + ', ';
				}
			});
		}
		location_disp = location_disp.slice(0, -2);
		return location_disp;
	}
	formatDate = (dates, timeInclude) => {
        var d = dates.split(' ')[0],
            time = dates.split(' ')[1],
            year = d.split('-')[0],
            month = parseInt(d.split('-')[1]),
            date = d.split('-')[2],
            hour = parseInt(time.split(':')[0]),
            min = time.split(':')[1],
            months = [
                'JAN', 'FEB', 'MAR', 'APR',
                'MAY', 'JUN', 'JUL', 'AUG',
                'SEP', 'OCT', 'NOV', 'DEC'
            ],
            time = hour == 0 ? '12:' + min + ' AM' : (
                hour < 13 ? (hour.length < 10 ? '0' + hour.toString() : hour) + ':' + min + ' AM' : (
                    ((hour - 12) < 10 ? '0' + (hour - 12).toString() : (hour - 12)) + ':' + min + ' PM'
                )
            );
    
        if(timeInclude) {
            return months[month-1] + '. ' + date + ', ' + year + ' - ' +time ;
        } else {
            return months[month-1] + '. ' + date + ', ' + year;
        }
    }
	render() {
		if(this.state.loader) {
            return <Loader type="puff" />;
		} else {
			return (
					<Card className="mycampaigns_card">
					{/* <CardHeader>List</CardHeader> */}
					<CardBody>
						<Table hover id="mycampaigns">
						<thead>
							<tr>
								<th>Campaign</th>
								<th>Date</th>
								<th>Vehicle</th>
								<th>Location</th>
								<th>Slots Used</th>
								<th>Basic Pay</th>
								<th>Additional Pay</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{this.state.campaigns.map((campaign,id) =>
								<tr key={id}>
									<td>
										<div className="d-flex flex-row justify-content-start align-items-center campaign-details">
											<div className="campaign-img"><img src={sampleimg}></img></div>
											<p>{campaign.campaign_name}</p>
										</div>
									</td>
									<td>{this.formatDate(campaign.created_at,true)}</td>
									<td>
										<div className="d-flex flex-row justify-content-start align-items-center flex-wrap">
											<div className="vehicle-type"><img  src={vtype[campaign.vehicle_classification]}></img></div>
											<p>{campaign.vehicle_type}</p>
										{/* <p>{campaign.vehicle_stickerArea}</p> */}
										</div>
									</td>
									<td>{this.getLocation(campaign.location_id)}</td>
									<td>{campaign.slots_used+" of "+campaign.slots_total} </td>
									<td>
										<div className="d-flex flex-column">
											<p><strong>Cost:</strong> ‎₱ {campaign.pay_basic}</p>
											<p><strong>Prerequisite:</strong> {campaign.pay_basic_km} km</p>
										</div>
									</td>
									<td>
										<div className="d-flex flex-column">
											<p><strong>Cost:</strong> ‎₱ {campaign.pay_additional}</p>
											<p><strong>Prerequisite:</strong> {campaign.pay_additional_km} km</p>
										</div>
									</td>
									<td>
										<div className="d-flex flex-column">
											<button className="btn btn-success" onClick={e => this.props.history.push(`/campaign/dashboard/${campaign.id}`)}>View</button>
											<button className="btn btn-primary">Update</button>
											<button className="btn btn-danger">Remove</button>
										</div>
									</td>
								</tr>
							)}
						</tbody>
						</Table>
					</CardBody>
					</Card>
			);
		}
	}
}
