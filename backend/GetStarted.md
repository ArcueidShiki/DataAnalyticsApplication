# Installation

```bash
## python version 3.12.9
python -m venv venv

# For Linux/MacOs
source venv/bin/activate

# For windows only use command prompt, powershell doesn't work
venv\Scripts\activate.bat

pip install -r requirements.txt

mkdir migrations
flask db init

python run.py
```

## Database Migration Operations

To view the app.db, start the backend and ensure you have installed the SQLite Viewer extension in VS Code or another IDE.

when? When you changed table schema in the models layer

The following operations will update the database without losing existing data in the tables

```bash
# cd to backend directory

# Initialize migration directory, only once
flask db init

# Generate a migration script, every time the models changes
flask db migrate -m "What have changed in the models?"

# Apply the migration, when models changes
flask db upgrade
```



## Test

```bash
pytest
pytest -v
pytest /path
pytest tests/test_user.py
pytest tests/test_user.py::test_create_user
python -m unittest discover -s tests
python -m unittest tests.test_user

cd tests
coverage run -m pytest
coverage report
coverage html
```

## Database migration

```bash
flask db init
flask db migrate -m "create users table"
flask db upgrade
```

## For API TEST

using postman

### Request Body

| Type | Content-Type | specifications | scenarios |
|--------|----------------|------------------|---------|
| form-data | multipart/form-data | single form, support file upload | single form submit(includes files, images) |
| x-www-form-urlencoded | application/x-www-form-urlencoded | key-value single form（URL encoded） | form submit (browser default) |
| raw - JSON | application/json | JSON | REST API (React Vue) |
| raw - text/plain | text/plain | plain text | debug or self-defined |
| raw - XML | application/xml | XML | special systems |
| raw - HTML | text/html | HTML | Web editors |
| GraphQL | application/graphql | GraphQL query | GraphQL API |
| raw - JavaScript | application/javascript | JS code | remote script executio |

### Generate private and public key for RSA

```bash
openssl genrsa -out rsa_private.pem 2048
openssl rsa -in rsa_private.pem -pubout -out rsa_public.pem
```

### Authorization

add this to request header in postman

`Authorization: Bearer <your.jwt.token>`

## HTTP STATUS CODE

All the http status codes are at here.

https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status


```bash
python run.py
https://editor.swagger.io/
https://pypi.org/project/swagger-ui-py/
http://localhost:5000/apidocs/

# flask api spec
https://flask-restx.readthedocs.io/
# flask restx(restplus)
https://flask-apispec.readthedocs.io/
```

## Purify dependencies

```bash
pip install pipreqs
pipreqs ./your_project_path --force
```

https://yfinance-python.org/reference/yfinance.price_history.html