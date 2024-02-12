import React from 'react';
import { Table } from 'react-bootstrap';

const MissingSongs = () => {
    let recommendedSongs = localStorage.getItem("songs")
    let missingSongs = JSON.parse(localStorage.getItem("playlistResponse"))['missing_songs']
    let songs = []
    try{
        songs = JSON.parse(recommendedSongs)['topSongs']
    }catch(e){

    }
    let missingSongSet = new Set()
    for(let missingSong of missingSongs){
        missingSongSet.add(missingSong[0]+"|"+missingSong[1])
    }
    let songsByAlbum = {}
    for (let songIdx in songs) {
        if (!missingSongSet.has(songs[songIdx]['playInfo']['artist']['name'].toLowerCase()+"|"+songs[songIdx]['playInfo']['name'].toLowerCase())){
            continue
        }
        if (!songsByAlbum[songs[songIdx]['album']['title'].toLowerCase()]){
            songsByAlbum[songs[songIdx]['album']['title'].toLowerCase()] = []
        }
        songsByAlbum[songs[songIdx]['album']['title'].toLowerCase()].push(songs[songIdx])
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
    return(
        <>
        <a href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(missingSongs))}`} download="export.json">Download Json</a>
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
        </>
    )
}

export default MissingSongs
