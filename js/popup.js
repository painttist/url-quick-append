
'use strict';

let urlIn = document.getElementById('url-input');
let btnClean = document.getElementById('btn-clean');
let btnCleanUndo = document.getElementById('btn-undo');
let btnGo = document.getElementById('btn-go');
let btnDropdownLinks = document.getElementById('btn-dropdown-links');

let overlayDel = document.getElementById('overlay-delete');

let btnOverlayCheck = document.getElementById("btn-overlay-check");
let btnOverlayClose = document.getElementById("btn-overlay-close");

const cacheKey = 'url-quick-append-cache';
const keywords = ['密码', '提取码', '密碼', '提取碼'];

var lazyLoading = true;
var theurl;

var urls = [];
var urlsName = [];


btnGo.disabled = true;

var oldOpts = getCachedOpts();
var selectedID = oldOpts.id;
var urlInText = oldOpts.urlInText;
var infoText = oldOpts.infoText;

// clearCache if any of the item is undefined
if (!((selectedID) && (urlInText) && (infoText))) {
  clearCache();
  oldOpts = getCachedOpts();
  selectedID = oldOpts.id;
  urlInText = oldOpts.urlInText;
  infoText = oldOpts.infoText;
}

// get options from localStorage
function getCachedOpts () {
  let cache = localStorage.getItem(cacheKey)
  if (cache) {
    return JSON.parse(cache)
  } else {
    return { id: 0, urlInText: "", infoText: [] }
  }
}

function clearCache () {
  localStorage.removeItem(cacheKey);
}

// record options into localStorage
function recordOpts(newOpt) {
  var oldOpt = getCachedOpts()
  localStorage.setItem(
    cacheKey,
    JSON.stringify(Object.assign({}, oldOpt, newOpt))
  )
}

function recordID() {
  recordOpts({id: selectedID});
}

function recordUrlInText() {
  recordOpts({urlInText: urlIn.value});
}

function recordInfoText() {
  recordOpts({infoText: infoText});
}

// Get the URL from storage
function getURLs() {
  chrome.storage.sync.get('urlsInfo', function(data) {
    // urlsName = data.urlsName;
    urls = data.urlsInfo.urls;
    urlsName = data.urlsInfo.urlsName;
    btnGo.disabled = false;

    appendURLList();
  });
}

function setURLs() {
  chrome.storage.sync.set({urlsInfo : {
      urls: urls,
      urlsName: urlsName
      }
    }, function(){
    });
}

function getOptions() {
  chrome.storage.sync.get('options', function(data) {
    lazyLoading = data.options.lazyLoading;
  });
}

getOptions();
getURLs();

