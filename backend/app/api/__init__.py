# backend/app/api/__init__.py
# Just imports - main.py handles router inclusion with prefixes

from . import auth
from . import lessons
from . import progress
from . import prediction