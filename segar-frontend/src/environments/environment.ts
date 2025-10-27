export const environment = {
  production: false,
  apiUrl: 'http://localhost:8090', //url del despliegue: http://35.238.19.224:8090
  keycloak: {
    url: 'http://localhost:8080', //url del despliegue: http://35.238.19.224:8080
    realm: 'segar',
    clientId: 'segar-frontend'
  }
};
