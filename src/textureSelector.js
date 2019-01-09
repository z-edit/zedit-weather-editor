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