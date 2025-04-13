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
pytest tests/test_user.py
pytest tests/test_user.py::test_create_user

python -m unittest discover -s tests
python -m unittest tests.test_user
```
