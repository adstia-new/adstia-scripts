
# Adstia-scripts


## jitsu-scripts

Use it from `layout.tsx` file like below:

```
<head>
    <Script
        id="cf-variables"
        dangerouslySetInnerHTML={{
        __html: `
        window.cf_variable = {
            JITSU_EVENT_URL:"${JITUS_EVENT_URL}"
        }
        `,
        }}
    ></Script>
    <Script src="https://cdn.jsdelivr.net/gh/adstia-new/adstia-scripts@main/jitsu-script.js" strategy="afterInteractive" />
</head>
```
