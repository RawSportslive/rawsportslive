const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/YOUTUBE_API_KEYS="([^"]+)"/);
if (match) {
  const keys = match[1].split(',');
  Promise.all(keys.map(key => {
    const fetchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCJ5v_MCY6GNUBTO8-D3XoAg&maxResults=1&key=${key}`;
    return fetch(fetchUrl).then(r=>r.json()).then(d=>({key, status: d.error ? d.error.code : 200, msg: d.error ? d.error.message : 'OK'})).catch(e=>({key, error: e.message}));
  })).then(console.log);
} else {
  console.log('no match');
}
