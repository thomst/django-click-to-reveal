# Click-to-reveal test project

Run the app's tests from the repository root:

```sh
python tests/manage.py test testproject
```

Run the compatibility matrix with tox:

```sh
tox
```

The tox matrix tests one Python version per Django version: Python 3.8 with
Django 3.2, Python 3.8 with Django 4.0, Python 3.10 with Django 4.2, Python
3.12 with Django 5.2, Python 3.13 with Django 6.0, and Python 3.14 with
Django 6.1.

To try the tag in a browser, initialize the development database and start the
test project's server:

```sh
python tests/manage.py migrate
python tests/manage.py runserver
```

Open <http://127.0.0.1:8000/> and click **Click to reveal**. The project
homepage renders the tag with a sample email address.
