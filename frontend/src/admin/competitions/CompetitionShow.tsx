import { Card, Stack, Typography } from '@mui/material';
import { ShowBase, useShowContext } from '../../frame';
import { BackButton, ListButton } from '../../ui-materialui';

const CompetitionShow = () => (
  <ShowBase>
    <CompetitionShowView />
  </ShowBase>
);

const CompetitionShowView = () => {
  const { record: data, isLoading } = useShowContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Card>
        <Stack spacing={1}>
          <div>
            <Typography variant="caption">Name</Typography>
            <Typography variant="body2">{data.name}</Typography>
          </div>
          <div>
            <Typography variant="caption">TLA</Typography>
            <Typography variant="body2">{data.code}</Typography>
          </div>
        </Stack>
      </Card>
      <BackButton />
    </div>
  );
};

export default CompetitionShow;
