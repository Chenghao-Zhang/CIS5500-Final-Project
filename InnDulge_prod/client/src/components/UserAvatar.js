import React from 'react';
import { Avatar, Tooltip, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { deepPurple } from '@mui/material/colors';

const buildUserPath = (userId) => `/user/${userId}`;

const UserAvatar = ({ user }) => {
  const navigate = useNavigate();

  const handleOnClick = () => {
    navigate(buildUserPath(user.id));
  };

  return (
    <Tooltip title={user.name} placement="bottom-start">
      <Link component="button" onClick={handleOnClick} sx={{ position: 'relative', right: 10, textDecoration: 'none' }}>
        <Avatar sx={{ bgcolor: deepPurple[500], textDecoration: 'none'}}>
          {user.name[0].toUpperCase()}
        </Avatar>
      </Link>
    </Tooltip>
  );
};

export default UserAvatar;