import flask

app = flask.Flask(__name__)
app.secret_key = "1238QWERTYUICVBNMFGHJ"  # random string


@app.route('/', methods=["GET"])
def index():
    return flask.render_template("index.html")


@app.route("/transform", methods=["POST"])
def transform():
    return "API TRANSFORM"


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    app.run(port=8080, debug=True)