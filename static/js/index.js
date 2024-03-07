var startHandle = document.getElementById("start_handle");
var endHandle = document.getElementById("end_handle");
var sliderBar = document.querySelector(".slider-bar");
var startMinutesInput = document.getElementById("start_minutes");
var startSecondsInput = document.getElementById("start_seconds");
var startsMillisecondsInput = document.getElementById("start_milliseconds");
var endMinutesInput = document.getElementById("end_minutes");
var endSecondsInput = document.getElementById("end_seconds");
var endMillisecondsInput = document.getElementById("end_milliseconds");
var totalTime = 1 * 60 * 1000; // Assuming the total time is 1 minute
var start_time = 0.0;
var end_time = 0.0;

var sliderWidth = document.querySelector(".custom-slider").offsetWidth;
var isDraggingStart = false;
var isDraggingEnd = false;

startHandle.addEventListener("mousedown", function(event) {
isDraggingStart = true;
});

endHandle.addEventListener("mousedown", function(event) {
isDraggingEnd = true;
});

document.addEventListener("mouseup", function(event) {
isDraggingStart = false;
isDraggingEnd = false;
});

document.addEventListener("mousemove", function(event) {
if (isDraggingStart) {
var newPosition = event.clientX - sliderBar.getBoundingClientRect().left;
var percentage = newPosition / sliderWidth * 100;
if (percentage < 0) percentage = 0;
if (percentage > parseFloat(endHandle.style.left)) percentage = parseFloat(endHandle.style.left);
startHandle.style.left = percentage + "%";
updateLabels();
}
if (isDraggingEnd) {
var newPosition = event.clientX - sliderBar.getBoundingClientRect().left;
var percentage = newPosition / sliderWidth * 100;
if (percentage > 100) percentage = 100;
if (percentage < parseFloat(startHandle.style.left)) percentage = parseFloat(startHandle.style.left);
endHandle.style.left = percentage + "%";
updateLabels();
}
});

// Event listeners for input changes in textboxes
startMinutesInput.addEventListener("input", function(event) {
updateSliderFromInputs();
});

startSecondsInput.addEventListener("input", function(event) {
updateSliderFromInputs();
});

startsMillisecondsInput.addEventListener("input", function(event) {
updateSliderFromInputs();
});

endMinutesInput.addEventListener("input", function(event) {
updateSliderFromInputs();
});

endSecondsInput.addEventListener("input", function(event) {
updateSliderFromInputs();
});

endMillisecondsInput.addEventListener("input", function(event) {
updateSliderFromInputs();
});

function openNextVideoModal() {
$('#nextVideoModal').modal('show');
}

// Function to update slider handles based on input values
function updateSliderFromInputs() {
var startMinutes = parseInt(startMinutesInput.value) || 0;
var startSeconds = parseInt(startSecondsInput.value) || 0;
var startsMills = parseInt(startsMillisecondsInput.value) || 0;
var endMinutes = parseInt(endMinutesInput.value) || 0;
var endSeconds = parseInt(endSecondsInput.value) || 0;
var endMills = parseInt(endMillisecondsInput.value) || 0;

var startTime = startMinutes * 60 * 1000 + startSeconds * 1000 + startsMills;
var endTime = endMinutes * 60 * 1000 + endSeconds * 1000 + endMills;

if (startTime < 0) startTime = 0;
if (endTime > totalTime) endTime = totalTime;

var startPercentage = (startTime / totalTime) * 100;
var endPercentage = (endTime / totalTime) * 100;

startHandle.style.left = startPercentage + "%";
endHandle.style.left = endPercentage + "%";

updateLabels();
}


function updateLabels() {
var startPercentage = parseFloat(startHandle.style.left);
var endPercentage = parseFloat(endHandle.style.left);
var startTime = Math.round(startPercentage / 100 * totalTime);
var endTime = Math.round(endPercentage / 100 * totalTime);
startMinutesInput.value = formatTimeMinutes(startTime);
startSecondsInput.value = formatTimeSeconds(startTime);
startsMillisecondsInput.value = formatTimeMilliseconds(startTime);
endMinutesInput.value = formatTimeMinutes(endTime);
endSecondsInput.value = formatTimeSeconds(endTime);
endMillisecondsInput.value = formatTimeMilliseconds(endTime);
}

