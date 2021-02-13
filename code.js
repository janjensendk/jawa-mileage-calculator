
function getPossibleConfigs() {
    return ["4-8", "5-10", "6-18", "6-12", "8-12", "10-15", "10-12", "10-8"];
}

function getQueryParams() {
    const result = new Map();
    // Format: "?field1=value1&field2=value2&field3=value3"
    const trimmed = window.location.search.substr(1).trim();
    const pairs = trimmed.split("&");
    for (let i = 0; i < pairs.length; i++) {
        if (pairs[i].length == 0) {
            continue;
        }
        const keyVal = pairs[i].split("=");
        if (keyVal.length == 2) {
            result.set(keyVal[0].toLowerCase().trim(), keyVal[1].toLowerCase().trim());
        }
    }
    return result;
}

function getDeltaDays(startDate, endDate) {
    return (endDate - startDate) / (24 * 60 * 60 * 1000);
}

function do_calculation(startDate, targetMonths, targetMileage) {
    const BUFFER_DAYS = 14;

    const endDate = new Date(startDate.getTime());
    endDate.setMonth(endDate.getMonth() + targetMonths);
    const totalDays = getDeltaDays(startDate, endDate);
    const idealMileagePerDay = (targetMileage / totalDays);
    const daysElapsed = getDeltaDays(startDate, new Date());
    const daysLeft = Math.round(totalDays - daysElapsed);
    const canReturn = Math.abs(daysLeft) <= BUFFER_DAYS;
    const daysUntilCanReturn = daysLeft - BUFFER_DAYS;
    const daysUntilLatestReturn = daysLeft + BUFFER_DAYS;

    if (daysElapsed > 0) {
        if (canReturn) {
            return {desc: "The car can be returned now", footer: "The ideal mileage would be ~" + targetMileage + " km"};
        } else {
            const idealMileage = idealMileagePerDay * daysElapsed;
            const km = Math.floor(idealMileage) + ".";
            const meter = String(idealMileage).split('.')[1].substring(0, 3);
            const info = daysUntilCanReturn > 0 ?
                        ("Approx. " + daysUntilCanReturn + " day(s) until earliest return date") :
                        ("Time exceeded with " + Math.abs(daysUntilLatestReturn) + " day(s), assuming contract extension");
            return {desc: "Today's ideal mileage:", km: km, meter: meter, footer: info};
        }
    } else {
        return {desc: "No car yet", footer: "Expected arrival in " + Math.ceil(Math.abs(daysElapsed)) + " day(s)"};
    }
}

function getMonthsFromConfig(config) {
    return Number.parseInt(config.split("-")[0]);
}

function getMileageFromConfig(config) {
    return Number.parseInt(config.split("-")[1]) * 1000;
}

function getDescriptionFromConfig(config) {
    const months = getMonthsFromConfig(config);
    const mileage = getMileageFromConfig(config);
    return "" + months + " months / " + mileage + " km";
}

function addConfigOptions(selectElement, defaultConfig) {
    let configs = getPossibleConfigs();

    if (defaultConfig && configs.includes(defaultConfig)) {
        configs = configs.filter(item => item !== defaultConfig);
        configs.unshift(defaultConfig);
    }

    for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        option = document.createElement('option');
        option.setAttribute('value', config);
        option.appendChild(document.createTextNode(getDescriptionFromConfig(config)));
        selectElement.appendChild(option);
    }
}