import { ApiConfigService } from "../../api-config";
import { CloudWatchLogsClient, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";
import { PutLogEventsCommandInput } from "@aws-sdk/client-cloudwatch-logs/dist-types/commands/PutLogEventsCommand";
import { InputLogEvent } from "@aws-sdk/client-cloudwatch-logs/dist-types/models/models_0";
import { LoggerService } from "@nestjs/common";


export class AwsLoggerService implements LoggerService {

  cloudWatchClient: CloudWatchLogsClient;
  logGroupName: string;
  logStreamName = "server-events";
  isDebug: boolean

  constructor(apiConfigService: ApiConfigService) {
    this.logGroupName = apiConfigService.nodeName
    this.cloudWatchClient = new CloudWatchLogsClient({
      region: 'eu-west-2'
    });
    this.isDebug = apiConfigService.logLevel === 'debug';
  }

  writeLog(level: string, message: any, info?: any) {
    const timestamp = new Date().getTime();

    const logEvent: InputLogEvent = {
      message: `[${level}] ${message}\n${info ? JSON.stringify(info) : ''}`,
      timestamp
    };

    const params: PutLogEventsCommandInput = {
      logGroupName: this.logGroupName,
      logStreamName: this.logStreamName,
      logEvents: [logEvent]
    };

    const command = new PutLogEventsCommand(params);

    this.cloudWatchClient.send(command)
      .catch(error => {
        console.error(`Error logging to CloudWatch: ${error}`);
      })
      .then();
  }

  log(message: any, info?: any) {
    this.writeLog('info', message, info)
  }

  async error(message: any, info?: any) {
    this.writeLog('error', message, {
      ...info,
      stack: new Error().stack
    })
  }

  async warn(message: any, info?: any) {
    this.writeLog('warn', message, info)
  }

  async debug(message: any, info?: any) {
    if ( this.isDebug ) {
      this.writeLog('debug', message, info)
    }
  }
}
