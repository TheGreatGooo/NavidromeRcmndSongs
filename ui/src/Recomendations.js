import React from 'react';
import { useEffect, useState } from 'react';
import { Button, Table, Modal } from 'react-bootstrap';

const Recommendations = () => {
    const [isLoading, setLoading] = useState(false)
    const [dialogMessage, setDialogMessage] = useState("")
    const [recommendedSongs, setRecommendedSongs] = useState(localStorage.getItem("songs"))
    const handleClose = () => setDialogMessage("")
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
                return response.then(response => {
                    setLoading(false);
                    if (response.ok){
                        return response.json()
                    } else {
                        setDialogMessage("Got invalid response from Navidrome server or Python backend")
                    }
                }).then((songs) => {
                    if (songs){
                        if (songs["success"]){
                            setDialogMessage("Recommendations loaded")
                            localStorage.setItem("songs", JSON.stringify(songs))
                            setRecommendedSongs(JSON.stringify(songs))
                        } else {
                            setDialogMessage("Navidrome failed with message " + songs["message"])
                        }
                    }
                });
            });
        }

        if (isLoading) {
            computeRecommendations()
        }
    }, [isLoading]);
    
    const handleClick = () => setLoading(true)
    let showDialog = dialogMessage.length == 0?false:true
    let songs = []
    try{
        songs = JSON.parse(recommendedSongs)['topSongs']
    }catch(e){

    }
    return (
        <div>
            <Modal show={showDialog} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Connection status</Modal.Title>
                </Modal.Header>
                <Modal.Body>{dialogMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                    Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Table>
                <thead>
                    <tr>
                        <th>Artist</th>
                        <th>Track Name</th>
                        <th>Playcount</th>
                    </tr>
                </thead>
                <tbody>
                    {songs.map(song => <tr><td>{song['artist']['name']}</td><td>{song['name']}</td><td>{song['playcount']}</td></tr>)}
                </tbody>
            </Table>
            <Button disabled={isLoading} onClick={!isLoading ? handleClick : null}>🗘</Button>
        </div>
    )
}

export default Recommendations