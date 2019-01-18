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