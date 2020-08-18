import flask
import json
import visualization
import os
import sys
from cyclegan.serve import CycleganService

app = flask.Flask(__name__)
app.secret_key = "1238QWERTYUICVBNMFGHJ"  # random string
app.config["MAX_CONTENT_LENGTH"] = 128 * 1024 * 1024  # 128M

#music_upload_path = "upload/"

# tmp file can only be stored in /tmp/ when deployed on google cloud. (otherwise, Datastore is recommended)
tmp_folder = "/tmp/"

# model service
cyclegan_service = CycleganService()

@app.route('/', methods=["GET"])
def index():
    return flask.render_template("index.html")


@app.route('/tmp/<path:path>', methods=["GET"])
def tmp(path):
    path = path.split("?")[0]
    return flask.send_from_directory("/tmp/", path)


@app.route("/transform", methods=["POST"])
def transform():
    file = flask.request.files["music"]
    filename = tmp_folder + file.filename
    #if not os.path.isdir(tmp_folder):
    #    os.mkdir(tmp_folder)
    file.save(filename)
    visualization.visualization(filename, "/tmp/wav.png")

    return json.dumps({
        "image": "/tmp/wav.png",
        "music": "static/music/Red.mp3",
    })


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    app.run(port=8080, debug=True)
