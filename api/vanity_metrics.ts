import superagent from 'superagent';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const PROD_URL =
  'http://rly-rewards.us-west-1.elasticbeanstalk.com/vanity_metrics';

const handler = async (request: VercelRequest, response: VercelResponse) => {
  const proxyResponse = await superagent.get(
    process.env.ORIGIN_URL || PROD_URL,
  );
  response
    .status(200)
    .setHeader('Content-Type', 'application/json')
    .send(proxyResponse.body);
};

export default handler;
