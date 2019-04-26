import React from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';
import { Avatar } from '../components';
import avatar3 from '../../img/avatar3.jpeg';
import avatar4 from '../../img/avatar4.jpeg';
import avatar5 from '../../img/avatar5.jpeg';
import avatar6 from '../../img/avatar6.jpeg';

export default function Avatars() {
  return (
    <React.Fragment>
      <Card>
        <CardHeader>Initials</CardHeader>
        <CardBody>
          <Avatar initials="JS" color="primary" /> <Avatar initials="TD" color="secondary" />{' '}
          <Avatar initials="AP" color="warning" size="small" /> <Avatar initials="PT" color="danger" size="small" />{' '}
        </CardBody>
      </Card>
      <Card>
        <CardHeader>Images</CardHeader>
        <CardBody>
          <Avatar image={avatar3} /> <Avatar image={avatar4} /> <Avatar image={avatar5} size="small" />{' '}
          <Avatar image={avatar6} size="small" />{' '}
        </CardBody>
      </Card>
    </React.Fragment>
  );
}
