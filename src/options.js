const options = {
    "browser": {
        "headless": false,
        "slowMo": 0,
        "devtools": false,
        "timeout": 100000,
        "excludeSwitches": "enable-automation",
        "args": [
            "--no-sandbox",
            "--disable-web-security",
            "--disable-setuid-sandbox",
            "--allow-file-access-from-files"
        ]
    }
}

export default options;