function formatTimeMinutes(time) {
return Math.floor(time / (1000 * 60));
}

function formatTimeSeconds(time) {
var seconds = Math.floor((time % (1000 * 60)) / 1000);
return seconds < 10 ? "0" + seconds : seconds;
}

function formatTimeMilliseconds(time) {
var milliseconds = time % 1000;
return milliseconds < 10 ? "00" + milliseconds : milliseconds < 100 ? "0" + milliseconds : milliseconds;
}

// var wf = new WFPlayer({
// container: document.querySelector('#waveform'),
// mediaElement: document.querySelector('#player'),
// });

// wf.load('path/to/audio.mp3');

async function fetch_video() {
    var video_id = document.getElementById("video_id").value;
    var video_id_textbox = document.getElementById("video_id");
    var video_url = document.getElementById("video_url").value;
    var video_url_textbox = document.getElementById("video_url");
    // var audio = document.getElementById("audio");
    // var full_audio = document.getElementById("full_audio");
    // var audiosrc = document.getElementById("audiosrc");
    // var player = document.getElementById("player");
    // var aud = document.getElementById("aud");
    var additional_data = document.getElementById("additional_data");
    var language_select = document.getElementById("language");

    if(video_id == "" && video_url == "") {
        alert("Please enter video ID or video URL");
        return;
    }

    if(video_id == "" && video_url != "") {
        video_id = video_url.split("/").pop();
        setTimeout(() => {
            video_id_textbox.value = "Loading .........";
        }, 100);
    }

    if(video_id != "" && video_url == "") {
        try{
            const response = await fetch(`https://vision.proteger.one/api/meetings/${video_id}/records`,
            {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer NjI.Pqv9wunSOQlRln5kp7BRk6GNhrfAOFkGFefaPhdYnr-r80BmgUxhC43ivq6L',
                    'Connection': 'keep-alive',
                    'Accept': '*/*'
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            recording_path = data.recordings[0].recording_path;
        }
        catch(err){
            console.log(err);
        }

        if(recording_path != undefined){
        const get_link_url = "https://vision.proteger.one/api/share/aws-link"
        const post_data = {
            "path": recording_path,
            "validity": "30mins"
        }
        try{
            const response = await fetch(get_link_url,
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer NjI.Pqv9wunSOQlRln5kp7BRk6GNhrfAOFkGFefaPhdYnr-r80BmgUxhC43ivq6L',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(post_data)
            });
            link_data = await response.json();
            video_url = link_data.url;
            video_url_textbox.value = video_url;
        }
        catch(err){
            console.log(err);
        }}
    }

    try{
            const video_data ={
                "video_id": video_id,
                "video_url": video_url
            }

            // video_id_textbox.value = ""
            const response = await fetch("/fetch",
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(video_data)
            });
            var audio_response = await response.json();
            // setTimeout(() => {
            //     video_id_textbox.value = "Loading ......";
            // }, 100);
            console.log("Audio Response : ",audio_response);
            if (audio_response.code == 'failure') {
                alert("Video Id: " + video_id + " was already processed");
                // return;
            }
            var duration = audio_response.duration;
            console.log(duration);
            totalTime = duration;
            // var audio_file_path = `uploads/${video_id}/audio.mp3`
            // var audioFilePath = "{{ url_for('static', filename='') }}" + audio_file_path;
            // audio.src = audioFilePath;
            // player.src = video_url;
            // player.load();
            // wf.load(audioFilePath);
            // audio.load();
            setTimeout( () => {
                video_id_textbox.value = video_id;
            }, 100);
            // aud.style.visibility = "visible";
            // updateLabels();
            additional_data.style.display = "block";

            try{
                const language_response = await fetch("/get_languages",
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                var language_response_response = await language_response.json();
                var languages = language_response_response.languages;
                language_select.innerHTML = '';
                languages.forEach(language => {
                    const option = document.createElement('option');
                    option.text = language;
                    language_select.add(option);
                });
            }
            catch(err){
                console.log(err);
            }
        }
        catch(err){
            console.log(err);
        }
        // loadAudio();
}

async function clip_audio() {
    var startPercentage = parseFloat(startHandle.style.left);
    var endPercentage = parseFloat(endHandle.style.left);
    var start_time = Math.round(startPercentage / 100 * totalTime);
    var end_time = Math.round(endPercentage / 100 * totalTime);
    var audio = document.getElementById("audio");
    var audiosrc = document.getElementById("audiosrc");
    var video_id = document.getElementById("video_id").value;
    var additional_data = document.getElementById("additional_data");
    var language_select = document.getElementById("language");
    // var all_buttons = document.getElementById("all_buttons");
    var audio_data = {
        "start_time": start_time,
        "end_time": end_time,
        "video_id": video_id
    }

    if(video_id == ""){
        alert("Please Fetch the video first");
        return;
    }

    try{
        const response = await fetch("/clip_audio",
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(audio_data)
        });
        var clipped_audio_response = await response.json();
        var languages = clipped_audio_response.languages;
        audio_file_name = clipped_audio_response.output_filename;
        var clipped_audio_file = "outputs/" + video_id + "/" + audio_file_name + ".mp3";
        console.log(clipped_audio_file);
        var time_in_seconds = Math.round(end_time/1000);
        console.log(time_in_seconds);
        wf.seek(end_time);
        var clipped_audioFilePath = "{{ url_for('static', filename='') }}" + clipped_audio_file;
        audio.src = clipped_audioFilePath;
        audio.load();
        alert("Audio clipped successfully");
        additional_data.style.display = "block";
        // Clear existing options
        language_select.innerHTML = '';
        languages.forEach(language => {
            const option = document.createElement('option');
                option.text = language;
                language_select.add(option);
        });
        // all_buttons.style.display = "block";
    }
    catch(err){
        console.log(err);
    }
}

