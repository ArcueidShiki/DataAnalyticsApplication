# Installation

```bash
## python version 3.12.9
python -m venv venv

# For Linux/MacOs
source venv/bin/activate

# For windows
venv\Scripts\activate.bat

pip install -r requirements.txt

python run.py
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

## API docs

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