import fs from 'fs'
import path from 'path'

const GNAV_CACHE_PATH = './gnav.txt';
export async function getGlobalNav(){
    let gnavContent = getGnavFromCache();
    if(!gnavContent){
      let gnavData = await fetch('https://www.att.com/ui/global_all_cms_globalnav/web-components/2.0/preRender/consumer-lite/index.html');
     gnavContent = await gnavData?.text();
    try {
        fs.writeFileSync(
          GNAV_CACHE_PATH,
          gnavContent,
          'utf8'
        )
        console.log('Wrote to members cache')
      } catch (error) {
        console.log('ERROR WRITING MEMBERS CACHE TO FILE')
        console.log(error)
      }
    }
    return gnavContent;
}

function getGnavFromCache(){
  let cachedData;
  try {
    cachedData = fs.readFileSync(GNAV_CACHE_PATH, 'utf8');
    console.log('reading gnav from cache');
  } catch (error) {
    cachedData = '';
    console.log('Member cache not initialized')
  }
  return cachedData;
}