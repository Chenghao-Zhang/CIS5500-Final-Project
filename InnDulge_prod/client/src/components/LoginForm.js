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
            onSubmit({...values, business_login});
            onClose();
        },
    });

    const [business_login, setBusinessLogin] = useState(false);
    const handleBusinessChange = (event) => {
        setBusinessLogin(event.target.checked);
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
                        <Grid item xs={12} container justifyContent="center">
                        <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={!formik.isValid}
                                sx={{ mt: 2 }}
                            >
                                Login
                            </Button>

                            {/* <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}> */}
                                <Checkbox
                                    checked={business_login}
                                    onChange={handleBusinessChange}
                                    inputProps={{ 'aria-label': 'business login' }}
                                />
                                {/* <InputLabel id="business-label" sx={{ mb: 1 }}>Business</InputLabel> */}
                            {/* </Box> */}
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Modal>
    );
};