import requests
import json
import config

HEADERS = {
    'Accept-Language': 'en-CA,en;q=0.9,fr-CA;q=0.8,fr;q=0.7,en-US;q=0.6,en-GB;q=0.5',
    'Connection': 'keep-alive',
    'Referer': 'http://arctic.kudikala.lan/navidrome/app/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'accept': 'application/json',
    'x-nd-authorization': config.xnd_authorization,
    'x-nd-client-unique-id': config.xnd_clientid,
}

PARAMS = {
    '_end': '15',
    '_order': 'ASC',
    '_sort': 'title',
    '_start': '0',
    'starred': 'true',
}

LASTFM_API_KEY = config.lastfm_api_key

def send_navidrome_request(endpoint, cookies=None, params=None):
    try:
        response = requests.get(endpoint, cookies=cookies, headers=HEADERS, params=params, verify=False)
        response.raise_for_status()
        return response.json()

    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None

def get_similar_tracks(artist, track_name):
    try:
        lastfm_params = {
            'method': 'track.getSimilar',
            'artist': artist,
            'track': track_name,
            'api_key': LASTFM_API_KEY,
            'format': 'json',
        }

        lastfm_response = requests.get('http://ws.audioscrobbler.com/2.0/', params=lastfm_params)
        lastfm_response.raise_for_status()
        return lastfm_response.json().get('similartracks', {}).get('track', [])

    except requests.exceptions.RequestException as e:
        print(f"Error getting similar tracks: {e}")
        return []

def save_to_json(data, filename):
    with open(filename, "w") as json_file:
        json.dump(data, json_file, indent=2)
        print(f"{filename} saved.")

def get_favorites():
    navidrome_response = send_navidrome_request('http://arctic.kudikala.lan/navidrome/api/song', cookies=config.cookies, params=PARAMS)

    if not navidrome_response:
        return

    save_to_json(navidrome_response, "favorites.json")

    similar_tracks = [get_similar_tracks(song.get('artist'), song.get('title')) for song in navidrome_response if 'artist' in song and 'title' in song]
    similar_tracks = [track for tracks in similar_tracks for track in tracks]

    save_to_json(similar_tracks, "similartracksfromfav.json")

    top_100_tracks = select_top_tracks(similar_tracks, 100)
    save_to_json(top_100_tracks, "top100tracks.json")

def select_top_tracks(similar_tracks, num_tracks):
    sorted_tracks = sorted(similar_tracks, key=lambda x: int(x.get('playcount', 0)), reverse=True)

    top_tracks = []
    selected_tracks = set()

    for track in sorted_tracks:
        title = track.get('name')
        if title not in selected_tracks:
            top_tracks.append(track)
            selected_tracks.add(title)

            if len(top_tracks) == num_tracks:
                break

    return top_tracks

if __name__ == "__main__":
    get_favorites()
