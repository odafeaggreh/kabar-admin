import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
// material
import {
  Link,
  Stack,
  Checkbox,
  TextField,
  IconButton,
  InputAdornment,
  FormControlLabel
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth, app, functions } from '../../../Firebase/firebase';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [adminEmail, setAdminEmail] = useState();
  const [adminPassword, setAdminPassword] = useState();
  const [buttonText, setButtonText] = useState('Login');

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const signin = (email, password) => {
    setButtonText('Loading...');
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigate('/dashboard/user');
      })
      .catch((error) => {
        setButtonText('Login');
        if (error) {
          switch (error.code) {
            case 'auth/user-not-found':
              console.log('You are not registered as a user. Please register');
              break;
            case 'auth/wrong-password':
              console.log('The password you have entered is incorrect.');
              break;
            case 'auth/too-many-requests':
              console.log(
                'You have entered an incorrect password too many times and your account has been temporarily disabled. Please try again after a few minutes or reset your password.'
              );
              break;
            default:
              console.log('Error creating user:', error);
          }
        }
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signin(adminEmail, adminPassword);
  };

  return (
    <form autoComplete="off" noValidate onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          fullWidth
          autoComplete="username"
          type="email"
          label="Email address"
          helperText="Enter your email address"
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
                <IconButton onClick={handleShowPassword} edge="end">
                  <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                </IconButton>
              </InputAdornment>
            )
          }}
          helperText="Enter password"
          onChange={(e) => setAdminPassword(e.target.value)}
        />
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained">
        {buttonText}
      </LoadingButton>
    </form>
  );
}
