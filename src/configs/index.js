const isDev = process.env.NODE_ENV === 'development'
const siteConfig = {
  apiURL: isDev ? 'http://192.168.2.15:7789' : 'https://client-api.cryptoweb3.tools',
}

export default siteConfig
