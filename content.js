window.addEventListener('load', () => {
    setTimeout(injectUI, 1000);
});

function injectUI() {
    closeAlert();
    const container = document.querySelector('#contents');
    
    if (!container) {
        console.warn('Watch Later Manager: #contents not found yet.');
        return;
    }

    // Prevent duplicate injection
    if (document.getElementById('watch-later-manager-ui')) {
        return;
    }

    initUI(container);
}

function closeAlert() {
    const alert = document.querySelector('ytd-alert-with-button-renderer');
    if (alert) {
        alert.remove();
    }
}

function initUI(container) {
    // Create your UI wrapper
    const ui = document.createElement('div');
    ui.id = 'watch-later-manager-ui';
    ui.style.padding = '16px';
    ui.style.marginBottom = '16px';
    ui.style.backgroundColor = '#fff';
    ui.style.border = '1px solid #ddd';
    ui.style.borderRadius = '8px';
    ui.style.fontSize = '16px';
    ui.style.fontFamily = 'Arial, sans-serif';
    ui.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';

    // Title
    const title = document.createElement('div');
    title.textContent = 'Watch Later Roulette';
    title.style.marginBottom = '12px';
    ui.appendChild(title);

    // Refresh Button
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = '🔄 Refresh List';
    refreshBtn.onclick = () => {
        const listWrapper = document.getElementById("watch-later-video-list");
        listWrapper.replaceChildren();
        initVideoListContainer();

        // Add debounce to avoid spamming
        refreshBtn.disabled = true;
        setTimeout(()=>{
            refreshBtn.disabled = false;
        },3000);
    };
    ui.appendChild(refreshBtn);

    // Video List
    const videoList = document.createElement('div');
    videoList.id = 'watch-later-video-list';
    ui.appendChild(videoList);

    // Insert it at the top of the video list
    container.insertBefore(ui, container.firstChild);

    initVideoListContainer();
}

async function initVideoListContainer() {
    const listWrapper = document.getElementById("watch-later-video-list");

    const videoList = await initVideoList();
    for (let i = 0; i < videoList.length; i++) {
        const videoData = videoList[i];

        const row = createVideoRow(i, videoData);

        listWrapper.appendChild(row);
    }
}

function createVideoRow(i, videoData) {
    const title = videoData.title;
    const videoLink = getVideoLinkFromThumbnailLink(videoData.thumbnail_url);

    // Container
    const row = document.createElement('div');
    row.style.display = "flex";
    row.style.flexDirection = "row";
    row.style.gap = "10px";
    row.style.marginTop = "15px";

    // Image
    const divImage = document.createElement('div');
    divImage.style.width = '160px';
    divImage.style.height = '90px';
    const image = document.createElement('img');
    image.src = videoData.thumbnail_url;
    image.style.width = '100%';
    image.style.height = '100%';
    image.style.objectFit = 'cover';
    image.style.display = 'block';
    divImage.appendChild(image);

    // Text
    const divText = document.createElement('div');
    divText.style.display = 'flex';
    divText.style.flexDirection = 'column';
    divText.style.gap = '4px';
    divText.style.maxWidth = '800px';

    // Title
    const divTitle = document.createElement('div');
    const pTitle = document.createElement('p');
    pTitle.innerText = videoData.title;
    pTitle.style.fontWeight = 'bold';
    pTitle.style.margin = '0';
    pTitle.style.overflow = 'hidden';
    pTitle.style.textOverflow = 'ellipsis';
    pTitle.style.whiteSpace = 'nowrap';
    divTitle.appendChild(pTitle);

    // Channel Name
    const divChannel = document.createElement('div');
    const pChannel = document.createElement('p');
    pChannel.innerText = videoData.author_name;
    pChannel.style.color = '#555';
    pChannel.style.fontSize = '0.9em';
    pChannel.style.margin = '0';
    divChannel.appendChild(pChannel);

    // Buttons
    const divButtons = document.createElement('div');
    divButtons.style.display = 'flex';
    divButtons.style.gap = '8px';
    divButtons.style.marginTop = '4px';

    const removeButton = document.createElement('button');
    removeButton.innerText = 'Remove';
    removeButton.style.padding = '4px 8px';

    const skipButton = document.createElement('button');
    skipButton.innerText = 'Skip';
    skipButton.style.padding = '4px 8px';

    divButtons.appendChild(removeButton);
    divButtons.appendChild(skipButton);

    // Append all
    divText.appendChild(divTitle);
    divText.appendChild(divChannel);
    divText.appendChild(divButtons);

    row.appendChild(divImage);
    row.appendChild(divText);

    row.addEventListener('click',()=>{
        window.location.href = videoLink;
    });
    row.style.cursor = 'pointer';

    return row;
}

function grabAllVideoLinks(){
    const links = document.querySelectorAll("ytd-playlist-video-renderer a#video-title");
    const videoLinks = Array.from(links).map((a) => {
        const href = a.getAttribute('href');
        const cleanLink = href.split("&")[0];
        return cleanLink;
    });
    
    return videoLinks;
}

function getVideoTitle(oEmbedJson) {
    if (!oEmbedJson || typeof oEmbedJson !== 'object') {
        console.warn('Invalid oEmbed data');
        return null;
    }

    return oEmbedJson.title || null;
}

async function getOEmbed(url) {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    const data = await res.json();
    return data;
}

async function initVideoList(){
    const videoLinks = grabAllVideoLinks();
    const videoTemp = getThreeRandomVideos(videoLinks);
    let videos = [];
    
    for(let video of videoTemp){
        const videoData = await getOEmbed(video);
        videos.push(videoData);
    };

    return videos;
}

function getThreeRandomVideos(arr){
    let videoArr = [];

    while(videoArr.length < 3){
        const num = Math.floor(Math.random() * arr.length);
        const newVideo = arr[num];

        if(!videoArr.includes(newVideo)){
            videoArr.push(newVideo);
        }
    }

    return videoArr;
}

function getVideoLinkFromThumbnailLink(thumbnail_url){
    // Hack to get youtube link from the thumbnail link provided in oembed

    const match = thumbnail_url.match(/vi\/([a-zA-Z0-9_-]{11})\//);
    let videoUrl = '';

    if (match) {
        const videoId = match[1]
        videoUrl = `/watch?v=${videoId}`;
    } else {
        console.warn("No video ID found");
    }

    return videoUrl;
}