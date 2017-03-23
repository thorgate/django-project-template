# Thorgate's Django template

[Django](https://www.djangoproject.com/) project template that we use at [Thorgate](https://thorgate.eu).

Best suited for medium-sized and bigger apps that use JavaScript and React for frontend.


## Features

- Django-based backend

    - [Django](https://www.djangoproject.com/) 1.8 (because it's LTS; you can easily upgrade to 1.10)
    - Separate settings for different environments (local/staging/production)
    - Python 3.4 / 3.5

- Frontend app with JavaScript (ES2015), React and Sass

    - Latest JavaScript features from [ES2015](https://babeljs.io/docs/learn-es2015/) and beyond, transpiled with
      [Babel](https://babeljs.io/)
    - [React](https://facebook.github.io/react/) 15.0 for fast modular user interfaces
    - [Sass](http://sass-lang.com/), [PostCSS](http://postcss.org/) and
      [Autoprefixer](https://github.com/postcss/autoprefixer) for more convenient styling
    - [Webpack](https://webpack.github.io/) 2.0-beta is used to bundle and minify JavaScript and styles
    - Optional single-page app structure

- Batteries

    - Linting of Python and JavaScript code with [Prospector](http://prospector.landscape.io/) and
      [ESLint](http://eslint.org/)
    - [py.test](http://pytest.org/) and [coverage](https://coverage.readthedocs.io/) integration
    - Deploy helpers, using [Fabric](http://www.fabfile.org/)
    - Out-of-the-box configuration for nginx, gunicorn, logrotate and crontab
    - Includes [PyCharm](https://www.jetbrains.com/pycharm/) project config


## Usage

To use this template, first ensure that you have
[Cookiecutter](http://cookiecutter.readthedocs.org/en/latest/readme.html) available.
If not, you can install it from pip: `pip install cookiecutter`.

Then just execute:

    cookiecutter dir/to/django-template/

It will ask you a few questions, e.g. project's name.

After generation completes, search for any TODOs in the code and make appropriate changes where needed.

See README.md in the generated project for instructions on how to set up your development environment.
