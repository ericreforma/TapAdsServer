import React, {
  useState,
  useEffect
} from 'react';
import Select from 'react-select';
import GoogleMapReact, {Marker} from 'google-map-react';

import PageLoader from '../../../layout/PageLoader';

import { GOOGLE_API, KEYS, URL } from '../../../config';
import { LocationController, CampaignController } from '../../../controllers';

export const LiveMap = props => {
  const defaultSelectedCampaign = {value: 0, label: 'All Campaigns'};
  const [google, setGoogle] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingNewUsers, setLoadingNewUsers] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(defaultSelectedCampaign);

  useEffect(() => {
    getCampaigns();
  }, []);

  const onGoogleMapInit = google => {
    setGoogle(google);
  }

  const getUsersLocation = (cid = defaultSelectedCampaign.value) => {
    LocationController.user.live(!cid ? '' : `?cid=${cid}`)
    .then(res => {
      const {data} = res;
      console.log(data);
      const newMarkers = data.map(d => {
        const {latitude, longitude} = d;
        return {
          lat: latitude,
          lng: longitude,
          name: d.user_name,
          campaign: d.campaign_name,
          photo: d.user_photo
        };
      });

      setMarkers(newMarkers);
      setLoadingNewUsers(false);
    })
    .catch(err => {
      console.log(err);
      const {data} = err.response;
      if(data) {
        if(data.code === 'cid not exist')
          alert(data.message);
          setLoadingNewUsers(false);
      }
    });
  }

  const getCampaigns = () => {
    CampaignController.list()
    .then(res => {
      const {data} = res;
      const campaigns = data.map(d => {
        return {value: d.id, label: d.name};
      });

      campaigns.unshift(defaultSelectedCampaign);
      
      setLoadingInit(false);
      setCampaigns(campaigns);
      getUsersLocation();
    })
    .catch(err => {
      console.log(err);
      console.log(err.response);
    });
  }

  const campaignValueOnChange = value => {
    if(value.value !== selectedCampaign.value) {
      setSelectedCampaign(value);
      setLoadingNewUsers(true);
      getUsersLocation(value.value);
    }
  }

  return (
    <PageLoader loading={loadingInit}>
      <h4>Campaign</h4>

      <SelectCampaignContainer>
        <Select
          value={selectedCampaign}
          onChange={campaignValueOnChange}
          options={campaigns} />
      </SelectCampaignContainer>
      
      <MapContainer>
        <PageLoader loading={loadingNewUsers}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: KEYS.google }}
            defaultCenter={GOOGLE_API.defaultCenter}
            defaultZoom={GOOGLE_API.defaultZoom}
            yesIWantToUseGoogleMapApiInternals
            onGoogleApiLoaded={onGoogleMapInit}
            options={{
              clickableIcons: false
            }}
          >
            {markers.map((m, mIdx) =>
              <MarkerDesign
                key={mIdx}
                lat={m.lat}
                lng={m.lng}
                marker={m}
              />
            )}
          </GoogleMapReact>
        </PageLoader>
      </MapContainer>
    </PageLoader>
  );
}

const MapContainer = ({children}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >{children}</div>
  )
}

const SelectCampaignContainer = ({children}) => {
  return (
    <div className="pb-4">{children}</div>
  )
}

const MarkerDesign = props => {
  const {
    marker
  } = props;

  const [mouseEnter, setMouseEnter] = useState(false);
  const dimension = 40 + (mouseEnter ? 10 : 0);

  const onMouseEnter = () => {
    setMouseEnter(true);
  }

  const onMouseLeave = () => {
    setMouseEnter(false);
  }

  return (
    <div
      style={{
        backgroundColor: mouseEnter ? '#37abb4' : '#227d84',
        border: `3px solid ${mouseEnter ? '#37abb4' : '#227d84'}`,
        borderRadius: '50%',
        width: dimension,
        height: dimension,
        marginTop: -(dimension / 2),
        marginLeft: -(dimension / 2),
        overflow: 'hidden'
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <img
        src={`${URL.STORAGE_URL}/${marker.photo}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          overflow: 'hidden'
        }}
      />
    </div>
  )
}