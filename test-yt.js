const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/YOUTUBE_API_KEYS="([^"]+)"/);
if (match) {
  const keys = match[1].split(',');
  const fetchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCJ5v_MCY6GNUBTO8-D3XoAg&eventType=live&type=video&key=${keys[0]}`;
  fetch(fetchUrl).then(r=>r.json()).then(d=>console.log(JSON.stringify(d, null, 2))).catch(e=>console.log(e));
} else {
  console.log('no match');
}
