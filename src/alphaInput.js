ngapp.directive('alphaInput', function() {
    return {
        restrict: 'E',
        scope: {
            color: '='
        },
        template: '<input type="text" ng-model="alphaText" />',
        link: function(scope, element) {
            element[0].title = 'Alpha';

            scope.$watch('color.channel.alpha', function() {
                let alphaText = scope.color.getAlpha();
                if (alphaText === scope.alphaText) return;
                scope.alphaText = alphaText;
            });

            scope.$watch('alphaText', function() {
                try {
                    scope.color.setAlpha(parseFloat(scope.alphaText));
                } catch(x) {}
            });
        }
    }
});