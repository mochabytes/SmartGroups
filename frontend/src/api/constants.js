// figure out where the backend lives after we boot it up (port was chosen dynamically in case 5000 wasn't available)
const discoverBackendPort = async () => {
  const possiblePorts = [5000, 5001, 5002, 5003, 5004, 5005, 5006, 5007, 5008, 5009, 5010, 5011]; // i doubt they'll have NONE of these free...
  
  for (const port of possiblePorts) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`http://localhost:${port}/api/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`Backend found on port ${port}`);
        return port;
      }
    } catch (error) {
      continue; // try the next one
    }
  }
  
  throw new Error('backend not found on any port :(');
};

// initialize api config, which gives info to make requests to the backend
let apiConfig = null;

export const initializeApi = async () => {
  if (!apiConfig) {
    try {
      const port = await discoverBackendPort();
      apiConfig = {
        BASE_URL: `http://localhost:${port}`,
        PORT: port,
        TIMEOUT: 30000,
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000,
      };
    } 
    catch (error) {
      console.error('Failed to discover backend port:', error);
      apiConfig = {
        BASE_URL: 'http://localhost:5013', // this is kind of a fallback, hopefully not an issue
        PORT: 5000,
        TIMEOUT: 30000,
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000,
      };
    }
  }
  return apiConfig;
};

// after api config is initialized, use this to get the current config
export const getApiConfig = () => {
  if (!apiConfig) {
    throw new Error('API not initialized. Call initializeApi() first.');
  }
  return apiConfig;
};

// api endpoints
export const API_ENDPOINTS = {
  UPLOAD: '/api/upload', // this is defined in the backend when i wrote up app.py
  HEALTH: '/api/health', // just checking it works
};

// remember status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// error + success messages (thanks claude)
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  FILE_UPLOAD_ERROR: 'Failed to upload file. Please try again.',
  INVALID_FILE_FORMAT: 'Invalid file format. Please upload a CSV file.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 500MB.',
  BACKEND_UNAVAILABLE: 'Backend service is unavailable. Please make sure the backend is running.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: 'File uploaded successfully!',
  GROUPS_GENERATED: 'Groups generated successfully!',
  HEALTH_CHECK_PASSED: 'Backend is running properly.',
};

// file upload config
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB - very generous since it's local
  ALLOWED_TYPES: ['text/csv', 'application/vnd.ms-excel', '.csv'],
  ALLOWED_EXTENSIONS: ['.csv'],
};

// user interface config
export const UI_CONFIG = {
  LOADING_MESSAGES: {
    DISCOVERING_BACKEND: 'Finding backend service...',
    UPLOADING_FILE: 'Uploading your file...',
    PROCESSING_DATA: 'Processing student data...',
    GENERATING_GROUPS: 'Generating groups with your constraints (if it is possible)...',
    HEALTH_CHECK: 'Checking backend status...',
  },
  TIMEOUTS: {
    NOTIFICATION_DURATION: 5000, // 5 seconds
    LOADING_MIN_DURATION: 2000, // 1 second minimum loading time
  },
};

// request headers — i.e. what backend expects when frontend sends a request
export const REQUEST_HEADERS = {
  JSON: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  FORM_DATA: { // for sending my files, and the constraints that user inputs into the form
    // the content type is automatically set
    'Accept': 'application/json',
  },
};

// dev & debugging config
export const DEBUG_CONFIG = {
  ENABLED: process.env.NODE_ENV === 'development',
  LOG_REQUESTS: process.env.NODE_ENV === 'development',
  LOG_RESPONSES: process.env.NODE_ENV === 'development',
};