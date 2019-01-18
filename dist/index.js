/* global ngapp, xelib, modulePath */
class Weather {
    static get colorLabels() {
        return ['Sunrise', 'Day', 'Sunset', 'Night'];
    }

    constructor(handle) {
        this.handle = handle;
        this.cache = {};
    }

    release() {
        Object.values(this.cache).forEach(id => xelib.Release(id));
    }

    cacheElement(path) {
        if (!this.cache.hasOwnProperty(path))
            this.cache[path] = xelib.GetElement(this.handle, path);
        return this.cache[path];
    }

    getRgb(handle, path) {
        let red = xelib.GetIntValue(handle, `${path}\\Red`),
            green = xelib.GetIntValue(handle, `${path}\\Green`),
            blue = xelib.GetIntValue(handle, `${path}\\Blue`);
        return [red, green, blue];
    }

    setRgb(path, color) {
        xelib.SetIntValue(this.handle, `${path}\\Red`, color.channel.red);
        xelib.SetIntValue(this.handle, `${path}\\Green`, color.channel.green);
        xelib.SetIntValue(this.handle, `${path}\\Blue`, color.channel.blue);
    }

    getCloudLayers() {
        this.cloudLayers = this.cloudTexturePaths.map((path, index) => {
            let texture = xelib.GetValue(this.handle, path),
                speed = this.getCloudLayerSpeed(index),
                disabled = this.getCloudLayerDisabled(index, texture),
                colors = this.getCloudLayerColors(index);
            return { index, disabled, speed, texture, colors };
        });
        return this.cloudLayers;
    }

    getDALC() {
        return this.dalc = null;
    }

    saveDALC() {}

    getWeatherColors() {
        this.colors = [];
        xelib.WithEachHandle(xelib.GetElements(this.handle, 'NAM0'), h => {
            let group = { label: xelib.Name(h) };
            Weather.colorLabels.forEach(label => {
                let [r, g, b] = this.getRgb(h, label);
                group[label] = new Color(`rgb(${r}, ${g}, ${b})`);
            });
            this.colors.push(group);
        });
        return this.colors;
    }

    saveWeatherColors() {
        this.colors.forEach(group => {
            Weather.colorLabels.forEach(label => {
                this.setRgb(`NAM0\\${group.label}\\${label}`, group[label]);
            });
        });
    }

    saveCloudLayerTexture(layer) {
        let texturePath = this.cloudTexturePaths[layer.index];
        xelib.AddElementValue(this.handle, texturePath, layer.texture);
    }

    saveCloudLayerSpeed() {}
    saveCloudLayerDisabled() {}
    saveCloudLayerColors() {}

    saveCloudLayers() {
        this.cloudLayers.forEach(layer => {
            if (layer.disabled) return;
            this.saveCloudLayerTexture(layer);
            this.saveCloudLayerSpeed(layer);
            this.saveCloudLayerDisabled(layer);
            this.saveCloudLayerColors(layer);
        });
    }

    save() {
        this.saveCloudLayers();
        this.saveWeatherColors();
        this.saveDALC();
    }
}
class TES4Weather extends Weather {
    constructor(handle) {
        super(handle);
        this.cloudTexturePaths = ['CNAM', 'DNAM'];
    }

    getCloudLayerSpeed(layerIndex) {
        let data = this.cacheElement('DATA - ');
        return xelib.GetIntValue(data, `[${layerIndex + 1}]`) / 255.0;
    }

    saveCloudLayerSpeed(layer) {
        let data = this.cacheElement('DATA - '),
            speedValue = Math.round(layer.speed * 255);
        xelib.SetIntValue(data, `[${layer.index + 1}]`, speedValue) ;
    }

    getCloudLayerDisabled(layerIndex, texture) {
        return !texture;
    }

    getCloudLayerColors() {
        return null;
    }
}
class FO3Weather extends Weather {
    constructor(handle) {
        super(handle);
        this.cloudTexturePaths = ['DNAM', 'CNAM', 'ANAM', 'BNAM'];
    }

