export const environment = {
  production: false, // Set to true in `environment.prod.ts`
  // apiUrl: 'https://chatapp-api.azure-api.net/api', // Replace with your backend API URL
  authApiUrl: 'http://localhost:5001/api/auth', // Replace with your backend API URL
  userApiUrl: 'http://localhost:5002/api/user',
  chatApiUrl: 'http://localhost:5003/api',
  // apiUrl: '',
  signalRHubUrl: 'http://localhost:5003/chathub', // Replace with SignalR Hub URL
  tenantId: '8cbbc777-745f-4292-b2d0-942307a91c38',
  clientId: '9edade3e-8b3d-4ad2-bed6-a358bce26588',
  tenant:
    'https://8cbbc777-745f-4292-b2d0-942307a91c38.b2clogin.com/8cbbc777-745f-4292-b2d0-942307a91c38.onmicrosoft.com/B2C_1_chatappsigninandsignup',
  googleClientId:
    '48957325825-hcfi4681fqum445pgs9oo7aj8iar5pvd.apps.googleusercontent.com',
  Authentication: {
    Google: {
      ClientId:
        '48957325825-mlf7eiq3bfgbddkgtb28rj77tfb2cej7.apps.googleusercontent.com',
      ClientSecret: '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',
    },
  },
};
