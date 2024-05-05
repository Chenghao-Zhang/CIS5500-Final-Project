import React, { useState } from 'react';
import { AppBar, Container, Toolbar, Typography, Menu, MenuItem, IconButton } from '@mui/material';
import { NavLink as RouterLink } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UserStatus from './UserStatus';
import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import page_icon from '../img/favicon.png';

function NavText({ href, text, isMain, subMenu }) {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const location = useLocation();
  const isSelected = location.pathname === href;
  const [anchorEl, setAnchorEl] = useState(null);
  const openSubMenu = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuId = 'innDulge-menu';

  return (
    <>
      {isMain && subMenu && (
        <>
          <RouterLink
            to={href}
            style={({ isActive }) => ({
              textDecoration: 'none',
              color: isActive ? deepPurple500 : 'inherit',
            })}
            className={clsx({
              'router-link-active': isSelected,
            })}
            aria-controls={menuId}
            aria-haspopup="true"
          >
            <Typography
              variant='h4'
              noWrap
              sx={{
                marginRight: '30px',
                fontFamily: 'cursive',
                fontWeight: 1000,
                letterSpacing: '.3rem',
                color: '#f7e1ed',
                '&:hover': {
                  textDecoration: 'underline',
                },
                '&.router-link-active': {
                  backgroundColor: 'primary',
                  color: 'white',
                },
              }}
            >
              {text}
              {' '}
              <IconButton
                onMouseEnter={handleMenuOpen}
                sx={{ ml: 1 }}
                aria-label="expand submenu"
              >
                <ExpandMoreIcon />
              </IconButton>
            </Typography>
          </RouterLink>

          <Menu
            id={menuId}
            anchorEl={anchorEl}
            open={openSubMenu}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            {subMenu.map((menuItem, index) => (
              <MenuItem
                key={index}
                component={RouterLink}
                to={menuItem.href}
                onClick={handleMenuClose}
                sx={{ 
                  typography: 'h6',
                  '&.Mui-selected': {
                    backgroundColor: primaryColor,
                  },
                  '&:hover': {
                    backgroundColor: primaryColor,
                  },
                }}
              >
                {menuItem.text}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}

      {!isMain && (
        <RouterLink
          to={href}
          style={({ isActive }) => ({
            textDecoration: 'none',
            color: isActive ? deepPurple500 : 'inherit',
          })}
          className={clsx({
            'router-link-active': isSelected,
          })}
        >
          <Typography
            variant='h7'
            noWrap
            sx={{
              marginRight: '30px',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              '&:hover': {
                textDecoration: 'underline',
              },
              '&.router-link-active': {
                backgroundColor: 'primary',
                color: 'white',
              },
            }}
          >
            {text}
          </Typography>
        </RouterLink>
      )}
    </>
  );
}

const deepPurple500 = '#673ab7';

export default function NavBar() {
  return (
    <AppBar position='static'>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <NavText
            href='/'
            text='InnDulge'
            isMain
            subMenu={[
              { href: '/residence', text: 'Residence' },
              { href: '/business', text: 'Entertainment' },
              { href: '/together', text: 'Play Together' },
              { href: '/ba', text: 'Business Analysis' },
            ]}
          />
          {/* Spacing */}
          <div style={{ flexGrow: 1 }} />
          {/* Logo */}
          <IconButton edge='start' color='inherit' aria-label='menu' href='/'>
            <img src={page_icon} alt='page icon' style={{ width: '50px', height: '50px' }} />
          </IconButton>
          <div style={{ flexGrow: 1 }} />
          <UserStatus />
        </Toolbar>
      </Container>
    </AppBar>
  );
}