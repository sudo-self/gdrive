// =======Options START=======
var authConfig = {
    siteName: "Goindex", // Website name
    version: "1.1.2", // Application version
    theme: "acrou", // Theme choice
  
    /**
     * Set the cloud drives to display; add multiple drives following the format below
     * [id]: Can be the team drive id, folder id, or "root" (representing the personal drive root directory);
     * [name]: Displayed name
     * [user]: Basic Auth username
     * [pass]: Basic Auth password
     * [protect_file_link]: Whether Basic Auth is used to protect file links, default is false (file links are not protected by default)
     * Each drive can have its own Basic Auth settings. Basic Auth protects all files/folders under that drive.
     * [Note] By default, file links are not protected for ease of direct download/external playback, etc.
     *       To protect file links, set protect_file_link to true. In this case, for external playback and operations,
     *       the host must be replaced with user:pass@host format.
     * Drives that don't need Basic Auth can leave user and pass empty (or you can omit them).
     * [Note] Drives with id set to subfolder id do not support search functionality (does not affect other drives).
     */
    default_gd: 0,  // Default drive
    /**
     * The number of items displayed per page on the file list page. [Recommended value between 100 and 1000];
     * Setting higher than 1000 may result in API request errors;
     * A smaller number causes the file list page to scroll incrementally (paging).
     * This setting also affects cache behavior when directory files exceed this value (pages need to be loaded).
     */
    files_list_page_size: 50,
    /**
     * The number of items displayed per page in search results. [Recommended value between 50 and 1000];
     * Setting higher than 1000 may result in API request errors;
     * A smaller number causes the search results page to scroll incrementally.
     * The size of this setting impacts the search operation's response speed.
     */
    search_result_list_page_size: 50,
    // Enable this for drives that require CORS support
    enable_cors_file_down: false,
    /**
     * Basic Auth already provides global protection for the drive, so by default, file links aren't protected.
     * For protected file links, the host needs to be formatted as user:pass@host.
     */
};

// =======Options END=======
// ======= Accounts Configuration START =======
var accounts = [
  {
    id: "root",
    name: "Google Drive 1",
    user: "", // Add your username here if needed
    pass: "", // Add your password here if needed
    protect_file_link: false,
    client_id: '',
    client_secret: '',
    refresh_token: ''
  },
  {
    id: "root",
    name: "Google Drive 2",
    user: "", // Add your username here if needed
    pass: "", // Add your password here if needed
    protect_file_link: false,
    client_id: "",
    client_secret: "",
    refresh_token: ""
  }
  // Uncomment below if you need to add another Google Drive account
  // ,{
  //   id: "root",
  //   name: "Google Drive 3",
  //   pass: "",
  //   client_id: "",
  //   client_secret: "",
  //   refresh_token: ""
  // }
];
// ======= Accounts Configuration END =======

// ======= Theme Configuration START =======
var themeOptions = {
  cdn: "https://cdn.jsdelivr.net/gh/alx-xlx/goindex",  // Link to CDN for theme
  version: "2.0.8-darkmode-0.1",  // Theme version
  languages: "en",  // Available languages, default is English
  render: {
    head_md: false,  // Render HEAD.md file or not
    readme_md: false,  // Render README.md file or not
    desc: false  // Render file/folder description or not
  },
  video: {
    api: "",  // Player API (optional)
    autoplay: true  // Enable video autoplay
  },
  audio: {}  // Audio player options (currently empty)
};
// ======= Theme Configuration END =======

