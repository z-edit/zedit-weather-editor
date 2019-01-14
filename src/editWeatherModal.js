ngapp.controller('editWeatherModalController', function($scope, tabService) {
    // initialization
    let node = $scope.modalOptions.nodes.last(),
        name = xelib.Name(node.handle);
    $scope.handle = node.handle;
    xelib.WithHandle(xelib.GetElementFile($scope.handle), file => {
        $scope.path = `${xelib.Name(file)}\\${name}`;
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