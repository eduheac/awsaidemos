export const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID || '',
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || '',
    },
  },
};

export const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '';
export const FILES_BUCKET = import.meta.env.VITE_FILES_BUCKET || '';
