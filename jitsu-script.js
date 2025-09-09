(function () {
  var JITSU_SCRIPT_SRC =
    (window.cf_variable && window.cf_variable.JITSU_EVENT_URL) || "";
  if (!JITSU_SCRIPT_SRC) {
    console.error("❌ Jitsu script URL is missing");
    return;
  }

  function getCookie(name) {
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
  }

  function setCookie(name, value) {
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
      value || ""
    )}; path=/`;
  }

  function loadJitsu(pathname) {
    var prevScript = document.querySelector("script[data-jitsu]");
    if (prevScript) prevScript.remove();

    var script = document.createElement("script");
    script.src = JITSU_SCRIPT_SRC;
    script.async = true;
    script.setAttribute("data-jitsu", "true");
    script.setAttribute("data-init-only", "true");

    var sessionId = sessionStorage.getItem("session_id") || null;
    var userId = localStorage.getItem("user_id") || null;
    var anonymousId = getCookie("__eventn_id");

    if (!sessionId) {
      sessionId = `sess_id_${crypto.randomUUID()}`;
      sessionStorage.setItem("session_id", sessionId);
    }

    if (!userId) {
      userId = `user_id_${crypto.randomUUID()}`;
      localStorage.setItem("user_id", userId);
    }

    if (!anonymousId) {
      anonymousId = crypto.randomUUID();
      setCookie("__eventn_id", anonymousId);
    }

    script.onload = function () {
      if (window.jitsu) {
        window.jitsu.track("page_view", {
          path: pathname,
          session_id: sessionId,
          user_id: localStorage.getItem("user_id") || "",
        });
      }
    };

    // Append to head if body isn't ready
    (document.body || document.head).appendChild(script);
  }

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    loadJitsu(window.location.pathname);
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      loadJitsu(window.location.pathname);
    });
  }

  window.addEventListener("jitsu:route-change", function (e) {
    loadJitsu(e.detail.pathname || window.location.pathname);
  });
})();
