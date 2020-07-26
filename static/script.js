function show () {
    document.getElementById('showResult').style.display = 'block'
}

function musicUpload(event) {
    event.preventDefault();

    var formData = new FormData($("#music-upload")[0]);
    console.log(formData)

    $.ajax({
        url: '/transform',
        type: 'post',
        data: formData,
        processData: false,
        contentType: false, 
        success : function(data) {
            var response = JSON.parse(data)
            $("#visualization")[0].src = response.image
            $("#audio")[0].src = response.music
        }
     });
}

window.onload = function(){
    var audio = document.getElementById("audio"); 
    var musiPlayIcon = document.getElementById("music-play-icon");
    var off = document.getElementById("off");

    off.onclick = function(){
        if(off.className == "play"){
            audio.pause(); 
            off.className="stop"; 
            musiPlayIcon.src = "static/images/play.png";  
        }
        else if(off.className == "stop"){ 
            audio.play();
            off.className="play";  
            musiPlayIcon.src = "static/images/pause.png"; 
        } 
    }
}
