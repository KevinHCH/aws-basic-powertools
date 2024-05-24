import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs'
import { join } from 'node:path'
export class AwsBasicPowertoolsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const lambdaPowerToolsConfig = {
      LOG_LEVEL: 'DEBUG',
      POWERTOOLS_LOGGER_LOG_EVENT: 'true',
      POWERTOOLS_LOGGER_SAMPLE_RATE: '1',
      POWERTOOLS_TRACE_ENABLED: 'enabled',
      POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS: 'captureHTTPsRequests',
      POWERTOOLS_SERVICE_NAME: 'aws-lambda-service',
      POWERTOOLS_TRACER_CAPTURE_RESPONSE: 'captureResult',
      POWERTOOLS_METRICS_NAMESPACE: 'HandlerMetrics',
    };
    // create the lambda function
    const handler = new NodejsFunction(this, 'Handler', {
      entry: join(__dirname, '../functions/index.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      logRetention: RetentionDays.ONE_WEEK,
      tracing: Tracing.ACTIVE,
      bundling: {
        minify: true
      },
      depsLockFilePath: join(__dirname, '../package-lock.json'),
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      environment: {
        ...lambdaPowerToolsConfig,
        MY_CUSTOM_VAR: "my-custom-var-value"
      },
    });
    handler.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    new cdk.CfnOutput(this, 'LambdaFunction', {
      value: handler.functionName,
      description: 'Lambda function name',
    })

  }
}
