from flask import Flask, request, jsonify
import requests
import json
import musicbrainzngs

app = Flask(__name__)
musicbrainzngs.set_useragent("ndrome_193","0.01")

@app.route('/test-login', methods=['POST'])
def login():
    try:
        payload = request.get_json()
        navidrome_server_url = payload.get('navidrome_server_url')
        username = payload.get('navidrome_username')
        password = payload.get('navidrome_password')

        auth_tokens = auth_and_capture_headers(navidrome_server_url, username, password)

        if auth_tokens:
            return jsonify({'success': True, 'message': 'Authentication succesful'})
        else:
            return jsonify({'success': False, 'message': 'Authentication failed'})
        
    except Exception as e:
        return jsonify({'success': False,  'message': f'Error during authentication: {str(e)}'})

@app.route('/songs', methods=['POST'])
def recommend_songs():
    payload = request.get_json()
    navidrome_server_url = payload.get("navidrome_server_url")
    navidrome_username = payload.get("navidrome_username")
    navidrome_password = payload.get("navidrome_password")
    lastfm_token = payload.get("lastfm_token")
    limit = payload.get("limit")

    try:
        auth_tokens = auth_and_capture_headers(navidrome_server_url, navidrome_username, navidrome_password)
        if not auth_tokens:
            raise Exception("Auth failed, check the navidrome username and password")
        current_favorties = get_current_favorites(navidrome_server_url, auth_tokens)
        all_similar_tracks = get_all_similar_tracks(lastfm_token, current_favorties)
        similar_tracks_sorted = sorted(all_similar_tracks, key=lambda track: int(track.get('playcount', 0)), reverse=True)
        top_tracks = filter_tracks(similar_tracks_sorted, limit)
        top_tracks_with_details = detailed_track_info(top_tracks)
        return jsonify({'success': True, 'topSongs': top_tracks_with_details, 'favorites': current_favorties})
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching top songs: {str(e)}'})

def isType(recordingType, release):
    return ( ('type' in release['release-group'] and release['release-group']['type'] == recordingType) or ('primary-type' in release['release-group'] and release['release-group']['primary-type'] == recordingType))

def detailed_track_info(tracks):
    tracks_with_details = []
    for track in tracks:
        title = None
        result = musicbrainzngs.search_recordings(query=f"title:{track['name']} AND artist:{track['artist']['name']}")
        albums = []
        for recording in result['recording-list']:
            if int(recording['ext:score']) < 60 :
                continue
            if 'release-list' not in recording:
                continue
            for release in recording['release-list']:
                if 'status' not in release :
                    continue
                if( release['status'] == 'Official' and isType('Album', release) and ('artist-credit' not in release  or release['artist-credit'][0]['name'] != 'Various Artists')):
                    if title :
                        if title != release['title']:
                            raise Exception(f"Found multiple album names: '{release['title']}' '{title}'  for the track: {track['name']} artist: {track['artist']['name']}")
                    else:
                        albums.append(release)
            if len(albums) == 0 :
                for release in recording['release-list']:
                    if 'status' not in release or 'artist-credit' not in release:
                        continue
                    if( release['status'] == 'Official' and isType('Single', release) and ('artist-credit' not in release  or release['artist-credit'][0]['name'] != 'Various Artists')):
                        if title :
                            if title != release['title']:
                                raise Exception(f"Found multiple album names: '{release['title']}' '{title}'  for the track: {track['name']} artist: {track['artist']['name']}")
                        else:
                            albums.append(release)
            if len(albums) == 1:
                title = albums[0]['title']
                tracks_with_details.append({'playInfo':track,'album':albums[0]})
            else:
                selected_album = None
                for album in albums:
                   if not title or len(album['title']) < len(title) :
                        title = album['title']
                        selected_album = album
                if selected_album:
                    tracks_with_details.append({'playInfo':track,'album':selected_album})
            if title :
                break
        if not title :
            tracks_with_details.append({'playInfo':track,'album':{'title':'unknown'}})
    return tracks_with_details