function load_time() {
    start_time = parseFloat(document.querySelector("tbody tr td:nth-child(2)").innerText);
    end_time = parseFloat(document.querySelector("tbody tr td:nth-child(3)").innerText);
    console.log(start_time);
    console.log(end_time);
    alert("Audio Clipped Successfully");
}

function clear_vid() {
    document.getElementById("video_id").value = "";
    document.getElementById("video_url").value = "";
}

function reset_sliders() {
    startHandle.style.left = "0%";
    endHandle.style.left = "100%";
    updateLabels(); 
}

async function onSubmit() {
    // Get the values of all input fields
    var transcript = document.getElementById("transcript").value;
    var language = document.getElementById("language").value;
    var gender = document.getElementById("gender").value;
    // var role = document.getElementById("role").value;
    var comment = document.getElementById("comment").value;
    var additional_data = document.getElementById("additional_data");
    // var audio = document.getElementById("audio");
    var video_id = document.getElementById("video_id").value;
    // var start_time = document.querySelector("tbody td:nth-child(1)").innerText;
    // var end_time = document.querySelector("tbody td:nth-child(2)").innerText;

    if(start_time == 0.0 && end_time == 0.0){
        alert("Please trim the audio first");
        return;
    }

    var audio_data = {
        "start_time": start_time,
        "end_time": end_time,
        "video_id": video_id
    }

    if(transcript == ""){
        alert("Please enter transcript");
        return;
    }

    if(language == ""){
        alert("Please select language");
        return;
    }

    if(gender == ""){
        alert("Please select voice gender");
        return;
    }

    try{
        const response = await fetch("/clip_audio",
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(audio_data)
        });
        var clipped_audio_response = await response.json();
        // var languages = clipped_audio_response.languages;
        audio_file_name = clipped_audio_response.output_filename;
        var clipped_audio_file = "../outputs/" + video_id + "/" + audio_file_name + ".wav";
        console.log(clipped_audio_file);
        var clipped_audioFilePath = clipped_audio_file;
        // audio.src = clipped_audioFilePath;
        // audio.load();
        alert("Data Submitted successfully");
        // Clear existing options
        // all_buttons.style.display = "block";
    }
    catch(err){
        console.log(err);
    }

    try{
        const trascript_data = {
            "transcript": transcript,
            "language": language,
            "gender": gender,
            // "role": role,
            "comment": comment,
            "filename": audio_file_name,
            "video_id": video_id
        }
        const response = await fetch("/submit",
        {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(trascript_data)
        });
        var submit_response = await response.json(); 
        if(response.ok){
            clearInputs();
            // additional_data.style.display = "none";
            // audio.src = "";
            // audio.load();
        }
    }
    catch(err){
        console.log(err);
    }

    // Log the values (you can perform any further actions here)
    // console.log("Transcript:", transcript);
    // console.log("Language:", language);
    // console.log("Gender:", gender);
    // console.log("Role:", role);
    // console.log("Comment:", comment);
}

