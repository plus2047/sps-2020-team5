document.write("<script language=javascript src='static/midi.js'></script>");

function showResult() {
    document.getElementById('showResult').style.display = 'block';
}

function showCyclegan() {
    document.getElementById('cyclegan').style.display = 'block';
    document.getElementById('translation').style.display = 'none';
    document.getElementById('upload').style.display = 'none';
    document.getElementById('select').style.display = 'none';
}

function showTranslation () {
    document.getElementById('cyclegan').style.display = 'none';
    document.getElementById('translation').style.display = 'block';
    document.getElementById('upload').style.display = 'none';
    document.getElementById('select').style.display = 'none';
}

function showUpload() {
    document.getElementById('upload').style.display = 'block';
    document.getElementById('select').style.display = 'none';
}

function showSelect() {
    document.getElementById('upload').style.display = 'none';
    document.getElementById('select').style.display = 'block';
}


var genreList=['- Source Genre -', 'pop','jazz','classic'];
var genreMusicList=[[],['Aaliyah_-_Try_Again'], ['2_of_a_kind_jp'], ['Menuet']];

function getSrcMusic(){
    for (var i = 0; i < 3; ++i) {
        var path = "static/music/" + genreList[i] + "/";
        // todo：获取文件夹下所有的文件名，js在Chrome无法完成，应该要后端获取
    }
}

// 加载所有类型下的音乐文件
function setSrcMusic(){
    var select = document.getElementById("srcGenre"); 
    var musicList = genreMusicList[select.selectedIndex];
    document.getElementById("musicName").innerHTML="<option>- Source Music -</option>";
    for(var i = 0; i < musicList.length; i++){
        var option = document.createElement("option");
        option.text=musicList[i];
        document.getElementById("musicName").add(option);
    }
}


function musicUpload(event) {
    event.preventDefault();

    var formData = new FormData($("#music-upload")[0]);

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

function loadMidiUrl(){
    var genre = document.getElementById("srcGenre");
    var music = document.getElementById("musicName");
    var musicList = genreMusicList[genre.selectedIndex];
    path = "static/music/" + genreList[genre.selectedIndex] + 
        '/' + musicList[music.selectedIndex-1] + '.mid';
    console.log(path);
    synth.loadMIDIUrl(path);
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
  for(var i=0;i<128;++i){
    var o=document.createElement("option");
    o.innerHTML=synth.getTimbreName(0,i);
    document.getElementById("prog").appendChild(o);
  }
  setInterval(function(){
    var st=synth.getPlayStatus();
    document.getElementById("status").innerHTML="Play:"+st.play+"  Pos:"+st.curTick+"/"+st.maxTick;
  },100);
}

function Test(){
  var o=synth.getAudioContext().createOscillator();
  o.connect(synth.getAudioContext().destination);
  o.start(0);
  o.stop(synth.getAudioContext().currentTime+1);
  console.log(synth)
}
window.onload=Init;