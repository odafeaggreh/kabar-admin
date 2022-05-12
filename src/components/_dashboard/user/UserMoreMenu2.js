import { Icon } from "@iconify/react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { httpsCallable } from "firebase/functions";
import { useRef, useState } from "react";
import editFill from "@iconify/icons-eva/edit-fill";
import { Link as RouterLink } from "react-router-dom";
import trash2Outline from "@iconify/icons-eva/trash-2-outline";
import moreVerticalFill from "@iconify/icons-eva/more-vertical-fill";
// material
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth, app, functions } from "../../../Firebase/firebase";

// ----------------------------------------------------------------------

// Modal Styles
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 400,
  bgcolor: "background.paper",
  border: "none",
  borderRadius: "5px",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
};

export default function UserMoreMenu2({
  uid,
  amount,
  type,
  status,
  transactionId,
}) {
  // User balance states
  const [userAmount, setUserAmount] = useState(amount);
  const [userType, setUserType] = useState(type);
  const [userStatus, setUserStatus] = useState(status);
  const [userTransactionId, setUserTransactionId] = useState(transactionId);
  const [updateAlert, setUpdateAlert] = useState("");
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  // Delete user cloud function
  const deleteUser = httpsCallable(functions, "deleteUser");

  // Modal states

  const [open, setOpen] = useState(false);

  const handleUpdate = async (transactionId) => {
    console.log(uid, transactionId);
    const adminRef = doc(db, `users/${uid}/transactions/${transactionId}`);
    await updateDoc(
      adminRef,
      {
        status: userStatus,
      },
      { merge: true }
    )
      .then(() => {
        setUpdateAlert("Broker details has been updated");
      })
      .catch((err) => {
        console.log(err.message);
      });
  };
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setUpdateAlert("");
    setUserAmount(amount);
    setUserType(type);
    setUserStatus(status);
    setUserTransactionId(transactionId);
  };

  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <Icon icon={moreVerticalFill} width={20} height={20} />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: 200, maxWidth: "100%" },
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          component={RouterLink}
          to="#"
          sx={{ color: "text.secondary" }}
          onClick={handleOpen}
        >
          <ListItemIcon>
            <Icon icon={editFill} width={24} height={24} />
          </ListItemIcon>
          <ListItemText
            primary="Edit"
            primaryTypographyProps={{ variant: "body2" }}
          />
        </MenuItem>
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={open}
          onClose={handleClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={open}>
            <Box component="form" sx={style} noValidate autoComplete="off">
              <div style={{ margin: "0 0 5px 0", textAlign: "center" }}>
                {updateAlert && (
                  <Alert severity="success">
                    <AlertTitle>Success</AlertTitle>
                    {updateAlert}
                  </Alert>
                )}

                <TextField
                  label="Status"
                  id="outlined-size-normal"
                  style={{ margin: "0 0 15px 0", width: "90%" }}
                  onChange={(e) => setUserStatus(e.target.value)}
                />
              </div>

              <Button
                variant="contained"
                onClick={() => handleUpdate(transactionId)}
              >
                Update
              </Button>
            </Box>
          </Fade>
        </Modal>
      </Menu>
    </>
  );
}
