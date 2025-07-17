import { Link } from "react-router-dom";
import { ListBase, RecordContextProvider, useCreatePath, useListContext } from "../../frame";
import { ShowButton } from "../../ui-materialui";

const CompetitionList = () => {
  return (
    <ListBase>
      <CompetitionListView />
    </ListBase>
  );
};

const CompetitionListView = () => {
  const { data, isLoading, resource } = useListContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {data?.map(record => (
        <RecordContextProvider key={record.id} value={record}>
          <li key={record.id}>
            {record.name} &nbsp;
            <ShowButton />
            <SeasonsLink competitionPath={`${resource.path}/${record.slug}`} />
          </li>
        </RecordContextProvider>
      ))}
    </ul>
  );
};

type SeasonsLinkProps = {
  competitionPath: string;
}

const SeasonsLink = ({ competitionPath }: SeasonsLinkProps) => {
  const createPath = useCreatePath();
  return (
    <Link
      to={createPath({ type: "list", resource: `${competitionPath}/seasons` })}
    >
      Seasons
    </Link>
  );
};

export default CompetitionList;
