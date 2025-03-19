// Load required static resources in the <head>
document.write(
  '<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/mdui@0.4.3/dist/css/mdui.min.css">'
);
// APlayer support
document.write(
  '<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css">'
);
document.write(
  '<script src="//cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js"></script>'
);
// DPlayer support
document.write(
  '<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/dplayer@1.25.0/dist/DPlayer.min.css">'
);
document.write(
  '<script src="//cdn.jsdelivr.net/npm/dplayer@1.25.1/dist/DPlayer.min.js"></script>'
);
// Markdown support
document.write(
  '<script src="//cdn.jsdelivr.net/npm/markdown-it@10.0.0/dist/markdown-it.min.js"></script>'
);
document.write(
  "<style>.mdui-appbar .mdui-toolbar{height:56px;font-size:1pc}.mdui-toolbar>*{padding:0 6px;margin:0 2px}.mdui-toolbar>i{opacity:.5}.mdui-toolbar>.mdui-typo-headline{padding:0 1pc 0 0}.mdui-toolbar>i{padding:0}.mdui-toolbar>a:hover,a.active,a.mdui-typo-headline{opacity:1}.mdui-container{max-width:980px}.mdui-list-item{transition:none}.mdui-list>.th{background-color:initial}.mdui-list-item>a{width:100%;line-height:3pc}.mdui-list-item{margin:2px 0;padding:0}.mdui-toolbar>a:last-child{opacity:1}@media screen and (max-width:980px){.mdui-list-item .mdui-text-right{display:none}.mdui-container{width:100%!important;margin:0}.mdui-toolbar>.mdui-typo-headline,.mdui-toolbar>a:last-child,.mdui-toolbar>i:first-child{display:block}}</style>"
);

// Initialize the page and load necessary resources
function init() {
  document.siteName = $("title").html();
  $("body").addClass("mdui-theme-primary-blue-grey mdui-theme-accent-blue");
  var html = `
<header class="mdui-appbar mdui-color-theme"> 
   <div id="nav" class="mdui-toolbar mdui-container"> 
   </div> 
</header>
<div id="content" class="mdui-container"> 
</div>
	`;
  $("body").html(html);
}

// Render the page based on the path
function render(path) {
  if (path.indexOf("?") > 0) {
    path = path.substr(0, path.indexOf("?"));
  }
  updateTitle(path);
  updateNav(path);
  if (path.substr(-1) == "/") {
    listFiles(path);
  } else {
    showFile(path);
  }
}

// Update the page title
function updateTitle(path) {
  path = decodeURI(path);
  $("title").html(document.siteName + " - " + path);
}

// Update the navigation bar
function updateNav(path) {
  var html = `<a href="/" class="mdui-typo-headline folder">${document.siteName}</a>`;
  var arr = path.trim("/").split("/");
  var p = "/";
  if (arr.length > 0) {
    for (i in arr) {
      var n = decodeURI(arr[i]);
      p += n + "/";
      if (n == "") {
        break;
      }
      html += `<i class="mdui-icon material-icons mdui-icon-dark folder" style="margin:0;">chevron_right</i><a class="folder" href="${p}">${n}</a>`;
    }
  }
  $("#nav").html(html);
}

// List files in a directory
function listFiles(path) {
  var content = `
	<div id="header_md" class="mdui-typo" style="display:none;padding: 20px 0;"></div>

	 <div class="mdui-row"> 
	  <ul class="mdui-list"> 
	   <li class="mdui-list-item th"> 
	    <div class="mdui-col-xs-12 mdui-col-sm-7">
	     File Name
	     <i class="mdui-icon material-icons icon-sort" data-sort="name" data-order="more">expand_more</i>
	    </div> 
	    <div class="mdui-col-sm-3 mdui-text-right">
	     Last Modified
	     <i class="mdui-icon material-icons icon-sort" data-sort="date" data-order="downward">expand_more</i>
	    </div> 
	    <div class="mdui-col-sm-2 mdui-text-right">
	     Size
	     <i class="mdui-icon material-icons icon-sort" data-sort="size" data-order="downward">expand_more</i>
	    </div> 
	    </li> 
	  </ul> 
	 </div> 
	 <div class="mdui-row"> 
	  <ul id="fileList" class="mdui-list"> 
	  </ul> 
	 </div>
	 <div id="readme_md" class="mdui-typo" style="display:none; padding: 20px 0;"></div>
	`;
  $("#content").html(content);

  var password = localStorage.getItem("password" + path);
  $("#fileList").html(
    `<div class="mdui-progress"><div class="mdui-progress-indeterminate"></div></div>`
  );
  $("#readme_md").hide().html("");
  $("#header_md").hide().html("");
  $.post(path, '{"password":"' + password + '"}', function (data, status) {
    var obj = jQuery.parseJSON(data);
    if (obj !== null && obj.hasOwnProperty("error") && obj.error.code === "401") {
      var pass = prompt("Directory is password protected. Enter password:", "");
      localStorage.setItem("password" + path, pass);
      if (pass !== null && pass !== "") {
        listFiles(path);
      } else {
        history.go(-1);
      }
    } else if (obj !== null) {
      renderFileList(path, obj.files);
    }
  });
}

// Render the file list
function renderFileList(path, files) {
  var html = "";
  for (var i in files) {
    var item = files[i];
    var filePath = path + item.name + "/";
    var size = formatFileSize(item["size"] || 0);
    var modifiedTime = formatDate(item["modifiedTime"]);

    if (item["mimeType"] === "application/vnd.google-apps.folder") {
      html += `<li class="mdui-list-item mdui-ripple"><a href="${filePath}" class="folder">
	            <div class="mdui-col-xs-12 mdui-col-sm-7 mdui-text-truncate">
	            <i class="mdui-icon material-icons">folder_open</i>
	              ${item.name}
	            </div>
	            <div class="mdui-col-sm-3 mdui-text-right">${modifiedTime}</div>
	            <div class="mdui-col-sm-2 mdui-text-right">${size}</div>
	            </a>
	        </li>`;
    } else {
      html += `<li class="mdui-list-item file mdui-ripple"><a href="${filePath}" class="file">
	          <div class="mdui-col-xs-12 mdui-col-sm-7 mdui-text-truncate">
	          <i class="mdui-icon material-icons">insert_drive_file</i>
	            ${item.name}
	          </div>
	          <div class="mdui-col-sm-3 mdui-text-right">${modifiedTime}</div>
	          <div class="mdui-col-sm-2 mdui-text-right">${size}</div>
	          </a>
	      </li>`;
    }
  }
  $("#fileList").html(html);
}
