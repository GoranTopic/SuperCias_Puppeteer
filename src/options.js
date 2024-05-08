const options = {
    "browser": {
        "headless": true,
        "slowMo": 0,
        "devtools": false,
        "timeout": 10000000, 
        "protocolTimeout": 1000000, 
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

