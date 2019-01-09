/* global ngapp, xelib, modulePath */
ngapp.service('recentService', function() {
    let dictionary = {};

    this.store = function(key, max) {
        if (dictionary.hasOwnProperty(key)) return;
        dictionary[key] = { max, items: [] };
    };

    this.get = function(key) {
        return dictionary[key].items.slice();
    };

    this.add = function(key, value) {
        let {items, max} = dictionary[key];
        let n = items.indexOf(value);
        (n === -1) ? items.length >= max && items.pop() : items.splice(n, 1);
        item.shift(value);
    };
});
ngapp.directive('alphaInput', function() {
    return {
        restrict: 'E',
        scope: {
            color: '='
        },
        template: '<input type="text" ng-model="alphaText" />',
        link: function(scope, element) {
            element[0].title = 'Alpha';

            let thaw = () => {
                if (!scope.freeze) return;
                scope.freeze = false;
                return true;
            };

            scope.$watch('color', function() {
                if (thaw()) return;
                scope.freeze = true;
                scope.alphaText = scope.color.getAlpha();
            });

            scope.$watch('alphaText', function() {
                if (thaw()) return;
                scope.freeze = true;
                try {
                    scope.color.setAlpha(parseFloat(scope.alphaText));
                } catch(x) {}
            });
        }
    }
});
ngapp.directive('colorSelector', function() {
    return {
        restrict: 'E',
        scope: {
            color: '=',
            key: '@'
        },
        templateUrl: `${moduleUrl}/partials/colorSelector.html`,
        controller: 'colorSelectorController'
    }
});

ngapp.controller('colorSelectorController', function($scope, recentService) {
    recentService.store($scope.key, 15);
    $scope.recentColors = recentService.get($scope.key);

    $scope.setCustomTexture = function({customColor}) {
        $scope.color = customColor;
        recentService.add($scope.key, $scope.color);
    };

    $scope.setColor = function(item) {
        $scope.color = item.color;
        recentService.add($scope.key, $scope.color);
    };
});
ngapp.directive('textureSelector', function() {
    return {
        restrict: 'E',
        scope: {
            texture: '=',
            key: '@'
        },
        templateUrl: `${moduleUrl}/partials/textureSelector.html`,
        controller: 'textureSelectorController'
    }
});

ngapp.controller('textureSelectorController', function($scope, recentService) {
    recentService.store($scope.key, 10);
    $scope.recentTextures = recentService.get($scope.key);

    $scope.setCustomTexture = function({customItem}) {
        $scope.texture = customItem.filePath;
        recentService.add($scope.key, $scope.texture);
    };

    $scope.setTexture = function(item) {
        $scope.texture = item.filePath;
        recentService.add($scope.key, $scope.texture);
    };
});
ngapp.controller('editWeatherModalController', function($scope, tabService) {
    // initialization
    let node = $scope.modalOptions.nodes.last();
    $scope.handle = node.handle;
    $scope.name = xelib.Name($scope.handle);
    xelib.WithHandle(xelib.GetElementFile($scope.handle), file => {
        $scope.filename = xelib.Name(file);
    });

    $scope.tabs = [{
        label: 'Clouds',
        templateUrl: `${moduleUrl}/partials/editWeather/clouds.html`,
        controller: 'editWeatherCloudsController'
    }, {
        label: 'Colors',
        templateUrl: `${moduleUrl}/partials/editWeather/colors.html`
    }, {
        label: 'Directional Ambient Lighting Colors',
        templateUrl: `${moduleUrl}/partials/editWeather/dalc.html`
    }];

    tabService.buildFunctions($scope);
});
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

ngapp.run(function(contextMenuFactory, nodeHelpers) {
    let {isRecordNode} = nodeHelpers,
        {treeViewItems} = contextMenuFactory;

    let isWeather = node => xelib.Signature(node.handle) === 'WTHR';

    treeViewItems.insertAfter(item => item.id === 'Open in new', {
        id: 'Edit weather',
        visible: (scope) => {
            let node = scope.selectedNodes.last();
            return node && isRecordNode(node) && isWeather(node);
        },
        build: (scope, items) => {
            items.push({
                label: 'Edit weather',
                hotkey: 'Ctrl+E',
                callback: () => scope.$emit('openModal', 'editWeather', {
                    nodes: scope.selectedNodes,
                    basePath: `${moduleUrl}/partials`
                })
            });
        }
    });
});