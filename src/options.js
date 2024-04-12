const browser_options = {
    "browser": {
        "headless": true,
        "slowMo": 0,
        "devtools": false,
        "timeout": 1000000000,
        "excludeSwitches": "enable-automation",
        "args": [
            "--no-sandbox",
            "--disable-web-security",
            "--disable-setuid-sandbox",
            "--allow-file-access-from-files"
        ]
    }
}

export { browser_options }
