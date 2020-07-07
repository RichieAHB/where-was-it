FROM python:3
RUN pip install pipenv
WORKDIR /usr/src/app
# next "tmp" section is used for Docker layer caching
COPY Pipfile* /tmp/
RUN cd /tmp && pipenv lock --requirements > requirements.txt
RUN pip install -r /tmp/requirements.txt
RUN cd ..
COPY . .
EXPOSE 5000
CMD ["pipenv", "run", "python3", "-m", "flask", "run", "--host=0.0.0.0"]
