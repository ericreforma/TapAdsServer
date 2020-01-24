const basePath = '/TapAdsServer/public';
const STORAGE_URL = `${basePath}/storage`;

export const URL = {
	basePath,
	STORAGE_URL,
	dashboard: `/dashboard`,
	login: `/login`,
	signup: `/signup`,
	logout: `/logout`,
	termsAndCondition: {
		privacyPolicy: '/termsAndCondition/privacyPolicy',
		termsOfUse: '/termsAndCondition/termsOfUse'
	},
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
		getTrips: '/client/user/trip',
		updateNotif: '/client/chat/notif/update',
		campaignList:  '/client/campaigns',
		userRequests: '/client/campaigns/requests',
		clientNotification: '/client/notifications',
		getListOfUsers: '/client/chat/usersList',
		auth: {
			login: '/client/login',
			register: '/client/register',
			logout: '/client/logout'
		}
	}
};

export const KEYS = {
	google: 'AIzaSyBwXTceRsEryqeySF0HtM66cVwwWa9rW0w',
	storage: '6CdP1np01nT D!r3cT m@rk3t!nG 1nC'
};