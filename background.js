
'use strict';

function setDefault() {
  chrome.storage.sync.set({
    options : {'lazyLoading': true}
  },  function(){
    console.log("Set Default Option")
  });

  chrome.storage.sync.set({urlsInfo : {
      'urlsName': [
        'Bilibili', 
        'Bilibili Up', 
        'Baidu', 
        'Pixiv',
        'Pixiv Artists',
        'Youtube',
        'Yande.re'],
      'urls': [
        'https://www.bilibili.com/video/av', 
        'https://space.bilibili.com/',
        'https://pan.baidu.com/s/',
        'https://www.pixiv.net/member_illust.php?mode=medium&illust_id=',
        'https://www.pixiv.net/member.php?id=',
        'https://www.youtube.com/watch?v=',
        'https://yande.re/post/show/'
        ]
      }
    }, function(){
      console.log("Set Default URLs");
    });
}

chrome.runtime.onInstalled.addListener(setDefault);