def auth_and_capture_headers(navidrome_server_url, username, password):
    auth_url = f"{navidrome_server_url}/auth/login"

    payload = {
        "username": username,
        "password": password
    }

    try:
        response = requests.post(auth_url, json=payload)
        response.raise_for_status()

        json_response = response.json()

        print(f"Received username: {username}")

        xnd_authorization = "Bearer " + json_response.get('token')
        xnd_client_id = json_response.get('id')

        if xnd_authorization and xnd_client_id:
            return (xnd_authorization, xnd_client_id)
        else:
            print("Authentication failed. Headers not found.")
            return None

    except requests.exceptions.RequestException as e:
        print(f"Error during authentication: {e}")
        return None

FAV_SEARCH_PARAMS = {
    '_end': '1000',
    '_order': 'ASC',
    '_sort': 'title',
    '_start': '0',
    'starred': 'true',
}

def send_navidrome_request(endpoint, auth_tokens, params=None):
    try:
        response = requests.get(endpoint,
                                headers={'accept': 'application/json',
    'x-nd-authorization': auth_tokens[0],
    'x-nd-client-unique-id': auth_tokens[1]}, params=params, verify=False)
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None

def get_track_details(lastfm_api_key, artist, track_name):
    try:
        lastfm_params = {
            'method': 'track.getInfo',
            'artist': artist,
            'track': track_name,
            'api_key': lastfm_api_key,
            'format': 'json',
        }

        lastfm_response = requests.get(
            'http://ws.audioscrobbler.com/2.0/', params=lastfm_params)
        lastfm_response.raise_for_status()
        return lastfm_response.json().get('track', {})

    except requests.exceptions.RequestException as e:
        print(f"Error getting similar tracks: {e}")
        return {}

def get_similar_tracks(lastfm_api_key, artist, track_name):
    try:
        lastfm_params = {
            'method': 'track.getSimilar',
            'artist': artist,
            'track': track_name,
            'api_key': lastfm_api_key,
            'format': 'json',
        }

        lastfm_response = requests.get(
            'http://ws.audioscrobbler.com/2.0/', params=lastfm_params)
        lastfm_response.raise_for_status()
        return lastfm_response.json().get('similartracks', {}).get('track', [])

    except requests.exceptions.RequestException as e:
        print(f"Error getting similar tracks: {e}")
        return []


def save_to_json(data, filename):
    with open(filename, "w") as json_file:
        json.dump(data, json_file, indent=2)
        print(f"{filename} saved.")

def get_current_favorites(navidrome_server_url, auth_tokens):
    return send_navidrome_request(
        f'{navidrome_server_url}/api/song', auth_tokens, params=FAV_SEARCH_PARAMS)

def get_all_similar_tracks(lastfm_api_key, current_favorties):
    similar_tracks = [get_similar_tracks(lastfm_api_key, song.get('artist'), song.get(
        'title')) for song in current_favorties if 'artist' in song and 'title' in song]
    favs = set()
    for fav in current_favorties:
        favs.add(f"artist:{fav['artist'].lower()}|title:{fav['title'].lower()}")
    print(favs)
    return [track for tracks in similar_tracks for track in tracks if f"artist:{track['artist']['name'].lower()}|title:{track['name'].lower()}" not in favs]

def filter_tracks(similar_tracks, limit):
    top_tracks = []
    selected_tracks = set()
    previous_track = similar_tracks[0]
    for track in similar_tracks:
        title = track.get('name')
        artist = track.get('artist').get('name')
        if (artist, title) not in selected_tracks:
            top_tracks.append(track)
            selected_tracks.add((artist, title))
            if len(top_tracks) > int(limit):
                previous_track = track
                break
        elif ( previous_track.get('name') == title and previous_track.get('artist').get('name') == artist ):
            top_tracks[len(top_tracks)-1]['playcount'] = top_tracks[len(top_tracks)-1]['playcount'] + track['playcount']
        previous_track = track
    return sorted(top_tracks, key=lambda track: int(track.get('playcount', 0)), reverse=True)

if __name__ == "__main__":
    app.run(port=5000)
    
