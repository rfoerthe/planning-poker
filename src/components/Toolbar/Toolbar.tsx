import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import AppToolbar from '@mui/material/Toolbar';
import GithubIcon from '@mui/icons-material/GitHub';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import MergeTypeOutlinedIcon from '@mui/icons-material/MergeTypeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { ThemePreference } from '../../service/theme';
import './Toolbar.css';

export const title = 'Planning Poker';

const legalNoticeUrl = 'https://info.foerther.de/impressum.html';
const repositoryUrl = 'https://github.com/rfoerthe/planning-poker';

type ToolbarProps = {
  themePreference?: ThemePreference;
  onThemePreferenceChange?: (themePreference: ThemePreference) => void;
};

const themeOptions = [
  { value: 'light', labelKey: 'toolbar.theme.light', Icon: LightModeOutlinedIcon },
  { value: 'dark', labelKey: 'toolbar.theme.dark', Icon: DarkModeOutlinedIcon },
  { value: 'system', labelKey: 'toolbar.theme.system', Icon: SettingsBrightnessOutlinedIcon },
] as const;

type NavItem = {
  testId: string;
  labelKey: string;
  Icon: typeof InfoOutlinedIcon;
  target: string;
  isExternal?: boolean;
};

const navItems: NavItem[] = [
  {
    testId: 'toolbar.menu.newSession',
    labelKey: 'toolbar.menu.newSession',
    Icon: AddCircleOutlineIcon,
    target: '/',
  },
  {
    testId: 'toolbar.menu.joinSession',
    labelKey: 'toolbar.menu.joinSession',
    Icon: MergeTypeOutlinedIcon,
    target: '/join',
  },
  {
    testId: 'toolbar.menu.about',
    labelKey: 'toolbar.menu.about',
    Icon: InfoOutlinedIcon,
    target: '/about-planning-poker',
  },
  {
    testId: 'toolbar.menu.guide',
    labelKey: 'toolbar.menu.guide',
    Icon: SearchOutlinedIcon,
    target: '/guide',
  },
  {
    testId: 'toolbar.menu.examples',
    labelKey: 'toolbar.menu.examples',
    Icon: BookOutlinedIcon,
    target: '/examples',
  },
  {
    testId: 'toolbar.menu.legal',
    labelKey: 'toolbar.menu.legalNotice',
    Icon: PolicyOutlinedIcon,
    target: legalNoticeUrl,
    isExternal: true,
  },
];

const primaryNavItems = navItems.slice(0, 2);
const secondaryNavItems = navItems.slice(2);

