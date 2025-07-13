import axios from 'axios';
import {
    getApiConfig,
    REQUEST_HEADERS,
    ERROR_MESSAGES,
    DEBUG_CONFIG
} from './constants.js'; // get my constants

const createApiClient = () => {
    const config = getApiConfig(); // get the config from constants; i.e. backend port + settings
    const client = axios.create ({
        baseURL: config.BASE_URL,
        timeout: config.TIMEOUT,
    });

    // now need interceptors to handle errors and logging
    // run request interceptor before sending request
    client.interceptors.request.use(
        (config) => {
            if (DEBUG_CONFIG.LOG_REQUESTS) { // if in dev mode, log request to console
                console.log('api request:', config.method?.toUpperCase(), config.url, config.data); // log the request to the console, config.url is the backedn url, data is the request body
            }
            return config;
        },
        (error) => {
            console.error('api request error:', error)
            return Promise.reject(error); // promise object reject, so that the error is handled by the caller
        }
    );

    // run response interceptor after receiving response
    client.interceptors.response.use(
        (response) => {
            if (DEBUG_CONFIG.LOG_RESPONSES) {
                console.log('api response:', response?.status, response?.config?.url);
            }
            return response;
        },
        (error) => {
            console.error('api response error:', error);
            return Promise.reject(error);
        }
    );

    return client;
};

// frontend sends a json request to the backend (realized I don't need this for now; keeping in case useful for future)
// export const makeJsonRequest = async (method, url, data = null) => {
//     const client = createApiClient();
//     const config = {
//         method,
//         url,
//         headers: REQUEST_HEADERS.JSON,
//     };
//     if (data) {
//         config.data = data;
//     }

//     const response = await client(config); 
//     return response.data; 
// }

// frontend sends a form data request to the backend
export const makeFormDataRequest = async (method, url, formData = null) => {
    const client = createApiClient();
    const config = {
        method,
        url,
        headers: REQUEST_HEADERS.FORM_DATA,
    };

    if (formData) {
        config.data = formData;
    }

    const response = await client(config);
    return response.data;
};

// shortcuts for get, post (json), and post (formdata)
export const get = (url) => makeJsonRequest('GET', url);
// export const postJson = (url, data) => makeJsonRequest('POST', url, data);
export const postFormData = (url, formData) => makeFormDataRequest('POST', url, formData);