    getCloudLayerSpeed(layerIndex) {
        let cloudSpeed = this.cacheElement('ONAM');
        return xelib.GetIntValue(cloudSpeed, `[${layerIndex}]`) / 255.0;
    }

    saveCloudLayerSpeed(layer) {
        let cloudSpeed = this.cacheElement('ONAM'),
            speedValue = Math.round(layer.speed * 255);
        xelib.SetIntValue(cloudSpeed, `[${layer.index}]`, speedValue);
    }

    getCloudLayerDisabled(layerIndex, texture) {
        return !texture;
    }

    getCloudLayerColor(layerIndex, colorIndex) {
        let path = `PNAM\\[${layerIndex}]\\[${colorIndex}]`,
            red = xelib.GetIntValue(this.handle, `${path}\\Red`),
            green = xelib.GetIntValue(this.handle, `${path}\\Green`),
            blue = xelib.GetIntValue(this.handle, `${path}\\Blue`);
        return new Color(`rgb(${red}, ${green}, ${blue})`);
    }

    saveCloudLayerColor(layer, label, colorIndex) {
        let path = `PNAM\\[${layer.index}]\\[${colorIndex}]`;
        this.setRgb(path, layer.colors[label]);
    }

    getCloudLayerColors(layerIndex) {
        return Weather.colorLabels.reduce((colors, label, colorIndex) => {
            colors[label] = this.getCloudLayerColor(layerIndex, colorIndex);
            return colors;
        }, {});
    }

    saveCloudLayerColors(layer) {
        Weather.colorLabels.forEach((label, index) => {
            this.saveCloudLayerColor(layer, label, index);
        });
    }
}
class FNVWeather extends FO3Weather {}
class TES5Weather extends Weather {
    constructor(handle) {
        super(handle);
        this.cloudTexturePaths = [
            '00TX', '10TX', '20TX', '30TX', '40TX', '50TX', '60TX', '70TX',
            '80TX', '90TX', ':0TX', ';0TX', '<0TX', '=0TX', '>0TX', '?0TX',
            '@0TX', 'A0TX', 'B0TX', 'C0TX', 'D0TX', 'E0TX', 'F0TX', 'G0TX',
            'H0TX', 'I0TX', 'J0TX', 'K0TX', 'L0TX'
        ];
        this.dalcPaths = [
            'Directional\\X+', 'Directional\\X-', 'Directional\\Y+',
            'Directional\\Y-', 'Directional\\Z+', 'Directional\\Z-'
        ];
    }

    getCloudLayerSpeed(layerIndex) {
        let xSpeeds = this.cacheElement('Cloud Speed\\QNAM'),
            ySpeeds = this.cacheElement('Cloud Speed\\RNAM');
        return {
            x: parseFloat(xelib.GetValue(xSpeeds, `[${layerIndex}]`)),
            y: parseFloat(xelib.GetValue(ySpeeds, `[${layerIndex}]`))
        }
    }

    saveCloudLayerSpeed(layer) {
        let xSpeeds = this.cacheElement('Cloud Speed\\QNAM'),
            ySpeeds = this.cacheElement('Cloud Speed\\RNAM');
        xelib.SetValue(xSpeeds, `[${layer.index}]`, `${layer.speed.x}`);
        xelib.SetValue(ySpeeds, `[${layer.index}]`, `${layer.speed.y}`);
    }

    getDisabledCloudLayers() {
        return xelib.GetEnabledFlags(this.handle, 'NAM1')
            .map(str => parseInt(str, 10))
    }

    getCloudLayerDisabled(layerIndex) {
        if (!this.hasOwnProperty('disabledLayers'))
            this.disabledLayers = this.getDisabledCloudLayers();
        return this.disabledLayers.includes(layerIndex);
    }

    saveCloudLayerDisabled(layer) {
        xelib.SetFlag(this.handle, 'NAM1', `${layer.index}`, layer.disabled);
    }

