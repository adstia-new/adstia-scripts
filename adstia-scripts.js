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

const findAndReplaceDOMShortcodes = () => {
  const patterns = [/\{\{(.*?)\}\}/];

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) =>
        patterns.some((pattern) => pattern.test(node.textContent || ""))
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT,
    }
  );

  while (walker.nextNode()) {
    const textNode = walker.currentNode;
    const parent = textNode.parentElement;

    if (!parent || !parent.contains(textNode)) return;

    parent.innerHTML = parent.textContent.replaceAll(
      /\{\{(.*?)\}\}/g,
      (_, match) => {
        const storedShortcodes = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_QUIZ_KEY) || "{}"
        );

        const queryParams = new URLSearchParams(window.location.search);

        if (queryParams.get(match.trim())) {
          return queryParams.get(match.trim());
        }
        if (storedShortcodes[match.trim()]) {
          return storedShortcodes[match.trim()];
        }

        return `<span data-sc="${match.trim()}"></span>`;
      }
    );
  }
};

const saveUAParserValuesToLocalStorage = async () => {
  try {
    const uaResult = UAParser();
    const savedTags = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_QUIZ_KEY) || "{}"
    );

    const uaClientHints = await uaResult?.withClientHints();

    localStorage.setItem(
      LOCAL_STORAGE_QUIZ_KEY,
      JSON.stringify({
        device:
          uaClientHints?.device?.toString() !== "undefined"
            ? uaClientHints?.device?.toString()
            : uaResult.device.model?.toString() || "",
        browser:
          uaClientHints?.browser?.toString() !== "undefined"
            ? uaClientHints?.browser?.toString()
            : uaResult.browser.name?.toString() || "",
        os:
          uaClientHints?.os?.toString() !== "undefined"
            ? uaClientHints?.os?.toString()
            : uaResult.os.name?.toString() || "",
        userAgent:
          uaClientHints?.ua.toString() !== "undefined"
            ? uaClientHints?.ua.toString()
            : uaResult.ua?.toString() || window.navigator.userAgent || "",
        osVersion:
          uaClientHints?.os?.version?.toString() ||
          uaResult.os.version?.toString() ||
          "",
        browserVersion:
          uaClientHints?.browser?.version?.toString() ||
          uaResult.browser.version?.toString() ||
          "",
        deviceModel:
          uaClientHints?.device?.model?.toString() ||
          uaResult.device.model?.toString() ||
          "",

        ...savedTags,
      })
    );
  } catch (e) {
    console.error("Failed to fetch User Agent");
  }
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

    // Fire GTM pageView event
    window.dataLayer.push({
      event: "pageView",
      data: {
        domainName,
        domainSlug,
        finalUrl,
      },
    });
  },

  updateShortcodes: () => {
    const spans = document.querySelectorAll("span[data-sc]");
    spans.forEach((span) => {
      const key = span.getAttribute("data-sc").trim();
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
    await saveUAParserValuesToLocalStorage();

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

        if (!storedData.ipZip) {
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
    findAndReplaceDOMShortcodes();
  },

  replaceShortcodes: function (str) {
    try {
      if (typeof window !== "undefined") {
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
      }

      return "";
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

      setTimeout(() => {
        this.pushDataToRingbaTags();
      }, 1500);
    } catch (err) {
      console.error("Error pushing data to Ringba tags:", err);
    }
  },

  saveFbPixelToQuizValues: () => {
    const fbp = getCookie("_fbp");
    const fbc = getCookie("_fbc");

    const storedQuizValues = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_QUIZ_KEY) || "{}"
    );

    localStorage.setItem(
      LOCAL_STORAGE_QUIZ_KEY,
      JSON.stringify({
        ...storedQuizValues,
        _fbp: fbp ?? "",
        _fbc: fbc ?? "",
      })
    );
  },
};
