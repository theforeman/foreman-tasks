import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Grid, Row, Col } from 'patternfly-react';

export const TaskSkeleton = () => {
  const details = [1, 2, 3, 4, 5, 6];
  return (
    <Grid>
      <br />
      <Row>
        <Col>
          <Skeleton />
        </Col>
      </Row>
      {details.map((items, key) => (
        <Row key={key}>
          <Col md={2} sm={6}>
            <Skeleton />
          </Col>
          <Col md={5} sm={6}>
            <Skeleton />
          </Col>
          <Col md={2} sm={6}>
            <Skeleton />
          </Col>
          <Col md={3} sm={6}>
            <Skeleton />
          </Col>
        </Row>
      ))}
      <br />
      <Row>
        <Col xs={6}>
          <div className="progress-description">
            <Skeleton />
          </div>
        </Col>
        <Col xs={3} xsOffset={3} className="progress-label-top-right">
          <Skeleton />
        </Col>
        <Col xs={12}>
          <Skeleton />
        </Col>
      </Row>
      <br />
    </Grid>
  );
};
