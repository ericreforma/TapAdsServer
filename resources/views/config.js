export default {
    api: {
        createCampaign: `/client/campaign/create`,
        createGeoLocation: '/client/campaign/new/geolocation',
        campaignDashboard: '/client/campaign/dashboard/',
        getGeoLocation: '/client/campaign/geolocation',

        submitRateUser: '/client/user/rating',
        userProfileView: '/client/user/:id/profile',
        getChat: '/client/user/chats',
        getConvo: '/client/user/convo/',
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