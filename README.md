# django-click-to-reveal

[![Tests](https://github.com/thomst/django-click-to-reveal/actions/workflows/tests.yml/badge.svg)](https://github.com/thomst/django-click-to-reveal/actions/workflows/tests.yml)
[![PyPI version](https://img.shields.io/pypi/v/django-click-to-reveal)](https://pypi.org/project/django-click-to-reveal/)
[![Coverage](https://coveralls.io/repos/github/thomst/django-reorder-items-widget/badge.svg?branch=main)](https://coveralls.io/github/thomst/django-reorder-items-widget?branch=main)
[![Python 3](https://img.shields.io/badge/python-3-blue)](https://img.shields.io/badge/python-3-blue)
[![Django versions](https://img.shields.io/badge/django-3.2%20--%206.0-orange)](https://img.shields.io/badge/django-3.2%20--%206.0-orange)
[![License](https://img.shields.io/badge/license-BSD--3--Clause-blue)](LICENCE)

Reveal an email address on demand in a Django template. The address is stored
in the database and is returned by a small JSON endpoint when the link is
clicked.

## Installation

```sh
pip install django-click-to-reveal
```

Add the app to `INSTALLED_APPS` and include its URL patterns in your project's
URL configuration:

```python
# settings.py
INSTALLED_APPS = [
    # ...
    "click_to_reveal",
]
```

```python
# urls.py
from django.urls import include, path

urlpatterns = [
    # ...
    path("", include("click_to_reveal.urls")),
]
```

Apply the app's database migration:

```sh
python manage.py migrate
```

## Usage

Load the template tag library and pass it the email address to reveal and the
link text to display:

```django
{% load click_to_reveal %}

{% click_to_reveal "person@example.com" "Show email" %}
```

The link text is optional and defaults to **Click to reveal**. When clicked,
the link fetches the address from the app's JSON endpoint.

The endpoint returns the stored email address to anyone who can access it. This
obfuscates the address in the initial page source; it is not an access-control
mechanism for confidential email addresses.

## Tests

Run the test project from the repository root:

```sh
python tests/manage.py test testproject
```

Run the Python/Django compatibility matrix with tox:

```sh
tox
```

Run the JavaScript tests with Node.js 20 or later:

```sh
node --test tests/click-to-reveal.test.js
```

## License

This project is distributed under the BSD 3-Clause License. See [LICENCE](LICENCE).
