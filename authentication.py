import requests
import config

def authenticate_and_capture_headers(username, password):
    auth_url = "http://arctic.kudikala.lan/navidrome/app/#/login"

    payload = {
        "username": config.username,
        "password": config.password,
    }

    try:
        response = requests.post(auth_url, json=payload)
        response.raise_for_status()

        # json_response = response.json()

        token = requests.head

        xnd_authorization = response.headers.get('x-nd-authorization')
        xnd_client_id = response.headers.get('x-nd-client-id')

        if xnd_authorization and xnd_client_id:
            print("Authentication successful!")
            print(f"x-nd-authorization: {xnd_authorization}")
            print(f"x-nd-client-id: {xnd_client_id}")
        else:
            print("Authentication failed. Headers not found.")

    except requests.exceptions.RequestException as e:
        print(f"Error during authentication: {e}")

# Usage
authenticate_and_capture_headers(config.username, config.password)