function clearInputs() {
    // Clear the values of all input fields
    document.getElementById("transcript").value = "";
    document.getElementById("language").value = "Hindi";
    document.getElementById("gender").value = "Male";
    // document.getElementById("role").value = "";
    document.getElementById("comment").value = "";
}

async function clear_all() {
    // var aud = document.getElementById("aud");
    var additional_data = document.getElementById("additional_data");
    var video_id = document.getElementById("video_id").value;
    download();
    // await downloadFileWithProgress();
    // clear_vid();
    // reset_sliders();
    clearInputs();
    // clear_video_audio();
    // aud.style.visibility = "hidden";
    additional_data.style.display = "none";
    // Close the modal
    var modal = document.getElementById('nextVideoModal');
    modal.classList.remove('show');
    var modalBackdrop = document.getElementsByClassName('modal-backdrop')[0];
    modalBackdrop.classList.remove('show');
    // setTimeout(clearInputs, 100);
}

function clear_clip() {
    // var audio = document.getElementById("audio");
    var additional_data = document.getElementById("additional_data");
    // audio.src = "";
    // audio.load();
    // reset_sliders();
    // clearInputs();
    additional_data.style.display = "none";
}

function clear_video_audio() {
    var audio = document.getElementById("audio");
    var player = document.getElementById("player");
    audio.src = "";
    player.src = "";
    audio.load();
    player.load();
}

async function download() {
var video_id = document.getElementById("video_id").value;
var video_url = document.getElementById("video_url").value;
var transcript = document.getElementById("transcript").value;

if (video_id == "" && video_url == "" && transcript == "" && audio_file_name == "") {
alert("Please Fill the details first");
return;
}

// Display download in progress message
const downloadMessage = document.createElement('div');
downloadMessage.textContent = 'Download in progress...';
downloadMessage.style.position = 'fixed';
downloadMessage.style.top = '50%';
downloadMessage.style.left = '50%';
downloadMessage.style.transform = 'translate(-50%, -50%)';
downloadMessage.style.backgroundColor = 'black';
downloadMessage.style.color = 'white';
downloadMessage.style.padding = '20px';
downloadMessage.style.border = '2px solid black';
document.body.appendChild(downloadMessage);

// Disable user interaction
document.body.style.pointerEvents = 'none';

await fetch('/download', {
method: 'POST',
headers: {
    'Content-Type': 'application/json'
},
body: JSON.stringify({ "video_id": video_id })
})
.then(response => {
if (response.ok) {
    return response.blob();
}
throw new Error('Network response was not ok');
})
.then(blob => {
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'static/outputs/' + video_id + '.zip';
document.body.appendChild(a);
a.click();
window.URL.revokeObjectURL(url);
alert(video_id + ".zip downloaded successfully")
audio_file_name = "";
})
.catch(error => console.error('Error:', error))
.finally(() => {
// Remove download in progress message
document.body.removeChild(downloadMessage);

// Re-enable user interaction
document.body.style.pointerEvents = 'auto';
});
}