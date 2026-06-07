//set the url of the server you want to test your code with and start the development server using the following command:
// ng serve --proxy-config ./proxy/proxy.conf.mjs
const environments = {
    'example': 'https://myPrimoVE.com',
    'il-urm08': 'http://il-urm08.corp.exlibrisgroup.com:1801',
    'sqa-eu01': 'https://sqa-eu01.alma.exlibrisgroup.com',
    'sqa-eu00': 'https://sqa-eu00.alma.exlibrisgroup.com',
    'sqa-na02': 'https://sqa-na02.alma.exlibrisgroup.com',
    'sand01': 'http://il-urmsand01.corp.exlibrisgroup.com:1801',
    'BL': 'https://bl-psb.primo.exlibrisgroup.com'

  }

  export const PROXY_TARGET = environments['il-urm08'];
