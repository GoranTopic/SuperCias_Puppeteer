export default {
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
    },
    "storage": "./storage/",
    "files_path": "./storage/files/",
    "debugging": false,
    "proxyRotation": false,
    "saveCaptchan": false,
    "max_tries": 15,
    "pdf_missing_threshold": 0,
    "minutesToTimeout": 10,
    "documents": {
        "DocumentosGenerales": {
            "filters": {
                "documento": "",
                "fecha": "",
                "nombre": "",
                "cargo": "" // "Presidente"
            }
        },
        "DocumentosJuridicos": {
            "filters": {
                "nombre de acto juridico": "",
                "documento": "",
                "fecha": "" // "2021"
            }
        },
        "DocumentosEconomicos": {
            "filters": {
                "documento": "",
                "fecha": ""
            }
        }
    }
}
