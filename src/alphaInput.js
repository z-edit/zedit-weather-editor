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
                try {
                    let f = parseFloat(scope.alphaText) * 20 + offset;
                    f = Math.max(Math.min(f, 20), 0);
                    scope.$applyAsync(() => {
                        scope.alphaText = (Math.floor(f) / 20.0).toFixed(2);
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