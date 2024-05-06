import React, { useState } from 'react';
import { Button, TextField, FormControl, Rating, Stack, Box, Modal } from '@mui/material';
import { useFormik } from 'formik';
import { apiCall } from '../helpers/apicall';
import moment from 'moment';

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

export default function RevieweForm({ isOpen, onClose, user_id, entityId, entityType, refresh }) {
  const [formData] = useState({
    stars: 0,
    text: '',
  });

  const initialValues = {
    user_id: user_id,
    id: entityId,
    date: moment().format('YYYY-MM-DD'),
    stars: formData.stars,
    text: formData.text,
  };

  const formik = useFormik({
    initialValues,
    onSubmit: async (values, { resetForm }) => {
      if (entityType === 'airbnb') {
        await apiCall('POST', 'review/residence/add', values);
      } else if (entityType === 'business') {
        await apiCall('POST', 'review/business/add', values);
      }
      refresh && refresh()
      resetForm({ values: initialValues });
      onClose();
    },
  });

  return (
    <Modal open={isOpen} onClose={onClose}>
    {/* <DialogTitle>Review</DialogTitle> */}
    <Box sx={style}>
        <form noValidate onSubmit={formik.handleSubmit}>
        <Box sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
            <Stack spacing={2}>
            <FormControl fullWidth>
                <Rating
                name="stars"
                value={formik.values.stars}
                onChange={(event, newValue) => formik.setFieldValue('stars', newValue)}
                precision={0.5}
                />
            </FormControl>
            <TextField
                fullWidth
                label="Review Text"
                multiline
                rows={4}
                variant="outlined"
                margin="normal"
                name="text"
                value={formik.values.text}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                helperText={formik.touched.text && formik.errors.text}
            />
            <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={!formik.isValid}
            >
                Submit Review
            </Button>
            </Stack>
        </Box>
        </form>
    </Box>
    </Modal>
  );
};