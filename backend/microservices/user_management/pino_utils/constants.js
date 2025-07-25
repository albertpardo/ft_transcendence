// Const for index patern in Kibana
const MICRO_NAME = "user_management";
const PINO_FILE = "file";
const PINO_HTTP = "http";
const APP_LOG = MICRO_NAME + "-log";
const APP_LOG_AUTH = MICRO_NAME + "-log-auth";
const APP_ERR = MICRO_NAME + "-error-handler";
const APP_REQ = MICRO_NAME + "-onrequest";

// Log Folder

const LOG_FOLDER = "/shared_logs";
const LOG_FILE = MICRO_NAME + ".log";


module.exports = { PINO_FILE, PINO_HTTP, APP_LOG, APP_LOG_AUTH, APP_ERR, APP_REQ, LOG_FOLDER, LOG_FILE };
