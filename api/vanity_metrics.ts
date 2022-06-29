import superagent from 'superagent';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const handler = async (request: VercelRequest, response: VercelResponse) => {
  const data = await superagent.get(
    'http://rly-rewards-staging.us-west-1.elasticbeanstalk.com/vanity_metrics',
  );
  response.status(200).send(data);
};

export default handler;
