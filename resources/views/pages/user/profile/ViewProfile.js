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

import { Loader } from '../../../components';
import config from '../../../config';

export default class ViewProfile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loader: true,

            userData: {},
            userCampaigns: [],
            userRating: [],
            userVehicles: [],

            favoriteCampaignsRowCount: 3,
            clientRatingsRowCount: 3,
        }
    }

    componentWillMount = () => {
        this.getUserProfile();
    }

    getUserProfile = () => {
        var { id } = this.props.match.params,
            apiRoute = config.api.userProfileView.split(':id'),
            url;
        
        apiRoute.splice(1, 0, id);
        url = apiRoute.join('');
        
        axios.get(url).then(response => {
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

class CardInfo extends Component {
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
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    render() {
        const {userData} = this.props;

        return (
            <div className="ups-pi-wrapper">
                {/* user image */}
                <div className="ups-pi-user-image">
                    <img src={userData.url ? userData.url : `/images/default_avatar.png`} />
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
                                                {Array(5).fill('/images/icons/').map((star, starIndex) =>
                                                    <img
                                                        key={starIndex}
                                                        className="ups-pi-star-icon"
                                                        src={star + (starIndex < parseInt(userData.rate) ? 'star_active.png' : 'star_inactive.png')}
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

                                    <Button color="primary" size="sm">
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

class CardCampaigns extends Component {
    render() {
        const {campaign} = this.props;

        return (
            <div className="ups-fc-card">
                <div className="ups-fc-c-client-image">
                    <img
                        src={campaign.media_campaign_url ? campaign.media_campaign_url : '/images/gallery-icon.png'}
                        alt={campaign.business_name}
                    />
                </div>

                <div className="ups-fc-c-lists">
                    <div className="ups-fc-c-l-header">
                        <h4 className="mr-3 mb-0"><strong>{campaign.campaign_name}</strong></h4>

                        <img
                            className="ups-fc-c-favorite-icon"
                            src={'/images/icons/completed_favorite_icon.png'}
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

class CardRatings extends Component {
    render() {
        const {rating} = this.props;

        return (
            <div className="ups-cr-card">
                <div className="ups-cr-client-info">
                    <div className="ups-cr-ci-image">
                        <img
                            src={rating.url ? rating.url : '/images/gallery-icon.png'}
                            alt={rating.business_name}
                        />
                    </div>

                    <div className="ups-cr-ci-wrapper">
                        <h4 className="mb-0"><strong>{rating.business_name}</strong></h4>
                        <h5 className="text-muted mb-0">{rating.business_nature}</h5>
                        <div>
                            {Array(5).fill('/images/icons/').map((star, starIndex) =>
                                <img
                                    key={starIndex}
                                    className="ups-cr-star-icon"
                                    src={star + (starIndex < parseInt(rating.rate) ? 'star_active.png' : 'star_inactive.png')}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="ups-cr-comment-header">
                    <div className="ups-cr-ch-horizontal"></div>
                    <h5 className="mb-0 text-muted">Comment</h5>
                    <div className="ups-cr-ch-horizontal"></div>
                </div>

                <div className="ups-cr-comment-wrapper">
                    {rating.comment ? (
                        <p className="ups-cr-comment-text">{rating.comment}</p>
                    ) : (
                        <div className="text-center">
                            <span><i>--- no comment ---</i></span>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}