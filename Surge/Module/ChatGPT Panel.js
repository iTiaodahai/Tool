let url = "http://chat.openai.com/cdn-cgi/trace";
let tf = ["T1", "XX", "AL", "DZ", "AD", "AO", "AG", "AR", "AM", "AU", "AT", "AZ", "BS", "BD", "BB", "BE", "BZ", "BJ", "BT", "BA", "BW", "BR", "BG", "BF", "CV", "CA", "CL", "CO", "KM", "CR", "HR", "CY", "DK", "DJ", "DM", "DO", "EC", "SV", "EE", "FJ", "FI", "FR", "GA", "GM", "GE", "DE", "GH", "GR", "GD", "GT", "GN", "GW", "GY", "HT", "HN", "HU", "IS", "IN", "ID", "IQ", "IE", "IL", "IT", "JM", "JP", "JO", "KZ", "KE", "KI", "KW", "KG", "LV", "LB", "LS", "LR", "LI", "LT", "LU", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MR", "MU", "MX", "MC", "MN", "ME", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NZ", "NI", "NE", "NG", "MK", "NO", "OM", "PK", "PW", "PA", "PG", "PE", "PH", "PL", "PT", "QA", "RO", "RW", "KN", "LC", "VC", "WS", "SM", "ST", "SN", "RS", "SC", "SL", "SG", "SK", "SI", "SB", "ZA", "ES", "LK", "SR", "SE", "CH", "TH", "TG", "TO", "TT", "TN", "TR", "TV", "UG", "AE", "US", "UY", "VU", "ZM", "BO", "BN", "CG", "CZ", "VA", "FM", "MD", "PS", "KR", "TW", "TZ", "TL", "GB"];
let tff = ["plus", "on"];

// 处理 argument 参数
let titlediy, icon, iconerr, iconColor, iconerrColor;
if (typeof $argument !== 'undefined') {
    const args = $argument.split('&');
    for (let i = 0; i < args.length; i++) {
        const [key, value] = args[i].split('=');
        if (key === 'title') {
            titlediy = value;
        } else if (key === 'icon') {
            icon = value;
        } else if (key === 'iconerr') {
            iconerr = value;
        } else if (key === 'icon-color') {
            iconColor = value;
        } else if (key === 'iconerr-color') {
            iconerrColor = value;
        }
    }
}

// 发送 HTTP 请求获取所在地信息
$httpClient.get(url, function(error, response, data) {
    if (error) {
        console.error("HTTP Request Failed:", error);
        $done();
        return;
    }

    if (!data) {
        console.error("No data received from server");
        $done();
        return;
    }

    let lines = data.split("\n");
    let cf = lines.reduce((acc, line) => {
        let [key, value] = line.split("=");
        acc[key] = value;
        return acc;
    }, {});

    if (!cf.loc) {
        console.error("Location not found in server response");
        $done();
        return;
    }

    let ip = cf.ip;
    let warp = cf.warp;
    let loc = getCountryFlagEmoji(cf.loc) + cf.loc;

    // 判断 ChatGPT 是否支持该国家/地区
    let l = tf.indexOf(cf.loc);
    let gpt, iconUsed, iconCol;
    if (l !== -1) {
        gpt = "GPT: ✔️";
        iconUsed = icon ? icon : undefined;
        iconCol = iconColor ? iconColor : undefined;

    } else {
        gpt = "GPT: ✖️";
        iconUsed = iconerr ? iconerr : undefined;
        iconCol = iconerrColor ? iconerrColor : undefined;
    }

    // 获取 Warp 状态
    let w = tff.indexOf(warp);
    let warps = (w !== -1) ? "✔️" : "✖️";

    // 组装通知数据
    let body = {
        title: titlediy ? titlediy : 'ChatGPT',
        content: `${gpt}   区域: ${loc}`
    };

    if (iconUsed) {
        body.icon = iconUsed;
    }
    if (iconCol) {
        body['icon-color'] = iconCol;
    }

    $done(body);
});

// 获取国旗 Emoji 函数
function getCountryFlagEmoji(countryCode) {
    if (!countryCode || typeof countryCode !== 'string') {
        console.error("Invalid countryCode:", countryCode);
        return "🌍";
    }
    if (countryCode.toUpperCase() === 'TW') {
        countryCode = 'CN';
    }
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}
