import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MetricUnit, Metrics } from '@aws-lambda-powertools/metrics';
import { logger } from '@shared';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
import middy from '@middy/core';


const tracer = new Tracer();
const metrics = new Metrics();

export const main = async ({
  body,
}: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!body) throw new Error('no payload body');
    logger.info('request', { body })
    logger.debug('debug message', { key: 'value' });
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "The lambda is alive" }),
    };
  } catch (error: any) {
    logger.error(error.message);

    metrics.addMetric('LambdaError', MetricUnit.Count, 1);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message }),

    }
  }
};

export const handler = middy(main)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));