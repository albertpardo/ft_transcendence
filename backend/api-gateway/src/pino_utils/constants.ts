// Const for index patern in Kibana
const MICRO_NAME: string = "api-gateway";
const PINO_FILE: string = "file";
const PINO_HTTP: string = "http";
const APP_LOG: string = MICRO_NAME + "-log";
const APP_LOG_AUTH: string = MICRO_NAME + "-log-auth";
const APP_ERR: string = MICRO_NAME + "-error-handler";
const APP_REQ: string = MICRO_NAME + "-onrequest";

// Log Folder

const LOG_FOLDER: string = "/shared_logs";
const LOG_FILE: string = MICRO_NAME + ".log";


export { PINO_FILE, PINO_HTTP, APP_LOG, APP_LOG_AUTH, APP_ERR, APP_REQ, LOG_FOLDER, LOG_FILE };
