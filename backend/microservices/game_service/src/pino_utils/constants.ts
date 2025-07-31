// Const for index patern in Kibana
const MICRO_NAME: string = "game_service";
const PINO_FILE: string = "file";
const PINO_HTTP: string = "http";
const APP_LOG = MICRO_NAME + "-log";
const APP_LOG_AUTH = MICRO_NAME + "-log-auth";
const APP_ERR = MICRO_NAME + "-error-handler";
const APP_REQ = MICRO_NAME + "-onrequest";

// Log Folder & Log File

const LOG_FOLDER: string = "/shared_logs";
const LOG_FILE = MICRO_NAME + ".log";


export { MICRO_NAME, PINO_FILE, PINO_HTTP, APP_LOG, APP_LOG_AUTH, APP_ERR, APP_REQ, LOG_FOLDER, LOG_FILE };