function setDefaultURLs() {
  chrome.storage.sync.set({urlsInfo : {
      'urlsName': [
        'Google Search',
        'Youtube Search',
        'Bilibili Search',
        'Bilibili ID',
        'Bilibili Up', 
        'Baidu Drive',
        'Pixiv ID',
        'Pixiv Artists',
        'Youtube ID',
        'Yande.re ID'],
      'urls': [
        'https://www.google.com/search?q=',
        'https://www.youtube.com/results?search_query=',
        'https://search.bilibili.com/all?keyword=',
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
    });
}

// setDefaultURLs();


btnGo.onclick = goToURL;

function goToURL() {

  // Split URL entries

  var urlAppends = urlIn.value.split("\n");

  urlAppends.forEach(function(item, index) {
    theurl = urls[selectedID] + item;
    if (lazyLoading) {
      chrome.tabs.create({
          url: chrome.extension.getURL('lazyloading.html#') + theurl,
          selected: false
        });
    } else {
      chrome.tabs.create({ url: theurl, selected: false });
    }
  });
}

// DROP DOWN


btnDropdownLinks.addEventListener('click', function() { 
  if (event.target.classList.contains('icon-add')) {
    
    // Add a new link

    panelDropdown.removeChild(panelDropdown.lastChild);

    urlsName.push("Name");
    urls.push("URL");

    var newLink = appendToPanelDropdown(urls.length - 1);

    
    newLink.children[1].classList.toggle("icon-mode_edit");
    newLink.children[1].classList.toggle("icon-check");

    newLink.children[0].readOnly = !newLink.children[0].readOnly;
    // link.children[0].focus();

    if (!newLink.children[0].readOnly) {
      newLink.children[0].select();
    } else {
      clearSelection();
    }
    newLink.children[3].classList.toggle('edit');
    newLink.classList.toggle('edit');

    appendAddLink();
    // setTimeout(scrollToBottom, 1);

    // panelDropdown.scrollTo({
    //   top: panelDropdown.scrollHeight + 120,
    //   left: 0,
    //   behavior: 'smooth'
    // });

    scrollTo(panelDropdown, panelDropdown.scrollHeight - panelDropdown.offsetHeight, 250);
  } else {
    toggleDropdown();   
  }
});

var linksList = document.getElementsByClassName('link');

var panelDropdown = document.getElementById("panel-dropdown-links");

function appendURLList() {
  // Append Links form URL List
  urls.forEach(function(element, i) {

    appendToPanelDropdown(i);

  });

  appendAddLink();
  
}

function appendAddLink() {

  var link = document.createElement("div");
  link.classList = "line link";

  link.addEventListener('click', function(){

    link.parentNode.removeChild(link);

    // Add a New One
    urls.push("URL");
    urlsName.push("Name");
    var newLink = appendToPanelDropdown(urls.length - 1);

    
    newLink.children[1].classList.toggle("icon-mode_edit");
    newLink.children[1].classList.toggle("icon-check");

    newLink.children[0].readOnly = !newLink.children[0].readOnly;
    // link.children[0].focus();

    if (!newLink.children[0].readOnly) {
      newLink.children[0].select();
    } else {
      clearSelection();
    }
    newLink.children[3].classList.toggle('edit');
    newLink.classList.toggle('edit');

    appendAddLink();
    // setTimeout(scrollToBottom, 1);

    // panelDropdown.scrollTo({
    //   top: panelDropdown.scrollHeight + 120,
    //   left: 0,
    //   behavior: 'smooth'
    // });

    scrollTo(panelDropdown, panelDropdown.scrollHeight - panelDropdown.offsetHeight, 250);

    // panelDropdown.scrollTop = panelDropdown.scrollHeight - panelDropdown.offsetHeight;

  });

  var linkPlusIcon = document.createElement('span');
  linkPlusIcon.classList = "link-btn-add icon-add";
  linkPlusIcon.innerHTML = " Add";

  link.appendChild(linkPlusIcon);

  panelDropdown.appendChild(link);

  changeLink(selectedID);  

}

overlayDel.addEventListener('click', function(){
  if (event.target.classList.contains('btn-overlay')) {
    if (event.target.classList.contains('icon-check')) {
      // Delete link pending
      panelDropdown.children[selectedID].classList.add('removed');

      setTimeout(function(){ 

        panelDropdown.innerHTML = "";
        urls.splice(selectedID, 1);
        urlsName.splice(selectedID, 1);
        appendURLList();
        setURLs();

      }, 250);
      
      overlayDel.classList.toggle('on');

    } else if (event.target.classList.contains('icon-close')) {
      overlayDel.classList.toggle('on');
    }
  } else if (event.target.classList.contains('overlay')) {
    overlayDel.classList.toggle('on');
  }

});

function appendToPanelDropdown(i) {

    var link = document.createElement("div");
    link.classList = "line link";

    link.addEventListener('mouseover', function(){
      changeLink(i);
    });
    link.addEventListener('click', function() {
      if ((event.target.classList.contains('link-btn-delete'))){
        overlayDel.classList.toggle('on');
        selectedID = i;
      } else if ((event.target.classList.contains('link-btn-edit'))) {
        toggleLinkEdit(i);
      }
      else if ( link.classList.contains("edit") && 
              ((event.target.classList.contains("link-name")) || 
              (event.target.classList.contains("link-url")))) {
        selectedID = i;
      } else {

        // Modifiy the URL
        urlsName[i] = link.children[0].value;
        urls[i] = link.children[3].value;
        // Set the URLs
        setURLs();

        if (event.target.classList.contains('link'))
        if (event.target.children[1].classList.contains('icon-check')) {
          toggleLinkEdit(i);
        }

        // Clicked on the line but outside of everything
        selectedID = i;
        changeLink(i);
        toggleDropdown();

      }
    });

    var linkName = document.createElement("input");
    linkName.id = "link-input-name-" + i;
    linkName.classList = "line-first link-input link-name";
    // linkName.id = "link-number-" + i;
    linkName.value = urlsName[i];
    linkName.readOnly = true;

    var linkURL = document.createElement("input");
    linkURL.id = "link-input-url-" + i;
    linkURL.classList = "link-input link-url";
    linkURL.value = urls[i];

    var linkDeleteIcon = document.createElement('span');
    linkDeleteIcon.classList = "link-btn-delete icon-delete";

    var linkEditIcon = document.createElement('span');
    linkEditIcon.classList = "link-btn-edit icon-mode_edit";

    link.appendChild(linkName);
    link.appendChild(linkEditIcon);
    link.appendChild(linkDeleteIcon);
    link.appendChild(linkURL);

    panelDropdown.appendChild(link);

    return link;

}

// // Add event listender to all links
// Array.from(linksList).forEach(function (element, i) {
//     element.addEventListener('mouseover', function(){
//       changeLink(i);
//     });
//     element.addEventListener('click', function() {
//       if ((event.target.classList.contains('link-btn-edit'))) {
//       }
//       else {
//         toggleDropdown();
//       }
//     });
// });

function changeLink(id) {
  if (id >= urls.length) {
    selectedID = urls.length-1;
    id = selectedID;
  }
  document.getElementById('link-selected').innerHTML = urlsName[id];
  recordID();
}

// Close the dropdown if the user clicks outside of it
// window.onclick = function(event) {

//   if ((event.target.classList.contains('link'))) {
//     var dropdowns = document.getElementsByClassName("dropdown-content");
//     var i;
//     for (i = 0; i < dropdowns.length; i++) {
//       var openDropdown = dropdowns[i];
//       if (openDropdown.classList.contains('show')) {
//         openDropdown.classList.remove('show');
//       }
//     }
//   }
// }

/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function toggleDropdown() {

  btnDropdownLinks.classList.toggle("expanded");

  var dropdown = document.getElementById("panel-dropdown-links");
  dropdown.classList.toggle("show");

  if (dropdown.classList.contains("show")) {
    document.getElementById('dropdown-icon').classList = 'icon-expand_less';
  } else {
    document.getElementById('dropdown-icon').classList = 'icon-expand_more';
  }

  setURLs();

}

function clearSelection()
{
  if (window.getSelection) {window.getSelection().removeAllRanges();}
  else if (document.selection) {document.selection.empty();}
}


// URL INPUT

// autoExpand(document.getElementById('url-input'));

document.addEventListener('input', function (event) {

  if (event.target.tagName.toLowerCase() !== 'textarea') return;
  
  recordUrlInText();
  autoExpand(event.target);

  checkInputToClean();
  btnCleanUndo.classList.add('hidden');

}, false);


btnClean.onclick = cleanInput;
btnCleanUndo.onclick = undoClearInput;

var beforeUndoUrlsInText;

function undoClearInput() {

  btnCleanUndo.classList.add('hidden');
  urlIn.value = beforeUndoUrlsInText;

  urlIn.focus();
  checkInputToClean();
  autoExpand(urlIn);

}

function cleanInput() {

  beforeUndoUrlsInText = urlIn.value;

  var splitSlash = urlIn.value.split("/");
  var cleanedString = splitSlash.pop();

  keywords.forEach(function(el, i){
    var wordSplit = cleanedString.split(el);

    if (wordSplit.length > 1) {
      cleanedString = wordSplit.join(' :');
    }
  });
  
  var splitColons = cleanedString.replace('：',':').split(":");

  cleanedString = "";

  if (splitColons.length <= 1) {
    cleanedString += splitColons.join('');
  } else {
    var front = splitColons.shift();
    var frontSplit = front.split(" ");
    var tag = frontSplit.pop();
    cleanedString += frontSplit.join('');

    splitColons.forEach(function (el, i){
      el.replace(' ', '');
      if (el.length > 0) {
        infoText.push(el);
        refreshInfo();
        recordInfoText();
      }
    })
  }
  
  urlIn.value = cleanedString;

  btnCleanUndo.classList.remove('hidden');

  recordUrlInText();
  checkInputToClean();
  urlIn.focus();
  autoExpand(urlIn);
}

function checkInputToClean() {

  var raw = urlIn.value;
  var toClean = false;

  var splitSlash = raw.split("/");

  if (splitSlash.length > 1) {
    toClean = true;
  }

  keywords.forEach(function(el, i){
    var wordSplit = raw.split(el);

    if (wordSplit.length > 1) {
      toClean = true;
    }
  })

  var splitColons = raw.replace('：',':').split(":");
  if (splitColons.length > 1) {
    toClean = true;
  }

  if (toClean) {
    urlIn.classList.add('toClean');
    btnClean.classList.remove('hidden');
  } else {
    urlIn.classList.remove('toClean');
    btnClean.classList.add('hidden');
  }
}

var autoExpand = function (field) {

  var currentHeight = parseInt(field.style.height, 10);

  // Reset field height
  field.style.height = 'inherit';
  // field.style.lineHeight = "0px";

  // Get the computed styles for the element
  var computed = window.getComputedStyle(field);

  // Calculate the height
  // var height = parseInt(computed.getPropertyValue('border-top-width'), 10)
  //              // + parseInt(computed.getPropertyValue('padding-top'), 10)
  //              + field.scrollHeight
  //              // + parseInt(computed.getPropertyValue('padding-bottom'), 10)
  //              + parseInt(computed.getPropertyValue('border-bottom-width'), 10);



  var clientHeight = parseInt(field.clientHeight, 10);
  var baseLineHeight = parseInt(computed.getPropertyValue('line-height'), 10);
  var baseClientHeight = baseLineHeight 
                      + parseInt(computed.getPropertyValue('padding-top'), 10)
                      + parseInt(computed.getPropertyValue('padding-bottom'), 10);
  var maxHeight = parseInt(computed.getPropertyValue('max-height'), 10);
  var height = field.scrollHeight - baseClientHeight + baseLineHeight;


  if ((height > currentHeight) && (height > maxHeight)) {
    var scrollTopTarget = (height - baseClientHeight - baseLineHeight);
    field.scrollTop = scrollTopTarget;
  }

  field.style.height = height + 'px';
  // field.style.lineHeight = height + 'px';

};

urlIn.value = urlInText;
urlIn.focus();
urlIn.select();
autoExpand(urlIn);
checkInputToClean();

function scrollTo(element, to, duration) {
    var start = element.scrollTop,
        change = to - start,
        currentTime = 0,
        increment = 20;

    var animateScroll = function(){        
        currentTime += increment;
        var val = Math.easeInOutQuad(currentTime, start, change, duration);
        element.scrollTop = val;
        if(currentTime < duration) {
            setTimeout(animateScroll, increment);
        }
    };
    animateScroll();
}

//t = current time
//b = start value
//c = change in value
//d = duration
Math.easeInOutQuad = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
};


// Event Listener for checking user pressing the Enter-key
document.addEventListener('keydown', function(event){
  var id = document.activeElement.id;
  var i = parseInt(id.substring(id.length - 1, id.length));
  var element = document.getElementById(id);

  // Check if it is an enter
  if (event.keyCode == 13) {
    if (element.tagName.toLowerCase() == "input") {
      event.preventDefault();
      toggleLinkEdit(i);
    } else
    if (element.tagName.toLowerCase() == "textarea"){
      if (event.shiftKey) {

        event.preventDefault();
        goToURL();
      }
    }
  }
  

  
});

function toggleLinkEdit(i) {
  var link = panelDropdown.children[i];

  var linkName = link.children[0];
  var linkEditIcon = link.children[1];
  var linkDeleteIcon = link.children[2];
  var linkURL = link.children[3];

  if (linkEditIcon.classList.contains('icon-check')) {
    // Modifiy the URL
    urlsName[i] = linkName.value;
    urls[i] = linkURL.value;
    // Set the URLs
    setURLs();
  }

  linkEditIcon.classList.toggle("icon-mode_edit");
  linkEditIcon.classList.toggle("icon-check");

  linkName.readOnly = !linkName.readOnly;

  if (!linkName.readOnly) {
    linkName.select();
  } else {
    clearSelection();
  }

  linkURL.classList.toggle('edit');
  link.classList.toggle('edit');
}


// V1.4 Support for appending info boxes for quickly copying onclick

// const dataInfoIDAttribute = "data-info-id";

function displayInfo() {

  if (infoText.length <= 0) return;

  var infoContainer = document.getElementById('line-info-container');

  infoText.forEach( function(element, index) {
    var newInfoText = document.createElement('button');
    newInfoText.classList.add('btn-info');
    newInfoText.innerHTML = element;
    // newInfoText.setAttribute(dataInfoIDAttribute, "0");
    infoContainer.appendChild(newInfoText);
  });

  // Add click events to them
  Array.from(document.getElementsByClassName('btn-info')).forEach(
    function (elem, index) {
      elem.onclick = function() {
        copyToClipboard(this.innerHTML);

        removeInfoText(this.innerHTML);

        urlIn.focus();

        this.innerHTML = "Copied";
        this.style.width = this.clientWidth;
      
        // animateCSS(this, 'fadeOut', function(element){
        //   element.parentNode.removeChild(element);
        // });
        
        var elem = this;
        setTimeout(function(){
          elem.classList.add("toShrink");
        }, 500);
        this.addEventListener('transitionend', function(ev){
        
          if (ev.propertyName == "width") {
          
            ev.target.remove();
          }
          else {
            ev.target.classList.add('toShrinkWidth');
          }
          // elem.parentNode.removeChild(elem);
          // var el = ev.target;
          // var parent = el.parentNode;
          // el.parentNode.removeChild(el);
        })

        
        // removeInfoText(parseInt(this.getAttribute(dataInfoIDAttribute), 10));
    }
  });
}

function animateCSS(element, animationName, callback) {

    const node = (typeof element === "object") ? element : document.querySelector(element);
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)

        if (typeof callback === 'function') callback(node)
    }

    node.addEventListener('animationend', handleAnimationEnd)
}

function clearInfo() {
  var infoContainer = document.getElementById('line-info-container');
  infoContainer.innerHTML = "";
}

function refreshInfo() {
  clearInfo();
  displayInfo();
}

function removeInfoText(content) {
  var index = infoText.indexOf(content);
  if (index > -1) {
    infoText.splice(index, 1);
  }
  recordInfoText();
}

displayInfo();

String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};

const copyToClipboard = str => {
  const el = document.createElement('textarea');  // Create a <textarea> element
  el.value = str;                                 // Set its value to the string that you want copied
  el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
  el.style.position = 'absolute';                 
  el.style.left = '-9999px';                      // Move outside the screen to make it invisible
  document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
  const selected =            
    document.getSelection().rangeCount > 0        // Check if there is any content selected previously
      ? document.getSelection().getRangeAt(0)     // Store selection if found
      : false;                                    // Mark as false to know no selection existed before
  el.select();                                    // Select the <textarea> content
  document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
  document.body.removeChild(el);                  // Remove the <textarea> element
  if (selected) {                                 // If a selection existed before copying
    document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
    document.getSelection().addRange(selected);   // Restore the original selection
  }
};


