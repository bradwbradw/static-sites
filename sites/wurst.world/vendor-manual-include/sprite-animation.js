
/*

https://github.com/tusharghate/angular-simple-sprite

The MIT License (MIT)

Copyright (c) 2015 Tushar Ghate

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */
(function() {
    angular
        .module('simple-sprite', [])
        .directive('simpleSprite', simpleSprite);

    simpleSprite.$inject = ['$interval'];

    function simpleSprite($interval) {
        return {
            restrict: 'AE',
            replace: false,
            scope: {
                src: "@",
                frameWidth: "@",
                frameHeight: "@",
                frames: "@",
                framesPerRow: "@",
                repeat: "@",
                speed: "@"
            },

            link: function($scope, element) {

                var src,
                    frameWidth,
                    frameHeight,
                    frames,
                    framesPerRow = 0,
                    repeat = true,
                    speed = 100,
                framesSeen = 0;

                // Keeps track of the current x and y positions of the sprite.
                var spritePosition = {
                    'x': 0,
                    'y': 0
                };

                /**
                 * Initializes the sprite with default CSS styles and options passed in by
                 * the user. Starts the sprite animation.
                 */
                function init() {
                    src = $scope.src;
                    frameWidth = parseInt($scope.frameWidth, 10);
                    frameHeight = parseInt($scope.frameHeight, 10);
                    frames = parseInt($scope.frames, 10);
                    repeat = $scope.repeat === 'true';
                    speed = $scope.speed;
                    framesPerRow = $scope.framesPerRow;

                    element.css({
                        "display": "block",
                        "width": frameWidth + "px",
                        "height": frameHeight + "px",
                        "background": "url(" + src + ") repeat",
                        "backgroundPosition": "0px 0px"
                    });

                    animate();
                }

                var animationInterval = null;

                /**
                 * Animates the sprite.
                 */
                function animate() {
                    /**
                     * Returns whether the sprite animation has completed or not.
                     */
                    function isAnimationComplete() {
                        return framesSeen >= frames;
                    }

                    animationInterval = $interval(function() {

                    console.log('animation increment '+framesSeen);
                        // Update the sprite frame
                        element.css("background-position", -spritePosition.x + "px" + " " + spritePosition.y + "px");

                    framesSeen++;
                        // Determine if we should loop the animation, or stop, if the animation is complete
                        if (isAnimationComplete()) {
                                //$window.clearInterval(animationInterval);
                                $interval.cancel(animationInterval);

                        } else {
                            // Increment the X position
                            spritePosition.x += frameWidth;

                            // Check if we should move to the next row
                            if ( (framesPerRow === 0 || framesPerRow) && spritePosition.x + frameWidth > frameWidth * framesPerRow) {
                                spritePosition.x = 0;
                                spritePosition.y -= frameHeight;
                            }
                        }
                    }, speed);
                }

                $scope.$on("$destroy", function() {
                    //$window.clearInterval(animationInterval);
                    $interval.cancel(animationInterval);
                });



                init();
            }
        };
    }
})(angular);