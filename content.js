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
    title.textContent = 'Watch Later Manager';
    title.style.marginBottom = '12px';
    ui.appendChild(title);

    // Refresh Button
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = '🔄 Refresh List';
    refreshBtn.onclick = () => {
        // For now, this does nothing
        console.log('Refresh button clicked (placeholder)');
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
        const title = videoData.title;

        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.padding = '6px 0';
        row.style.borderBottom = '1px solid #eee';

        const label = document.createElement('span');
        label.textContent = `${i + 1}. ${title}`;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.style.marginLeft = '12px';
        removeBtn.style.padding = '4px 10px';
        removeBtn.style.cursor = 'pointer';
        removeBtn.style.backgroundColor = '#e74c3c';
        removeBtn.style.color = '#fff';
        removeBtn.style.border = 'none';
        removeBtn.style.borderRadius = '4px';
        removeBtn.onclick = () => row.remove();

        row.appendChild(label);
        row.appendChild(removeBtn);
        listWrapper.appendChild(row);
    }
}

window.addEventListener('load', () => {
    setTimeout(injectUI, 1000);
});

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
    const fiveVideoTemp = videoLinks.slice(0,5);
    let fiveVideo = [];
    
    for(let video of fiveVideoTemp){
        const videoData = await getOEmbed(video);
        fiveVideo.push(videoData);
    };

    console.log(fiveVideo);
    return fiveVideo;
}