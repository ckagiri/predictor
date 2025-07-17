import { Card, Stack, Typography } from '@mui/material';
import { ShowBase, useShowContext } from '../../frame';
import { BackButton } from '../../ui-materialui';

const MatchShow = () => (
  <ShowBase>
    <MatchShowView />
  </ShowBase>
);

const MatchShowView = () => {
  const { record: data, isLoading } = useShowContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Card>
        <Stack spacing={1}>
          <div>
            <Typography variant="caption">
              Fixture
            </Typography>
            <Typography variant="body2">{data.homeTeam.name} vs {data.awayTeam.name}</Typography>
          </div>
          <div>
            <Typography variant="caption">
              Status
            </Typography>
            <Typography variant="body2">{data.status}</Typography>
          </div>
          <div>
            <Typography variant="caption">
              Score
            </Typography>
            <Typography variant="body2">
              {data.result.goalsHomeTeam} - {data.result.goalsAwayTeam}
            </Typography>
          </div>
        </Stack>
      </Card>
      <BackButton />
    </div>
  );
};

export default MatchShow;
