ngapp.service('cloudLayerService', function() {
    let cache, game,
        twoLayers = ['C', 'D'].map(c => `${c}NAM`),
        fourLayers = ['D', 'C', 'A', 'B'].map(c => `${c}NAM`),
        twentyNineLayers = [
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            ':', ';', '<', '=', '>', '?', '@', 'A', 'B', 'C',
            'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'
        ].map(c => `${c}0TX`),
        ctlPaths = {
            'TES4': twoLayers,
            'FO3': fourLayers,
            'FNV': fourLayers,
            'TES5': twentyNineLayers,
            'SSE': twentyNineLayers,
            'FO4': twentyNineLayers
        },
        colorLabels = ['Sunrise', 'Day', 'Sunset', 'Night'];

    // helper functions
    let cacheElement = function(handle, path) {
        if (!cache.hasOwnProperty(path))
            cache[path] = xelib.GetElement(handle, path);
        return cache[path];
    };

    // cloud layer speed functions
    let getSpeedFromData = (handle, index) => {
        let data = cacheElement(handle, 'DATA - ');
        return xelib.GetIntValue(data, `[${index + 1}]`) / 255.0;
    };

    let getSpeedFromONAM = (handle, index) => {
        let cloudSpeed = cacheElement(handle, 'ONAM');
        return xelib.GetIntValue(cloudSpeed, `[${index}]`) / 255.0;
    };

    let getSpeedFromQNAMRNAM = (handle, index) => {
        let xSpeeds = cacheElement(handle, 'Cloud Speeds\\QNAM'),
            ySpeeds = cacheElement(handle, 'Cloud Speeds\\RNAM');
        return {
            x: parseFloat(xelib.GetValue(xSpeeds, `[${index}]`)),
            y: parseFloat(xelib.GetValue(ySpeeds, `[${index}]`))
        }
    };

    let getCloudLayerSpeed = {
        'TES4': getSpeedFromData,
        'FO3': getSpeedFromONAM,
        'FNV': getSpeedFromONAM,
        'TES5': getSpeedFromQNAMRNAM,
        'SSE': getSpeedFromQNAMRNAM,
        'FO4': getSpeedFromQNAMRNAM
    };

    // cloud layer disabled
    let getDisabledFromTexture = texture => {
        return !texture || texture === 'Sky\\Alpha.dds';
    };

    let getDisabledFromFlags = (texture, handle, index) => {
        if (!cache.hasOwnProperty('Disabled'))
            cache['Disabled'] = xelib.GetEnabledFlags(handle, 'NAM1')
                .map(str => parseInt(str, 10));
        return cache['Disabled'].includes(index);
    };

    let getCloudLayerDisabled = {
        'TES4': getDisabledFromTexture,
        'FO3': getDisabledFromTexture,
        'FNV': getDisabledFromTexture,
        'TES5': getDisabledFromFlags,
        'SSE': getDisabledFromFlags,
        'FO4': getDisabledFromFlags
    };

    // cloud layer colors
    let getColor = (handle, index, colorIndex) => {
        let path = `PNAM\\${index}\\${colorIndex}`,
            red = xelib.GetIntValue(handle, `${path}\\Red`),
            green = xelib.GetIntValue(handle, `${path}\\Green`),
            blue = xelib.GetIntValue(handle, `${path}\\Blue`);
        return new Color(`rgb(${red}, ${green}, ${blue})`);
    };

    let getAlpha = (handle, index, colorIndex) => {
        let alphaPath = `JNAM\\${index}\\${colorIndex}`;
        return xelib.GetFloatValue(handle, alphaPath) * 255;
    };

    let buildColors = function(useAlpha) {
        return (handle, index) => {
            return colorLabels.reduce((colors, label, n) => {
                colors[label] = getColor(handle, index, n);
                if (useAlpha)
                    colors[label].setAlpha(getAlpha(handle, index, n));
                return colors;
            }, {});
        }
    };

    let getCloudLayerColors = {
        'TES4': () => null,
        'FO3': buildColors(false),
        'FNV': buildColors(false),
        'TES5': buildColors(true),
        'SSE': buildColors(true),
        'FO4': buildColors(true)
    };

    // main layer builder
    let buildLayer = function(handle, ctlPath, index) {
        let texture = xelib.GetValue(handle, ctlPath),
            speed = getCloudLayerSpeed[game](handle, index),
            disabled = getCloudLayerDisabled[game](texture, handle, index),
            colors = getCloudLayerColors[game](handle, index);
        return { index, disabled, speed, texture, colors };
    };

    // public api
    this.getLayers = function(handle) {
        cache = {};
        game = xelib.GetGlobal('AppName');
        return ctlPaths[game].map((path, i) => buildLayer(handle, path, i));
    };
});