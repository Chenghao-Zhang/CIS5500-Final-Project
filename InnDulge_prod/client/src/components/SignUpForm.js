// SignUpForm.js
import React from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

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

export default function SignUpForm ({ isOpen, onClose, onSubmit }) {
    const handleUsernameChange = (event) => {
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
    
    const handleConfirmPwdChange = (event) => {
        const value = event.target.value;
        // Filter out non-compliant characters
        const filteredValue = value.replace(/\s/g, ''); // Filter whitespace
        formik.setFieldValue('confirmPassword', filteredValue);
    };

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object().shape({
        username: Yup.string().min(1).max(20).required('Username is required'),
        password: Yup.string()
            .min(6)
            .required('Password is required'),
        confirmPassword: Yup.string().min(6).required('Password is required')
    }),
    onSubmit: (values) => {
      onSubmit(values);
      onClose();
    },
  });

  return (
    <Modal open={isOpen} onClose={onClose} title="Sign Up">
      <Box sx={style}>
        <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                fullWidth
                label="Username"
                name="username"
                type="username"
                value={formik.values.username}
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
            <Grid item xs={12}>
                <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formik.values.confirmPassword}
                onChange={handleConfirmPwdChange}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                />
            </Grid>
            <Grid item xs={12} container justifyContent="center">
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={!formik.isValid}
                        sx={{ mt: 2 }}
                    >
                        Sign Up
                    </Button>
                </Grid>
                </Grid>
        </form>
      </Box>
    </Modal>
  );
};