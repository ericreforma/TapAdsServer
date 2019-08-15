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

export const TOKEN = localStorage.getItem('client_token');