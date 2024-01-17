import React from 'react'
import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

const updateSetting = (key, value) => {
    localStorage.setItem(key, value)
    localStorage.removeItem("songs")
}

const Settings = () => {
    const [isLoading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    let connectionState = null;
    useEffect(() => {
        function testConnection() {
            return new Promise((resolve) => {
                let navidrome_server_url = localStorage.getItem("navidrome_server_url")
                let navidrome_username = localStorage.getItem("navidrome_username")
                let navidrome_password = localStorage.getItem("navidrome_password")
                let response = fetch("/api/test-login",
                {
                    method: 'POST',
                    body: {
                        "navidrome_server_url": navidrome_server_url ? navidrome_server_url : "https://example.com/navidrome",
                        "navidrome_username": navidrome_username ? navidrome_username : "user",
                        "navidrome_password": navidrome_password ? navidrome_password : "password",
                    }
                })
                return response.then(response => response.json())
            });
        }

        if (isLoading) {
            testConnection().then((test_response) => {
                connectionState = test_response;
                setLoading(false);
                setShow(true);
            });
        }
    }, [isLoading]);
    
    const handleClick = () => setLoading(true);
    return (
    <>
    <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>Woohoo, you are reading this text in a modal!</Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
            Close
            </Button>
        </Modal.Footer>
    </Modal>
    <Form>
        <Form.Group className='mb-3'>
            <Form.Label>Navidrome URL</Form.Label>
            <Form.Control onChange={(event) => {updateSetting("navidrome_server_url",event.target.value)}} placeholder='https://example.com/navidrome'/>
            <Form.Text className='text-muted'>The base url of the Navidrome installation</Form.Text>
        </Form.Group>
        <Form.Group className='mb-3'>
            <Form.Label>Navidrome username</Form.Label>
            <Form.Control onChange={(event) => {updateSetting("navidrome_username",event.target.value)}} placeholder='user'/>
            <Form.Text className='text-muted'>Navidrome username</Form.Text>
        </Form.Group>
        <Form.Group className='mb-3'>
            <Form.Label>Navidrome password</Form.Label>
            <Form.Control type="password" onChange={(event) => {updateSetting("navidrome_password",event.target.value)}} placeholder='password'/>
            <Form.Text className='text-muted'>Navidrome password</Form.Text>
        </Form.Group>

        <Form.Group className='mb-3'>
            <Button onClick={!isLoading ? handleClick : null}>Test Connection</Button>
        </Form.Group>

        <Form.Group className='mb-3'>
            <Form.Label>LastFM Token</Form.Label>
            <Form.Control onChange={(event) => {updateSetting("lastfm_token",event.target.value)}} placeholder='token'/>
            <Form.Text className='text-muted'>LastFM token to use for querying similar songs</Form.Text>
        </Form.Group>
        <Form.Group className='mb-3'>
            <Form.Label>Limit</Form.Label>
            <Form.Control onChange={(event) => {updateSetting("limit",event.target.value)}} placeholder='100'/>
            <Form.Text className='text-muted'>Number of songs to suggest</Form.Text>
        </Form.Group>
    </Form>
    </>)
};

export default Settings