import React, { Component } from 'react';
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Progress,
  Button
} from 'reactstrap';
import axios from 'axios';
import { Switch } from '../../components';
import { Doughnut, Line } from 'react-chartjs-2';
import { Loader } from '../../components';

import config from '../../config';

export default class CampaignDashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loaderShow: true,

            //icons
            vehicleClass: [
                '/images/icons/car_small_icon.png',
                '/images/icons/car_mid_icon.png',
                '/images/icons/car_large_icon.png',
                '/images/icons/motorcycle_icon.png'
            ],

            campaign: {},
            userData: [],
        };
    }

    componentWillMount = () => {
        const { id } = this.props.match.params;
        this.getCampaignData(id);
    }

    getCampaignData = (id) => {
        axios.get(config.api.campaignDashboard + id).then(response => {
            if(response.data.status == 'success') {
                this.setState({
                    campaign: response.data.message.campaign,
                    userData: response.data.message.userData,
                    loaderShow: false,
                });
            } else {
                alert('Error occured please try again later');
                this.getCampaignData(id);
            }
        }).catch(error => {
            this.getCampaignData(id);
        });
    }


    // addtional functions >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    reconstructDate = (dates, timeInclude) => {
        var d = dates.split(' ')[0],
            time = dates.split(' ')[1],
            year = d.split('-')[0],
            month = parseInt(d.split('-')[1]) - 1,
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
            return time + ' - ' + months[month] + '. ' + date + ', ' + year;
        } else {
            return months[month] + '. ' + date + ', ' + year;
        }
    }

    numberWithCommas = (x) => {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    render() {
        const vehicleType = [
            'Private',
            'Public',
            'Mixed'
        ];

        if(this.state.loaderShow) {
            return (
                <Loader type="puff" />
            );
        } else {
            return (
                <div>
                    <div className="m-b">
                        <h2>{this.state.campaign.name}</h2>

                        <Card color="light">
                            <CardBody>
                                <strong>Description</strong>
                                <p className="text-muted">
                                    {this.state.campaign.description}
                                </p>
                                
                                <div className="row form-group">
                                    <div className="col align-self-center">
                                        <strong>Vehicle:</strong>
                                        <img
                                            style={{
                                                marginLeft: 15,
                                                marginRight: 10,
                                                height: 60,
                                                width: 60
                                            }}
                                            src={this.state.vehicleClass[this.state.campaign.vehicle_classification]}
                                        />
                                        <span
                                            className="text-success"
                                        >{vehicleType[this.state.campaign.vehicle_type]}</span>
                                    </div>
                                </div>
                                
                                <div className="row form-group">
                                    <div className="col align-self-center">
                                        <strong>Created:</strong>
                                        <span
                                            className="ml-3"
                                        >
                                            {this.reconstructDate(this.state.campaign.created_at, false)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="row form-group">
                                    <div className="col align-self-center">
                                        <strong>Basic Pay:</strong>
                                        <span
                                            className="ml-3"
                                        >
                                            {'₱ ' + this.numberWithCommas(this.state.campaign.pay_basic)} / {this.state.campaign.pay_basic_km + 'km'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="row">
                                    <div className="col align-self-center">
                                        <strong>Additional Pay:</strong>
                                        <span
                                            className="ml-3"
                                        >
                                            {'₱ ' + this.numberWithCommas(this.state.campaign.pay_additional)} / {this.state.campaign.pay_additional_km + 'km'}
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            );
        }
    }
}
