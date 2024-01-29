import React from 'react'
import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

const updateSettings = (event) => {
    event.preventDefault();
    localStorage.setItem("navidrome_server_url", event.target.url.value)
    localStorage.setItem("navidrome_username", event.target.username.value)
    localStorage.setItem("navidrome_password", event.target.password.value)
    localStorage.setItem("limit", event.target.limit.value)
    localStorage.setItem("token", event.target.token.value)
    localStorage.removeItem("songs")
}

const Settings = (props) => {
    const [isTestingConnection, setTestingConnection] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [navidromeServerUrl, setNavidromeServerUrl] = useState(localStorage.getItem("navidrome_server_url"));
    const [navidromeUsername, setNavidromeUsername] = useState(localStorage.getItem("navidrome_username"));
    const [navidromePassword, setNavidromePassword] = useState(localStorage.getItem("navidrome_password"));
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [limit, setLimit] = useState(localStorage.getItem("limit"));
    const handleClose = () => setDialogMessage("")
    useEffect(() => {
        function testConnection() {
            return new Promise((resolve) => {
                let response = fetch("/api/test-login",
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "navidrome_server_url": navidromeServerUrl ? navidromeServerUrl : "https://example.com/navidrome",
                        "navidrome_username": navidromeUsername ? navidromeUsername : "user",
                        "navidrome_password": navidromePassword ? navidromePassword : "password",
                    })
                })
                return response.then(response => {
                    setTestingConnection(false);
                    if (response.ok){
                        return response.json()
                    } else {
                        setDialogMessage("Got invalid response from Navidrome server or Python backend")
                    }
                })
                .then(testResponse => {
                    if (testResponse){
                        if (testResponse["success"]){
                            setDialogMessage("Navidrome server connected sucessfully")
                        } else {
                            setDialogMessage("Navidrome failed with message " + testResponse["message"])
                        }
                    }
                })
            });
        }

        if (isTestingConnection) {
            testConnection()
        }
    }, [isTestingConnection])
    
    const handleClick = (event) => setTestingConnection(true);
    let showDialog = dialogMessage.length == 0?false:true
    return (
    <>
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
    <Form onSubmit={(event)=>updateSettings(event)}>
        <Form.Group className='mb-3'>
            <Form.Label>Navidrome URL</Form.Label>
            <Form.Control name='url' value={navidromeServerUrl} onInput={e => setNavidromeServerUrl(e.target.value)} placeholder='https://example.com/navidrome'/>
            <Form.Text className='text-muted'>The base url of the Navidrome installation</Form.Text>
        </Form.Group>
        <Form.Group className='mb-3'>
            <Form.Label>Navidrome username</Form.Label>
            <Form.Control value={navidromeUsername} onInput={e => setNavidromeUsername(e.target.value)} name='username' placeholder='user'/>
            <Form.Text  className='text-muted'>Navidrome username</Form.Text>
        </Form.Group>
        <Form.Group className='mb-3'>
            <Form.Label>Navidrome password</Form.Label>
            <Form.Control value={navidromePassword} onInput={e => setNavidromePassword(e.target.value)} name='password' type="password" placeholder='password'/>
            <Form.Text className='text-muted'>Navidrome password</Form.Text>
        </Form.Group>

        <Form.Group className='mb-3'>
            <Button onClick={!isTestingConnection ? handleClick : null}>Test Connection</Button>
        </Form.Group>

        <Form.Group className='mb-3'>
            <Form.Label>LastFM Token</Form.Label>
            <Form.Control value={token} onInput={e => setToken(e.target.value)}  name='token' placeholder='token'/>
            <Form.Text className='text-muted'>LastFM token to use for querying similar songs</Form.Text>
        </Form.Group>
        <Form.Group className='mb-3'>
            <Form.Label>Limit</Form.Label>
            <Form.Control value={limit} onInput={e => setLimit(e.target.value)}  name='limit' placeholder='100'/>
            <Form.Text className='text-muted'>Number of songs to suggest</Form.Text>
        </Form.Group>
        <Form.Group className='mb-3'>
            <Button type="submit">Save</Button>
        </Form.Group>
    </Form>
    </>)
};

export default Settings