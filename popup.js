
'use strict';

let urlIn = document.getElementById('url-input');
let btnGo = document.getElementById('btn-go');
let btnDropdownLinks = document.getElementById('btn-dropdown-links');

let overlayDel = document.getElementById('overlay-delete');

let btnOverlayCheck = document.getElementById("btn-overlay-check");
let btnOverlayClose = document.getElementById("btn-overlay-close");

var cacheKey = 'url-quick-append-cache';

var lazyLoading = true;
var theurl;

var urls = [];
var urlsName = [];


btnGo.disabled = true;

var oldOpts = getCachedOpts();
var selectedID = oldOpts.id;
var urlInText = oldOpts.urlInText;

// get options from localStorage
function getCachedOpts () {
  let cache = localStorage.getItem(cacheKey)
  if (cache) {
    return JSON.parse(cache)
  } else {
    return { id: 0, urlInText: "" }
  }
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
      // console.log("URLs Updated");
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
      // console.log("Set Default URLs");
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
  // console.log("toggle panel");

  if (dropdown.classList.contains("show")) {
    document.getElementById('dropdown-icon').classList = 'icon-expand_less';
  } else {
    document.getElementById('dropdown-icon').classList = 'icon-expand_more';
  }

  setURLs();

  // console.log("Toggle Drop Down");

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
}, false);

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

  // console.log(field.scrollHeight);
  // console.log("Scroll Height:" + field.scrollHeight);
  // console.log("Client Height:" + field.clientHeight);
  // console.log("Padding Top:" + parseInt(computed.getPropertyValue('padding-top'), 10));
  // console.log("Line Height: " + computed.getPropertyValue('line-height'));
  // console.log("Max Height: " + computed.getPropertyValue('max-height'));


  var clientHeight = parseInt(field.clientHeight, 10);
  var baseLineHeight = parseInt(computed.getPropertyValue('line-height'), 10);
  var baseClientHeight = baseLineHeight 
                      + parseInt(computed.getPropertyValue('padding-top'), 10)
                      + parseInt(computed.getPropertyValue('padding-bottom'), 10);
  var maxHeight = parseInt(computed.getPropertyValue('max-height'), 10);
  var height = field.scrollHeight - baseClientHeight + baseLineHeight;

  // console.log("Base Client Height: " + baseClientHeight);
  // console.log("Height: " + height);
  // console.log("Current Height: " + currentHeight);

  if ((height > currentHeight) && (height > maxHeight)) {
    // console.log("Scroll Height:" + field.scrollHeight);
    // console.log("Scroll Top:" + field.scrollTop);
    var scrollTopTarget = (height - baseClientHeight - baseLineHeight);
    // console.log("Scroll Top Target: " + scrollTopTarget);
    // console.log("Height: " + height);
    // console.log("Current Height: " + currentHeight);
    field.scrollTop = scrollTopTarget;
  }

  field.style.height = height + 'px';



  // field.style.lineHeight = height + 'px';

};

urlIn.value = urlInText;
urlIn.focus();
urlIn.select();
autoExpand(urlIn);


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
    // console.log("Pressed Enter");
    if (element.tagName.toLowerCase() == "input") {
      // console.log("Input Confirmed");
      event.preventDefault();
      toggleLinkEdit(i);
    } else
    if (element.tagName.toLowerCase() == "textarea"){
      // console.log("Text Area Confirmed");
      if (event.shiftKey) {

        event.preventDefault();
        // console.log("GO!");
        goToURL();
      }
    }
  }
  

  // console.log(element);
  
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




