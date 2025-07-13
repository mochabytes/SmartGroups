import {
    get,
    postFormData
} from './api.js';

import {
    initializeApi,
    API_ENDPOINTS,
    SUCCESS_MESSAGES,
    ERROR_MESSAGES,
    UPLOAD_CONFIG
} from './constants.js';

// set up the api when the app starts
export const setupApi = async () => {
    try {
        await initializeApi();
        console.log('api initialized correctly');
        return true;
    }
    catch (error) {
        console.error('api initialization failed:', error);
        return false;
    }
};

// check if backend running
export const checkHealth = async () => {
    try {
        const response = await get(API_ENDPOINTS.HEALTH);
        return {
            success: true,
            message: SUCCESS_MESSAGES.HEALTH_CHECK_PASSED,
            data: response,
        };
    }
    catch (error) {
        throw new Error(ERROR_MESSAGES.BACKEND_UNAVAILABLE);
    }
};

// validate the file before uploading
const checkFile = (file) => {
    // if no file uploaded
    if (!file) {
        throw new Error(ERROR_MESSAGES.FILE_UPLOAD_ERROR);
    }

    // if file too big
    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
        throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
    }

    // if file type not allowed
    if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type)) {
        throw new Error(ERROR_MESSAGES.INVALID_FILE_FORMAT);
    }

    // if file extension not csv
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
        throw new Error(ERROR_MESSAGES.INVALID_FILE_FORMAT);
    }

    return true;
};

// upload the file and the constraints formdata to the backend
export const uploadFileAndConstraints = async (file, constraints = {}) => {
    await initializeApi(); // Ensure API is initialized before proceeding
    try {
        const formData = new FormData(); // all the constraints + file
        
        checkFile(file);  // check file
        formData.append('file', file); // add file if it passes check

        // append attributes (can be empty string if no attributes provided)
        formData.append('given_attributes', constraints.givenAttributes);  // request.form['given_attributes']

        // add the group size constraints
        if (constraints.groupSizeMin !== undefined) {
            formData.append('group_size_min', constraints.groupSizeMin.toString());  // request.form['group_size_min']
        }
        if (constraints.groupSizeMax !== undefined) {
            formData.append('group_size_max', constraints.groupSizeMax.toString());  // request.form['group_size_max']
        }

        // add the group count constraints
        if (constraints.groupCountMin !== undefined) {
            formData.append('group_count_min', constraints.groupCountMin.toString());  // request.form['group_count_min']
        }
        if (constraints.groupCountMax !== undefined) {
            formData.append('group_count_max', constraints.groupCountMax.toString());  // request.form['group_count_max']
        }

        // for each attribute, add min / max constraints if they enter them
        if (constraints.attributeConstraints) {
            Object.entries(constraints.attributeConstraints).forEach(([attr, attrConstraints]) => {
                if (attrConstraints.minPerGroup !== undefined) {
                    formData.append(`${attr}_min_per_group`, attrConstraints.minPerGroup.toString());
                }
                if (attrConstraints.maxPerGroup !== undefined) {
                    formData.append(`${attr}_max_per_group`, attrConstraints.maxPerGroup.toString());
                }
            });
        }
        if (constraints.combinedConstraints && constraints.combinedConstraints.length > 0) {
            formData.append('combined_constraints', JSON.stringify(constraints.combinedConstraints));
        }

        // show what's sent to backend
        if (process.env.NODE_ENV === 'development') {
            console.log('FormData being sent to backend:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
        }

        // send the request
        const response = await postFormData(API_ENDPOINTS.UPLOAD, formData);

        return {
            success: true,
            message: SUCCESS_MESSAGES.GROUPS_GENERATED,
            data: response
        };

    } 
    catch (error) {
        // Try to extract the most specific error message possible
        let errorMsg = null;
        if (error.response) {
            if (error.response.data) {
                if (typeof error.response.data === 'string') {
                    errorMsg = error.response.data;
                } else if (error.response.data.error) {
                    errorMsg = error.response.data.error;
                } else {
                    errorMsg = JSON.stringify(error.response.data);
                }
            }
        }
        if (!errorMsg && error.message) {
            errorMsg = error.message;
        }
        if (!errorMsg) {
            errorMsg = ERROR_MESSAGES.FILE_UPLOAD_ERROR;
        }
        throw new Error(errorMsg);
    }
}