from flask import Flask, render_template, request, jsonify, send_file
import requests
import requests
from moviepy.video.io.VideoFileClip import VideoFileClip
from pydub import AudioSegment
from datetime import datetime
from zipfile import ZipFile
import os
import shutil

app = Flask(__name__, static_folder='static')

def download_video(url: str, output_path: str):
    with requests.get(url, stream=True) as response:
        with open(output_path, 'wb') as file:
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    file.write(chunk)

def extract_audio(video_path: str, audio_path: str):
    video_clip = VideoFileClip(video_path)
    audio_clip = video_clip.audio
    audio_clip.write_audiofile(audio_path)
    video_clip.close()


def split_audio_rttm(audio_path: str, 
                     output_folder: str,
                     output_file: str, 
                     start: float, 
                     end: float):

    # Load the audio file
    audio = AudioSegment.from_file(audio_path, format='mp3')
    
    start_time = int(start * 1000)  # Convert to milliseconds
    end_time = int(end * 1000)  # Convert to milliseconds
    print(start_time)
    print(end_time)

    # Extract the audio segment for the current turn
    turn_audio = audio[start_time:end_time]

    # Save the turn as a separate audio file
    output_filename = f"{output_folder}{output_file}.wav"
    turn_audio.export(output_filename, format='wav')


def extract_and_split_audio(file, start, end):
    # Define paths
    video_path = 'uploads/video.mp4'
    audio_path = 'uploads/audio.mp3'
    output_folder = 'output/'
    output_file = 'output'

    # Download the video
    download_video(file, video_path)

    # Extract audio from the video
    extract_audio(video_path, audio_path)

    # Split the audio
    split_audio_rttm(audio_path, output_folder, output_file, start, end)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/fetch', methods=['POST'])
def fetch():
    # Get data from the request
    video_data = request.json

    # Process the data
    video_id = video_data.get('video_id')
    video_url = video_data.get('video_url')

    video_path = f'static/uploads/{video_id}/video.mp4'
    audio_path = f'static/uploads/{video_id}/audio.mp3'

    if not os.path.exists('static/uploads/' + video_id):
        os.makedirs('static/uploads/' + video_id)

    download_video(video_url, video_path)
    extract_audio(video_path, audio_path)

    audio = AudioSegment.from_file(audio_path)
    duration_ms = len(audio)
    print(duration_ms)
    # duration_seconds = duration_ms / 1000.0

    if os.path.exists(f'static/outputs/{video_id}.zip'):
        response = {'message': 'Video already uploaded',
                    'audio_path': audio_path, 
                    'duration': int(duration_ms), 
                    'code': 'failure'}
        return jsonify(response), 502

    # return render_template('index.html', video_url=video_url)
    # Return a response
    response = {'message': 'Video uploaded successfully', 
                'audio_path': audio_path, 
                'duration': int(duration_ms),
                'code': 'success'}
    return jsonify(response), 200

@app.route('/clip_audio', methods=['POST'])
def clip_audio():
    # Get data from the request
    split_data = request.json

    # Process the data
    start = split_data.get('start_time')
    end = split_data.get('end_time')
    video_id = split_data.get('video_id')

    file = f'static/uploads/{video_id}/audio.mp3'

    current_date = datetime.now().date()
    current_time = datetime.now().time().strftime("%H%M%S")
    output_filename = f'{current_date}_{current_time}_{video_id}_{start}_{end}'

    if not os.path.exists('static/outputs/' + video_id):
        os.makedirs('static/outputs/' + video_id)

    # split the audio
    split_audio_rttm(file, f'static/outputs/{video_id}/', output_filename , start, end)

    # Return a response
    response = {'message': 'Audio split successfully', 
                'output_filename': f'{output_filename}'
                }
    return jsonify(response), 200

@app.route('/get_languages', methods=['POST'])
def get_languages():
    languages = []

    with open(f'static/language.txt', 'r') as ff:
        lines = ff.readlines()
        for line in lines:
            language = line.split(',')[0]
            languages.append(language)

    response = {'languages': languages}
    return jsonify(response), 200

@app.route('/submit', methods=['POST'])
def submit():
    submit_data = request.json

    transcript = submit_data.get('transcript')
    language = submit_data.get('language')
    gender = submit_data.get('gender')
    # role = submit_data.get('role')
    comment = submit_data.get('comment')
    filename = submit_data.get('filename')
    video_id = submit_data.get('video_id')

    if comment == '':
        comment = "NA"

    transcript_file = 'static/outputs/' + video_id + '/transcript.csv'
    transcript_text = f"{filename},{transcript},{language},{gender},{comment}\n"

    if not os.path.exists(transcript_file):
        with open(transcript_file, 'w') as f:
            f.write(transcript_text)

    else:
        with open(transcript_file, 'a') as f:
            f.write(transcript_text)

    response = {'message': 'Transcript submitted successfully'}
    return jsonify(response), 200

@app.route('/download', methods=['POST'])
def zip_files():
    video_id = request.json.get('video_id')
    filenames = ['transcript.csv']

    with open(f'static/outputs/{video_id}/transcript.csv', 'r') as ff:
        lines = ff.readlines()
        for line in lines:
            filename = line.split(',')[0]
            filenames.append(filename + '.wav')
    # filenames = [filename + '.mp3', 'transcript.csv']

    file_paths = [os.path.join(f'static/outputs/{video_id}', file) for file in filenames]
    
    zip_path = f'static/outputs/{video_id}.zip'
    with ZipFile(zip_path, 'w') as zip_file:
        for file_path in file_paths:
            zip_file.write(file_path, os.path.basename(file_path))

    # delete vid folder
    # shutil.rmtree(f'static/uploads/{video_id}')
    # shutil.rmtree(f'static/outputs/{video_id}')

    return send_file(zip_path, as_attachment=True)

@app.route('/delete', methods=['POST'])
def delete_files():
    video_id = request.json.get('video_id')

    if os.path.exists(f'static/uploads/{video_id}'):
        shutil.rmtree(f'static/uploads/{video_id}')

    if os.path.exists(f'static/outputs/{video_id}'):
        shutil.rmtree(f'static/outputs/{video_id}')

    if os.path.exists(f'static/outputs/{video_id}.zip'):
        os.remove(f'static/outputs/{video_id}.zip')

    response = {'message': 'Files deleted successfully'}
    return jsonify(response), 200


if __name__ == '__main__':
    app.run(debug=True, port=3000, host='0.0.0.0')