    getCloudLayerColor(layerIndex, colorIndex) {
        let path = `PNAM\\[${layerIndex}]\\[${colorIndex}]`,
            alphaPath = `JNAM\\[${layerIndex}]\\[${colorIndex}]`,
            [r, g, b] = this.getRgb(this.handle, path),
            alpha = xelib.GetFloatValue(this.handle, alphaPath);
        return new Color(`rgba(${r}, ${g}, ${b}, ${alpha})`);
    }

    saveCloudLayerColor(layer, label, colorIndex) {
        let path = `PNAM\\[${layer.index}]\\[${colorIndex}]`,
            alphaPath = `JNAM\\[${layer.index}]\\[${colorIndex}]`,
            color = layer.colors[label],
            alphaValue = color.channel.alpha / 255.0;
        this.setRgb(path, color);
        xelib.SetFloatValue(this.handle, alphaPath, alphaValue);
    }

    getCloudLayerColors(layerIndex) {
        return Weather.colorLabels.reduce((colors, label, colorIndex) => {
            colors[label] = this.getCloudLayerColor(layerIndex, colorIndex);
            return colors;
        }, {});
    }

    saveCloudLayerColors(layer) {
        Weather.colorLabels.forEach((label, index) => {
            this.saveCloudLayerColor(layer, label, index);
        });
    }

    getDALC() {
        this.dalc = this.dalcPaths.map(path => ({
            path: path.replace('Directional\\', '')
        }));
        let path = 'Directional Ambient Lighting Colors';
        xelib.WithEachHandle(xelib.GetElements(this.handle, path), h => {
            let label = xelib.Name(h).replace('DALC - ', '');
            this.dalcPaths.forEach((path, index) => {
                let [r, g, b] = this.getRgb(h, path);
                this.dalc[index][label] = new Color(`rgb(${r}, ${g}, ${b})`);
            });
        });
        return this.dalc;
    }

