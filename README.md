# sps-2020-team5

Welcome to Google SPS mainland team 5 project!

## Deploy

This project use flask for backend system.

Install flask:

    pip install flask

Then, `cd` into the root folder of this project (which contains `main.py`), and run command:

    FLASK_APP=main.py FLASK_ENV=development flask run

Then a development server will start. It should host on http://localhost:5000.

## Deploy on Google Cloud

Before doing this, one need to creat a google cloud project and get App Engine resources first.

In google cloud shell,  `cd` into the root folder of this project, and run command:

    gcloud app deploy

Then, you can get the deploy link by running:

    gcloud app browse
