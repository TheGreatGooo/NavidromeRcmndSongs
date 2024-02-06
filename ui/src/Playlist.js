import React from 'react';
import { useEffect, useState } from 'react';
import { Button, Table, Modal } from 'react-bootstrap';

const Playlist = () => {
    const [currentRecommendations, setCurrentRecommendations] = useState(localStorage.getItem("currentRecommendations"))
    const [isSettingRecommendations, setSettingRecommendations] = useState(false)
    const [dialogMessage, setDialogMessage] = useState("")
    const handleClose = () => setDialogMessage("")
    useEffect(() => {
        function getNavidromePlaylist() {
            return new Promise((resolve) => {
                let navidrome_server_url = localStorage.getItem("navidrome_server_url")
                let navidrome_username = localStorage.getItem("navidrome_username")
                let navidrome_password = localStorage.getItem("navidrome_password")
                let response = fetch("/api/playlist",
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "navidrome_server_url": navidrome_server_url ? navidrome_server_url : "https://example.com/navidrome",
                        "navidrome_username": navidrome_username ? navidrome_username : "user",
                        "navidrome_password": navidrome_password ? navidrome_password : "password",
                    })
                })
                return response.then(response => {
                    if (response.ok){
                        return response.json()
                    } else {
                        setDialogMessage("Got invalid response from Navidrome server or Python backend")
                    }
                }).then((songs) => {
                    if (songs){
                        if (songs["success"]){
                            setDialogMessage("Playlist loaded")
                            localStorage.setItem("currentRecommendations", JSON.stringify(songs))
                            setCurrentRecommendations(JSON.stringify(songs))
                        } else {
                            setDialogMessage("Navidrome failed with message " + songs["message"])
                        }
                    }
                });
            });
        }

        if (!currentRecommendations) {
            getNavidromePlaylist()
        }
    }, [currentRecommendations])
    useEffect(() => {
        function setNavidromePlaylist() {
            return new Promise((resolve) => {
                let navidrome_server_url = localStorage.getItem("navidrome_server_url")
                let navidrome_username = localStorage.getItem("navidrome_username")
                let navidrome_password = localStorage.getItem("navidrome_password")
                let playlist_songs = []
                for (let song of JSON.parse(localStorage.getItem("songs"))['topSongs']){
                    playlist_songs.push({'artist':song['playInfo']['artist']['name'],'name':song['playInfo']['name']})
                }
                let response = fetch("/api/playlist",
                {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "navidrome_server_url": navidrome_server_url ? navidrome_server_url : "https://example.com/navidrome",
                        "navidrome_username": navidrome_username ? navidrome_username : "user",
                        "navidrome_password": navidrome_password ? navidrome_password : "password",
                        "playlist_songs": playlist_songs
                    })
                })
                return response.then(response => {
                    setSettingRecommendations(false)
                    if (response.ok){
                        return response.json()
                    } else {
                        setDialogMessage("Got invalid response from Navidrome server or Python backend")
                    }
                }).then((playlistResponse) => {
                    if (playlistResponse){
                        if (playlistResponse["success"]){
                            localStorage.setItem("playlistResponse",JSON.stringify(playlistResponse))
                            setDialogMessage("Playlist saved")
                            setCurrentRecommendations(null)
                        } else {
                            setDialogMessage("Navidrome failed with message " + playlistResponse["message"])
                        }
                    }
                });
            });
        }

        if (isSettingRecommendations) {
            setNavidromePlaylist()
        }
    }, [isSettingRecommendations]);
    let songs = []
    try{
        songs = JSON.parse(recommendedSongs)['topSongs']
    }catch(e){

    }
    let currentTracks = []
    try{
        currentTracks = JSON.parse(currentRecommendations)['songs']
    }catch(e){

    }
    let showDialog = dialogMessage.length == 0?false:true
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
            <Button onClick={()=>setCurrentRecommendations(null)}>Get Current Recommendations</Button>
            <Button onClick={()=>setSettingRecommendations(true)}>Sync Recommendations</Button>
            <Table>
                <thead>
                    <tr>
                        <th>Artist</th>
                        <th>Album</th>
                        <th>Track Name</th>
                    </tr>
                </thead>
                <tbody>
                    {currentTracks.map(song => <tr><td>{song['artist']}</td><td>{song['album']}</td><td>{song['title']}</td></tr>)}
                </tbody>
            </Table>
        </div>
    )
}

export default Playlist
