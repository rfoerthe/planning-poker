import {
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Slide,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import AppToolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import GamesIcon from '@mui/icons-material/Games';
import GithubIcon from '@mui/icons-material/GitHub';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckIcon from '@mui/icons-material/Check';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import MergeTypeOutlinedIcon from '@mui/icons-material/MergeTypeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import React from 'react';
import { useNavigate } from 'react-router';
import './Toolbar.css';
import { useTranslation } from 'react-i18next';
import { ThemePreference } from '../../service/theme';
export const title = 'Planning Poker';

type ToolbarProps = {
  themePreference?: ThemePreference;
  onThemePreferenceChange?: (themePreference: ThemePreference) => void;
};

const themeOptions = [
  {
    value: 'light',
    labelKey: 'toolbar.theme.light',
    Icon: LightModeOutlinedIcon,
  },
  {
    value: 'dark',
    labelKey: 'toolbar.theme.dark',
    Icon: DarkModeOutlinedIcon,
  },
  {
    value: 'system',
    labelKey: 'toolbar.theme.system',
    Icon: SettingsBrightnessOutlinedIcon,
  },
] as const;

export const Toolbar = ({
  themePreference = 'system',
  onThemePreferenceChange = () => {},
}: ToolbarProps) => {
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery((theme: any) => theme.breakpoints.down('xs'));
  const { t } = useTranslation();
  const [themeMenuAnchorEl, setThemeMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const isThemeMenuOpen = Boolean(themeMenuAnchorEl);
  const selectedThemeOption =
    themeOptions.find((themeOption) => themeOption.value === themePreference) ?? themeOptions[2];
  const SelectedThemeIcon = selectedThemeOption.Icon;

  const handleThemeMenuClose = () => {
    setThemeMenuAnchorEl(null);
  };

  const handleThemePreferenceChange = (nextThemePreference: ThemePreference) => {
    onThemePreferenceChange(nextThemePreference);
    handleThemeMenuClose();
  };

  return (
    <Slide direction='down' in={true} timeout={800}>
      <AppBar position='sticky' className='AppBar'>
        <AppToolbar>
          <div className='HeaderContainer'>
            <div className='HeaderLeftContainer' onClick={() => navigate('/')}>
              <GamesIcon className='HeaderIcon' />
              <Typography variant={isSmallScreen ? 'subtitle1' : 'h5'}
                          color='inherit'
                          noWrap
                          title={`Version: ${import.meta.env.PACKAGE_VERSION}`}>
                {title}
              </Typography>
            </div>
            <div className='HeaderActions'>
              <Button
                title={t('toolbar.menu.about')}
                startIcon={<InfoOutlinedIcon />}
                color='inherit'
                onClick={() => navigate('/about-planning-poker')}
              >
                {!isSmallScreen ? t('toolbar.menu.about') : null}
              </Button>
              <Button
                title={t('toolbar.menu.guide')}
                startIcon={<SearchOutlinedIcon />}
                color='inherit'
                onClick={() => navigate('/guide')}
              >
                {!isSmallScreen ? t('toolbar.menu.guide') : null}
              </Button>
              <Button
                title={t('toolbar.menu.examples')}
                startIcon={<BookOutlinedIcon />}
                color='inherit'
                onClick={() => navigate('/examples')}
              >
                {!isSmallScreen ? t('toolbar.menu.examples') : null}
              </Button>
              <Button
                title={t('toolbar.menu.newSession')}
                startIcon={<AddCircleOutlineIcon />}
                color='inherit'
                onClick={() => navigate('/')}
                data-testid='toolbar.menu.newSession'
              >
                {!isSmallScreen ? t('toolbar.menu.newSession') : null}
              </Button>
              <Button
                title={t('toolbar.menu.joinSession')}
                startIcon={<MergeTypeOutlinedIcon />}
                size={isSmallScreen ? 'small' : 'large'}
                color='inherit'
                onClick={() => navigate('/join')}
                data-testid='toolbar.menu.joinSession'
              >
                {!isSmallScreen ? t('toolbar.menu.joinSession') : null}
              </Button>
              <Button
                title={t('toolbar.menu.legalNotice')}
                startIcon={<PolicyOutlinedIcon />}
                size={isSmallScreen ? 'small' : 'large'}
                color='inherit'
                onClick={() =>
                  (window.location.href = 'https://info.foerther.de/legal_notice_en.html')
                }
                data-testid='toolbar.menu.legal'
              >
                {!isSmallScreen ? t('toolbar.menu.legalNotice') : null}
              </Button>

              <Tooltip title={t('toolbar.theme.label')}>
                <IconButton
                  id='theme-button'
                  color='inherit'
                  aria-label={t('toolbar.theme.label')}
                  aria-controls={isThemeMenuOpen ? 'theme-menu' : undefined}
                  aria-haspopup='menu'
                  aria-expanded={isThemeMenuOpen ? 'true' : undefined}
                  onClick={(event) => setThemeMenuAnchorEl(event.currentTarget)}
                  data-testid='toolbar.theme.button'
                >
                  <SelectedThemeIcon />
                </IconButton>
              </Tooltip>
              <Menu
                id='theme-menu'
                anchorEl={themeMenuAnchorEl}
                open={isThemeMenuOpen}
                onClose={handleThemeMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'theme-button',
                }}
              >
                {themeOptions.map(({ value, labelKey, Icon }) => (
                  <MenuItem
                    key={value}
                    selected={themePreference === value}
                    onClick={() => handleThemePreferenceChange(value)}
                    data-testid={`toolbar.theme.${value}`}
                  >
                    <ListItemIcon>
                      <Icon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText>{t(labelKey)}</ListItemText>
                    {themePreference === value ? <CheckIcon fontSize='small' /> : null}
                  </MenuItem>
                ))}
              </Menu>
              <Button
                id='github-button'
                color='inherit'
                onClick={() =>
                  (window.location.href = 'https://github.com/rfoerthe/planning-poker')
                }
              >
                <GithubIcon></GithubIcon>
              </Button>
              {/*{!isSmallScreen && <LanguageControl />}*/}
            </div>
          </div>
        </AppToolbar>
      </AppBar>
    </Slide>
  );
};
