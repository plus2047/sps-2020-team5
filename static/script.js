document.write("<script language=javascript src='static/midi.js'></script>");

var genreList=['- Source Genre -', 'pop','jazz','classic'];
var genreMusicList=[[],[], [], []];

// 加载所有类型下的音乐文件
function setSrcMusic(srcGenre, musicName){
    var select = document.getElementById(srcGenre); 
    var musicList = genreMusicList[select.selectedIndex];
    document.getElementById(musicName).innerHTML="<option>- Source Music -</option>";
    for(var i = 0; i < musicList.length; i++){
        var option = document.createElement("option");
        option.text=musicList[i];
        document.getElementById(musicName).add(option);
    }
}


function musicUpload(event, divName) {
    // formData: 
    //      model(cyclegan/seq2seq),
    //      type(select/upload),
    //      srcGenre(pop/jazz/classic),
    //      tarGenre(pop/jazz/classic)
    //      如果type == "upload"，则是file，表示上传的文件; 如果type == "select"，则是filePath，表示选择的文件路径
    event.preventDefault();

    var formData = new FormData();
    if (divName == "music-upload-cyclegan"){
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
    else if (divName == "music-select-cyclegan"){
        formData.append("model", "cyclegan");
        formData.append("type", "select");

        var srcSelect = document.getElementById("srcGenre-select-cyclegan");
        var tarSelect = document.getElementById("tarGenre-select-cyclegan");
        var srcOptions = srcSelect.options;
        var tarOptions = tarSelect.options;
        var srcGenre = srcOptions[srcSelect.selectedIndex].text;
        var tarGenre = tarOptions[tarSelect.selectedIndex].text;
        formData.append("srcGenre", srcGenre);
        formData.append("tarGenre", tarGenre);
        formData.append("filePath", "static/music/" + srcGenre + "/" + tarGenre  + ".mid");
    }
    else if (divName == "music-upload-rnn"){
        formData.append("model", "seq2seq");
        formData.append("type", "upload");

        var srcSelect = document.getElementById("srcGenre-upload-rnn");
        var tarSelect = document.getElementById("tarGenre-upload-rnn");
        var srcOptions = srcSelect.options;
        var tarOptions = tarSelect.options;
        var srcGenre = srcOptions[srcSelect.selectedIndex].text;
        var tarGenre = tarOptions[tarSelect.selectedIndex].text;
        formData.append("srcGenre", srcGenre);
        formData.append("tarGenre", tarGenre);

        var fileObj = document.getElementById("file-upload-rnn").files[0];
        formData.append("file", fileObj);
    }
    else if (divName == "music-select-rnn"){
        formData.append("model", "seq2seq");
        formData.append("type", "select");

        var srcSelect = document.getElementById("srcGenre-select-rnn");
        var tarSelect = document.getElementById("tarGenre-select-rnn");
        var srcOptions = srcSelect.options;
        var tarOptions = tarSelect.options;
        var srcGenre = srcOptions[srcSelect.selectedIndex].text;
        var tarGenre = tarOptions[tarSelect.selectedIndex].text;
        formData.append("srcGenre", srcGenre);
        formData.append("tarGenre", tarGenre);
        formData.append("filePath", "static/music/" + srcGenre + "/" + tarGenre  + ".mid");
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
        success : function(data) {
            var response = JSON.parse(data)
            $("#visualization")[0].src = response.image + "?" + new Date().getTime();
            $("#audio")[0].src = response.music
            path = response.music;
            output.loadMIDIUrl(path);
            show()
        }
     });
     
}

function getMusicList() {
     $.getJSON("/static_music_list",function(data){
        for (var i = 0; i < data.length; ++i){
            var fileName = data[i].split("/");
            var len = fileName[3].length;
            if (fileName[2] == "pop") genreMusicList[1].push(fileName[3].substring(0, len - 4));
            else if (fileName[2] == "jazz") genreMusicList[2].push(fileName[3].substring(0, len - 4));
            else if (fileName[2] == "classic") genreMusicList[3].push(fileName[3].substring(0, len - 4));
            //console.log(genreMusicList);
        }
    });
}

function playPause(){
    var musiPlayIcon = document.getElementById("music-play-icon");
    var off = document.getElementById("off");
    if(off.className == "play"){
        output.stopMIDI();
        off.className="pause"; 
        musiPlayIcon.src = "static/images/play.png";  
    }
    else if(off.className == "pause"){ 
        output.playMIDI();
        off.className="play";  
        musiPlayIcon.src = "static/images/pause.png"; 
    }
}

function loadMidiUrl(srcGenre, musicName){
    var genre = document.getElementById(srcGenre);
    var music = document.getElementById(musicName);
    var musicList = genreMusicList[genre.selectedIndex];
    path = "static/music/" + genreList[genre.selectedIndex] + 
        '/' + musicList[music.selectedIndex-1] + '.mid';
    console.log(path);
    input.loadMIDIUrl(path);
}

function showResult() {
    document.getElementById('showResult').style.display = 'block';
}

function showCyclegan() {
    document.getElementById('cyclegan').style.display = 'block';
    document.getElementById('rnn').style.display = 'none';
    document.getElementById('uploadCyclegan').style.display = 'none';
    document.getElementById('selectCyclegan').style.display = 'none';
    document.getElementById('uploadRnn').style.display = 'none';
    document.getElementById('selectRnn').style.display = 'none';
}

function showRnn() {
    document.getElementById('cyclegan').style.display = 'none';
    document.getElementById('rnn').style.display = 'block';
    document.getElementById('uploadCyclegan').style.display = 'none';
    document.getElementById('selectCyclegan').style.display = 'none';
    document.getElementById('uploadRnn').style.display = 'none';
    document.getElementById('selectRnn').style.display = 'none';
}

function showUploadCyclegan() {
    document.getElementById('uploadCyclegan').style.display = 'block';
    document.getElementById('selectCyclegan').style.display = 'none';
}
function showUploadRnn() {
    document.getElementById('uploadRnn').style.display = 'block';
    document.getElementById('selectRnn').style.display = 'none';
}

function showSelectCyclegan() {
    document.getElementById('uploadCyclegan').style.display = 'none';
    document.getElementById('selectCyclegan').style.display = 'block';
}
function showSelectRnn() {
    document.getElementById('uploadRnn').style.display = 'none';
    document.getElementById('selectRnn').style.display = 'block';
}

// 播放Midi
function playMidiInput(){
    input.playMIDI();
}

function stopMidiInput(){
    input.stopMIDI();
}

function SetProgramInput(p){
    input.send([0xc0,p]);
}

function Init(){
    getMusicList();
    input=new WebAudioTinySynth({voices:64});
    output=new WebAudioTinySynth({voices:64});
    setInterval(function(){
        input.getPlayStatus();
        output.getPlayStatus();
        //document.getElementById("status").innerHTML="Play:"+st.play+"  Pos:"+st.curTick+"/"+st.maxTick;
    },100);
}

window.onload=Init;