// ======= Global Functions START =======
const FUNCS = {
  // Convert search keyword to a safer format for Google Search
  formatSearchKeyword: function(keyword) {
    let nothing = "";
    let space = " ";
    if (!keyword) return nothing;
    return keyword
      .replace(/(!=)|['"=<>/\\:]/g, nothing)
      .replace(/[,，|(){}]/g, space)
      .trim();
  },
};
// ======= Global Functions END =======

// ======= Global Constants START =======
const CONSTS = new (class {
  default_file_fields = "parents,id,name,mimeType,modifiedTime,createdTime,fileExtension,size";
  gd_root_type = {
    user_drive: 0,
    share_drive: 1,
    sub_folder: 2
  };
  folder_mime_type = "application/vnd.google-apps.folder";
})();
// ======= Global Constants END =======

// Google Drive Instances
var gds = [];

// Function to render HTML
function html(current_drive_order = 0, model = {}) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
    <title>${authConfig.siteName}</title>
    <meta name="description" content="Combining the power of Cloudflare Workers and Google Drive to index your files.">
    <meta name="theme-color" content="#FF3300">
    <meta name="application-name" content="Goindex">
    <meta name="robots" content="index, follow">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:image" content="https://i.imgur.com/rOyuGjA.gif">
    <meta name="twitter:description" content="Combining the power of Cloudflare Workers and Google Drive to index your files.">
    <meta name="keywords" content="goindex, google, drive, workers-script, themes">
    <meta name="twitter:title" content="Goindex">
    <meta name="twitter:url" content="https://github.com/alx-xlx/goindex">
    <link rel="shortcut icon" href="https://i.imgur.com/rOyuGjA.gif">
    <meta property="og:site_name" content="Goindex">
    <meta property="og:type" content="website">
    <meta property="og:image" content="https://i.imgur.com/rOyuGjA.gif">
    <meta property="og:description" content="Combining the power of Cloudflare Workers and Google Drive to index your files.">
    <meta property="og:title" content="Goindex">
    <meta property="og:url" content="https://github.com/alx-xlx/goindex">
    <link rel="apple-touch-icon" href="https://i.imgur.com/rOyuGjA.gif">
    <link rel="icon" type="image/png" sizes="32x32" href="https://i.imgur.com/rOyuGjA.gif">
    <meta name="google-site-verification" content="OD_AXMYw-V6ID9xQUb2Wien9Yy8IJSyfBUyejYNB3CU"/>
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-86099016-6"></script>
    <script>window.dataLayer=window.dataLayer || []; function gtag(){dataLayer.push(arguments);}gtag('js', new Date()); gtag('config', 'UA-86099016-6');</script>
    <script>
      (function(w,d,s,l,i){
        w[l]=w[l]||[];
        w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
        var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
        j.async=true;
        j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
        f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-MR47R4M');
    </script>
    <style>
      @import url(${themeOptions.cdn}@${themeOptions.version}/goindex-acrou/dist/style.min.css);
    </style>
    <script>
      window.gdconfig=JSON.parse('${JSON.stringify({version: authConfig.version, themeOptions: themeOptions})}');
      window.themeOptions=JSON.parse('${JSON.stringify(themeOptions)}');
      window.gds=JSON.parse('${JSON.stringify(accounts.map((it)=> it.name))}');
      window.MODEL=JSON.parse('${JSON.stringify(model)}');
      window.current_drive_order=${current_drive_order};
    </script>
  </head>
  <body>
    <noscript>
      <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MR47R4M" height="0" width="0" style="display:none;visibility:hidden"></iframe>
    </noscript>
    <div id="app"></div>
    <script src="${themeOptions.cdn}@${themeOptions.version}/goindex-acrou/dist/app.min.js"></script>
  </body>
  </html>
  `;
}
addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request));
});

/**
 * Handle the incoming request
 * @param {Request} request
 */
async function handleRequest(request) {
    // Initialize Google Drive instances if not already initialized
    if (gds.length === 0) {
        for (let i = 0; i < this.accounts.length; i++) {
            let authConfig = {
                ...this.authConfig,
                ...this.accounts[i]
            };
            const gd = new googleDrive(authConfig, i);
            gds.push(gd);
        }
        
        // Initialize Google Drive root types in parallel for better performance
        let tasks = [];
        gds.forEach((gd) => {
            tasks.push(gd.initRootType());
        });
        for (let task of tasks) {
            await task;
        }
    }

    // Extract the path from the request URL
    let gd;
    let url = new URL(request.url);
    let path = decodeURI(url.pathname);

    /**
     * Redirect to the index page
     * @returns {Response}
     */
    function redirectToIndexPage() {
        return new Response("", {
            status: 301,
            headers: { Location: `/${authConfig.default_gd}:/` },
        });
    }

    // If the path is the root, redirect to the index page
    if (path == "/") return redirectToIndexPage();

    // Handle requests for favicon.ico
    if (path.toLowerCase() == "/favicon.ico") {
        // Favicon can be added here later
        return new Response("", { status: 404 });
    }

    // Special command format: /{num}:{command}/{optional-path}
    const command_reg = /^\/(?<num>\d+):(?<command>[a-zA-Z0-9]+)(\/.*)?$/g;
    const match = command_reg.exec(path);
    let command;
    if (match) {
        const num = match.groups.num;
        const order = Number(num);
        
        // Check if the order is valid
        if (order >= 0 && order < gds.length) {
            gd = gds[order];
        } else {
            return redirectToIndexPage();
        }

        // Basic authentication check
        const basicAuthResponse = gd.basicAuthResponse(request);
        if (basicAuthResponse) return basicAuthResponse;

        command = match.groups.command;

        // Search command handler
        if (command === "search") {
            if (request.method === "POST") {
                return handleSearch(request, gd); // Handle search results
            } else {
                const params = url.searchParams;
                return new Response(
                    html(gd.order, {
                        q: params.get("q") || "",
                        is_search_page: true,
                        root_type: gd.root_type,
                    }),
                    {
                        status: 200,
                        headers: { "Content-Type": "text/html; charset=utf-8" },
                    }
                );
            }
        } else if (command === "id2path" && request.method === "POST") {
            return handleId2Path(request, gd); // Handle ID to path conversion
        } else if (command === "view") {
            const params = url.searchParams;
            return gd.view(params.get("url"), request.headers.get("Range"));
        } else if (command !== "down" && request.method === "GET") {
            return new Response(html(gd.order, { root_type: gd.root_type }), {
                status: 200,
                headers: { "Content-Type": "text/html; charset=utf-8" },
            });
        }
    }

    // Regular expression for matching specific paths
    const reg = new RegExp(`^(/\\d+:)${command}/`, "g");
    path = path.replace(reg, (p1, p2) => {
        return p2 + "/";
    });

    // Validate the path format
    const common_reg = /^\/\d+:\/.*$/g;
    try {
        if (!path.match(common_reg)) {
            return redirectToIndexPage();
        }

        // Extract the order number from the path
        let split = path.split("/");
        let order = Number(split[1].slice(0, -1));
        if (order >= 0 && order < gds.length) {
            gd = gds[order];
        } else {
            return redirectToIndexPage();
        }
    } catch (e) {
        return redirectToIndexPage();
    }

    // Basic authentication check
    const basic_auth_res = gd.basicAuthResponse(request);
    path = path.replace(gd.url_path_prefix, "") || "/";

    // Handle POST requests for API interaction
    if (request.method == "POST") {
        return basic_auth_res || apiRequest(request, gd);
    }

    let action = url.searchParams.get("a");

    // Handle directories and special actions
    if (path.substr(-1) == "/" || action != null) {
        return (
            basic_auth_res ||
            new Response(html(gd.order, { root_type: gd.root_type }), {
                status: 200,
                headers: { "Content-Type": "text/html; charset=utf-8" },
            })
        );
    } else {
        // Handle file download or password verification
        if (
            path
                .split("/")
                .pop()
                .toLowerCase() == ".password"
        ) {
            return basic_auth_res || new Response("", { status: 404 });
        }

        // Retrieve file for download
        let file = await gd.file(path);
        let range = request.headers.get("Range");
        if (gd.accounts.protect_file_link && basic_auth_res) return basic_auth_res;
        const is_down = !(command && command == "down");
        return gd.down(file.id, range, is_down);
    }
}

/**
 * Handle API request for a directory or file
 * @param {Request} request
 * @param {GoogleDrive} gd
 */
async function apiRequest(request, gd) {
    let url = new URL(request.url);
    let path = url.pathname;
    path = path.replace(gd.url_path_prefix, "") || "/";

    let option = { status: 200, headers: { "Access-Control-Allow-Origin": "*" } };

    // Directory request
    if (path.substr(-1) == "/") {
        let deferred_pass = gd.password(path);
        let body = await request.text();
        body = JSON.parse(body);

        // List directory contents
        let deferred_list_result = gd.list(path, body.page_token, Number(body.page_index));

        // Check if password is required for directory
        if (authConfig["enable_password_file_verify"]) {
            let password = await gd.password(path);
            if (password && password.replace("\n", "") !== body.password) {
                let html = `{"error": {"code": 401,"message": "password error."}}`;
                return new Response(html, option);
            }
        }

        let list_result = await deferred_list_result;
        return new Response(JSON.stringify(list_result), option);
    } else {
        // File request
        let file = await gd.file(path);
        let range = request.headers.get("Range");
        return new Response(JSON.stringify(file));
    }
}

async function handleSearch(request, gd) {
  const option = {
    status: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
  };
  let body = await request.text();
  body = JSON.parse(body);
  let search_result = await gd.search(
    body.q || "",
    body.page_token,
    Number(body.page_index)
  );
  return new Response(JSON.stringify(search_result), option);
}
async function handleId2Path(request, gd) {
  const option = {
    status: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
  };
  let body = await request.text();
  body = JSON.parse(body);
  let path = await gd.findPathById(body.id);
  return new Response(path || "", option);
}
class GoogleDrive {
  constructor(authConfig, order) {
    this.order = order;
    this.accounts = accounts[order];
    this.protect_file_link = this.protect_file_link || false;
    this.url_path_prefix = `/${order}:`;
    this.authConfig = authConfig;
    this.paths = [];
    this.files = [];
    this.passwords = [];
    this.id_path_cache = {};
    this.id_path_cache[this.accounts["id"]] = "/";
    this.paths["/"] = this.accounts["id"];
  }

  async init() {
    await this.accessToken();
    if (authConfig.user_drive_real_root_id) return;
    const root_obj = await (gds[0] || this).findItemById("root");
    if (root_obj && root_obj.id) {
      authConfig.user_drive_real_root_id = root_obj.id;
    }
  }

  async initRootType() {
    const root_id = this.accounts["id"];
    const types = CONSTS.gd_root_type;
    if (root_id === "root" || root_id === authConfig.user_drive_real_root_id) {
      this.root_type = types.user_drive;
    } else {
      const obj = await this.getShareDriveObjById(root_id);
      this.root_type = obj ? types.share_drive : types.sub_folder;
    }
  }

  basicAuthResponse(request) {
    const user = this.accounts.user || "",
      pass = this.accounts.pass || "",
      _401 = new Response("Unauthorized", {
        headers: {
          "WWW-Authenticate": `Basic realm="goindex:drive:${this.order}"`,
        },
        status: 401,
      });
    if (user || pass) {
      const auth = request.headers.get("Authorization");
      if (auth) {
        try {
          const [received_user, received_pass] = atob(
            auth.split(" ").pop()
          ).split(":");
          return received_user === user && received_pass === pass ? null : _401;
        } catch {
          return _401;
        }
      }
      return _401;
    }
  }

  async findItemById(id) {
    // Logic for finding item by ID in Google Drive.
    // This could be a request to the Google Drive API, for example.
  }

  async accessToken() {
    // Logic to get the access token for Google Drive.
  }

  async getShareDriveObjById(id) {
    // Logic to get shared drive details by ID.
  }

  async search(query, pageToken, pageIndex) {
    // Logic to search for files in Google Drive based on a query, page token, and page index.
  }

  async findPathById(id) {
    // Logic to find a path by file ID in Google Drive.
  }
}

