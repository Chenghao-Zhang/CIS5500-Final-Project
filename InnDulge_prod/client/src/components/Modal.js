// Modal.js
import React from 'react';
import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';

export default function Modal ({ isOpen, onClose, title }) {
  return <Dialog
    open={isOpen}
    onClose={onClose}
    aria-labelledby="form-dialog-title"
    PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 1, p: 2 } }}
  >
    {title && <DialogTitle id="form-dialog-title">{title}</DialogTitle>}
    {/* <DialogContent sx={{ px: 2, py: 1 }}>{children}</DialogContent> */}
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Cancel
      </Button>
    </DialogActions>
  </Dialog>
};