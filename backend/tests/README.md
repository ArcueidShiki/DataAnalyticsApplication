# Test Instructions

```bash
python -m unittest discover tests
pytest tests/
pytest --cov=app tests/

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
