import { API_BASE_URL } from '@constants/API';

const getConfiguration = async () => {
  const response = await fetch(`${API_BASE_URL}/study-room/credentials`);
  const configuration = await response.json();
  return configuration;
};

export { getConfiguration };
