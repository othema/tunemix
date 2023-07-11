import { getInfo, chooseFormat } from "ytdl-core";
import axios from "axios";

export async function getAudioStream(id: string) {
  // const res = await fetch(`https://pipedapi.kavin.rocks/streams/${id}`);
  // return await res.json();
  const url = "https://www.youtube.com/watch?v=" + id;
  const info = await getInfo(url);
  const format = chooseFormat(info.formats, { filter: "audioonly" });

  return format.url;
}

export async function suggest(query: string) {
  const res = await fetch(`https://pipedapi.kavin.rocks/opensearch/suggestions?query=${query}`);
  if (res.status != 200) return [query];
  return (await res.json())[1];
}

export async function search(query: string, maxResults = null) {
  const encodedSearch = encodeURIComponent(query);
  const BASE_URL = 'https://youtube.com';
  const url = `${BASE_URL}/results?search_query=${encodedSearch}`;
  let response = (await axios.get(url)).data;

  while (!response.includes('ytInitialData')) {
    response = (await axios.get(url)).data;
  }

  const results = parseHtml(response);

  if (maxResults !== null && results.length > maxResults) {
    return results.slice(0, maxResults);
  }

  return results;
}

function parseHtml(response: string) {
  const results = [];
  const start = response.indexOf('ytInitialData') + 'ytInitialData'.length + 3;
  const end = response.indexOf('};', start) + 1;
  const jsonStr = response.substring(start, end);
  const data = JSON.parse(jsonStr);

  for (const contents of data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents) {
    for (const video of contents.itemSectionRenderer.contents) {
      const res: {[key: string]: any} = {};

      if ('videoRenderer' in video) {
        const videoData = video.videoRenderer;
        res.id = videoData.videoId || null;
        res.thumbnails = videoData.thumbnail.thumbnails.map((thumb: any) => thumb.url || null);
        res.title = videoData.title.runs[0].text || null;
        res.long_desc = videoData.descriptionSnippet?.runs[0]?.text || null; // Use optional chaining
        res.channel = videoData.longBylineText.runs[0].text || null;
        res.duration = videoData.lengthText.simpleText || 0;
        res.views = videoData.viewCountText.simpleText || 0;
        res.publish_time = videoData.publishedTimeText?.simpleText || null; // Use optional chaining
        res.url_suffix = videoData.navigationEndpoint.commandMetadata.webCommandMetadata.url || null;
        results.push(res);
      }
    }

    if (results.length > 0) {
      return results;
    }
  }

  return results;
}