export const Toolbar = ({
  themePreference = 'system',
  onThemePreferenceChange = () => {},
}: ToolbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isCompact = useMediaQuery('(max-width: 760px)');
  const [themeMenuAnchorEl, setThemeMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [secondaryMenuAnchorEl, setSecondaryMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const isThemeMenuOpen = Boolean(themeMenuAnchorEl);
  const isSecondaryMenuOpen = Boolean(secondaryMenuAnchorEl);
  const selectedThemeOption =
    themeOptions.find((themeOption) => themeOption.value === themePreference) ?? themeOptions[2];
  const SelectedThemeIcon = selectedThemeOption.Icon;

  const handleThemeMenuClose = () => setThemeMenuAnchorEl(null);

  const handleThemePreferenceChange = (nextThemePreference: ThemePreference) => {
    onThemePreferenceChange(nextThemePreference);
    handleThemeMenuClose();
  };

  const handleNavigation = (item: NavItem) => {
    setIsDrawerOpen(false);
    setSecondaryMenuAnchorEl(null);
    if (item.isExternal) {
      window.location.href = item.target;
      return;
    }
    navigate(item.target);
  };

  const isCurrentRoute = (item: NavItem) =>
    !item.isExternal &&
    (item.target === '/' ? location.pathname === '/' : location.pathname.startsWith(item.target));

  return (
    <>
      <AppBar position='sticky' elevation={0} className='AppBar'>
        <AppToolbar className='AppToolbar' disableGutters>
          <button
            type='button'
            className='BrandButton'
            onClick={() => navigate('/')}
            title={t('toolbar.version', { version: import.meta.env.PACKAGE_VERSION })}
          >
            <span className='BrandMark' aria-hidden='true'>
              <svg viewBox='0 0 24 24' width='18' height='18'>
                <rect
                  x='2.6'
                  y='6'
                  width='9.6'
                  height='13.6'
                  rx='2.2'
                  transform='rotate(-18 7.4 12.8)'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.8'
                />
                <rect x='11.4' y='4.4' width='10' height='14' rx='2.4' fill='currentColor' />
              </svg>
            </span>
            <span className='BrandName'>{title}</span>
          </button>

          {!isCompact && (
            <nav className='NavLinks' aria-label={t('toolbar.primaryNavigation')}>
              {primaryNavItems.map((item, index) => (
                <button
                  key={item.testId}
                  type='button'
                  className={[
                    'NavLink',
                    index === 0 ? 'NavLinkPrimary' : '',
                    isCurrentRoute(item) ? 'NavLinkActive' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  data-testid={item.testId}
                  title={t(item.labelKey)}
                  aria-current={isCurrentRoute(item) ? 'page' : undefined}
                  onClick={() => handleNavigation(item)}
                >
                  <item.Icon className='NavLinkIcon' fontSize='small' />
                  {t(item.labelKey)}
                </button>
              ))}
              <button
                id='secondary-navigation-button'
                type='button'
                className='NavLink NavLinkMore'
                aria-controls={isSecondaryMenuOpen ? 'secondary-navigation-menu' : undefined}
                aria-haspopup='menu'
                aria-expanded={isSecondaryMenuOpen ? 'true' : undefined}
                onClick={(event) => setSecondaryMenuAnchorEl(event.currentTarget)}
              >
                <MoreHorizIcon className='NavLinkIcon' fontSize='small' />
                {t('toolbar.more')}
              </button>
            </nav>
          )}

          <div className='AppBarActions'>
            <Tooltip title={t('toolbar.theme.label')}>
              <IconButton
                id='theme-button'
                className='AppBarIconButton'
                color='inherit'
                aria-label={t('toolbar.theme.label')}
                aria-controls={isThemeMenuOpen ? 'theme-menu' : undefined}
                aria-haspopup='menu'
                aria-expanded={isThemeMenuOpen ? 'true' : undefined}
                onClick={(event) => setThemeMenuAnchorEl(event.currentTarget)}
                data-testid='toolbar.theme.button'
              >
                <SelectedThemeIcon fontSize='small' />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('toolbar.github')}>
              <IconButton
                id='github-button'
                className='AppBarIconButton'
                color='inherit'
                aria-label={t('toolbar.github')}
                onClick={() => (window.location.href = repositoryUrl)}
              >
                <GithubIcon fontSize='small' />
              </IconButton>
            </Tooltip>

            {isCompact && (
              <IconButton
                className='AppBarIconButton'
                color='inherit'
                aria-label={t('toolbar.openMenu')}
                aria-expanded={isDrawerOpen ? 'true' : undefined}
                onClick={() => setIsDrawerOpen(true)}
                data-testid='toolbar.menu.button'
              >
                <MenuIcon fontSize='small' />
              </IconButton>
            )}
          </div>
        </AppToolbar>
      </AppBar>

      <Menu
        id='theme-menu'
        anchorEl={themeMenuAnchorEl}
        open={isThemeMenuOpen}
        onClose={handleThemeMenuClose}
        slotProps={{ list: { 'aria-labelledby': 'theme-button' } }}
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

      <Menu
        id='secondary-navigation-menu'
        anchorEl={secondaryMenuAnchorEl}
        open={isSecondaryMenuOpen}
        onClose={() => setSecondaryMenuAnchorEl(null)}
        slotProps={{ list: { 'aria-labelledby': 'secondary-navigation-button' } }}
      >
        {secondaryNavItems.map((item) => (
          <MenuItem
            key={item.testId}
            selected={isCurrentRoute(item)}
            onClick={() => handleNavigation(item)}
            data-testid={item.testId}
          >
            <ListItemIcon>
              <item.Icon fontSize='small' />
            </ListItemIcon>
            <ListItemText>{t(item.labelKey)}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <Drawer
        anchor='right'
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        slotProps={{ paper: { className: 'NavDrawer' } }}
      >
        <div className='NavDrawerHeader'>
          <span className='SectionLabel'>{t('toolbar.brand')}</span>
          <IconButton
            aria-label={t('toolbar.closeMenu')}
            onClick={() => setIsDrawerOpen(false)}
            size='small'
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        </div>
        <Divider />
        <List className='NavDrawerList'>
          {navItems.map((item) => (
            <ListItemButton
              key={item.testId}
              className='NavDrawerItem'
              data-testid={`drawer.${item.testId}`}
              selected={isCurrentRoute(item)}
              aria-current={isCurrentRoute(item) ? 'page' : undefined}
              onClick={() => handleNavigation(item)}
            >
              <ListItemIcon className='NavDrawerIcon'>
                <item.Icon fontSize='small' />
              </ListItemIcon>
              <ListItemText primary={t(item.labelKey)} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </>
  );
};
