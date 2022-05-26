import superagent from 'superagent';
import { useEffect, useState } from 'react';

export const fetchResource = async (apiRoute: string) => {
  const request = async () => {
    return superagent.get(apiRoute);
  };

  return makeRequest(request);
};

const makeRequest = async (
  requestFx: () => Promise<superagent.Response>,
): Promise<[number, any]> => {
  let response = null;
  try {
    response = await requestFx();
  } catch (err) {
    console.debug('Request error == ', err);
    return [500, null];
  }

  return [response.status, response.body];
};

export function useFetchResource<S>(
  apiEndpoint: string,
): [boolean, string | undefined, S | undefined, () => Promise<void>] {
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [apiData, setApiData] = useState<S | undefined>();

  const fetchData = async () => {
    setLoading(true);

    const [status, data] = await fetchResource(apiEndpoint);

    setLoading(false);
    setHasFetchedData(true);

    if (status > 200) {
      setError('Unable to fetch resource');
      return;
    }

    setApiData(data);
  };

  useEffect(() => {
    if (!loading && !hasFetchedData && !apiData) {
      fetchData();
    }
  });

  return [loading, error, apiData, fetchData];
}