    saveDALC() {
        let basePath = 'Directional Ambient Lighting Colors';
        this.dalc.forEach(item => {
            Weather.colorLabels.forEach((label, i) => {
                let path = `${basePath}\\[${i}]\\Directional\\${item.path}`;
                this.setRgb(path, item[label]);
            });
        });
    }
}
class SSEWeather extends TES5Weather {}
class FO4Weather extends TES5Weather {}
ngapp.service('weatherService', function() {
    const weatherMap = {
        TES4: TES4Weather,
        FO3: FO3Weather,
        FNV: FNVWeather,
        TES5: TES5Weather,
        SSE: SSEWeather,
        FO4: FO4Weather
    };

    this.Weather = weatherMap[xelib.GetGlobal('AppName')];
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
            let inputElement = element[0].firstElementChild,
                skip = false;

            let notFocused = function() {
                return document.activeElement !== inputElement;
            };

            let onWheel = function(e) {
                if (e.deltaY === 0 || notFocused()) return;
                e.preventDefault();
                let offset = e.deltaY < 0 ? 1 : -1;
                if (e.ctrlKey) offset *= 10;
                try {
                    let f = parseFloat(scope.alphaText) * 100 + offset;
                    f = Math.max(Math.min(f, 100), 0);
                    scope.$applyAsync(() => {
                        scope.alphaText = (Math.round(f) / 100.0).toFixed(2);
                    });
                } catch (x) {}
            };

            element[0].addEventListener('wheel', onWheel);

            scope.$watch('color.channel.alpha', function() {
                if (skip) return skip = false;
                scope.alphaText = scope.color.getAlpha();
            });

            scope.$watch('alphaText', function() {
                try {
                    scope.color.channel.alpha = parseFloat(scope.alphaText) * 255;
                    skip = true;
                } catch(x) {}
            });

            scope.$on('$destroy', function() {
                element[0].removeEventListener('wheel', onWheel);
            })
        }
    }
});
ngapp.directive('cloudSpeedInput', function() {
    return {
        restrict: 'E',
        scope: {
            speed: '='
        },
        template: '<input type="text" ng-model="speedText" />',
        link: function(scope, element) {
            let inputElement = element[0].firstElementChild,
                skip = false;

            let notFocused = function() {
                return document.activeElement !== inputElement;
            };

            let onWheel = function(e) {
                if (e.deltaY === 0 || notFocused()) return;
                e.preventDefault();
                let offset = e.deltaY < 0 ? 1 : -1;
                if (e.ctrlKey) offset *= 10;
                try {
                    let f = parseFloat(scope.speedText) * 200 + offset;
                    f = Math.max(Math.min(f, 200), -200);
                    scope.$applyAsync(() => {
                        scope.speedText = (Math.round(f) / 200.0).toFixed(3);
                    });
                } catch (x) {}
            };

            element[0].addEventListener('wheel', onWheel);

            scope.$watch('speed', function() {
                if (skip) return skip = false;
                scope.speedText = scope.speed.toFixed(3);
            });

            scope.$watch('speedText', function() {
                try {
                    scope.speed = parseFloat(scope.speedText);
                    skip = true;
                } catch(x) {}
            });

            scope.$on('$destroy', function() {
                element[0].removeEventListener('wheel', onWheel);
            })
        }
    }
});
ngapp.controller('editWeatherModalController', function($scope, tabService, weatherService, recentService) {
    let {add} = recentService;

    // initialization
    let node = $scope.modalOptions.nodes.last(),
        name = xelib.Name(node.handle);
    $scope.weather = new weatherService.Weather(node.handle);
    xelib.WithHandle(xelib.GetElementFile(node.handle), file => {
        $scope.path = `${xelib.Name(file)}\\${name}`;
    });

    // tab data initialization
    $scope.disabledLayers = [];
    $scope.cloudLayers = [];
    $scope.weather.getCloudLayers().forEach(layer => {
        let key = layer.disabled ? 'disabledLayers' : 'cloudLayers';
        $scope[key].push(layer);
    });

    $scope.colorGroups = $scope.weather.getWeatherColors();
    $scope.dalc = $scope.weather.getDALC();

    // tab initialization
    $scope.tabs = [{
        label: 'Clouds',
        templateUrl: `${moduleUrl}/partials/editWeather/clouds.html`,
        controller: 'editWeatherCloudsController'
    }, {
        label: 'Colors',
        templateUrl: `${moduleUrl}/partials/editWeather/colors.html`
    }];

    if ($scope.dalc) $scope.tabs.push({
        label: 'Directional Ambient Lighting Colors',
        templateUrl: `${moduleUrl}/partials/editWeather/dalc.html`
    });

    tabService.buildFunctions($scope);

    // helper functions
    let recentColor = function(color) {
        color = new Color(color);
        color.channel.alpha = 255;
        return color;
    };

    let populateRecentCloudColors = function() {
        recentService.store('weather/cloudColors', 11);
        $scope.cloudLayers.forEachReverse(layer => {
            if (!layer.colors) return;
            Object.values(layer.colors).forEach(color => {
                add('weather/cloudColors', recentColor(color))
            });
        });
    };

    let populateRecentCloudTextures = function() {
        recentService.store('weather/skyTextures', 10);
        $scope.cloudLayers.forEachReverse(layer => {
            if (!layer.texture) return;
            add('weather/skyTextures', layer.texture);
        });
    };

    let populateRecentColorGroup = function(key, dataKey) {
        recentService.store(key, 11);
        $scope[dataKey].forEachReverse(group => {
            weatherService.Weather.colorLabels.forEach(label => {
                add(key, recentColor(group[label]));
            });
        });
    };

    // scope functions
    $scope.save = function() {
        $scope.weather.save();
        $scope.closeModal();
    };

    $scope.closeModal = function() {
        $scope.weather.release();
        $scope.$emit('closeModal');
    };

    // initialization
    populateRecentCloudColors();
    populateRecentCloudTextures();
    populateRecentColorGroup('weather/colors', 'colorGroups');
    populateRecentColorGroup('weather/dalc', 'dalc');
});
ngapp.controller('editWeatherCloudsController', function($scope) {
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