import React from 'react';
import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

const Recommendations = () => {
    const [isLoading, setLoading] = useState(false);
    useEffect(() => {
        function computeRecommendations() {
            return new Promise((resolve) => {
                let navidrome_server_url = localStorage.getItem("navidrome_server_url")
                let navidrome_username = localStorage.getItem("navidrome_username")
                let navidrome_password = localStorage.getItem("navidrome_password")
                let lastfm_token = localStorage.getItem("token")
                let limit = localStorage.getItem("limit")
                let response = fetch("/api/songs",
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "navidrome_server_url": navidrome_server_url ? navidrome_server_url : "https://example.com/navidrome",
                        "navidrome_username": navidrome_username ? navidrome_username : "user",
                        "navidrome_password": navidrome_password ? navidrome_password : "password",
                        "lastfm_token": lastfm_token ? lastfm_token : "token",
                        "limit": limit ? limit : "100",
                    })
                })
                return response.then(response => response.json())
            });
        }

        if (isLoading) {
            computeRecommendations().then((songs) => {
                localStorage.setItem("songs", JSON.stringify(songs))
                setLoading(false);
            });
        }
    }, [isLoading]);
    
    const handleClick = () => setLoading(true);
    let songs = localStorage.getItem("songs");
    if (songs){
        return (
            <div>
                {songs}
            </div>
        )
    }else{
        return (
            <div>
                <Button disabled={isLoading} onClick={!isLoading ? handleClick : null}>🗘</Button>
            </div>
        )
    }
}

export default Recommendations