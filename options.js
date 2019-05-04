
'use strict';

var lazyLoading = false;

let checkLazy = document.getElementById('check-lazy');
let msgSuccess = document.getElementById('msg-success');
let btnApply = document.getElementById('btn-apply');

function getOptions() {
  chrome.storage.sync.get('options', function(data) {
    lazyLoading = data.options.lazyLoading;
    checkLazy.checked = data.options.lazyLoading;
  });
}

function setOptions() {
  lazyLoading = checkLazy.checked;
  chrome.storage.sync.set({
    options : {'lazyLoading': lazyLoading}
  }, showSuccess);
  // console.log(lazyLoading);
}

function showSuccess() {
  msgSuccess.classList.remove('hidden');
  
  setTimeout(function(){
    msgSuccess.classList.add('hidden');
  }, 800);

  // console.log("Saved Option Success");
}

getOptions();

btnApply.addEventListener('click', function() { setOptions(); });


let optionReset = document.getElementById('option-line-reset');

let overlayReset = document.getElementById('overlay-reset');

let btnOverlayCheck = document.getElementById('btn-overlay-check');
let btnOverlayClose = document.getElementById('btn-overlay-close');

optionReset.addEventListener('click', function() {
  overlayReset.classList.toggle('on');

});

overlayReset.addEventListener('click', function() {
  if (event.target.id == "btn-overlay-check") {
    overlayReset.classList.toggle('on');
    setDefaultURLs();
    return;
  }

  if (event.target.id == "btn-overlay-close") {
    overlayReset.classList.toggle('on');
    return;
  }

  if (event.target.id == "overlay-reset") {
    overlayReset.classList.toggle('on');
    return; 
  }

});

function setDefaultURLs() {
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
      showSuccess();
      console.log("Reset To Default URLs");
    });
}


// let page = document.getElementById('buttonDiv');
// const kButtonColors = ['#3aa757', '#e8453c', '#f9bb2d', '#4688f1'];
// function constructOptions(kButtonColors) {
//   for (let item of kButtonColors) {
//     let button = document.createElement('button');
//     button.style.backgroundColor = item;
//     button.addEventListener('click', function() {
//       chrome.storage.sync.set({color: item}, function() {
//         console.log('color is ' + item);
//       })
//     });
//     page.appendChild(button);
//   }
// }
// constructOptions(kButtonColors);
