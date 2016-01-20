http://kangax.github.io/jstests/toDataUrl_mime_type_test/
http://www.alsacreations.com/article/lire/1439-data-uri-schema.html
https://uploadcare.com/cookbook/advanced/
http://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent

npm install -g browserify
npm install -g watchify

https://facebook.github.io/react/docs/getting-started.html

> watchify --debug -t [ babelify --presets [ react ] ] src\popup.js -o dist/bundle.js

Error: Parsing file C:\JUL\DEV\github\fetchme\src\app.js: 'import' and 'export'
may appear only with 'sourceType: module' (3:0)

well... ok forgot 

> watchify --debug -t [ babelify --presets [ es2015 react ] ] src\popup.js -o dist/bundle.js

https://github.com/sindresorhus/pretty-bytes

A; B    Run A and then B, regardless of success of A
A && B  Run B if A succeeded
A || B  Run B if A failed
A &     Run A in background.


up vote
53
down vote
How about:

http://stackoverflow.com/questions/3004811/how-do-you-run-multiple-programs-from-a-bash-script

prog1 & prog2 && fg
This will:

Start prog1.
Send it to background, but keep printing its output.
Start prog2, and keep it in foreground, so you can close it with ctrl-c.
When you close prog2, you'll return to prog1's foreground, so you can also close it with ctrl-c.

https://github.com/mdn/simple-web-worker

https://github.com/vdsabev/image-downloader/blob/master/scripts/send_images.js

figure tags

http://www.apple.com/itunes/

https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle

https://github.com/vdsabev/image-downloader