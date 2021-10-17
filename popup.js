
'use strict';

var urlIn = document.getElementById('url-input');

var btnClean = document.getElementById('btn-clean');
var btnCleanUndo = document.getElementById('btn-undo');
var btnGo = document.getElementById('btn-go');
var btnDropdownLinks = document.getElementById('btn-dropdown-links');
var panelDropdown = document.getElementById("panel-dropdown-links");

var overlayDel = document.getElementById('overlay-delete');

var btnOverlayCheck = document.getElementById("btn-overlay-check");
var btnOverlayClose = document.getElementById("btn-overlay-close");

var divLinkSelected = document.getElementById('display-link-selected');

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

// Reset to default if undefined
selectedID =  selectedID == undefined ? 0 : selectedID;
urlInText =  urlInText == undefined ? "" : urlInText;
infoText = infoText == undefined ? [] : infoText;

// get options from localStorage
function getCachedOpts () {
  var cache = localStorage.getItem(cacheKey)
  if (cache) {
    return JSON.parse(cache)
  } else {
    return { id: 0, urlInText: "", infoText: undefined }
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

// UTILITY
function getElemIndex(elem) {
  return Array.from(elem.parentNode.children).indexOf(elem);
}

function getAbsoluteHeight(el) {
  // Get the DOM Node if you pass in a string
  el = (typeof el === 'string') ? document.querySelector(el) : el; 

  var styles = window.getComputedStyle(el);
  var margin = parseFloat(styles['marginTop']) + parseFloat(styles['marginBottom']);

  return Math.ceil(el.offsetHeight + margin);
}

// GO

function goToURL() {

  // Split URL entries

  var urlAppends = urlIn.value.split("\n");

  urlAppends.forEach(function(item, index) {
    theurl = urls[selectedID] + item;
    if (lazyLoading) {
      chrome.tabs.create({
          url: chrome.runtime.getURL('lazyloading.html#') + theurl,
          selected: false
        });
    } else {
      chrome.tabs.create({ url: theurl, selected: false });
    }
  });
}

// DROP DOWN

// document.body.addEventListener('click', function(){
//   console.log(document.activeElement);
// });

btnDropdownLinks.addEventListener('click', function() { 
  if (event.target.classList.contains('icon-add')) {
    appendNewLink();
  } else {
    toggleDropdown();   
  }
});

var linksList = document.getElementsByClassName('link');

function appendURLList() {
  // Append Links form URL List
  urls.forEach(function(element, i) {

    appendToPanelDropdown(i);

  });

  appendAddLink();

  changeLink(selectedID);
}

// panelDropdown.addEventListener("scroll", function (ev) {
//   console.log("Scroll Height: " + (panelDropdown.scrollHeight - panelDropdown.offsetHeight));
//   console.log('Scroll Top: ' + panelDropdown.scrollTop);
// });

function appendNewLink() {

  // Add a New Link Blank

  // Remove Line Add Link
  panelDropdown.removeChild(panelDropdown.lastChild);

  urlsName.push("Name");
  urls.push("URL");

  var newLink = appendToPanelDropdown(urls.length - 1);
  
  newLink.children[1].classList.toggle("icon-mode_edit");
  newLink.children[1].classList.toggle("icon-check");

  newLink.children[0].readOnly = !newLink.children[0].readOnly;
  
  newLink.children[0].focus();
  newLink.children[0].select();

  newLink.children[3].classList.toggle('edit');
  newLink.classList.toggle('edit');

  changeLink(getElemIndex(newLink));

  // Add Line Add Link
  appendAddLink();
  scrollTo(panelDropdown, panelDropdown.scrollHeight - panelDropdown.offsetHeight, 250);
}

function appendAddLink() {

  var link = document.createElement("div");
  link.classList = "line link";
  link.setAttribute('tabindex', '-1');

  // link.addEventListener('mouseover', linkOnMouseOver);
  link.addEventListener('click', appendNewLink);

  var linkPlusIcon = document.createElement('span');
  linkPlusIcon.classList = "link-btn-add icon-add";
  linkPlusIcon.innerHTML = " Add";

  link.appendChild(linkPlusIcon);

  panelDropdown.appendChild(link);
}

overlayDel.addEventListener('click', function(){
  if (event.target.classList.contains('btn-overlay')) {
    if (event.target.classList.contains('icon-check')) {
      
      // Delete link pending
      linkDelete(selectedID);
      
      overlayDel.classList.toggle('on');

    } else if (event.target.classList.contains('icon-close')) {
      overlayDel.classList.toggle('on');
    }
  } else if (event.target.classList.contains('overlay')) {
    overlayDel.classList.toggle('on');
  }

});

function linkDelete(id) {

  panelDropdown.children[id].classList.add('removed');
  urls.splice(id, 1);
  urlsName.splice(id, 1);
  setURLs();

  scrollToLink(id > 0 ? id - 1 : 0);

  // console.log("Scroll Height: " + (panelDropdown.scrollHeight - panelDropdown.offsetHeight));
  // console.log('Scroll Top: ' + panelDropdown.scrollTop);


  // scrollTo(panelDropdown, panelDropdown.scrollHeight - panelDropdown.offsetHeight, 250);

  panelDropdown.children[id].addEventListener('transitionend', function(){
    this.remove();
  });

}

function linkOnClick(ev) {
  
  var target = ev.target;
  var i = getElemIndex(ev.currentTarget);

  // console.log('linkOnClick: ' + i);

  if ((target.classList.contains('link-btn-delete'))){
    // Clicked on the Delete Button
    selectedID = i;
    overlayDel.classList.toggle('on');
  } else if ((target.classList.contains('link-btn-edit'))) {
    // Clicked on the Edit
    toggleLinkEdit(i);
  } else if (target.classList.contains("link-name") || 
            (target.classList.contains("link-url"))) 
  {
    // Click on the Name or URL Input box
    changeLink(i);

    if (!target.parentNode.classList.contains('edit')) {
      // If is not in editing mode
      // Deselect that link
      tabDeselectLink(i);

      // Focus on URL Input
      urlIn.focus();
      urlIn.select();

      // And toggle the dropdown
      toggleDropdown();
    }
  } else if (target.classList.contains('link')){
    // Clicked on the any other parts of the link

    // Save the URL
    urlsName[i] = ev.target.children[0].value;
    urls[i] = ev.target.children[3].value;
    setURLs();

    // Change the link displaying
    changeLink(i);
    
    if (!target.classList.contains('edit')) {
      // If is not in editing mode
      // Deselect that link
      tabDeselectLink(i);

      // Focus on URL Input
      urlIn.focus();
      urlIn.select();

      // And toggle the dropdown
      toggleDropdown();
    }
  }
}



function linkOnMouseOver(ev) {
  var id = getElemIndex(ev.currentTarget);
  changeLink(id);
}

function appendToPanelDropdown(i) {

  var link = document.createElement("div");
  link.classList = "line link";
  link.setAttribute('tabindex', '-1');

  link.addEventListener('mouseover', linkOnMouseOver);
  link.addEventListener('click', linkOnClick);

  var linkName = document.createElement("input");
  linkName.id = "link-input-name";
  linkName.classList = "line-first link-input link-name";
  // linkName.id = "link-number-" + i;
  linkName.value = urlsName[i];
  linkName.readOnly = true;

  var linkURL = document.createElement("input");
  linkURL.id = "link-input-url";
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

function displayLink(id) {
  divLinkSelected.innerHTML = urlsName[id];
}

function changeLink(id) {

  // console.log('changeLink: ' + id);

  selectedID = loop(selectedID, 0, urls.length - 1);

  tabDeselectLink(selectedID);

  selectedID = loop(id, 0, urls.length - 1);
  
  tabSelectLink(selectedID);

  displayLink(selectedID);
  recordID();
}

// Include Min, Exclude Max
function loop(val, min, max){
    return val < min? max : (val > max? min : val);
}

function toggleDropdown() {

  btnDropdownLinks.classList.toggle("expanded");
  panelDropdown.classList.toggle("show");

  if (panelDropdown.classList.contains("show")) {
    document.getElementById('dropdown-icon').classList = 'icon-expand_less';
  } else {
    document.getElementById('dropdown-icon').classList = 'icon-expand_more';
  }

  // Save the URLs
  setURLs();
}

function clearSelection() {
  if (window.getSelection) {window.getSelection().removeAllRanges();}
  else if (document.selection) {document.selection.empty();}
}

// IS SOMETHING?

function isDropDownOpen() {
  return btnDropdownLinks.classList.contains("expanded");
}

// URL INPUT

document.addEventListener('input', function (event) {

  if (event.target.tagName.toLowerCase() !== 'textarea') return;
  
  recordUrlInText();
  
  updateCleanButton();
  btnCleanUndo.classList.add('hidden');

  autoExpand(event.target);

}, false);


btnClean.onclick = cleanInput;
btnCleanUndo.onclick = undoClearInput;

var beforeUndoUrlsInText;

function undoClearInput() {

  btnCleanUndo.classList.add('hidden');
  urlIn.value = beforeUndoUrlsInText;

  recordUrlInText();

  urlIn.focus();
  updateCleanButton();
  autoExpand(urlIn);
}

const regKey = RegExp('['+keywords.join('')+']{2,3} *:+ *\\S*', 'gm');
const regKeySingle = RegExp('['+keywords.join('')+']{2,3} *:+ *\\S*');
// const regKeyClean = RegExp('['+keywords.join('')+']{2,3}:+ *');
const regColonClean = /[\s\S]*:+ */g;
const regColon = /\S*:+ *[^:\s]+/g;
const regEmptyDes = /[\S]*:+ */g;

function cleanInput() {

  beforeUndoUrlsInText = urlIn.value;

  var raw = urlIn.value;

  // Find all 密码 提取码 + 冒号

  // var infos = [];
  if (!raw) return;

  // Pick out the keys
  raw = raw.replace('：',':');
  var keys = raw.match(regKey);
  raw = raw.replace(regKey, " ");

  console.log('regKey');
  console.log(raw);

  // Delete Any Ending"/"
  raw = raw.replace(/\/$/gm, "");

  console.log('Ending /');
  console.log(raw);
  

  // Delete Any "/" followed by Spaces
  raw = raw.replace(/\/\s/g, " ");

  console.log('Ending / + space');
  console.log(raw);

  // Delete all Front URLs
  raw = raw.replace(/(\S*\/)+/g, '\n');

  console.log('Front URL');
  console.log(raw);

  var colons = raw.match(regColon);
  raw = raw.replace(regColon, " ");

  console.log('regColon');
  console.log(raw);

  var colonDes = raw.match(regEmptyDes);
  raw = raw.replace(regEmptyDes, "");

  console.log('regEmptyDes');
  console.log(raw);

  var infos = [];

  if (keys)
    infos = infos.concat(keys);

  if (colons)
    infos = infos.concat(colons);

  if (infos) {
    infos.forEach(function (el, i){
      var info = el.replace(regColonClean, "");
      if (info.length > 0) {
        infoText.push(info);
      }
    })
  }

  var cleanedString = raw.match(/\S+/g);

  if (cleanedString) {
    cleanedString.join('\n');
  } else {
    cleanedString = "";
  }

  refreshInfo();
  recordInfoText();
  
  urlIn.value = cleanedString;

  btnCleanUndo.classList.remove('hidden');

  recordUrlInText();
  updateCleanButton();
  urlIn.focus();
  autoExpand(urlIn);
}

function updateCleanButton() {
  if (checkInputToClean()) {
    urlIn.classList.add('toClean');
    btnClean.classList.remove('hidden');
  } else {
    urlIn.classList.remove('toClean');
    btnClean.classList.add('hidden');
  }
}

function checkInputToClean() {

  var raw = urlIn.value;
  // var toClean = false;

  var matchSlash = raw.match('/');
  if (matchSlash) {
    // console.log("True");
    return true;
  }

  var matchColons = raw.replace('：',':').match(regColon);
  if (matchColons) {
    console.log("True");
    return true;
  }

  var checkKeys = raw.match(regKeySingle);
  if (checkKeys) {
    console.log("True");
    return true;
  }

  console.log("False");
  return false;


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

function tabSelectLink(id) {
  // if (id < panelDropdown.children.length)
  panelDropdown.children[id].setAttribute('data-selected', 'true');
}

function tabDeselectLink(id) {
  // if (id < panelDropdown.children.length)
  panelDropdown.children[id].setAttribute('data-selected', 'false');
}

function switchLinkInputFocus(elem) {
  // console.log("Switch Focus");
  var link = elem.parentNode;

  var linkName = link.children[0];
  var linkEditIcon = link.children[1];
  var linkDeleteIcon = link.children[2];
  var linkURL = link.children[3];

  if (document.activeElement == linkName) {
    linkURL.focus();
    linkURL.select();
  } else {
    linkName.focus();
    linkName.select();
  }
}

function scrollToLink(id) {
  var elem = panelDropdown.children[id];
  var offsetTop = elem.offsetTop - (getAbsoluteHeight(elem) * 2) + elem.offsetHeight;
  scrollTo(panelDropdown, offsetTop, 250);
}

// Event Listener for checking user pressing the Enter-key

var isTabKeyDown = false;
var isTabQuickSelected = false;

document.addEventListener('keyup', function(event) {
  var elem = document.activeElement;

  if (event.keyCode == 9) {
    // Tab Key Up
    event.preventDefault();

    isTabKeyDown = false;

    if (!isTabQuickSelected) {
      if (event.shiftKey) {

        if (!isDropDownOpen()) {
          // If it is not open, open it
          toggleLinkEdit(selectedID);
          toggleDropdown();  
          changeLink(selectedID);
          scrollToLink(selectedID);
        } else {
          toggleLinkEdit(selectedID);
        }
        
      } else {

        if (!isDropDownOpen()) {
          // If it is not open, open it
          toggleDropdown();  
          changeLink(selectedID);
          scrollToLink(selectedID);
        } else {
          // Dropdown already open
          if (elem.classList.contains('link-input')) {
            switchLinkInputFocus(elem);
          } else {
            changeLink(selectedID + 1);
            scrollToLink(selectedID);
          }
        }
        // Scrolll scroll to the selected Link;
      }
    } else {
      isTabQuickSelected = false;
    }

  }
});

document.addEventListener('keydown', function(event){
  // var id = document.activeElement.id;
  // var i = parseInt(id.substring(id.length - 1, id.length));
  var elem = document.activeElement;

  if (isTabKeyDown) {
    // When tab is down
    event.preventDefault();

    var letter = String.fromCharCode(event.keyCode);

    if (letter.match(/\S/)) {
      // console.log("Pressed: " + letter);
      isTabQuickSelected = true;

      var currentCap = urlsName[selectedID][0]

      var startID = 0;
      if (letter == currentCap) {
        // from selectedID, find next available one with this Cap
        startID = loop(selectedID+1, 0, urlsName.length - 1);
      }

      // console.log(urlsName.length);

      for (var i = startID; i < startID+urlsName.length; i++) {
        var id = i % urlsName.length;
        if (urlsName[id][0].toUpperCase() == letter) {
          // Found a match
          // console.log("Found!" + urlsName[i] + ", at " + i);

          changeLink(id);
          scrollToLink(selectedID);
          return;
        }
      }
    }

    // if (letter == "A") {

    //   if (!isDropDownOpen()) {
    //     toggleDropdown();
    //     changeLink(1);
    //     scrollToLink(1);
    //   }
    // }
  }

  if (event.keyCode == 9) {
    // Tab Key down
    event.preventDefault();

    isTabKeyDown =true;
  }

  // Check if it is an enter
  if (event.keyCode == 13) {
    // Enter Key Down
    // console.log(elem);
    if (elem.classList.contains("link-input")) {
      event.preventDefault();
      toggleLinkEdit(getElemIndex(elem.parentNode));
    } else
    if (elem.tagName.toLowerCase() == "textarea"){
      if (event.shiftKey) {
        event.preventDefault();

        if (checkInputToClean()) {
          cleanInput();
        } else {
          goToURL();
        }
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

  // Check if is Saving the URL
  if (linkEditIcon.classList.contains('icon-check')) {

    document.getSelection().removeAllRanges();
    // Modifiy the URL
    urlsName[i] = linkName.value;
    urls[i] = linkURL.value;
    // Set the URLs
    setURLs();

    urlIn.focus();
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

function displayInfo() {

  if (infoText.length <= 0) return;

  var infoContainer = document.getElementById('line-info-container');

  // Adding them to the Info Container
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

        this.onclick = function(ev) {
          ev.target.remove();
        }
      
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

getOptions();
getURLs();

urlIn.value = urlInText;
urlIn.focus();
urlIn.select();
autoExpand(urlIn);
updateCleanButton();


autoExpand(urlIn);

btnGo.onclick = goToURL;


urlIn.addEventListener('focus', function(){
  // console.log("URL IN FOCUS");
  setTimeout(function() {
    urlIn.select()
  }, 3);
  // urlIn.setSelectionRange(0, 1);
  // var selObj = window.getSelection(); 
  // console.log(selObj);
  
  // var selRange = selObj.getRangeAt(0);
  // console.log(selRange);
});
displayInfo();

