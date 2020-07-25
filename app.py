import json
import numpy as np
import flask

app = flask.Flask(__name__, static_folder="frontend", static_url_path="")
app.secret_key = "1238QWERTYUICVBNMFGHJ"  # random string


@app.route("/", methods=["GET"])
def index():
    return app.send_static_file("index.html")


@app.route("/transform", methods=["POST"])
def transform():
    return "API TRANSFORM"
