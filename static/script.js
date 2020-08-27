document.write("<script language=javascript src='static/midi.js'></script>");

var genreList = ['- Source Genre -', 'pop', 'jazz', 'classic'];
var genreMusicList = [[], [], [], []];
var musicListSeq2seq = [];

/*** 加载所有类型下的音乐文件 */
// cyclegan
function setSrcMusicCyclegan(srcGenre, musicName) {
    var select = document.getElementById(srcGenre);
    var musicListCyclegan = genreMusicList[select.selectedIndex];
    document.getElementById(musicName).innerHTML = "<option>- Source Music -</option>";
    for (var i = 0; i < musicListCyclegan.length; i++) {
        var option = document.createElement("option");
        option.text = musicListCyclegan[i];
        document.getElementById(musicName).add(option);
    }
}
// seq2seq
function setSrcMusicSeq2seq(musicName) {
    document.getElementById(musicName).innerHTML = "<option>- Source Music -</option>";
    // console.log(musicListSeq2seq);
    for (var i = 0; i < musicListSeq2seq.length; i++) {
        var option = document.createElement("option");
        var music = musicListSeq2seq[i].split(".");
        // console.log(music);
        option.text = music[0];
        document.getElementById(musicName).add(option);
    }
}


function musicUpload(event, divName) {
    /** 上传formdata
        formData: 
            model(cyclegan/seq2seq),
            type(select/upload),
            srcGenre(pop/jazz/classic), 如果是seq2seq, 则没有这一项
            tarGenre(cyclegan: pop/jazz/classic; seq2seq: jazz/chacha/reggae) 
            如果type == "upload"，则是file，表示上传的文件; 如果type == "select"，则是filePath，表示选择的文件路径
        
        获取返回值：
            cyclegan: 生成音乐的路径music; 可视化图片的路径image
            seq2seq: 原音乐路径music; piano音乐路径piano; bass音乐路径bass; 可视化图片的路径image
     */

    event.preventDefault();
    cyclegan = 0; // 是否是cyclegan
    var formData = new FormData();
    if (divName == "music-upload-cyclegan") {
        cyclegan = 1;

        formData.append("model", "cyclegan");
        formData.append("type", "upload");

        var srcSelect = document.getElementById("srcGenre-upload-cyclegan");
        var tarSelect = document.getElementById("tarGenre-upload-cyclegan");
        var srcOptions = srcSelect.options;
        var tarOptions = tarSelect.options;
        var srcGenre = srcOptions[srcSelect.selectedIndex].text;
        var tarGenre = tarOptions[tarSelect.selectedIndex].text;
        formData.append("srcGenre", srcGenre);
        formData.append("tarGenre", tarGenre);

        var fileObj = document.getElementById("file-upload-cyclegan").files[0];
        formData.append("file", fileObj);
    }
    else if (divName == "music-select-cyclegan") {
        cyclegan = 1;

        formData.append("model", "cyclegan");
        formData.append("type", "select");

        var srcSelect = document.getElementById("srcGenre-select-cyclegan");
        var tarSelect = document.getElementById("tarGenre-select-cyclegan");
        var musicSelect = document.getElementById("musicName-select-cyclegan");
        var srcOptions = srcSelect.options;
        var tarOptions = tarSelect.options;
        var musicOptions = musicSelect.options;
        var srcGenre = srcOptions[srcSelect.selectedIndex].text;
        var tarGenre = tarOptions[tarSelect.selectedIndex].text;
        var music = musicOptions[musicSelect.selectedIndex].text;
        formData.append("srcGenre", srcGenre);
        formData.append("tarGenre", tarGenre);
        formData.append("filePath", "static/music/cyclegan/" + srcGenre + "/" + music + ".mid");
    }
    else if (divName == "music-upload-seq2seq") {
        formData.append("model", "seq2seq");
        formData.append("type", "upload");

        var tarSelect = document.getElementById("tarGenre-upload-seq2seq");
        var tarOptions = tarSelect.options;
        var tarGenre = tarOptions[tarSelect.selectedIndex].text;
        formData.append("tarGenre", tarGenre);

        var fileObj = document.getElementById("file-upload-seq2seq").files[0];
        formData.append("file", fileObj);
    }
    else if (divName == "music-select-seq2seq") {
        formData.append("model", "seq2seq");
        formData.append("type", "select");

        var tarSelect = document.getElementById("tarGenre-select-seq2seq");
        var musicSelect = document.getElementById("musicName-select-seq2seq");
        
        var tarOptions = tarSelect.options;
        var musicOptions = musicSelect.options;

        var tarGenre = tarOptions[tarSelect.selectedIndex].text;
        var music = musicListSeq2seq[musicSelect.selectedIndex - 1];
        
        formData.append("tarGenre", tarGenre);
        formData.append("filePath", "static/music/" + music);
    }
    /*
    for (var key of formData.keys()) {
        console.log("key:" + key + " value:" + formData.get(key));
    }
    */

    $.ajax({
        url: '/transform',
        type: 'post',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
            var response = JSON.parse(data)
            $("#visualization")[0].src = response.image + "?" + new Date().getTime();
            if (cyclegan){
                // console.log(response.music);
                var path = response.music;
                output.loadMIDIUrl(path);
            }
            else {
                var path1 = response.music;
                var path2 = response.piano;
                var path3 = response.bass;
                output.loadMIDIUrl(path1);
                outputPiano.loadMIDIUrl(path2);
                outputBass.loadMIDIUrl(path3);
            }
            show()
        }
    });

}

