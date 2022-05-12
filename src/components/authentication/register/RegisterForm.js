import { useState } from 'react';
import { Icon } from '@iconify/react';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import { useNavigate } from 'react-router-dom';
// material
import { Stack, TextField, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { db, auth, app, functions } from '../../../Firebase/firebase';
// ----------------------------------------------------------------------

export default function RegisterForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [adminEmail, setAdminEmail] = useState();
  const [adminPassword, setAdminPassword] = useState();
  const [buttonText, setButtonText] = useState('Register');
  const addAdminRole = httpsCallable(functions, 'addAdminRole');

  const signup = (email, password) => {
    setButtonText('Loading...');
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        addAdminRole({ email: adminEmail })
          .then(() => {
            navigate('/dashboard/user');
          })
          .catch((err) => {
            console.log(err.message);
          });
      })
      .catch((error) => {
        if (error) {
          setButtonText('Register');
          switch (error.code) {
            case 'EMAIL_TAKEN':
              console.log(
                'The new user account cannot be created because the email is already in use.'
              );
              break;
            case 'INVALID_EMAIL':
              console.log('The specified email is not a valid email.');
              break;
            default:
              console.log('Error creating user:', error);
          }
        }
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(adminEmail, adminPassword);
  };

  return (
    <form autoComplete="off" noValidate onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          fullWidth
          autoComplete="username"
          type="email"
          label="Email address"
          helperText="Enter email address"
          onChange={(e) => setAdminEmail(e.target.value)}
        />

        <TextField
          fullWidth
          autoComplete="current-password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" onClick={() => setShowPassword((prev) => !prev)}>
                  <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                </IconButton>
              </InputAdornment>
            )
          }}
          helperText="Enter password"
          onChange={(e) => setAdminPassword(e.target.value)}
        />

        <LoadingButton fullWidth size="large" type="submit" variant="contained">
          {buttonText}
        </LoadingButton>
      </Stack>
    </form>
  );
}
