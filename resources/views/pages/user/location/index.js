import React, { Component } from 'react';
import {
    FormGroup,
    Col,
    Row,
    Card,
    CardBody,
    Button
} from 'reactstrap';
import GoogleMapReact from 'google-map-react';

import { Loader } from '../../../components';
import { HttpRequest } from '../../../services/http';
import config from '../../../config';
import { GOOGLE_MAPS } from '../../../services/google_maps';
import { GOOGLE_API } from '../../../config/variable';

import CampaignList from './CampaignList';
import UserList from './UserList';
import DateInput from './DateInput';
import UserTrips from './UserTrips';

export default class UserLocation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loader: true,

            campaigns: [],
            activeCampaign: false,
            actionChoice: false,
            activeUserId: false,
            date: {
                from: '',
                to: ''
            },
            pagination: {
                currPage: 0,
                pageLength: 7,
            },
            userTrips: {
                trips: [],
                locations: []
            },
            googleMap: {
                google: {},
                heatmap: null,
                polygon: null,
            }
        };
    }

    componentDidMount = () => {
        this.getCampaignLocationData();
    }

    getCampaignLocationData = () => {
        HttpRequest.get(config.api.getCampaignData).then(response => {
            if(response.data.status == 'success') {
                var loader = false,
                    { campaigns,
                    users,
                    geoLocations } = response.data.message;

                campaigns = campaigns.map(c => {
                    c.geoLocations = geoLocations.filter(g => c.location_id.indexOf(g.id) !== -1);
                    return c;
                });

                this.setState({
                    loader,
                    campaigns,
                    users
                });
            }
        }).catch(error => {
            setTimeout(() => this.getCampaignLocationData(), 1000);
            console.log(error);
        });
    }

    handleGoogleMapApi = (google) => {
        var { googleMap } = this.state;
        googleMap.google = google;
        this.setState({googleMap});
    }

    mainSetState = (data) => {
        var objKey = Object.keys(data)[0],
            objValue = Object.values(data)[0];
            
        this.setState({[objKey]: objValue});
    }

    loadOnClick = () => {
        var { activeUserId,
            activeCampaign } = this.state;

        if(activeUserId && activeCampaign) {
            HttpRequest.get(config.api.getTrips(activeUserId, activeCampaign)).then(response => {
                if(response.data.status == 'success') {
                    var userTrips = {},
                        { userTrip,
                        userTripMap } = response.data.message;
                    
                    userTrips.trips = userTrip.map(u => {
                        u.userTripMap = userTripMap.filter(ut => u.id == ut.user_trip_id);
                        return u;
                    });
                    userTrips.locations = userTripMap;
                    this.setState({userTrips});
                    this.plotPolygonMap();
                }
            }).catch(error => {
                console.log(error);
                setTimeout(() => this.loadOnClick(), 1000);
            });
        }
    }

    plotHeatMap = (locations) => {
        var { googleMap } = this.state,
            { google } = googleMap,
            bounds = new google.maps.LatLngBounds(),
            dataName = GOOGLE_API.userTripMap('latitude', 'longitude'),
            data = GOOGLE_MAPS.getPoints(google, locations, dataName);
            
        if(googleMap.heatmap) {
            googleMap.heatmap.setMap(null);
        }

        if(locations.length !== 0) {
            GOOGLE_MAPS.extendBounds(
                google, bounds, locations, dataName
            );
            GOOGLE_MAPS.fitBounds(google, bounds);
            googleMap.heatmap = GOOGLE_MAPS.heatmap(google, data);
        }

        this.setState({googleMap});
    }

    plotPolygonMap = () => {
        var { googleMap,
            activeCampaign,
            userTrips,
            campaigns } = this.state,
            { google } = googleMap,
            { locations } = userTrips,
            geoLocations = campaigns.filter(c => c.id == activeCampaign)[0].geoLocations,
            bounds = new google.maps.LatLngBounds(),
            dataName = GOOGLE_API.userTripMap('lat', 'lng'),
            newPolygon = [];

        if(googleMap.polygon) {
            googleMap.polygon.map(g => {
                g.setMap(null);
            });
        }
        
        geoLocations.map(g => {
            var jsonPoints = JSON.parse(g.json_coordinates)
            
            jsonPoints.map(j => {
                newPolygon.push(GOOGLE_MAPS.createPolygon(google, j));
                GOOGLE_MAPS.extendBounds(
                    google, bounds, j, dataName
                );
            });
        });
        GOOGLE_MAPS.fitBounds(google, bounds);
        googleMap.polygon = newPolygon;

        this.plotHeatMap(locations);
        this.setState({googleMap});
    }

    replotHeatMap = (checked) => {
        var { userTrips } = this.state,
            { trips,
            locations } = userTrips,
            userTripsChecked = checked.slice(1),
            locationPassed,
            locationIDs,
            locationPushed;

        locationPassed = trips.filter((l, index) => {
            if(userTripsChecked[index]) {
                return true;
            }
            return false;
        });
        
        locationIDs = locationPassed.map(l => l.id);
        locationPushed = locations.filter(l => locationIDs.indexOf(l.user_trip_id) !== -1);
        this.plotHeatMap(locationPushed);
    }

    render() {
        if(this.state.loader) {
            return <Loader type="puff" />
        } else {
            return (
                <div className="user-location-section">
                    <Row>
                        <Col lg="6">
                            <Card>
                                <CardBody>
                                    {/* campaign lists */}
                                    <FormGroup className="p-2">
                                        <CampaignList {...this.state} mainSetState={this.mainSetState} />
                                    </FormGroup>

                                    <hr />

                                    {/* user lists */}
                                    <UserList {...this.state} mainSetState={this.mainSetState} />

                                    <hr />

                                    {/* date input */}
                                    <FormGroup className="pt-2 pl-2 pr-2">
                                        <DateInput {...this.state} mainSetState={this.mainSetState} />
                                    </FormGroup>

                                    <hr />

                                    <div className="p-2">
                                        <Button
                                            color="success"
                                            onClick={e => this.loadOnClick()}
                                            block
                                        >Load</Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        <Col lg="6">
                            <Card>
                                <CardBody>
                                    <FormGroup>
                                        <div
                                            style={{
                                                width: '100%',
                                                height: '70vh'
                                            }}
                                        >
                                            <GoogleMapReact
                                                bootstrapURLKeys={{ key: config.apiKey.googleApiKey }}
                                                defaultCenter={GOOGLE_API.defaultCenter}
                                                defaultZoom={GOOGLE_API.defaultZoom}
                                                yesIWantToUseGoogleMapApiInternals
                                                onGoogleApiLoaded={this.handleGoogleMapApi}          
                                                heatmapLibrary={true} 
                                                options={{
                                                    clickableIcons: false
                                                }}
                                            ></GoogleMapReact>
                                        </div>
                                    </FormGroup>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Card>
                                <CardBody>
                                    <div className="ulc-user-trips">
                                        <h3 className="pt-1 pb-2">User Trips</h3>
                                        <UserTrips
                                            {...this.state}
                                            replotHeatMap={this.replotHeatMap}
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
            )
        }
    }
}