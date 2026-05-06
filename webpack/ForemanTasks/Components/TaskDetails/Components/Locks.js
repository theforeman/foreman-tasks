import React from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  AlertVariant,
  Gallery,
  GalleryItem,
  Card,
  CardTitle,
  CardBody,
} from '@patternfly/react-core';
import { translate as __ } from 'foremanReact/common/I18n';

const ConditionalLink = ({ children, link }) =>
  link ? <a href={link}>{children}</a> : children;

ConditionalLink.propTypes = {
  children: PropTypes.node.isRequired,
  link: PropTypes.string,
};

ConditionalLink.defaultProps = {
  link: null,
};

const Locks = ({ locks }) => (
  <div>
    <Alert
      variant={AlertVariant.info}
      ouiaId="task-locks-info"
      isInline
      className="pf-u-mb-lg"
    >
      {__(
        'You can find resource locks on this page. Exclusive lock marked with locked icon means that no other task can use locked resource while this task is running. Non-exclusive lock marked with unlocked icon means other tasks can access the resource freely, it is only used to indicate the relation of this task with the resource'
      )}
    </Alert>
    <Gallery hasGutter>
      {locks.map((lock, key) => (
        <GalleryItem key={key}>
          <ConditionalLink link={lock.link}>
            <Card isCompact ouiaId={`task-lock-${key}`}>
              <CardTitle>
                <span
                  className={`pf-u-mr-sm fa ${
                    lock.exclusive ? 'fa-lock' : 'fa-unlock-alt'
                  }`}
                  aria-hidden
                />
                {lock.resource_type}
              </CardTitle>
              <CardBody>{`id:${lock.resource_id}`}</CardBody>
            </Card>
          </ConditionalLink>
        </GalleryItem>
      ))}
    </Gallery>
  </div>
);

Locks.propTypes = {
  locks: PropTypes.array,
};

Locks.defaultProps = {
  locks: [],
};

export default Locks;
