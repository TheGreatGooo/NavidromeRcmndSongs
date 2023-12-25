import requests
import json
import config
import requests

cookies = {
    'nd-player-636865727279': 'd649631f-437e-45de-aa69-89006c3edebc',
}

headers = {
    'Accept-Language': 'en-CA,en;q=0.9,fr-CA;q=0.8,fr;q=0.7,en-US;q=0.6,en-GB;q=0.5',
    'Connection': 'keep-alive',
    'Referer': 'http://arctic.kudikala.lan/navidrome/app/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'accept': 'application/json',
    'x-nd-authorization': config.xnd_authorization,
    'x-nd-client-unique-id': config.xnd_clientid,
}

params = {
    '_end': '15',
    '_order': 'ASC',
    '_sort': 'title',
    '_start': '0',
    'starred': 'true',
}

lastfm_api_key = config.lastfm_api_key
lastfm_shared_secret = config.lastfm_shared_secret

def get_favorites():
    try:
        navidrome_response = requests.get(
            'http://arctic.kudikala.lan/navidrome/api/song',
            params=params,
            cookies=cookies,
            headers=headers,
            verify=False,
        )
        navidrome_response.raise_for_status()
        favorites_data = navidrome_response.json()

        with open("favorites.json", "w") as json_file:
            json.dump(favorites_data, json_file, indent=2)

        print("Favorites saved to favorites.json")

        similar_tracks = []
        for song in favorites_data:
            artist = song.get('artist')
            track_name = song.get('title')

            if artist and track_name:
                similar_tracks.extend(get_similar_tracks(artist, track_name))

        with open("similartracksfromfav.json", "w") as json_file:
            json.dump(similar_tracks, json_file, indent=2)

        print("Similar tracks saved to similartracksfromfav.json")

        top_100_tracks = select_top_tracks(similar_tracks, 100)
        
        with open("top100tracks.json", "w") as json_file:
            json.dump(top_100_tracks, json_file, indent= 2)

        print("Top 100 tracks from similar tracks saved to top100tracks.json")

    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

def get_similar_tracks(artist, track_name):
    try:
        lastfm_params = {
            'method': 'track.getSimilar',
            'artist': artist,
            'track': track_name,
            'api_key': lastfm_api_key,
            'format': 'json',
        }

        lastfm_response = requests.get('http://ws.audioscrobbler.com/2.0/', params=lastfm_params)
        lastfm_response.raise_for_status()
        similar_tracks_data = lastfm_response.json().get('similartracks', {}).get('track', [])

        return similar_tracks_data

    except requests.exceptions.RequestException as e:
        print(f"Error getting similar tracks: {e}")
        return []


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