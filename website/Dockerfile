FROM python:3.12-rc-alpine3.18

WORKDIR /dacty

COPY dacty .
COPY requirements.txt .

RUN ["pip", "install", "-r", "requirements.txt"]
RUN ["python3", "manage.py", "migrate"]

EXPOSE 8000

ENTRYPOINT [ "python3", "manage.py",  "runserver", "0.0.0.0:8000"]