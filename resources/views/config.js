const homepage = '/TapAdsServer/public';

export default {
    api: {
        createCampaign: `${homepage}/api/client/campaign/create`,
        createGeoLocation: `${homepage}/api/client/campaign/new/geolocation`,
        campaignDashboard: (id) => {
            return `${homepage}/api/client/campaign/dashboard/${id}`
        },
        getGeoLocation: `${homepage}/api/client/campaign/geolocation`,
        getCampaignData: `${homepage}/api/client/campaign/location/data`,

        submitRateUser: `${homepage}/api/client/user/rating`,
        userProfileView: (id) => {
            return `${homepage}/api/client/user/${id}/profile`
        },
        getChat: `${homepage}/api/client/user/chats`,
        getConvo: `${homepage}/api/client/user/convo/`,
        getTrips: (uid, cid) => {
            return `${homepage}/api/client/user/trip/${cid}/${uid}`;
        },
        submitRateUser: `${homepage}/api/client/user/rating`,

        updateNotif:`${homepage}/api/client/chat/notif/update`,

        campaignList:  `${homepage}/api/client/campaigns`,
        userRequests: `${homepage}/api/client/campaigns/requests`,
        login: `${homepage}/api/client/login`,
        clientNotification: `${homepage}/api/client/notifications`,

        getListOfUsers: `${homepage}/api/client/chat/usersList`,
    },
    apiKey: {
        googleApiKey: `AIzaSyBwXTceRsEryqeySF0HtM66cVwwWa9rW0w`
    }
};
