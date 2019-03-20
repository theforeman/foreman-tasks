import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Card, Row, Col } from 'patternfly-react';
import { translate as __ } from 'foremanReact/common/I18n';

const Locks = ({ locks }) => (
  <div>
    <Alert type="info">
      {__(
        'You can find resource locks on this page. Exclusive lock marked with locked icon means that no other task can use locked resource while this task is running. Non-exclusive lock marked with unlocked icon means other tasks can access the resource freely, it is only used to indicate the relation of this task with the resource'
      )}
    </Alert>
    <Card.Grid>
      <Row>
        {locks.map((lock, key) => (
          <Col xs={6} sm={4} md={4} key={key}>
            <Card className="card-pf-aggregate-status" accented>
              <Card.Title>
                <span
                  className={`fa ${
                    lock.exclusive ? 'fa-lock' : 'fa-unlock-alt'
                  }`}
                />
                {lock.name}
              </Card.Title>
              <Card.Body>
                {`${lock.resource_type} id:${lock.resource_id}`}
                <br />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Card.Grid>
  </div>
);

Locks.propTypes = {
  locks: PropTypes.array,
};

Locks.defaultProps = {
  locks: [],
};

export default Locks;
