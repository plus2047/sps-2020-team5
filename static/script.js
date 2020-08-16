document.write("<script language=javascript src='static/midi.js'></script>");

var genreList=['- Source Genre -', 'pop','jazz','classic'];
var genreMusicList=[[],['Aaliyah_-_Try_Again'], ['2_of_a_kind_jp'], ['Menuet']];

function getSrcMusic(){
    for (var i = 0; i < 3; ++i) {
        var path = "static/music/" + genreList[i] + "/";
        // todo：获取文件夹下所有的文件名，js在Chrome无法完成，应该要后端获取
    }
}

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
    //      model(cyclegan/rnn),
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
        formData.append("model", "rnn");
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
        formData.append("model", "rnn");
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
            show()
        }
     });
     
}

function playPause(){
    var audio = document.getElementById("audio"); 
    var musiPlayIcon = document.getElementById("music-play-icon");
    var off = document.getElementById("off");
    if(off.className == "play"){
        audio.pause(); 
        off.className="pause"; 
        musiPlayIcon.src = "static/images/play.png";  
    }
    else if(off.className == "pause"){ 
        audio.play();
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
    synth.loadMIDIUrl(path);
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
function playMidi(){
    synth.playMIDI();
}

function stopMidi(){
    synth.stopMIDI();
}

function SetProgram(p){
    synth.send([0xc0,p]);
}

function Init(){
    synth=new WebAudioTinySynth({voices:64});
    setInterval(function(){
        var st=synth.getPlayStatus();
        //document.getElementById("status").innerHTML="Play:"+st.play+"  Pos:"+st.curTick+"/"+st.maxTick;
    },100);
}

window.onload=Init;