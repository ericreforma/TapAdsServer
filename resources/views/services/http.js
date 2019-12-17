import axios from 'axios';
import { API, TOKENIZED_API, API_RAW } from './api';

let httpRequest;

export const HttpRequest = {
	get: url => {
		httpRequest = axios.create(TOKENIZED_API());
		return new Promise(function(resolve, reject) {
			AxiosRequest.get(resolve, reject, url);
		});
	},
	post: (url, form = {}) => {
		httpRequest = axios.create(TOKENIZED_API());
		return new Promise(function(resolve, reject) {
			AxiosRequest.post(resolve, reject, url, form);
		});
	}
};

export const RawHttpRequest = {
	get: url => {
		httpRequest = axios.create(API);
		return new Promise(function(resolve, reject) {
			AxiosRawRequest.get(resolve, reject, url);
		});
	},
	post: (url, form = {}) => {
		httpRequest = axios.create(API_RAW());
		return new Promise(function(resolve, reject) {
			AxiosRawRequest.post(resolve, reject, url, form);
		});
	}
};

const AxiosRequest = {
	get: (resolve, reject, url, tries = 0) => {
		httpRequest.get(url)
		.then(resolve)
		.catch(e => {
			if(tries === 3) {
				reject(e);
			} else {
				setTimeout(() => {
					AxiosRequest.get(resolve, reject, url, tries + 1);
				}, 2000);
			}
		})
	},
	post: (resolve, reject, url, form, tries = 0) => {
		httpRequest.post(url, form)
		.then(resolve)
		.catch(e => {
			if(tries === 3) {
				reject(e);
			} else {
				setTimeout(() => {
					AxiosRequest.get(resolve, reject, url, tries + 1);
				}, 2000);
			}
		});
	}
};

const AxiosRawRequest = {
	get: (resolve, reject, url, tries = 0) => {
		httpRequest.get(url)
		.then(resolve)
		.catch(e => {
			if(tries === 3) {
				reject(e);
			} else {
				setTimeout(() => {
					AxiosRawRequest.get(resolve, reject, url, tries + 1);
				}, 2000);
			}
		})
	},
	post: (resolve, reject, url, form, tries = 0) => {
		httpRequest.post(url, form)
		.then(resolve)
		.catch(e => {
			if(tries === 3) {
				reject(e);
			} else {
				setTimeout(() => {
					AxiosRawRequest.get(resolve, reject, url, tries + 1);
				}, 2000);
			}
		});
	}
};