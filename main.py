import flask
import json
import visualization
import os
import sys
import pathlib
from cyclegan.serve import CycleganService
import shutil
import cyclegan.convert_clean

app = flask.Flask(__name__)
app.secret_key = "1238QWERTYUICVBNMFGHJ"  # random string
app.config["MAX_CONTENT_LENGTH"] = 128 * 1024 * 1024  # 128M

#music_upload_path = "upload/"

# tmp file can only be stored in /tmp/ when deployed on google cloud. (otherwise, Datastore is recommended)
tmp_folder = "/tmp/" if sys.platform.startswith("linux") else "tmp/"
input_folder = tmp_folder + "music_input/"
output_folder = tmp_folder + "music_outupt/"

if not os.path.exists(input_folder):
    os.mkdir(input_folder)
if not os.path.exists(output_folder):
    os.mkdir(output_folder)

# model service
cyclegan_service = CycleganService()
seq2seq_service = cyclegan_service  # change it info seq2seq model

def convert_to_npy(input_file):
    convert_work_dir = tmp_folder + "midi2npy/"
    if not os.path.exists(convert_work_dir):
        os.mkdir(convert_work_dir)
    origin_dir = convert_work_dir + "origin_midi/"
    if not os.path.exists(origin_dir):
        os.mkdir(origin_dir)
    
    shutil.copy2(input_file, convert_work_dir + "origin_midi/origin.mid")
    cyclegan.convert_clean.main(convert_work_dir)
    basename = pathlib.Path(input_file).name

    shutil.copy2(convert_work_dir + "phrase/piano_8.npy",
        tmp_folder + "music_input/" + basename[:-3] + "npy")

@app.route('/', methods=["GET"])
def index():
    return flask.render_template("index.html")


@app.route('/tmp/<path:path>', methods=["GET"])
def tmp(path):
    path = path.split("?")[0]
    return flask.send_from_directory(tmp_folder, path)


@app.route("/transform", methods=["POST"])
def transform():

    form = flask.request.form

    service = seq2seq_service if form["model"] == "seq2seq" else cyclegan_service

    model_name = None
    direction = None
    if form["srcGenre"] == "jazz" and form["tarGenre"] == "pop":
        model_name = "jazz_pop"
        direction = "AtoB"
    elif form["srcGenre"] == "pop" and form["tarGenre"] == "jazz":
        model_name = "jazz_pop"
        direction = "BtoA"
    elif form["srcGenre"] == "jazz" and form["tarGenre"] == "classic":
        model_name = "jazz_classic"
        direction = "AtoB"
    elif form["srcGenre"] == "classic" and form["tarGenre"] == "jazz":
        model_name = "jazz_classic"
        direction = "BtoA"
    elif form["srcGenre"] == "pop" and form["tarGenre"] == "classic":
        model_name = "pop_classic"
        direction = "AtoB"
    elif form["srcGenre"] == "classic" and form["tarGenre"] == "pop":
        model_name = "pop_classic"
        direction = "BtoA"
    else:
        print("Unspported translate action!")
        return ""
    
    basename = ""
    if form["type"] == "select":
        f = form["filePath"]
        shutil.copy2(f, input_folder)
        basename = pathlib.Path(f).name
    else:
        file = flask.request.files["file"]
        basename = file.filename
        fullname = input_folder + file.filename
        file.save(fullname)

    if basename.endswith("mid") and form["model"] == "cyclegan":
        # convert into npy
        convert_to_npy(input_folder + basename)

    basename = basename[:-3] + "npy"
    visualization.visualization(input_folder + basename, tmp_folder + "wav.png")

    service.run_file(input_folder, output_folder, model_name, direction)

    b = pathlib.Path(basename)
    output_name = output_folder + b.stem + "_transfer.mid"

    return json.dumps({
        "image": tmp_folder + "wav.png",
        "music": output_name
    })


@app.route('/static_music_list_cyclegan', methods=["GET"])
def static_music_list_cyclegan():
    def findall(suf):
        return [str(s) for s in pathlib.Path("static/music/cyclegan").glob("**/*." + suf)]
    return json.dumps(findall("mid") + findall("npy"))


@app.route('/static_music_list_seq2seq', methods=["GET"])
def static_music_list_seq2seq():
    def findall(suf):
        return [str(s) for s in pathlib.Path("static/music/seq2seq").glob("**/*." + suf)]
    return json.dumps(findall("mid") + findall("npy"))


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.

    app.run(port=8080, debug=True)