dt-mobile-signing-web
=====================

Mobile Signing Room Web Application Demo based on Mocked Api responses.


Project structure
-----------------

- `/signing_web/`: application settings, startup scripts, wsgi scripts..
- `/signingroom/`: application related modules
- `/common/`: common components (currently only the web proxy view)
- `/static/`: static assets (including the front-end of the signingroom)

## `pip` index

`-i http://10.134.8.12:8000/simple/`



How To Build Static Files
--------------------------

Install grunt:

$ sudo npm install -g grunt grunt-cli node-gyp

Install GraphicsMagick for merging images:

Install other tools:

$ npm install

> NOTE: The default image engine for sprity is lwip, which has a reason-unknown build error on my laptop.
> So chose gm instead.
