(() => {
    let youtubeLeftControls;
    let youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = []

    const fetchBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : [])
            })
        })
    }

    const addNewBookmarkEventHandler = async () => {
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
        time: currentTime,
        desc: "Bookmark at " + getTime(currentTime),
        }
        currentVideoBookmarks = await fetchBookmarks()
        // console.log({currentVideoBookmarks});
        // console.log({newBookmark});
        // console.log({currentTime});
        
        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        })
    }
    
    const newVideoLoaded = async () => {
        const bookmarkBtnExists = document.getElementsByClassName('bookmark-btn')[0]
        currentVideoBookmarks = await fetchBookmarks();
     
        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement('img');
           
            bookmarkBtn.src = chrome.runtime.getURL('assets/bookmark.png');
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";
        
            youtubeLeftControls = document.getElementsByClassName('ytp-left-controls')[0]; 
            youtubePlayer = document.getElementsByClassName('video-stream')[0]
            
            youtubeLeftControls.appendChild(bookmarkBtn);
            bookmarkBtn.addEventListener('click', addNewBookmarkEventHandler)
        }
    }

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const {type, value, videoId} = obj;

        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded()
        }
    });

    newVideoLoaded();
})();

const getTime = t => {
    var date = new Date(0);
    date.setSeconds(1);

    return date.toISOString().substring(11, 0);
}