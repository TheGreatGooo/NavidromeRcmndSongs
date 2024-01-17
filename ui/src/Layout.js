import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Navigation from './Nav';

const Layout=({ children }) => {
    return (
        <Container fluid>
            <Row>
                <Col xs={1}>
                    <Navigation/>
                </Col>
                <Col>
                <div>{children}</div>
                </Col>
            </Row>
        </Container>
    );
}

export default Layout