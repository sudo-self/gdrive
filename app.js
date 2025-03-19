// Load necessary static assets in the <head>
document.write('<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/mdui@0.4.3/dist/css/mdui.min.css">');
document.write('<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css">');
document.write('<script src="//cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js"></script>');
document.write('<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/dplayer@1.25.0/dist/DPlayer.min.css">');
document.write('<script src="//cdn.jsdelivr.net/npm/dplayer@1.25.1/dist/DPlayer.min.js"></script>');
document.write('<script src="//cdn.jsdelivr.net/npm/markdown-it@10.0.0/dist/markdown-it.min.js"></script>');
document.write("<style>.mdui-appbar .mdui-toolbar{height:56px;font-size:1pc}.mdui-toolbar>*{padding:0 6px;margin:0 2px}.mdui-toolbar>i{opacity:.5}.mdui-toolbar>.mdui-typo-headline{padding:0 1pc 0 0}.mdui-toolbar>i{padding:0}.mdui-toolbar>a:hover,a.active,a.mdui-typo-headline{opacity:1}.mdui-container{max-width:980px}.mdui-list-item{transition:none}.mdui-list>.th{background-color:initial}.mdui-list-item>a{width:100%;line-height:3pc}.mdui-list-item{margin:2px 0;padding:0}.mdui-toolbar>a:last-child{opacity:1}@media screen and (max-width:980px){.mdui-list-item .mdui-text-right{display:none}.mdui-container{width:100%!important;margin:0}.mdui-toolbar>.mdui-typo-headline,.mdui-toolbar>a:last-child,.mdui-toolbar>i:first-child{display:block}}</style>");

// Initialize the page and load necessary resources
function init() {
  document.siteName = $("title").html();
  $("body").addClass("mdui-theme-primary-blue-grey mdui-theme-accent-blue");
  
  // Setup HTML structure
  var html = `
    <header class="mdui-appbar mdui-color-theme"> 
      <div id="nav" class="mdui-toolbar mdui-container"> 
        <img src="https://bucket.jessejesse.com/logo.png" alt="Logo" class="inline-block h-10 mr-2">
      </div> 
    </header>
    <div id="content" class="mdui-container"> 
      <!-- Content dynamically injected here -->
    </div>
  `;
  
  $("body").html(html);
}

// Render content based on the provided path
function render(path) {
  if (path.indexOf("?") > 0) {
    path = path.substr(0, path.indexOf("?"));
  }
  
  updateTitle(path);
  updateNav(path);
  
  // Render different content based on path type (directory or file)
  if (path.substr(-1) === "/") {
    listFiles(path);
  } else {
    displayFile(path);
  }
}

// Update page title
function updateTitle(path) {
  path = decodeURI(path);
  $("title").html(document.siteName + " - " + path);
}

// Update navigation bar
function updateNav(path) {
  var html = "";
  html += `<a href="/" class="mdui-typo-headline folder">${document.siteName}</a>`;
  var arr = path.trim("/").split("/");
  var p = "/";
  
  if (arr.length > 0) {
    for (let i in arr) {
      var n = arr[i];
      n = decodeURI(n);
      p += n + "/";
      if (n == "") {
        break;
      }
      html += `<i class="mdui-icon material-icons mdui-icon-dark folder" style="margin:0;">chevron_right</i><a class="folder" href="${p}">${n}</a>`;
    }
  }
  
  $("#nav").html(html);
}

// List files in the directory
function listFiles(path) {
  var content = `
    <div class="mdui-row"> 
      <ul class="mdui-list"> 
        <li class="mdui-list-item th"> 
          <div class="mdui-col-xs-12 mdui-col-sm-7">File</div> 
          <div class="mdui-col-sm-3 mdui-text-right">Last Modified</div> 
          <div class="mdui-col-sm-2 mdui-text-right">Size</div> 
        </li> 
      </ul> 
    </div> 
    <div class="mdui-row"> 
      <ul id="list" class="mdui-list"> </ul> 
    </div>
  `;
  
  // Footer HTML
  var footer = `
    <footer class="bg-gray-800 text-white text-center py-4 mt-auto w-full">
      <div class="mb-4">
        <img src="https://img.shields.io/badge/gdrive-.JesseJesse.workers.dev-orange" alt="Badge Preview" class="rounded-md" />
      </div>
      <p class="text-sm">© 2024 ${document.siteName}. All rights reserved.</p>
    </footer>
  `;
  
  content += footer; // Add footer to content
  $("#content").html(content); // Append content to body

  var password = localStorage.getItem("password" + path);
  $("#list").html(`<div class="mdui-progress"><div class="mdui-progress-indeterminate"></div></div>`);
  
  // Simulate file listing via post
  $.post(path, `{"password":"${password}"}`, function (data, status) {
    var obj = jQuery.parseJSON(data);
    if (obj && obj.hasOwnProperty("error") && obj.error.code == "401") {
      var pass = prompt("Directory is password protected. Enter password:", "");
      localStorage.setItem("password" + path, pass);
      if (pass) {
        listFiles(path);
      } else {
        history.go(-1);
      }
    } else if (obj) {
      populateFileList(path, obj.files);
    }
  });
}

function populateFileList(path, files) {
  let html = "";
  for (let i in files) {
    var item = files[i];
    var filePath = path + item.name + "/";
    if (!item["size"]) {
      item["size"] = "";
    }

    item["modifiedTime"] = convertUTCtoLocal(item["modifiedTime"]);
    item["size"] = formatFileSize(item["size"]);
    
    if (item["mimeType"] === "application/vnd.google-apps.folder") {
      html += `<li class="mdui-list-item mdui-ripple"><a href="${filePath}" class="folder">
        <div class="mdui-col-xs-12 mdui-col-sm-7">${item.name}</div>
        <div class="mdui-col-sm-3 mdui-text-right">${item["modifiedTime"]}</div>
        <div class="mdui-col-sm-2 mdui-text-right">${item["size"]}</div>
      </a></li>`;
    } else {
      var fileUrl = path + item.name;
      html += `<li class="mdui-list-item file mdui-ripple"><a href="${fileUrl}">
        <div class="mdui-col-xs-12 mdui-col-sm-7">${item.name}</div>
        <div class="mdui-col-sm-3 mdui-text-right">${item["modifiedTime"]}</div>
        <div class="mdui-col-sm-2 mdui-text-right">${item["size"]}</div>
      </a></li>`;
    }
  }
  $("#list").html(html); // Inject file list into DOM
}

// Convert UTC time to local time
function convertUTCtoLocal(utcTime) {
  let date = new Date(utcTime);
  return date.toLocaleString();
}

// Format file sizes
function formatFileSize(bytes) {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + " GB";
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + " MB";
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(2) + " KB";
  return bytes > 1 ? bytes + " bytes" : bytes === 1 ? "1 byte" : "";
}

// Listen for back button navigation
window.onpopstate = function () {
  render(window.location.pathname);
};

$(function () {
  init();
  var path = window.location.pathname;
  
  $("body").on("click", ".folder, .view", function () {
    var url = $(this).attr("href");
    history.pushState(null, null, url);
    render(url);
    return false;
  });

  render(path); // Initial render call
});



