export const environment = {
  production: false,
  apiUrl: 'https://segar-solutions.duckdns.org/api', //url del despliegue: http://35.238.19.224:8090
  keycloak: {
    url: 'https://segar-solutions.duckdns.org/auth',
    realm: 'segar',
    clientId: 'segar-frontend'
  }
};
