const initVoluumLanderScript = (url) => {
  try {
    (function (d, c, k, l, r, t, g, u, A, e, m, v, B, a, n, p, h, q, w, D, x) {
      function y() {
        for (
          var f = c.querySelectorAll(".dtpcnt"), b = 0, a = f.length;
          b < a;
          b++
        )
          f[b][u] = f[b][u].replace(/(^|\s+)dtpcnt($|\s+)/g, "");
      }
      function C(a, b, d, e) {
        var f = new Date();
        f.setTime(f.getTime() + (e || 864e5));
        c.cookie =
          a +
          "=" +
          b +
          "; " +
          d +
          "samesite=Strict; expires=" +
          f.toGMTString() +
          "; path=/";
        k.setItem(a, b);
        k.setItem(a + "-expires", f.getTime());
      }
      function z(a) {
        var b = c.cookie.match(new RegExp("(^| )" + a + "=([^;]+)"));
        return b
          ? b.pop()
          : k.getItem(a + "-expires") &&
            +k.getItem(a + "-expires") > new Date().getTime()
          ? k.getItem(a)
          : null;
      }
      x = "https:" === d.location.protocol ? "secure; " : "";
      d[e] ||
        ((d[e] = function () {
          (d[e].q = d[e].q || []).push(arguments);
        }),
        (p = c[r]),
        (c[r] = function () {
          p && p.apply(this, arguments);
          if (
            d[e] &&
            !d[e].hasOwnProperty("params") &&
            /loaded|interactive|complete/.test(c.readyState)
          )
            for (; (a = c[t][m++]); )
              /\/?click\/?($|(\/[0-9]+)?$)/.test(a.pathname) &&
                (a[g] =
                  "javascrip" +
                  d.postMessage.toString().slice(4, 5) +
                  ":" +
                  e +
                  '.l="' +
                  a[g] +
                  '",void 0');
        }),
        setTimeout(function () {
          (q = /[?&]cpid(=([^&#]*)|&|#|$)/.exec(d.location.href)) &&
            q[2] &&
            ((h = q[2]), (w = z("vl-" + h)));
          var f = z("vl-cep"),
            b = location[g];
          if (
            "savedCep" === B &&
            f &&
            (!h || "undefined" === typeof h) &&
            0 > b.indexOf("cep=")
          ) {
            var e = -1 < b.indexOf("?") ? "&" : "?";
            b += e + f;
          }
          a = c.createElement("script");
          n = c.scripts[0];
          a.defer = 1;
          a.src =
            v +
            (-1 === v.indexOf("?") ? "?" : "&") +
            "lpref=" +
            l(c.referrer) +
            "&lpurl=" +
            l(b) +
            "&lpt=" +
            l(c.title) +
            "&vtm=" +
            new Date().getTime() +
            (w ? "&uw=no" : "");
          a[A] = function () {
            for (m = 0; (a = c[t][m++]); )
              /dtpCallback\.l/.test(a[g]) &&
                (a[g] = decodeURIComponent(a[g]).match(
                  /dtpCallback\.l="([^"]+)/
                )[1]);
            y();
          };
          n.parentNode.insertBefore(a, n);
          h && C("vl-" + h, "1", x);
        }, 0),
        setTimeout(y, 7e3));
    })(
      window,
      document,
      localStorage,
      encodeURIComponent,
      "onreadystatechange",
      "links",
      "href",
      "className",
      "onerror",
      "dtpCallback",
      0,
      url,
      "savedCep"
    );
    var clickId;
    window.dtpCallback(() => {
      clickId = window.dtpCallback.params.click_id;
      sessionStorage.setItem("clickId", clickId);
    });
  } catch (e) {
    console.error("Failed to load voluum script", e);
  }
};

const initVoluumOfferScript = (url) => {
  try {
    (function (c, d, f, h, t, b, n, u, k, l, m, e, p, v, q) {
      function r(a) {
        var c = d.cookie.match(new RegExp("(^| )" + a + "=([^;]+)"));
        return c
          ? c.pop()
          : f.getItem(a + "-expires") &&
            +f.getItem(a + "-expires") > new Date().getTime()
          ? f.getItem(a)
          : null;
      }
      q = "https:" === c.location.protocol ? "secure; " : "";
      c[b] ||
        ((c[b] = function (a) {
          c[b].state.callbackQueue.push(a);
        }),
        (c[b].state = { callbackQueue: [] }),
        (c[b].registerConversion = function (a) {
          c[b].state.callbackQueue.push(a);
        }),
        (function () {
          (m = /[?&]cpid(=([^&#]*)|&|#|$)/.exec(c.location.href)) &&
            m[2] &&
            ((e = m[2]), (p = r("vl-" + e)));
          var a = r("vl-cid"),
            b;
          "savedCid" !== u || !a || (e && "undefined" !== typeof e) || (b = a);
          k = d.createElement("script");
          l = d.scripts[0];
          k.src =
            n +
            (-1 === n.indexOf("?") ? "?" : "&") +
            "oref=" +
            h(d.referrer) +
            "&ourl=" +
            h(location[t]) +
            "&opt=" +
            h(d.title) +
            "&vtm=" +
            new Date().getTime() +
            (b ? "&cid=" + b : "") +
            (p ? "&uw=no" : "");
          l.parentNode.insertBefore(k, l);
          if (e) {
            a = "vl-" + e;
            b = q;
            var g = new Date();
            g.setTime(g.getTime() + 864e5);
            d.cookie =
              a +
              "=1; " +
              b +
              "samesite=Strict; expires=" +
              g.toGMTString() +
              "; path=/";
            f.setItem(a, "1");
            f.setItem(a + "-expires", g.getTime());
          }
        })());
    })(
      window,
      document,
      localStorage,
      encodeURIComponent,
      "href",
      "dtpCallback",
      url,
      "savedCid"
    );
    var clickId;
    dtpCallback(() => {
      clickId = dtpCallback.getClickID();
      sessionStorage.setItem("clickId", clickId);
    });
  } catch (e) {
    console.error("Failed to load voluum script", e);
  }
};

window.VoluumScripts = {
  init: (url, currentSlug, landingSlugs, offerSlugs) => {
    const urlWithoutTrailingSlash = url?.endsWith("/") ? url.slice(0, -1) : url;

    if (landingSlugs.includes(currentSlug)) {
      initVoluumLanderScript(urlWithoutTrailingSlash + "/d/.js");
    } else if (offerSlugs.includes(currentSlug)) {
      initVoluumOfferScript(urlWithoutTrailingSlash + "/d/.js");
    }

    // meta tag for voluum
    const headTag = document.getElementsByTagName("HEAD")[0];
    const volumMetaTag = document.createElement("META");
    volumMetaTag.setAttribute("http-equiv", "delegate-ch");
    volumMetaTag.setAttribute(
      "content",
      `sec-ch-ua ${url}; sec-ch-ua-mobile ${url}; sec-ch-ua-arch ${url}; sec-ch-ua-model ${url}; sec-ch-ua-platform ${url}; sec-ch-ua-platform-version ${url}; sec-ch-ua-bitness ${url}; sec-ch-ua-full-version-list ${url}; sec-ch-ua-full-version ${url}`
    );
    headTag.appendChild(volumMetaTag);

    // noscript tag for voluum
    const noScriptUrl = `${urlWithoutTrailingSlash}/d/.js?noscript=true&lpurl=`;
    const noscript = document.createElement("noscript");
    const link = document.createElement("link");
    link.href = noScriptUrl;
    link.rel = "stylesheet";
    noscript.appendChild(link);
    document.body.prepend(noscript);
  },
};
