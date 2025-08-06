import { Card, Stack, Typography } from '@mui/material';
import { ShowBase, useShowContext } from '../../frame';
import { BackButton } from '../../ui-materialui';

const RoundShow = () => (
  <ShowBase>
    <RoundShowView />
  </ShowBase>
);

const RoundShowView = () => {
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
            <Typography variant="caption">Position</Typography>
            <Typography variant="body2">{data.position}</Typography>
          </div>
        </Stack>
      </Card>
      <BackButton />
    </div>
  );
};

export default RoundShow;
