import React from 'react';
import Button from '@material-ui/core/Button';
import ProductIcon from '@material-ui/icons/Collections';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { EditButton } from '../admin/materialui'
import {
  TextField,
  Datagrid,
  List,
} from './materialui';

export const SeasonList = props => {
  const { slug: competitionSlug } = useParams();
  return (
    <List
      {...props}
      perPage={1000}
      actions={null}
      filterDefaultValues={{ competition: competitionSlug }}
      bulkActionButtons={false}
      pagination={null}>
      <Datagrid>
        {/* <ReferenceField label="User" source="userId" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="title" />
      <ShowButton /> */}
        <TextField source="name" sortable={false} />
        <TextField source="slug" sortable={false} />
        <TextField source="year" sortable={false} />
        <SeasonsLink />
        <EditButton />
      </Datagrid>
    </List>
  )
};

const useStyles = makeStyles({
  icon: { paddingRight: '0.5em' },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
  },
});


const SeasonsLink = ({ record }) => {
  const classes = useStyles();
  return record ? (
    <Button
      size="small"
      color="primary"
      component={Link}
      to={{
        pathname: `/competitions/${record.slug}/seasons`,
      }}
      className={classes.link}
    >
      <ProductIcon className={classes.icon} />
      Seasons
    </Button>
  ) : null;
};

