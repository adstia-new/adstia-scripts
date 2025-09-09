const LOCAL_STORAGE_QUIZ_KEY = "quizValues";
const COOKIE_ANONYMOUS_ID = "__eventn_id";

const getDomainName = () => {
  const location = window.location;

  return location.host;
};

const getCurrentSlug = () => {
  const location = window.location;

  return location.pathname;
};

const getCurrentUrl = () => {
  const location = window.location;

  return location.href;
};

const getScreenResolution = () => {
  return `${window.screen.width}x${window.screen.height}`;
};

const getConnectionType = () => {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  return connection ? connection.effectiveType || "unknown" : "unknown";
};

const getCookie = (name) => {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name + "=") === 0) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
};

window.adstiaScripts = {
  init: function () {
    const domainName = getDomainName();
    const domainSlug = getCurrentSlug();
    const finalUrl = getCurrentUrl();
    const screenResolution = getScreenResolution();
    const connectionType = getConnectionType();

    const quizValues = localStorage.getItem(LOCAL_STORAGE_QUIZ_KEY);
    const parsedQuizValues = quizValues ? JSON.parse(quizValues) : {};

    const newQuizValuesData = {
      ...parsedQuizValues,
      domainName,
      domainSlug,
      finalUrl,
      screenResolution,
      connectionType,
    };

    localStorage.setItem(
      LOCAL_STORAGE_QUIZ_KEY,
      JSON.stringify(newQuizValuesData)
    );
  },

  updateShortcodes: () => {
    const spans = document.querySelectorAll("span[data-sc]");
    spans.forEach((span) => {
      const key = span.getAttribute("data-sc");
      const storedValue = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_QUIZ_KEY)
      );
      if (storedValue && storedValue[key]) {
        const textNode = document.createTextNode(storedValue[key]);
        span.parentNode.replaceChild(textNode, span);
      }
    });
  },

  fetchUserLocationAndDeviceInfo: async function () {
    if (
      typeof window === "undefined" ||
      !window?.cf_variable?.IP_ADDRESS_API_KEY
    )
      return;

    const IP_ADDRESS_API_KEY = window.cf_variable?.IP_ADDRESS_API_KEY;
    const IP_ADDRESS_API_URL = "https://api.ipify.org?format=json";
    const IP_ADDRESS_BASED_LOCATION_API_URL =
      "https://server.adstiacms.com/api/ip-address";
    const LOCAL_STORAGE_QUIZ_KEY = "quizValues";

    try {
      if (typeof window !== "undefined") {
        const storedData = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_QUIZ_KEY) || "{}"
        );

        if (!storedData.websiteZip) {
          const ipResponse = await fetch(IP_ADDRESS_API_URL);
          const ipData = await ipResponse.json();
          const userIp = ipData.ip;

          const locationResponse = await fetch(
            IP_ADDRESS_BASED_LOCATION_API_URL,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ip: userIp,
                key: IP_ADDRESS_API_KEY,
              }),
            }
          );

          if (!locationResponse.ok) {
            throw new Error(`HTTP error! status: ${locationResponse.status}`);
          }

          const data = await locationResponse.json();
          const uaResult = UAParser();
          const savedTags = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_QUIZ_KEY) || "{}"
          );

          localStorage.setItem(
            LOCAL_STORAGE_QUIZ_KEY,
            JSON.stringify({
              ipCity: data.data.city,
              ipCountry: data.data.country,
              ipState: data.data.state,
              ipZip: data.data.postalCode,
              ipAddress: data.data.ipAddress,
              ipCountryCode: data.data.countryCode,
              device: uaResult.device.model?.toString() || "",
              browser: uaResult.browser.name?.toString() || "",
              os: uaResult.os.name?.toString() || "",
              userAgent: uaResult.ua?.toString() || "",
              osVersion: uaResult.os.version?.toString() || "",
              browserVersion: uaResult.browser.version?.toString() || "",
              deviceModel: uaResult.device.model?.toString() || "",
              ...savedTags,
            })
          );
        }
      }

      this.updateShortcodes();
    } catch (error) {
      console.error("Fetch error:", error);
    }
  },

  replaceDOMShortcodes: function () {
    var regex = new RegExp(/\{\{(.*?)\}\}/, "g");
    findAndReplaceDOMText(window.document.body, {
      find: regex,
      replace: function (_, match) {
        var e = document.createElement("span");
        e.setAttribute("data-sc", match[1]);
        e.appendChild(document.createTextNode(""));
        return e;
      },
    });
  },

  replaceShortcodes: function (str) {
    try {
      const urlSearchParams = new URLSearchParams(window.location.search);

      const paramsShortcodes = Object.fromEntries(urlSearchParams.entries());

      const userId = localStorage.getItem("user_id") || "";

      const shortcodes = {
        user_id: userId,
        referral_d: window.location.hostname,
        ...paramsShortcodes,
      };

      const replaced = str.replace(/\{\{query\.(.*?)\}\}/g, (_, match) => {
        return shortcodes[match.trim()] || "";
      });

      if (replaced.endsWith("?")) {
        return replaced.slice(0, -1);
      }

      return replaced;
    } catch (e) {
      console.error("Failed to replace Shortcodes", e);
      return str;
    }
  },

  updateData: function (data, keyMap) {
    return Object.entries(data).reduce((acc, [key, value]) => {
      // if key exists in map, replace with mapped key
      const newKey = keyMap[key] || key;
      acc[newKey] = value;
      return acc;
    }, {});
  },

  pushDataToRingbaTags: function () {
    const quizData = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_QUIZ_KEY) || "{}"
    );
    const searchParams = new URLSearchParams(window.location.search);

    const anonymousId = getCookie(COOKIE_ANONYMOUS_ID);

    const ringbaData = {
      ...quizData,
      ...Object.fromEntries(searchParams.entries()),
      user_id: localStorage.getItem("user_id") || "",
      session_id: sessionStorage.getItem("session_id") || "",
      anonymous_id: anonymousId || "",
    };

    const keyMap = {
      websiteCity: "city",
      websiteState: "state",
      websiteCountry: "country",
      websiteZip: "zip",
    };

    const { screenResolution, ...filteredRingbaData } = this.updateData(
      ringbaData,
      keyMap
    );

    try {
      const entries = Object.entries(filteredRingbaData);
      window._rgba_tags = window?._rgba_tags || [];

      entries.forEach((i) => {
        window?._rgba_tags?.push({ [i[0]]: i[1] });
      });
    } catch (err) {
      console.error("Error pushing data to Ringba tags:", err);
    }
  },
};

