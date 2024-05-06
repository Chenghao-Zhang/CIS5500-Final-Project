// LoginForm.js
import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import { Checkbox } from '@mui/material';

import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { gapi } from 'gapi-script';
import TwitterLogin from "react-twitter-login";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function LoginForm({ isOpen, onClose, onSubmit }) {

  const tw_clientId = 'dTFOLUNtcjNvMWxZbmpIcnZoTUU6MTpjaQ';
  const tw_secret = '7ftA_v_UI9IBaEFW_i9QDdH-bxgF_5MtmPvYQnEHSoflP6G7VT';


  const clientId = '453513275360-mi0g8lr1l25j3ndjlie04rlli24v9ra9.apps.googleusercontent.com';

  const handleUsernameChange = (event) => {
    // console.log("sfaf", event)
    const value = event.target.value;
    // Filter out non-compliant characters
    const filteredValue = value.replace(/[\s~`!@#$%^&*()_=+[\]{}|;:'",<>/?\\]/g, '');
    formik.setFieldValue('username', filteredValue);
  };

  const handlePwdChange = (event) => {
    const value = event.target.value;
    // Filter out non-compliant characters
    const filteredValue = value.replace(/\s/g, ''); // Filter whitespace
    formik.setFieldValue('password', filteredValue);
  };

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      business_login: false,
    },
    validationSchema: Yup.object().shape({
      username: Yup.string().max(255).required('Username is required'),
      password: Yup.string().min(6).required('Password is required'),
    }),
    onSubmit: (values) => {
      onSubmit({ ...values, business_login });
      onClose();
    },
  });

  const [business_login, setBusinessLogin] = useState(false);
  const handleBusinessChange = (event) => {
    setBusinessLogin(event.target.checked);
  };
  

  useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        clientId: clientId,
        scope: ''
      });
    };
    gapi.load('client:auth2', initClient);
  });
  const [profile, setProfile] = useState([]);
  const onSuccess = (res) => {
    setProfile(res.profileObj);
  };
  const onFailure = (err) => {
    console.log('failed:', err);
  };
  const logOut = () => {
    setProfile(null);
  };
  // if (profile !== null) {
  //   // Simulate an event with profile email as target value
  //   console.log(profile.name)
  //   // handleUsernameChange({ target: { value: profile.email } });
  // }
  useEffect(() => {
    if (profile) {
      formik.setFieldValue('username', profile.name);
    }
  }, [profile]);

  const authHandler = (err, data) => {
    if (err) {
      console.error('Twitter Login failed:', err);
    } else {
      console.log('Twitter data:', data);
    }
  };
  return (
    <Modal open={isOpen} onClose={onClose} title="Login">
      <Box sx={style}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                type="username"
                value={profile ? profile.name : formik.values.username}
                onChange={handleUsernameChange}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={handlePwdChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />
            </Grid>
            <Grid item xs={12} container justifyContent="center">

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {profile ? (
                <div>
                  <img src={profile.imageUrl} alt="user image" />
                  <h3>User Logged in</h3>
                  <p>Name: {profile.name}</p>
                  <p>Email Address: {profile.email}</p>
                  <br />
                  <br />
                  <GoogleLogout clientId={clientId} buttonText="Log out" onLogoutSuccess={logOut} />
                </div>
              ) : (<GoogleLogin
                clientId={clientId}
                buttonText="Log in with Google"
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={'single_host_origin'}
                isSignedIn={true}
              />)
              }
              <br />
              <TwitterLogin
                authCallback={authHandler}
                consumerKey={tw_clientId}
                consumerSecret={tw_secret}
                buttonText="Log in with Twitter"
              />
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={!formik.isValid}
                sx={{ mt: 2 }}
              >
                Login
              </Button>

              <Checkbox
                checked={business_login}
                onChange={handleBusinessChange}
                inputProps={{ 'aria-label': 'business login' }}
              />
              {/* <InputLabel id="business-label" sx={{ mb: 1 }}>Business</InputLabel> */}
              </Box>
            </Grid>
            
          </Grid>
        </form>
      </Box>
    </Modal>
  );
};