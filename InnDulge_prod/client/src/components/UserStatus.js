// UserStatus.js
import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { loginUser, onLogin, onLogout } from '../helpers/cookie';
import cookie from 'react-cookies'
import UserAvatar from './UserAvatar';

const config = require('../config.json');

export default function UserStatus() {
  // Msg Ctrl
  const [msg, setMsg] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  // User Status
  const [userId, setUserId] = useState(cookie.load('userId')?cookie.load('userId'):'');
  const [username, setUsername] = useState(cookie.load('username')?cookie.load('username'):'');
  // Modal Ctrl
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // Try load user from Cookies
  useEffect(() => {
    try {
      console.log(loginUser());
      const currentUser = loginUser();
      if(currentUser.userId!==undefined&&currentUser.userId!==null&&currentUser.userId!==''){
        handleCookieLogin(currentUser.userId, currentUser.username);
      }
    } catch (error) {
      console.log('No cookies')
    }
  }, []);

  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
    handleCloseSignupModal();
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleOpenSignupModal = () => {
    setIsSignupModalOpen(true);
    handleCloseLoginModal();
  };

  const handleCloseSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleRegistrationSuccess = () => {
    setOpenSnackbar(true);
  };

  const handleLogout = () => {
    setUserId('');
    setUsername('');
    onLogout();
  };

  const handleCookieLogin = (userId, username) => {
    setUserId(userId);
    setUsername(username);
  };

  async function handleLogin (newUser) {
    return new Promise((resolve, reject) => {
        fetch(`http://${config.server_host}:${config.server_port}/user/login`,
        {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: newUser.username, password: newUser.password })
        }
        )
        .then(res => res.json())
        .then(resJson => {
            if(resJson.userId&&resJson.username){
                setUserId(resJson.userId);
                setUsername(resJson.username);
                onLogin({userId:resJson.userId, username: resJson.username});
                console.log(resJson);
                resolve(true);
            }else{
                resolve(false);
            }
        }).catch(error => {
            console.error('Error logging in:', error);
            reject(error);
        });
    });
  };

  async function handleLoginSubmit (userData) {
    const result = await handleLogin(userData);
    console.log(result);
    if(result){
      setMsg('User Login Successful.')
    }else{
      setMsg('User Login failed.')
    }
    handleRegistrationSuccess();
  };

  const handleSignUpSubmit = (userData) => {
    fetch(`http://${config.server_host}:${config.server_port}/user/register`, 
    {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: userData.username, password: userData.password })
    })
      .then(res => res.json())
      .then(resJson => {
        if(resJson.userId){
            setMsg('User Registration Successful.')
            handleRegistrationSuccess();
        }else{
            const errMsg = resJson.error?resJson.error:'User Registration failed.';
            console.error(errMsg);
            setMsg(errMsg)
            handleRegistrationSuccess();
        }
    });
  };

  return (
    <>
      <Snackbar open={openSnackbar} 
      autoHideDuration={6000} 
      message = {msg}
      onClose={handleCloseSnackbar}/>
      {userId!=='' ? (
        <Stack direction="row" spacing={2}>
          <Tooltip title={username}>
          <UserAvatar user={{id:userId, name:username}}/>
          </Tooltip>
          <Button variant="contained" color='info' onClick={handleLogout}>Logout</Button>
        </Stack>
      ) : (
        <>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="success" onClick={handleOpenLoginModal}>Login</Button>
              <Button variant="contained" color="success" onClick={handleOpenSignupModal}>Sign Up</Button>
            </Stack>
        </>
      )}
      <LoginForm 
      isOpen={isLoginModalOpen}
      onClose={handleCloseLoginModal}
      onSubmit={handleLoginSubmit} />

      <SignUpForm 
      isOpen={isSignupModalOpen}
      onClose={handleCloseSignupModal}
      onSubmit={handleSignUpSubmit} />
    </>
  );
};