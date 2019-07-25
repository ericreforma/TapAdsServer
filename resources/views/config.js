const homepage = '';

export default {
  api: {
      campaignlist: `${homepage}/api/client/campaigns`,
      createCampaign: `${homepage}/api/client/campaign/create`,
      createGeoLocation: `${homepage}/api/client/campaign/new/geolocation`,
      campaignDashboard: `${homepage}/api/client/campaign/dashboard/`,
      getGeoLocation: `${homepage}/api/client/campaign/geolocation`,
      submitRateUser: `${homepage}/api/client/user/rating`,
      userProfileView: `${homepage}/api/client/user/:id/profile`,
      login: `${homepage}/api/client/login`,
      getLiveLocation: `${homepage}/api/client/campaign/getLiveLocation`,
  },
  apiKey: {
      googleApiKey: 'AIzaSyBwXTceRsEryqeySF0HtM66cVwwWa9rW0w'
  },
  homepage
};
