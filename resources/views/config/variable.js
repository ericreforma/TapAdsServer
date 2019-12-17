import { getToken } from '../storage';
import { URL } from '../config';

export const months = {
	three: [
		'Jan', 'Feb', 'Mar',
		'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep',
		'Oct', 'Nov', 'Dec'
	],
	complete: [
		'January', 'February', 'March',
		'April', 'May', 'June', 'July',
		'August', 'September', 'October',
		'November', 'December'
	]
};

export const chat = {
	maxHourBreak: 2
};

export const USER_TYPE = {
	user: 0,
	client: 1,
};

export const GOOGLE_API = {
	heatmap_gradient: [
		'rgba(0, 255, 255, 0)',
		'rgba(0, 255, 255, 1)',
		'rgba(0, 191, 255, 1)',
		'rgba(0, 127, 255, 1)',
		'rgba(0, 63, 255, 1)',
		'rgba(0, 0, 255, 1)',
		'rgba(0, 0, 223, 1)',
		'rgba(0, 0, 191, 1)',
		'rgba(0, 0, 159, 1)',
		'rgba(0, 0, 127, 1)',
		'rgba(63, 0, 91, 1)',
		'rgba(127, 0, 63, 1)',
		'rgba(191, 0, 31, 1)',
		'rgba(255, 0, 0, 1)'
	],
	userTripMap: (lat, lng) => {
		return {lat, lng};
	},
	defaultCenter: {
		lat: 14.6053665,
		lng: 121.0531643
	},
	defaultZoom: 10,
};

export const TOKEN = getToken();

export const IMAGES = {
	logo: `${URL.basePath}/images/app-logo.png`,
	logoWhite: `${URL.basePath}/images/app-logo-white.png`,
	puff: `${URL.basePath}/images/puff.svg`,
	spin: `${URL.basePath}/images/spin.svg`,
	bars: `${URL.basePath}/images/bars.svg`,
	dots: `${URL.basePath}/images/dots.svg`,
	defaultAvatar: `${URL.basePath}/images/default_avatar.png`,
	placeholder: `${URL.basePath}/images/placeholder.png`,
	placeholder1: `${URL.basePath}/images/placeholder1.png`,
	galleryIcon: `${URL.basePath}/images/gallery-icon.png`,
	vtype: [
		`${URL.basePath}/images/car_small_icon.png`,
		`${URL.basePath}/images/car_mid_icon.png`,
		`${URL.basePath}/images/car_large_icon.png`,
		`${URL.basePath}/images/motorcycle_icon.png`,
	],
	icons: {
		sort: `${URL.basePath}/images/icons/sort_icon.png`,
		// chat: `${URL.basePath}/images/icons/chat_icon.png`,
		star: `${URL.basePath}/images/icons/star.png`,
		starActive: `${URL.basePath}/images/icons/star_active.png`,
		starInactive: `${URL.basePath}/images/icons/star_inactive.png`,
		favorite: `${URL.basePath}/images/icons/completed_favorite_icon.png`,
	},

	imgPath: (url) => {
		return `${URL.basePath}/${url}`;
	}
};

export const VEHICLE = {
  CLASS: {
    regular: {
      id: 0,
      name: 'Regular',
      description: ['Compact SUV to', 'Regular SUV,', 'Sedan or smaller']
    },
    premium: {
      id: 1,
      name: 'Premium',
      description: 'Van to Truck'
    },
    motorcycle: {
      id: 2,
      name: 'Motorcycle',
      description: 'Motorcycle'
    },
  },
  TYPE: {
    private: {
      id: 0,
      name: 'Private'
    },
    public: {
      id: 1,
      name: 'Public'
    },
    mixed: {
      id: 2,
      name: 'Mixed'
    },
  },
  STICKER_AREA: {
    full_wrap: {
			id: 0,
      name: 'Full Wrap'
    },
    '4_doors': {
			id: 1,
      name: '4 Doors'
    },
    '2_doors': {
			id: 2,
      name: '2 Doors'
    },
    bumper: {
			id: 3,
      name: 'Bumper'
    },
    rear_windows: {
			id: 4,
      name: 'Rear Windows'
    },
    in_car: {
			id: 5,
      name: 'In-Car'
    },
    motorcycle: {
			id: 6,
      name: 'Motorcycle'
    }
  }
};