function getMusicList() {
    $.getJSON("/static_music_list_cyclegan", function(data) {
        for (var i = 0; i < data.length; ++i) {
            var fileName = data[i].split("/");
            var len = fileName[4].length;
            if (fileName[3] == "pop") genreMusicList[1].push(fileName[4].substring(0, len - 4));
            else if (fileName[3] == "jazz") genreMusicList[2].push(fileName[4].substring(0, len - 4));
            else if (fileName[3] == "classic") genreMusicList[3].push(fileName[4].substring(0, len - 4));
            //console.log(genreMusicList);
        }
    });
    $.getJSON("/static_music_list_seq2seq", function(data) {
        for (var i = 0; i < data.length; ++i) {
            var fileName = data[i].split("/");
            musicListSeq2seq.push(fileName[3]);
        }
        // console.log(musicListSeq2seq.length);
    });
}

function playPause() {
    var musiPlayIcon = document.getElementById("music-play-icon");
    var off = document.getElementById("off");
    if (off.className == "play") {
        output.stopMIDI();
        if (!cyclegan){
            outputBass.stopMIDI();
            outputPiano.stopMIDI();
        }
        off.className = "pause";
        musiPlayIcon.src = "static/images/play.png";
    }
    else if (off.className == "pause") {
        output.playMIDI();
        if (!cyclegan){
            outputBass.playMIDI();
            outputPiano.playMIDI();
        }
        off.className = "play";
        musiPlayIcon.src = "static/images/pause.png";
    }
}

function loadMidiUrl(model, srcGenre, musicName) {
    var path;
    if (model == "cyclegan") {
        var genre = document.getElementById(srcGenre);
        var music = document.getElementById(musicName);
        var musicListCyclegan = genreMusicList[genre.selectedIndex];
        path = "static/music/" + model + '/' + genreList[genre.selectedIndex] +
            '/' + musicListCyclegan[music.selectedIndex - 1] + '.mid';
    }
    else {
        var music = document.getElementById(musicName);
        // console.log(music)
        path = "static/music/" + model + '/' + musicListSeq2seq[music.selectedIndex - 1];
    }
    console.log(path);
    input.loadMIDIUrl(path);
}

function showResult() {
    document.getElementById('showResult').style.display = 'block';
}

function showCyclegan() {
    document.getElementById('cyclegan').style.display = 'block';
    document.getElementById('seq2seq').style.display = 'none';
    document.getElementById('uploadCyclegan').style.display = 'none';
    document.getElementById('selectCyclegan').style.display = 'none';
    document.getElementById('uploadSeq2seq').style.display = 'none';
    document.getElementById('selectSeq2seq').style.display = 'none';
    document.getElementById('showResult').style.display = 'none';
}

function showSeq2seq() {
    document.getElementById('cyclegan').style.display = 'none';
    document.getElementById('seq2seq').style.display = 'block';
    document.getElementById('uploadCyclegan').style.display = 'none';
    document.getElementById('selectCyclegan').style.display = 'none';
    document.getElementById('uploadSeq2seq').style.display = 'none';
    document.getElementById('selectSeq2seq').style.display = 'none';
    document.getElementById('showResult').style.display = 'none';

    setSrcMusicSeq2seq("musicName-select-seq2seq");
}

function showUploadCyclegan() {
    document.getElementById('uploadCyclegan').style.display = 'block';
    document.getElementById('selectCyclegan').style.display = 'none';
    document.getElementById('showResult').style.display = 'none';
}
function showUploadSeq2seq() {
    document.getElementById('uploadSeq2seq').style.display = 'block';
    document.getElementById('selectSeq2seq').style.display = 'none';
    document.getElementById('showResult').style.display = 'none';
}

function showSelectCyclegan() {
    document.getElementById('uploadCyclegan').style.display = 'none';
    document.getElementById('selectCyclegan').style.display = 'block';
    document.getElementById('showResult').style.display = 'none';
}
function showSelectSeq2seq() {
    document.getElementById('uploadSeq2seq').style.display = 'none';
    document.getElementById('selectSeq2seq').style.display = 'block';
    document.getElementById('showResult').style.display = 'none';
}

// 播放Midi
function playMidiInput() {
    input.playMIDI();
}

function stopMidiInput() {
    input.stopMIDI();
}

function SetProgramInput(p) {
    input.send([0xc0, p]);
}

function Init() {
    getMusicList();
    input = new WebAudioTinySynth({ voices: 64 });
    output = new WebAudioTinySynth({ voices: 64 });
    outputPiano = new WebAudioTinySynth({ voices: 64 });
    outputBass = new WebAudioTinySynth({ voices: 64 });
    setInterval(function() {
        input.getPlayStatus();
        output.getPlayStatus();
        outputPiano.getPlayStatus();
        outputBass.getPlayStatus();
        //document.getElementById("status").innerHTML="Play:"+st.play+"  Pos:"+st.curTick+"/"+st.maxTick;
    }, 100);
}

window.onload = Init;
