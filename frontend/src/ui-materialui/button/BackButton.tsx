import ChevronLeft from '@mui/icons-material/ChevronLeft';
import { Button, ButtonProps } from "./Button";
import { useNavigate } from 'react-router';

export const BackButton = (props: BackButtonProps) => {
    const {
        icon = defaultIcon,
        label = 'Back',
        ...rest
    } = props;
    const navigate = useNavigate();

    return (
        <Button
            label={label}
            onClick={() => navigate(-1)}
            {...(rest as any)}
        >
            {icon}
        </Button>
    );
};

const defaultIcon = <ChevronLeft />;

interface Props {
    icon?: React.ReactNode;
    label?: string;
}

export type BackButtonProps = Props & ButtonProps;
