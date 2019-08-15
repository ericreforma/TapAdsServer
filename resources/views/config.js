export default {
    api: {
        createCampaign: `/client/campaign/create`,
        createGeoLocation: '/client/campaign/new/geolocation',
        campaignDashboard: (id) => {
            return `/client/campaign/dashboard/${id}`
        },
        getGeoLocation: '/client/campaign/geolocation',
        getCampaignData: '/client/campaign/location/data',

        submitRateUser: '/client/user/rating',
        userProfileView: (id) => {
            return `/client/user/${id}/profile`
        },
        getChat: '/client/user/chats',
        getConvo: '/client/user/convo/',
        getTrips: (uid, cid) => {
            return `/client/user/trip/${cid}/${uid}`;
        },
        submitRateUser: '/client/user/rating',

        updateNotif: '/client/chat/notif/update',

        campaignList:  '/client/campaigns',
        userRequests: '/client/campaigns/requests',

        clientNotification: '/client/notifications',

        getListOfUsers: '/client/chat/usersList',
    },
    apiKey: {
        googleApiKey: 'AIzaSyBwXTceRsEryqeySF0HtM66cVwwWa9rW0w'
    }
};