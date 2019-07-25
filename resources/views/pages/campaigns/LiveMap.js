import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import axios from 'axios';
import config from '../../config.js';

const Car = () => <div className="car" />;
export default class LiveMap extends Component {
  constructor(props) {
    super(props);

    const campaign = this.props.match.params;
    const innerHeight = window.innerHeight;
    const allHeight = (innerHeight - (50 + 64 + 88));

    this.state = {
      height: allHeight,
      url: `${config.api.getLiveLocation}/${campaign.id}`,
      token: localStorage.getItem('client_token'),
      defaultCenter: {
        lat: 14.6053665,
        lng: 121.0531643
      },
      location: []
    };
  }

  componentDidMount() {
    this.getLocation();
  }

  getLocation() {
    axios.get(this.state.url, {
      headers: {
        Authorization: `Bearer ${this.state.token}`
      }
    })
    .then((response) => {
      this.setState({
        location: response.data
      });
    })
    .catch((error) => {
      console.log(error.message);
    });
  }

  render() {
    return (
      <div style={{ height: `${this.state.height}px`, width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: config.apiKey.googleApiKey }}
          defaultCenter={this.state.defaultCenter}
          defaultZoom={11}
          yesIWantToUseGoogleMapApiInternals
        >
          {this.state.location.map((location) =>
            <Car lat={location.latitude} lng={location.longitude} />
          )}
        </GoogleMapReact>
      </div>
    );
  }
}
