ngapp.controller('editWeatherModalController', function($scope, tabService, weatherService, recentService) {
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
    let populateRecentCloudTextures = function() {
        recentService.store('weather/skyTextures', 10);
        $scope.cloudLayers.forEachReverse(layer => {
            if (!layer.texture) return;
            recentService.add('weather/skyTextures', layer.texture);
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
    populateRecentCloudTextures();
});