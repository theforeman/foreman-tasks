import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Grid, GridItem } from '@patternfly/react-core';

export const TaskSkeleton = () => {
  const details = [1, 2, 3, 4];
  return (
    <Grid hasGutter>
      <GridItem span={12} className="pf-v5-u-pb-lg" />
      <GridItem span={12}>
        <Skeleton />
      </GridItem>
      {details.map(key => (
        <React.Fragment key={key}>
          <GridItem md={2} sm={6}>
            <Skeleton />
          </GridItem>
          <GridItem md={5} sm={6}>
            <Skeleton />
          </GridItem>
          <GridItem md={2} sm={6}>
            <Skeleton />
          </GridItem>
          <GridItem md={3} sm={6}>
            <Skeleton />
          </GridItem>
        </React.Fragment>
      ))}
      <GridItem span={12} className="pf-v5-u-pb-lg" />
      <GridItem span={12}>
        <Skeleton />
      </GridItem>
      <GridItem span={12}>
        <Skeleton />
      </GridItem>
      <GridItem span={12} className="pf-v5-u-pb-lg" />
    </Grid>
  );
};