// Start of function to replace DOM shortcodes
var NON_PROSE = {
  script: 1,
  style: 1,
  textarea: 1,
  select: 1,
  option: 1,
  optgroup: 1,
  button: 1,
  svg: 1,
  canvas: 1,
  video: 1,
  audio: 1,
  map: 1,
  object: 1,
  noscript: 1,
  iframe: 1,
};

function isText(n) {
  return n && n.nodeType === Node.TEXT_NODE;
}
function isElem(n) {
  return n && n.nodeType === Node.ELEMENT_NODE;
}

// Collects all text in-order, but also remembers where each character lives,
// so we can turn regex offsets back into DOM ranges.
function aggregateText(root, filterElements) {
  var pieces = []; // alternating strings and nested arrays
  var nodes = []; // flat list of [textNode, startOffsetInAggregate, endOffsetInAggregate]
  var total = 0;

  function walk(node) {
    if (isText(node)) {
      var text = node.data;
      if (text.length) {
        pieces.push(text);
        nodes.push([node, total, total + text.length]);
        total += text.length;
      }
      return;
    }

    if (!isElem(node)) return;

    var tag = node.nodeName.toLowerCase();
    if (NON_PROSE[tag]) return;
    if (typeof filterElements === "function" && !filterElements(node)) return;

    for (var c = node.firstChild; c; c = c.nextSibling) {
      walk(c);
    }
  }

  walk(root);

  return {
    text: pieces.join(""),
    map: nodes, // each entry: [textNode, start, end)
    length: total,
  };
}

// Turn a [start,end) in the aggregate into a DOM Range
function rangeForOffsets(doc, map, start, end) {
  var r = doc.createRange();

  // Find start container/offset
  var i, entry, node, sOffInNode, eOffInNode;

  for (i = 0; i < map.length; i++) {
    entry = map[i]; // [node, s, e)
    if (start >= entry[1] && start <= entry[2]) {
      node = entry[0];
      sOffInNode = start - entry[1];
      r.setStart(node, sOffInNode);
      break;
    }
  }

  // Find end container/offset
  for (; i < map.length; i++) {
    entry = map[i];
    if (end >= entry[1] && end <= entry[2]) {
      node = entry[0];
      eOffInNode = end - entry[1];
      r.setEnd(node, eOffInNode);
      break;
    }
  }

  return r;
}

function findAndReplaceDOMText(root, options) {
  if (!root || !options || !options.find) return;

  var doc = root.ownerDocument || document;
  var re = options.find;
  var replace = options.replace;
  var filterElements = options.filterElements;

  // Build a snapshot of the text & map to nodes once, then
  // do replacements from the END backwards to keep offsets valid.
  var agg = aggregateText(root, filterElements);
  if (!agg.length) return;

  var text = agg.text;
  var matches = [];
  var m;

  // Always work with a global regex to gather all matches.
  var rx = re.global
    ? re
    : new RegExp(
        re.source,
        re.flags ? (re.flags.includes("g") ? re.flags : re.flags + "g") : "g"
      );

  while ((m = rx.exec(text))) {
    if (!m[0].length) {
      // avoid zero-length loops
      rx.lastIndex++;
      continue;
    }
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      array: m,
    });
  }

  if (!matches.length) return;

  // Replace from last to first so earlier offsets remain valid.
  for (var i = matches.length - 1; i >= 0; i--) {
    var hit = matches[i];
    var rng = rangeForOffsets(doc, agg.map, hit.start, hit.end);

    // Call user's replace EXACTLY ONCE per match
    var nodeOrString =
      typeof replace === "function"
        ? replace(undefined, hit.array) // you ignore first arg: (_, match)
        : String(replace);

    var replacementNode;
    if (nodeOrString == null) {
      // if user returns null/undefined, do nothing for this match
      continue;
    } else if (
      isElem(nodeOrString) ||
      (nodeOrString && nodeOrString.nodeType)
    ) {
      replacementNode = nodeOrString;
    } else {
      replacementNode = doc.createTextNode(String(nodeOrString));
    }

    // Swap the matched contents with the replacement node
    rng.deleteContents();
    rng.insertNode(replacementNode);

    // Optional: normalize neighboring text nodes for cleanliness
    var parent = replacementNode.parentNode;
    if (parent) {
      parent.normalize && parent.normalize();
    }
  }
}
