   import React, { Component } from 'react';
import {
	Card,
	CardHeader,
	CardBody,
	Table,
	Button
} from 'reactstrap';
import axios from 'axios';
import { Loader } from '../../components';

const vtype = [
	require('../../../img/car_small_icon.png'),
	require('../../../img/car_mid.icon.png'),
	require('../../../img/car_large_icon.png'),
	require('../../../img/motorcycle_icon.png')
]; 
const sampleimg = require('../../../img/placeholder1.png');

export default class CampaignList extends Component {
	constructor(props){
		super(props);
		this.state = {
			loader: true,
			campaigns:[],
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

		axios.get('/api/client/campaigns',data).then( (res) => {
			this.setState({
				campaigns:res.data
			});
			const script = document.createElement("script");
			const scriptText = document.createTextNode("$('#mycampaigns').DataTable({responsive: true});");
			script.appendChild(scriptText);
			document.body.appendChild(script);
			this.setState({loader: false});
        }).catch(error => {
			setTimeout(this.LoadCampaign, 1000);
        })
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
            return months[month] + '. ' + date + ', ' + year + ' - ' +time ;
        } else {
            return months[month] + '. ' + date + ', ' + year;
        }
    }
	render() {
		if(this.state.loader) {
            return <Loader type="puff" />;
		} else {
			return (
				<div>
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
							<th>Slots</th>
							<th>Basic Pay</th>
							<th>Additional Pay</th>
							<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{this.state.campaigns.map((campaign,id) =>
								<tr key={id}>
									<td>
										<div className="d-flex flex-row justify-content-start align-items-center flex-wrap">
											<div className="campaign-img"><img src={sampleimg}></img></div>
											<p>{campaign.name}</p>
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
									<td>{campaign.location_id}</td>
									<td>{campaign.slots}</td>
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

				</div>
			);
		}
	}
}
