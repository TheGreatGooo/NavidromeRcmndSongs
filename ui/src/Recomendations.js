import React from 'react';
import { useEffect, useState } from 'react';
import { Button, Table, Modal, Accordion } from 'react-bootstrap';

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
                    signal: AbortSignal.timeout(3000000),
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
    let songsByAlbum = {}
    for (let songIdx in songs) {
        if (!songsByAlbum[songs[songIdx]['album']['title']]){
            songsByAlbum[songs[songIdx]['album']['title']] = []
        }
        songsByAlbum[songs[songIdx]['album']['title']].push(songs[songIdx])
    }
    let sortedSongsByAlbum = Object.keys(songsByAlbum).map(function(key){
        return [key, songsByAlbum[key]];
    })
    sortedSongsByAlbum.sort(function(obj1, obj2){
        let playcount1 = 0
        for (let songIdx in obj1[1]){
            playcount1 = playcount1 + parseInt(obj1[1][songIdx]['playInfo']['playcount'])
        }
        let playcount2 = 0
        for (let songIdx in obj2[1]){
            playcount2 = playcount2 + parseInt(obj2[1][songIdx]['playInfo']['playcount'])
        }
        if (playcount1 < playcount2){
            return 1
        } else if (playcount1 > playcount2){
            return -1
        }
        return 0
    });
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
            <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>All Tracks</Accordion.Header>
                    <Accordion.Body>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Artist</th>
                                    <th>Track Name</th>
                                    <th>Playcount</th>
                                    <th>Album</th>
                                </tr>
                            </thead>
                            <tbody>
                                {songs.map(song => <tr><td>{song['playInfo']['artist']['name']}</td><td>{song['playInfo']['name']}</td><td>{song['playInfo']['playcount']}</td><td>{song['album']['title']}</td></tr>)}
                            </tbody>
                        </Table>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header>Tracks By Album</Accordion.Header>
                    <Accordion.Body>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Album</th>
                                    <th>Artist</th>
                                    <th>Track Name</th>
                                    <th>Playcount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedSongsByAlbum.map(songWithDetails => <>
                                    <tr><td>{songWithDetails[0]}</td></tr>
                                    {songWithDetails[1].map(song => <tr><td></td><td>{song['playInfo']['artist']['name']}</td><td>{song['playInfo']['name']}</td><td>{song['playInfo']['playcount']}</td></tr>)}
                                </>)}
                            </tbody>
                        </Table>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
            <Button disabled={isLoading} onClick={!isLoading ? handleClick : null}>🗘</Button>
        </div>
    )
}

export default Recommendations