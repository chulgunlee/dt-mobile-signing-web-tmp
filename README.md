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

Install npm bundles:

    $ npm install

This project uses [webpack](https://webpack.github.io/) to build the static files, while providing a dev server which can merge the js/css files automatically.

To run the dev server, run:

    $ grunt

Then run back-end api in another terminal:

    $ python manage.py runserver 0.0.0.0:8001

The static dev server will listen on :8000 and proxy all non-static requests to back-end listening on 8001.
Open http://localhost:8000/ with browser.



    
