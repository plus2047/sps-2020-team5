function show () {
    document.getElementById('showResult').style.display = 'block'
}

window.onload = function(){
    var audio = document.getElementById("audio"); 
    var musiPlayIcon = document.getElementById("music-play-icon");
    var off = document.getElementById("off");

    off.onclick = function(){
        if(off.className == "play"){
            audio.pause(); 
            off.className="stop"; 
            musiPlayIcon.src = "images/play.png";  
        }
        else if(off.className == "stop"){ 
            audio.play();
            off.className="play";  
            musiPlayIcon.src = "images/pause.png"; 
        } 
    }
}
