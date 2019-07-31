import React, {Component} from 'react';
import {
    Row,
    Col,
    Card,
    CardHeader,
    CardBody,
    Button
} from 'reactstrap';
import axios from 'axios';

import CardInfo from './CardInfo';
import CardCampaigns from './CardCampaigns';
import CardRatings from './CardRatings';
import { Loader } from '../../../components';
import config from '../../../config';

export default class ViewProfile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loader: true,
            token: '',

            userData: {},
            userCampaigns: [],
            userRating: [],
            userVehicles: [],

            favoriteCampaignsRowCount: 3,
            clientRatingsRowCount: 3,
        }
    }

    componentWillMount = () => {
		var token =  localStorage.getItem('client_token');
        this.setState({token});
        this.getUserProfile();
    }

    getUserProfile = () => {
        var { id } = this.props.match.params,
            apiRoute = config.api.userProfileView.split(':id'),
            url;
        
        apiRoute.splice(1, 0, id);
        url = apiRoute.join('');
        
        axios.get(url, {
            headers: {
				Authorization: 'Bearer ' + this.state.token
            }
        }).then(response => {
            if(response.data.status == 'success') {
                var {
                        userData,
                        userCampaigns,
                        userRating,
                        userVehicles,
                    } = response.data.message,
                    rate = userRating.length !== 0 ? (
                        userRating.map(r => {return r.rate;}).reduce((a,b) => a + b) / userRating.length
                    ) : 0,
                    totalRating = userRating.length !== 0 ? (
                        userRating.map(r => {return r.rate;}).reduce((a,b) => a + b)
                    ) : 0;

                userData.rate = rate;
                userData.totalRating = totalRating.toFixed(2);

                this.setState({
                    loader: false,
                    userData: userData,
                    userCampaigns: userCampaigns,
                    userRating: userRating,
                    userVehicles: userVehicles
                });
            } else {
                alert(response.data.message);
            }
        }).catch(error => {
            setTimeout(this.getUserProfile, 1000);
        });
    }

    showMoreFavoriteCampaigns = () => {
        var {favoriteCampaignsRowCount} = this.state;
        favoriteCampaignsRowCount += 3;
        this.setState({favoriteCampaignsRowCount});
    }

    showMoreClientRatings = () => {
        var {clientRatingsRowCount} = this.state;
        clientRatingsRowCount += 3;
        this.setState({clientRatingsRowCount});
    }

    render() {
        if(this.state.loader) {
            return <Loader type="puff" />
        } else {
            const { userData } = this.state;

            return (
                <div className="user-profile-section">
                    <div className="ups-personal-info">
                        <CardInfo userData={userData} />
                    </div>

                    <Row>
                        <Col lg={6}>
                            <div className="ups-favorite-campaigns">
                                <div className="ups-div-header">
                                    <h4 className="mb-0">Favorite Campaigns</h4>
                                    <div className="ups-fc-h-horizontal"></div>
                                </div>

                                <Card>
                                    <CardBody>
                                        {this.state.userCampaigns.length !== 0 ? (
                                            <div>
                                                {this.state.userCampaigns.map((c, cIdx) =>
                                                    (this.state.favoriteCampaignsRowCount - 1) >= cIdx ? (
                                                        <CardCampaigns
                                                            key={cIdx}
                                                            campaign={c}
                                                        />
                                                    ) : null
                                                )}

                                                {this.state.favoriteCampaignsRowCount < this.state.userCampaigns.length ? (
                                                    <div className="mt-3">
                                                        <Button
                                                            color="secondary"
                                                            size="xs"
                                                            onClick={this.showMoreFavoriteCampaigns}
                                                            block
                                                        >
                                                            Show more
                                                        </Button>
                                                    </div>
                                                ) : null}
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <span><i>-- no client ratings --</i></span>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </div>
                        </Col>
                        
                        <Col lg={6}>
                            <div className="ups-client-ratings">
                                <div className="ups-div-header">
                                    <h4 className="mb-0">Client Ratings</h4>
                                    <div className="ups-fc-h-horizontal"></div>
                                </div>

                                <Card>
                                    <CardBody>
                                        {this.state.userRating.length !== 0 ? (
                                            <div>
                                                {this.state.userRating.map((r, rIdx) =>
                                                    (this.state.clientRatingsRowCount - 1) >= rIdx ? (
                                                        <CardRatings
                                                            key={rIdx}
                                                            rating={r}
                                                        />
                                                    ) : null
                                                )}

                                                {this.state.clientRatingsRowCount < this.state.userRating.length ? (
                                                    <div className="mt-3">
                                                        <Button
                                                            color="secondary"
                                                            size="xs"
                                                            onClick={this.showMoreClientRatings}
                                                            block
                                                        >
                                                            Show more
                                                        </Button>
                                                    </div>
                                                ) : null}
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <span><i>-- no favorite campaigns --</i></span>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                </div>
            )
        }
    }
}