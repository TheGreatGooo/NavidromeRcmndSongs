import React from 'react'
import Container from 'react-bootstrap/Container';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
  
  const Navigation = () => (
    <Container className="p-3">
        <Nav  className="flex-column" >
            <Nav.Link href="#settings">Settings</Nav.Link>
            <Nav.Link href="#recommendations">Recommendations</Nav.Link>
        </Nav>
    </Container>
  );
  
  export default Navigation;