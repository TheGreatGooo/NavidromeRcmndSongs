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
    const [isLoading, setLoading] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const handleClose = () => setDialogMessage("")
    useEffect(() => {
        function testConnection() {
            return new Promise((resolve) => {
                let navidrome_server_url = localStorage.getItem("navidrome_server_url")
                let navidrome_username = localStorage.getItem("navidrome_username")
                let navidrome_password = localStorage.getItem("navidrome_password")
                let response = fetch("/api/test-login",
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
                        setLoading(false);
                        setDialogMessage("Got invalid response from Navidrome server")
                    }
                })
            });
        }

        if (isLoading) {
            testConnection().then((test_response) => {
                setLoading(false);
                setDialogMessage("Navidrome server connected sucessfully")
            });
        }
    }, [isLoading]);
    
    const handleClick = () => setLoading(true);
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
            <Form.Control name='url' defaultValue={localStorage.getItem("navidrome_server_url")} placeholder='https://example.com/navidrome'/>
            <Form.Text className='text-muted'>The base url of the Navidrome installation</Form.Text>
        </Form.Group>
        <Form.Group className='mb-3'>
            <Form.Label>Navidrome username</Form.Label>
            <Form.Control defaultValue={localStorage.getItem("navidrome_username")} name='username' placeholder='user'/>
            <Form.Text  className='text-muted'>Navidrome username</Form.Text>
        </Form.Group>
        <Form.Group className='mb-3'>
            <Form.Label>Navidrome password</Form.Label>
            <Form.Control defaultValue={localStorage.getItem("navidrome_password")} name='password' type="password" placeholder='password'/>
            <Form.Text className='text-muted'>Navidrome password</Form.Text>
        </Form.Group>

        <Form.Group className='mb-3'>
            <Button onClick={!isLoading ? handleClick : null}>Test Connection</Button>
        </Form.Group>

        <Form.Group className='mb-3'>
            <Form.Label>LastFM Token</Form.Label>
            <Form.Control defaultValue={localStorage.getItem("token")} name='token' placeholder='token'/>
            <Form.Text className='text-muted'>LastFM token to use for querying similar songs</Form.Text>
        </Form.Group>
        <Form.Group className='mb-3'>
            <Form.Label>Limit</Form.Label>
            <Form.Control defaultValue={localStorage.getItem("limit")} name='limit' placeholder='100'/>
            <Form.Text className='text-muted'>Number of songs to suggest</Form.Text>
        </Form.Group>
        <Form.Group className='mb-3'>
            <Button type="submit">Save</Button>
        </Form.Group>
    </Form>
    </>)
};

export default Settings