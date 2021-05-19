import fetch, { Response as fResponse } from 'node-fetch'

const customHeader = {
  Referer: 'https://www.bilibili.com',
  UserAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
}

async function myFetch(
  url: string,
  fetchConfig = {
    headers: customHeader,
  }
): Promise<fResponse> {
  return fetch(url, fetchConfig)
}

export default myFetch
