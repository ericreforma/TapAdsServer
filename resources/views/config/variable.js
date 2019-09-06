import {getToken} from '../storage';
import { URL_ROUTES } from '../config/route';

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
    logo: `${URL_ROUTES.basePath}/images/app-logo.png`,
    logoWhite: `${URL_ROUTES.basePath}/images/app-logo-white.png`,
    puff: `${URL_ROUTES.basePath}/images/puff.svg`,
    spin: `${URL_ROUTES.basePath}/images/spin.svg`,
    bars: `${URL_ROUTES.basePath}/images/bars.svg`,
    dots: `${URL_ROUTES.basePath}/images/dots.svg`,
    defaultAvatar: `${URL_ROUTES.basePath}/images/default_avatar.png`,
    placeholder: `${URL_ROUTES.basePath}/images/placeholder.png`,
    placeholder1: `${URL_ROUTES.basePath}/images/placeholder1.png`,
    galleryIcon: `${URL_ROUTES.basePath}/images/gallery-icon.png`,
    vtype: [
        `${URL_ROUTES.basePath}/images/car_small_icon.png`,
        `${URL_ROUTES.basePath}/images/car_mid_icon.png`,
        `${URL_ROUTES.basePath}/images/car_large_icon.png`,
        `${URL_ROUTES.basePath}/images/motorcycle_icon.png`,
    ],
    icons: {
        sort: `${URL_ROUTES.basePath}/images/icons/sort_icon.png`,
        // chat: `${URL_ROUTES.basePath}/images/icons/chat_icon.png`,
        star: `${URL_ROUTES.basePath}/images/icons/star.png`,
        starActive: `${URL_ROUTES.basePath}/images/icons/star_active.png`,
        starInactive: `${URL_ROUTES.basePath}/images/icons/star_inactive.png`,
        favorite: `${URL_ROUTES.basePath}/images/icons/completed_favorite_icon.png`,
    },

    imgPath: (url) => {
        return `${URL_ROUTES.basePath}/${url}`;
    }
};