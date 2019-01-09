ngapp.controller('editWeatherCloudsController', function($scope) {
    $scope.disabledLayers = [];
    $scope.cloudLayers = [];

    let ctlChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';',
        '<', '=', '>', '?', '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
        'I', 'J', 'K', 'L'];

    let getColor = function(colorHandle, alphaHandle, path) {
        let alpha = xelib.GetFloatValue(alphaHandle, path),
            red = xelib.GetIntValue(colorHandle, `${path}\\Red`),
            green = xelib.GetIntValue(colorHandle, `${path}\\Green`),
            blue = xelib.GetIntValue(colorHandle, `${path}\\Blue`);
        return new Color(`rgba(${red}, ${green}, ${blue}, ${alpha})`);
    };

    let buildLayer = function(disabledLayers, index, elements) {
        let disabled = disabledLayers.includes(index),
            a = disabled ? $scope.disabledLayers : $scope.cloudLayers,
            ctlPath = index < ctlChars.length && `${ctlChars[index]}0TX`,
            {colors, alphas, xSpeeds, ySpeeds} = elements,
            alphaHandle = xelib.GetElement(alphas, `[${index}]`),
            colorHandle = xelib.GetElement(colors, `[${index}]`);
        a.push({
            index,
            disabled,
            xSpeed: parseFloat(xelib.GetValue(xSpeeds, `[${index}]`)),
            ySpeed: parseFloat(xelib.GetValue(ySpeeds, `[${index}]`)),
            texture: ctlPath && xelib.GetValue($scope.handle, ctlPath),
            sunriseColor: getColor(colorHandle, alphaHandle, 'Sunrise'),
            dayColor: getColor(colorHandle, alphaHandle, 'Day'),
            sunsetColor: getColor(colorHandle, alphaHandle, 'Sunset'),
            nightColor: getColor(colorHandle, alphaHandle, 'Night')
        });
    };

    let loadLayers = function() {
        let mapping = {
            ySpeeds: 'Cloud Speed\\RNAM',
            xSpeeds: 'Cloud Speed\\QNAM',
            alphas: 'JNAM',
            colors: 'PNAM'
        };
        let elements = {};
        Object.keys(mapping).forEach(key => {
            elements[key] = xelib.GetElement($scope.handle, mapping[key]);
        });
        let disabledLayers = xelib.GetEnabledFlags($scope.handle, 'NAM1')
            .map(str => parseInt(str, 10));
        for (let i = 0; i < 32; i++)
            buildLayer(disabledLayers, i, elements);
    };

    $scope.addLayer = function(item) {
        let index = $scope.disabledLayers.findIndex(layer => {
            return layer.index === item.index;
        });
        let layerToAdd = $scope.disabledLayers.splice(index, 1)[0];
        layerToAdd.disabled = false;
        $scope.cloudLayers.push(layerToAdd);
        $scope.cloudLayers.sortOnKey('index');
    };

    $scope.disableLayer = function(index) {
        let layerToAdd = $scope.cloudLayers.splice(index, 1)[0];
        layerToAdd.disabled = true;
        $scope.disabledLayers.push(layerToAdd);
    };

    // initialization
    loadLayers();
});