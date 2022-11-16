(() => {
  let youtubeRightControls, youtubePlayer;
  let currentVideo = "";
  let currentVideoBookmarks = [];

  const fetchBookmarks = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;
    if (type === "NEW") {
      currentVideo = videoId;
      newVideoLoaded();
    }
  });

  const newVideoLoaded = async () => {
    const bookmarkBtnExists =
      document.getElementsByClassName("bookmark-btn")[0];
    currentVideoBookmarks = await fetchBookmarks();
    if (!bookmarkBtnExists) {
      const bookmarkBtn = document.createElement("button");
      const bookmarkImg = document.createElement("img");
      bookmarkBtn.appendChild(bookmarkImg);

      youtubeRightControls =
        document.getElementsByClassName("ytp-right-controls")[0];
      youtubePlayer = document.getElementsByClassName("video-stream")[0];

      bookmarkImg.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkImg.style = "height: 48px; width: 48px";
      bookmarkBtn.className = `ytp-button bookmark-btn`;
      bookmarkBtn.title = "Click to bookmark current timestamp";

      youtubeRightControls.appendChild(bookmarkBtn);
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    }
  };

  const addNewBookmarkEventHandler = async () => {
    const currentTime = youtubePlayer.currentTime;
    const newBookmark = {
      time: currentTime,
      desc: `Bookmark at: ${convertTime(currentTime)}`,
    };

    currentVideoBookmarks = await fetchBookmarks();

    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify(
        [...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time)
      ),
    });
  };
})();

const convertTime = (time) => {
  var date = new Date(0);
  date.setSeconds(time);
  date = date.toISOString();

  return date.substring(11, date.length - 5);
};
